import { NextResponse } from "next/server";

/* ------------------------------------------------------------------ */
/*  OAuth provider configuration                                       */
/* ------------------------------------------------------------------ */
interface OAuthConfig {
  authUrl: string;
  tokenUrl: string;
  userInfoUrl: string;
  clientId: string;
  clientSecret: string;
  scopes: string[];
}

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

function getProviderConfig(
  provider: string
): OAuthConfig | null {
  switch (provider) {
    case "google":
      return {
        authUrl: "https://accounts.google.com/o/oauth2/v2/auth",
        tokenUrl: "https://oauth2.googleapis.com/token",
        userInfoUrl: "https://www.googleapis.com/oauth2/v2/userinfo",
        clientId: process.env.GOOGLE_CLIENT_ID || "",
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        scopes: ["openid", "email", "profile"],
      };
    case "facebook":
      return {
        authUrl: "https://www.facebook.com/v19.0/dialog/oauth",
        tokenUrl: "https://graph.facebook.com/v19.0/oauth/access_token",
        userInfoUrl:
          "https://graph.facebook.com/me?fields=id,name,email,picture.width(200)",
        clientId: process.env.FACEBOOK_CLIENT_ID || "",
        clientSecret: process.env.FACEBOOK_CLIENT_SECRET || "",
        scopes: ["email", "public_profile"],
      };
    case "apple":
      return {
        authUrl: "https://appleid.apple.com/auth/authorize",
        tokenUrl: "https://appleid.apple.com/auth/token",
        userInfoUrl: "", // Apple returns user info in the id_token
        clientId: process.env.APPLE_CLIENT_ID || "",
        clientSecret: process.env.APPLE_CLIENT_SECRET || "",
        scopes: ["name", "email"],
      };
    default:
      return null;
  }
}

/* ------------------------------------------------------------------ */
/*  GET /api/auth/social/[provider] — redirect to OAuth provider       */
/* ------------------------------------------------------------------ */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ provider: string }> }
) {
  const { provider } = await params;
  const config = getProviderConfig(provider);

  if (!config) {
    return NextResponse.json(
      { error: "Unsupported provider." },
      { status: 400 }
    );
  }

  if (!config.clientId) {
    return NextResponse.json(
      {
        error: `${provider} OAuth is not configured. Set the environment variables.`,
      },
      { status: 503 }
    );
  }

  const redirectUri = `${APP_URL}/api/auth/social/${provider}/callback`;

  const params_obj = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: config.scopes.join(" "),
    state: crypto.randomUUID(),
  });

  // Apple-specific
  if (provider === "apple") {
    params_obj.set("response_mode", "form_post");
  }

  return NextResponse.redirect(`${config.authUrl}?${params_obj.toString()}`);
}
