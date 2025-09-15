import { NextRequest, NextResponse } from "next/server";

const MAX_MESSAGES = parseInt(process.env.MAX_MESSAGES || "5", 10) || 5;

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  let sessionId: string | undefined;
  
  try {
    const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;
    if (!n8nWebhookUrl) {
      return NextResponse.json(
        { 
          error: "Server misconfiguration: N8N_WEBHOOK_URL is not set",
          errorType: "configuration",
          retryable: false
        },
        { status: 500 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const message: string | undefined = body?.message;
    const history = Array.isArray(body?.history) ? body.history : [];

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { 
          error: "Missing 'message' in request body",
          errorType: "validation",
          retryable: false
        },
        { status: 400 }
      );
    }

    const cookies = req.cookies;
    const currentCount = parseInt(cookies.get("msgCount")?.value ?? "0", 10) || 0;
    const existingSessionId = cookies.get("sessionId")?.value;
    sessionId = existingSessionId && existingSessionId.length > 0 ? existingSessionId : crypto.randomUUID();

    if (currentCount >= MAX_MESSAGES) {
      return NextResponse.json(
        { 
          error: "Message limit reached", 
          remaining: 0,
          errorType: "rate_limit",
          retryable: false,
          resetTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        },
        { status: 429 }
      );
    }

    // Forward the request to n8n webhook with timeout and retry logic
    const url = new URL(n8nWebhookUrl);
    url.searchParams.set("sessionId", sessionId);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    let upstreamRes: Response;
    try {
      upstreamRes = await fetch(url.toString(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "n8n-chat-ui/1.0",
        },
        body: JSON.stringify({ message, history }),
        signal: controller.signal,
      });
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      
      // Handle different types of fetch errors
      if (fetchError.name === 'AbortError') {
        return NextResponse.json(
          { 
            error: "Request timeout - the service took too long to respond",
            errorType: "timeout",
            retryable: true,
            processingTime: Date.now() - startTime
          },
          { status: 408 }
        );
      }
      
      if (fetchError.code === 'ECONNREFUSED' || fetchError.code === 'ENOTFOUND') {
        return NextResponse.json(
          { 
            error: "Unable to connect to the chat service",
            errorType: "connection",
            retryable: true,
            processingTime: Date.now() - startTime
          },
          { status: 503 }
        );
      }
      
      throw fetchError; // Re-throw other errors to be caught by outer try-catch
    }
    
    clearTimeout(timeoutId);

    // Handle upstream errors with detailed error information
    if (!upstreamRes.ok) {
      let errorMessage = `Upstream service error (${upstreamRes.status})`;
      let errorType = "upstream";
      let retryable = false;
      
      if (upstreamRes.status >= 500) {
        errorMessage = "The chat service is temporarily unavailable";
        errorType = "server";
        retryable = true;
      } else if (upstreamRes.status === 429) {
        errorMessage = "The chat service is rate limited";
        errorType = "rate_limit";
        retryable = true;
      } else if (upstreamRes.status === 408) {
        errorMessage = "The chat service timed out";
        errorType = "timeout";
        retryable = true;
      }
      
      return NextResponse.json(
        { 
          error: errorMessage,
          errorType,
          retryable,
          upstreamStatus: upstreamRes.status,
          processingTime: Date.now() - startTime
        },
        { status: upstreamRes.status >= 500 ? 502 : upstreamRes.status }
      );
    }

    const contentType = upstreamRes.headers.get("content-type") || "";

    let reply = "";
    try {
      if (contentType.includes("application/json")) {
        const data: unknown = await upstreamRes.json();
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
    } catch (parseError) {
      console.error("Error parsing upstream response:", parseError);
      return NextResponse.json(
        { 
          error: "Invalid response from chat service",
          errorType: "parse",
          retryable: true,
          processingTime: Date.now() - startTime
        },
        { status: 502 }
      );
    }

    const newCount = currentCount + 1;
    const remaining = Math.max(0, MAX_MESSAGES - newCount);
    const processingTime = Date.now() - startTime;

    // Prepare response
    const res = NextResponse.json({
      reply,
      remaining,
      sessionId,
      processingTime,
      success: true
    });

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
  } catch (err: any) {
    console.error("/api/chat error", {
      error: err.message,
      stack: err.stack,
      sessionId,
      processingTime: Date.now() - startTime
    });
    
    return NextResponse.json(
      { 
        error: "Unexpected server error",
        errorType: "internal",
        retryable: true,
        processingTime: Date.now() - startTime
      },
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


