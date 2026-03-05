import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/lib/models/user";
import { signToken, setAuthCookie } from "@/lib/auth";

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

/* ------------------------------------------------------------------ */
/*  Provider-specific token / user-info helpers                        */
/* ------------------------------------------------------------------ */

interface OAuthUser {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

async function exchangeCodeForToken(
  provider: string,
  code: string
): Promise<string> {
  const tokenUrls: Record<string, string> = {
    google: "https://oauth2.googleapis.com/token",
    facebook: "https://graph.facebook.com/v19.0/oauth/access_token",
    apple: "https://appleid.apple.com/auth/token",
  };

  const redirectUri = `${APP_URL}/api/auth/social/${provider}/callback`;

  const body: Record<string, string> = {
    code,
    client_id:
      provider === "google"
        ? process.env.GOOGLE_CLIENT_ID!
        : provider === "facebook"
          ? process.env.FACEBOOK_CLIENT_ID!
          : process.env.APPLE_CLIENT_ID!,
    client_secret:
      provider === "google"
        ? process.env.GOOGLE_CLIENT_SECRET!
        : provider === "facebook"
          ? process.env.FACEBOOK_CLIENT_SECRET!
          : process.env.APPLE_CLIENT_SECRET!,
    redirect_uri: redirectUri,
    grant_type: "authorization_code",
  };

  const res = await fetch(tokenUrls[provider], {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(body).toString(),
  });

  const data = await res.json();
  if (!res.ok) {
    console.error(`${provider} token exchange error:`, data);
    throw new Error(`Failed to exchange code with ${provider}`);
  }

  return data.access_token || data.id_token;
}

async function fetchProviderUser(
  provider: string,
  token: string
): Promise<OAuthUser> {
  if (provider === "google") {
    const res = await fetch(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const data = await res.json();
    return {
      id: data.id,
      name: data.name || data.email?.split("@")[0] || "User",
      email: data.email,
      avatar: data.picture || "",
    };
  }

  if (provider === "facebook") {
    const res = await fetch(
      `https://graph.facebook.com/me?fields=id,name,email,picture.width(200)&access_token=${token}`
    );
    const data = await res.json();
    return {
      id: data.id,
      name: data.name || "User",
      email: data.email || "",
      avatar: data.picture?.data?.url || "",
    };
  }

  // Apple — parse id_token JWT (no user info endpoint)
  if (provider === "apple") {
    const payload = JSON.parse(
      Buffer.from(token.split(".")[1], "base64").toString()
    );
    return {
      id: payload.sub,
      name: payload.email?.split("@")[0] || "Apple User",
      email: payload.email || "",
      avatar: "",
    };
  }

  throw new Error("Unsupported provider");
}

/* ------------------------------------------------------------------ */
/*  GET /api/auth/social/[provider]/callback                           */
/* ------------------------------------------------------------------ */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ provider: string }> }
) {
  const { provider } = await params;

  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");

    if (!code) {
      const error = searchParams.get("error") || "No authorization code";
      return NextResponse.redirect(
        `${APP_URL}/login?error=${encodeURIComponent(error)}`
      );
    }

    // Exchange code → token → user info
    const accessToken = await exchangeCodeForToken(provider, code);
    const oauthUser = await fetchProviderUser(provider, accessToken);

    if (!oauthUser.email) {
      return NextResponse.redirect(
        `${APP_URL}/login?error=${encodeURIComponent("Email not provided by " + provider)}`
      );
    }

    await connectDB();

    // Find existing user by provider ID or email
    let user = await User.findOne({
      $or: [
        { authProvider: provider, authProviderId: oauthUser.id },
        { email: oauthUser.email.toLowerCase() },
      ],
    });

    if (user) {
      // Link provider if user exists but used different auth
      if (user.authProvider === "local") {
        user.authProvider = provider as any;
        user.authProviderId = oauthUser.id;
        if (oauthUser.avatar && !user.avatar) user.avatar = oauthUser.avatar;
        await user.save();
      }
    } else {
      // Create new user (no password for social auth)
      user = await User.create({
        name: oauthUser.name,
        email: oauthUser.email.toLowerCase(),
        authProvider: provider,
        authProviderId: oauthUser.id,
        avatar: oauthUser.avatar,
      });
    }

    // Issue JWT & set cookie
    const jwt = await signToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });
    await setAuthCookie(jwt);

    // Redirect to appropriate dashboard
    const redirectPath = user.role === "admin" ? "/admin" : "/dashboard";
    return NextResponse.redirect(`${APP_URL}${redirectPath}`);
  } catch (err) {
    console.error(`OAuth callback error (${provider}):`, err);
    return NextResponse.redirect(
      `${APP_URL}/login?error=${encodeURIComponent("Authentication failed. Please try again.")}`
    );
  }
}

/* ------------------------------------------------------------------ */
/*  POST — Apple sends callback as form POST                           */
/* ------------------------------------------------------------------ */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ provider: string }> }
) {
  const { provider } = await params;

  if (provider !== "apple") {
    return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const formData = await req.formData();
    const code = formData.get("code") as string;
    const userStr = formData.get("user") as string | null;

    if (!code) {
      return NextResponse.redirect(
        `${APP_URL}/login?error=No authorization code from Apple`
      );
    }

    const accessToken = await exchangeCodeForToken("apple", code);
    const oauthUser = await fetchProviderUser("apple", accessToken);

    // Apple only sends user info on first authorization
    if (userStr) {
      try {
        const userData = JSON.parse(userStr);
        if (userData.name) {
          oauthUser.name =
            `${userData.name.firstName || ""} ${userData.name.lastName || ""}`.trim() ||
            oauthUser.name;
        }
      } catch {}
    }

    if (!oauthUser.email) {
      return NextResponse.redirect(
        `${APP_URL}/login?error=Email not provided by Apple`
      );
    }

    await connectDB();

    let user = await User.findOne({
      $or: [
        { authProvider: "apple", authProviderId: oauthUser.id },
        { email: oauthUser.email.toLowerCase() },
      ],
    });

    if (user) {
      if (user.authProvider === "local") {
        user.authProvider = "apple";
        user.authProviderId = oauthUser.id;
        await user.save();
      }
    } else {
      user = await User.create({
        name: oauthUser.name,
        email: oauthUser.email.toLowerCase(),
        authProvider: "apple",
        authProviderId: oauthUser.id,
      });
    }

    const jwt = await signToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });
    await setAuthCookie(jwt);

    const redirectPath = user.role === "admin" ? "/admin" : "/dashboard";
    return NextResponse.redirect(`${APP_URL}${redirectPath}`);
  } catch (err) {
    console.error("Apple OAuth callback error:", err);
    return NextResponse.redirect(
      `${APP_URL}/login?error=Apple authentication failed`
    );
  }
}
