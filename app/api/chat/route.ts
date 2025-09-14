import { NextRequest, NextResponse } from "next/server";

const MAX_MESSAGES = parseInt(process.env.MAX_MESSAGES || "5", 10) || 5;

export async function POST(req: NextRequest) {
  try {
    const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;
    if (!n8nWebhookUrl) {
      return NextResponse.json(
        { error: "Server misconfiguration: N8N_WEBHOOK_URL is not set" },
        { status: 500 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const message: string | undefined = body?.message;
    const history = Array.isArray(body?.history) ? body.history : [];

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Missing 'message' in request body" },
        { status: 400 }
      );
    }

    const cookies = req.cookies;
    const currentCount = parseInt(cookies.get("msgCount")?.value ?? "0", 10) || 0;
    const existingSessionId = cookies.get("sessionId")?.value;
    const sessionId = existingSessionId && existingSessionId.length > 0 ? existingSessionId : crypto.randomUUID();

    if (currentCount >= MAX_MESSAGES) {
      return NextResponse.json(
        { error: "Message limit reached", remaining: 0 },
        { status: 429 }
      );
    }

    // Forward the request to n8n webhook
    const url = new URL(n8nWebhookUrl);
    url.searchParams.set("sessionId", sessionId);
    const upstreamRes = await fetch(url.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message, history }),
      // Optionally add a timeout via AbortController if desired
    });

    const contentType = upstreamRes.headers.get("content-type") || "";

    let reply = "";
    if (contentType.includes("application/json")) {
      const data: unknown = await upstreamRes.json().catch(() => ({}));
      let outputValue: unknown = undefined;
      if (typeof data === "object" && data !== null && "output" in data) {
        outputValue = (data as Record<string, unknown>)["output"];
      }
      if (typeof outputValue === "string") {
        reply = outputValue;
      } else if (outputValue !== undefined) {
        try {
          reply = JSON.stringify(outputValue);
        } catch {
          reply = String(outputValue);
        }
      } else {
        reply = "";
      }
    } else {
      reply = await upstreamRes.text();
    }

    const newCount = currentCount + 1;
    const remaining = Math.max(0, MAX_MESSAGES - newCount);

    // Prepare response
    const res = NextResponse.json(
      { reply, remaining },
      { status: upstreamRes.ok ? 200 : upstreamRes.status }
    );

    // Set/Update cookies with a 24h expiration
    res.cookies.set("msgCount", String(newCount), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24,
      path: "/",
    });
    // Persist session id for the same window
    res.cookies.set("sessionId", sessionId, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24,
      path: "/",
    });

    return res;
  } catch (err) {
    console.error("/api/chat error", err);
    return NextResponse.json(
      { error: "Unexpected server error" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const cookies = req.cookies;
  const currentCount = parseInt(cookies.get("msgCount")?.value ?? "0", 10) || 0;
  const remaining = Math.max(0, MAX_MESSAGES - currentCount);
  const sessionId = cookies.get("sessionId")?.value ?? null;
  return NextResponse.json({ remaining, max: MAX_MESSAGES, sessionId });
}

export async function DELETE(req: NextRequest) {
  const res = NextResponse.json({ success: true, message: "Message limit reset" });
  res.cookies.delete("msgCount");
  res.cookies.delete("sessionId");
  return res;
}


