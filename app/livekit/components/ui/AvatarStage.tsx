"use client";

import * as React from "react";
import { isTrackReference } from "@livekit/components-core";
import { Track, ParticipantKind } from "livekit-client";
import { useTracks, VideoTrack } from "@livekit/components-react";

export default function AvatarStage() {
  // get all camera tracks (subscribed or not)
  const tracks = useTracks(
    [{ source: Track.Source.Camera, withPlaceholder: false }],
    { onlySubscribed: false }
  );

  const avatarTrack = React.useMemo(() => {
    const refs = tracks.filter(isTrackReference);

    return refs.find((t) => {
      const p = t.participant;
      const isAgent = p.isAgent ?? p.kind === ParticipantKind.AGENT;

      const agentType = p.attributes?.["agentType"];
      const publishOnBehalf = p.attributes?.["lk.publish_on_behalf"];
      const identity = (p.identity || "").toLowerCase();
      const name = (p.name || "").toLowerCase();

      // ✅ match your avatar participant reliably
      return (
        (isAgent && agentType === "avatar") ||
        identity.includes("avatar") ||
        name.includes("mia") ||
        Boolean(publishOnBehalf) // many agents publish "on behalf"
      );
    });
  }, [tracks]);

  return (
    <div className="w-full h-full relative overflow-hidden">
      {avatarTrack ? (
        <VideoTrack
          trackRef={avatarTrack}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-white/70">
          Waiting for AI avatar…
        </div>
      )}
    </div>
  );
}
