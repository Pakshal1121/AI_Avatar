// import { NextRequest, NextResponse } from "next/server";
// import { AgentDispatchClient } from "livekit-server-sdk";

// export async function POST(request: NextRequest) {
//   let body: any = null;

//   try {
//     const contentType = request.headers.get("content-type") || "";
//     if (contentType.includes("application/json")) {
//       body = await request.json();
//     }
//   } catch {
//     body = null;
//   }

//   const room = body?.room;

//   // Ignore invalid / empty posts (prevents dev 400 spam)
//   if (typeof room !== "string" || room.trim() === "") {
//     return NextResponse.json({ ignored: true });
//   }

//   const { LIVEKIT_API_KEY, LIVEKIT_API_SECRET, LIVEKIT_URL } = process.env;

//   if (!LIVEKIT_API_KEY || !LIVEKIT_API_SECRET || !LIVEKIT_URL) {
//     return NextResponse.json(
//       { error: "Server configuration is missing" },
//       { status: 500 }
//     );
//   }

//   // ✅ Allow callers to specify which agent to dispatch.
//   // Falls back to NEXT_PUBLIC_AGENT_NAME (= "livekit-agent") for Speaking.
//   // Listening coach passes agentName: "listening-coach"
//   const agentName: string =
//     typeof body?.agentName === "string" && body.agentName.trim()
//       ? body.agentName.trim()
//       : process.env.NEXT_PUBLIC_AGENT_NAME || "livekit-agent";

//   try {
//     const agentDispatchClient = new AgentDispatchClient(
//       LIVEKIT_URL,
//       LIVEKIT_API_KEY,
//       LIVEKIT_API_SECRET
//     );

//     const dispatches = await agentDispatchClient.listDispatch(room);

//     const existingDispatch = dispatches.find(
//       (dispatch) => dispatch.agentName === agentName
//     );

//     // Idempotent: don't dispatch the same agent twice
//     if (existingDispatch) {
//       return NextResponse.json({ success: true, reused: true });
//     }

//     await agentDispatchClient.createDispatch(room, agentName, {
//       metadata: JSON.stringify({ agentName, room }),
//     });

//     return NextResponse.json({ success: true });
//   } catch (error) {
//     console.error("Error requesting agent:", error);
//     return NextResponse.json(
//       { error: error instanceof Error ? error.message : "Unknown error" },
//       { status: 500 }
//     );
//   }
// }

import { NextRequest, NextResponse } from "next/server";
import { AgentDispatchClient } from "livekit-server-sdk";

export async function POST(request: NextRequest) {
  let body: any = null;

  try {
    const contentType = request.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      body = await request.json();
    }
  } catch {
    body = null;
  }

  const room = body?.room;

  // Ignore invalid / empty posts (prevents dev 400 spam)
  if (typeof room !== "string" || room.trim() === "") {
    return NextResponse.json({ ignored: true });
  }

  const { LIVEKIT_API_KEY, LIVEKIT_API_SECRET, LIVEKIT_URL } = process.env;

  if (!LIVEKIT_API_KEY || !LIVEKIT_API_SECRET || !LIVEKIT_URL) {
    return NextResponse.json(
      { error: "Server configuration is missing" },
      { status: 500 }
    );
  }

  // ✅ Allow callers to specify which agent to dispatch.
  // Falls back to NEXT_PUBLIC_AGENT_NAME (= "livekit-agent") for Speaking.
  // Listening coach passes agentName: "listening-coach"
  const agentName: string =
    typeof body?.agentName === "string" && body.agentName.trim()
      ? body.agentName.trim()
      : process.env.NEXT_PUBLIC_AGENT_NAME || "livekit-agent";

  try {
    const agentDispatchClient = new AgentDispatchClient(
      LIVEKIT_URL,
      LIVEKIT_API_KEY,
      LIVEKIT_API_SECRET
    );

    const dispatches = await agentDispatchClient.listDispatch(room);

    const existingDispatch = dispatches.find(
      (dispatch) => dispatch.agentName === agentName
    );

    // Idempotent: don't dispatch the same agent twice
    if (existingDispatch) {
      return NextResponse.json({ success: true, reused: true });
    }

    // ✅ ADDED: merge in caller metadata (e.g., writing scoring context)
    const extraMeta =
      body?.metadata && typeof body.metadata === "object" ? body.metadata : {};

    await agentDispatchClient.createDispatch(room, agentName, {
      metadata: JSON.stringify({ agentName, room, ...extraMeta }),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error requesting agent:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}