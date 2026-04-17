import { randomString } from "@/app/livekit/lib/client-utils";
import { ConnectionDetails } from "@/app/livekit/lib/types";

import {
  AccessToken,
  AccessTokenOptions,
  VideoGrant,
} from "livekit-server-sdk";
import { NextRequest, NextResponse } from "next/server";

const API_KEY = process.env.LIVEKIT_API_KEY;
const API_SECRET = process.env.LIVEKIT_API_SECRET;
const LIVEKIT_URL = process.env.LIVEKIT_URL;
const COOKIE_KEY = "random-participant-postfix";

export async function GET(request: NextRequest) {
  try {
    const roomName = request.nextUrl.searchParams.get("roomName");
    const participantName = request.nextUrl.searchParams.get("participantName");
    const metadata = request.nextUrl.searchParams.get("metadata") ?? "";
    const region = request.nextUrl.searchParams.get("region");

    const livekitServerUrl = region ? getLiveKitURL(region) : LIVEKIT_URL;
    let randomParticipantPostfix = request.cookies.get(COOKIE_KEY)?.value;

    if (!livekitServerUrl) {
      return new NextResponse("Invalid LiveKit URL", { status: 500 });
    }

    if (!roomName) {
      return new NextResponse("Missing roomName", { status: 400 });
    }

    if (!participantName) {
      return new NextResponse("Missing participantName", { status: 400 });
    }

    if (!randomParticipantPostfix) {
      randomParticipantPostfix = randomString(4);
    }

    const participantToken = await createParticipantToken(
      {
        identity: `${participantName}__${randomParticipantPostfix}`,
        name: participantName,
        metadata,
      },
      roomName
    );

    const data: ConnectionDetails = {
      serverUrl: livekitServerUrl,
      roomName,
      participantToken,
      participantName,
    };

    const isProd = process.env.NODE_ENV === "production";

    return new NextResponse(JSON.stringify(data), {
      headers: {
        "Content-Type": "application/json",
        "Set-Cookie": `${COOKIE_KEY}=${randomParticipantPostfix}; Path=/; HttpOnly; SameSite=Lax;${
          isProd ? " Secure;" : ""
        } Expires=${getCookieExpirationTime()}`,
      },
    });
  } catch (error) {
    return new NextResponse(
      error instanceof Error ? error.message : "Unknown error",
      { status: 500 }
    );
  }
}

function createParticipantToken(
  userInfo: AccessTokenOptions,
  roomName: string
) {
  const at = new AccessToken(API_KEY, API_SECRET, userInfo);
  at.ttl = "5m";
  const grant: VideoGrant = {
    room: roomName,
    roomJoin: true,
    canPublish: true,
    canPublishData: true,
    canSubscribe: true,
  };
  at.addGrant(grant);
  return at.toJwt();
}

function getLiveKitURL(region: string): string {
  const key = `LIVEKIT_URL_${region}`.toUpperCase();
  return process.env[key] ?? LIVEKIT_URL!;
}

function getCookieExpirationTime(): string {
  const now = new Date();
  now.setTime(now.getTime() + 2 * 60 * 60 * 1000);
  return now.toUTCString();
}
