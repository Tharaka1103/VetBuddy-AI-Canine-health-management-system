import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

/* ------------------------------------------------------------------ */
/*  POST /api/health/skin-disease — proxy to Flask skin disease AI     */
/* ------------------------------------------------------------------ */
export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file uploaded" },
        { status: 400 }
      );
    }

    // Forward the image to the Flask AI backend
    const flaskForm = new FormData();
    flaskForm.append("file", file);

    const flaskRes = await fetch("http://localhost:5000/predict-skin-disease", {
      method: "POST",
      body: flaskForm,
    });

    const result = await flaskRes.json();
    return NextResponse.json(result);
  } catch (err: unknown) {
    console.error("POST /api/health/skin-disease error:", err);
    return NextResponse.json(
      { error: "Failed to analyze image. Make sure the AI server is running." },
      { status: 500 }
    );
  }
}
