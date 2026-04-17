import { NextRequest, NextResponse } from "next/server";
import { AgentDispatchClient, RoomServiceClient } from "livekit-server-sdk";

export async function DELETE(request: NextRequest) {
  try {
    const roomName =
      request.nextUrl.searchParams.get("room") ||
      request.nextUrl.searchParams.get("roomName");

    const identity = request.nextUrl.searchParams.get("identity") || "";
    const agentName = process.env.NEXT_PUBLIC_AGENT_NAME || "livekit-agent";

    if (!roomName || roomName.trim() === "") {
      return NextResponse.json({ ignored: true });
    }

    const { LIVEKIT_API_KEY, LIVEKIT_API_SECRET, LIVEKIT_URL } = process.env;

    if (!LIVEKIT_API_KEY || !LIVEKIT_API_SECRET || !LIVEKIT_URL) {
      return NextResponse.json(
        { error: "Server configuration is missing" },
        { status: 500 }
      );
    }

    const agentDispatchClient = new AgentDispatchClient(
      LIVEKIT_URL,
      LIVEKIT_API_KEY,
      LIVEKIT_API_SECRET
    );

    // ✅ delete dispatch if present (idempotent)
    try {
      const dispatches = await agentDispatchClient.listDispatch(roomName);
      const dispatchId = dispatches?.find((d) => d.agentName === agentName)?.id;
      if (dispatchId) {
        await agentDispatchClient.deleteDispatch(dispatchId, roomName);
      }
    } catch (e) {
      // don't fail stop if dispatch API errors
      console.error("deleteDispatch failed:", e);
    }

    const roomService = new RoomServiceClient(
      LIVEKIT_URL,
      LIVEKIT_API_KEY,
      LIVEKIT_API_SECRET
    );

    // ✅ if identity provided, remove that exact participant
    if (identity && identity.trim() !== "") {
      try {
        await roomService.removeParticipant(roomName, identity);
      } catch (e) {
        console.error("removeParticipant(identity) failed:", e);
      }
      return NextResponse.json({
        status: "success",
        message: `Stop complete (dispatch deleted if existed, identity removed): ${identity}`,
      });
    }

    // ✅ fallback: try to find agent in participants list
    const participants = await roomService.listParticipants(roomName);

    let agentIdentity =
      participants?.find((p) => p.identity === agentName)?.identity;

    if (!agentIdentity) {
      agentIdentity = participants?.find(
        (p) =>
          p.name === agentName ||
          p.identity?.toLowerCase().includes(agentName.toLowerCase()) ||
          p.name?.toLowerCase().includes(agentName.toLowerCase())
      )?.identity;
    }

    if (agentIdentity) {
      try {
        await roomService.removeParticipant(roomName, agentIdentity);
      } catch (e) {
        console.error("removeParticipant(fallback) failed:", e);
      }
    }

    return NextResponse.json({
      status: "success",
      message: agentIdentity
        ? "Stop complete: dispatch deleted and participant removed."
        : "Stop complete: dispatch deleted. Participant not found (already left).",
    });
  } catch (error) {
    console.error("Error stopping agent:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

