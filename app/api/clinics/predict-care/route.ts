import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

/* ------------------------------------------------------------------ */
/*  POST /api/clinics/predict-care — proxy to Flask /predict-care      */
/* ------------------------------------------------------------------ */
export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { Dog_Age, Condition, Severity } = body;

    let result = {
      status: "success",
      urgency_level: "Routine Checkup",
      recommended_clinic_type: "General Vet Clinic",
      ai_message:
        "Based on analysis, a Routine Checkup is required. Please visit a General Vet Clinic.",
    };

    try {
      const flaskRes = await fetch("http://localhost:5000/predict-care", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          Dog_Age: Dog_Age || 1,
          Condition: Condition || "Healthy",
          Severity: Severity || "None",
        }),
      });

      if (flaskRes.ok) {
        result = await flaskRes.json();
      }
    } catch (flaskErr) {
      console.warn(
        "Flask /predict-care unavailable, using rule-based fallback:",
        flaskErr
      );

      // Rule-based fallback
      const severity = Severity || "None";
      const condition = Condition || "Healthy";

      if (
        severity === "Severe" ||
        condition === "High Fever" ||
        condition === "Seizures"
      ) {
        result = {
          status: "success",
          urgency_level: "Emergency Visit",
          recommended_clinic_type: "Specialized Hospital",
          ai_message:
            "Based on analysis, an Emergency Visit is required. Please visit a Specialized Hospital immediately.",
        };
      } else if (severity === "Moderate" || condition === "Infection") {
        result = {
          status: "success",
          urgency_level: "Priority Appointment",
          recommended_clinic_type: "General Vet Clinic",
          ai_message:
            "Based on analysis, a Priority Appointment is required. Please visit a General Vet Clinic.",
        };
      }
    }

    return NextResponse.json(result);
  } catch (err: unknown) {
    console.error("POST /api/clinics/predict-care error:", err);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
