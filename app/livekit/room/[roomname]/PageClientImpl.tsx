// "use client";

// import React from "react";
// import { useRouter } from "next/navigation";

// import { decodePassphrase } from "../../lib/client-utils";
// import { DebugMode } from "../../lib/Debug";
// import { RecordingIndicator } from "../../lib/RecordingIndicator";
// import { SettingsMenu } from "../../lib/SettingsMenu";
// import { ConnectionDetails } from "../../lib/types";

// import {
//   LiveKitRoom,
//   LocalUserChoices,
//   RoomAudioRenderer,
//   formatChatMessageLinks,
// } from "@livekit/components-react";

// import {
//   ExternalE2EEKeyProvider,
//   Room,
//   RoomOptions,
//   VideoCodec,
//   VideoPresets,
//   DeviceUnsupportedError,
//   RoomConnectOptions,
//   RoomEvent,
//   RemoteVideoTrack,
//   Track,
//   RemoteParticipant,
// } from "livekit-client";

// import { RoomContext } from "./RoomContext";
// import { VideoConference } from "./VideoConference";
// import { PreJoin } from "./PreJoin";

// import { useAuth } from "@/components/auth/AuthProvider";

// const CONN_DETAILS_ENDPOINT = "/api/livekit/connection-details";
// const SHOW_SETTINGS_MENU = process.env.NEXT_PUBLIC_SHOW_SETTINGS_MENU === "true";

// export function PageClientImpl(props: {
//   roomName: string;
//   region?: string;
//   hq: boolean;
//   codec: VideoCodec;
// }) {
//   const { user, loading } = useAuth();

//   const [mounted, setMounted] = React.useState(false);
//   const [embedEnabled, setEmbedEnabled] = React.useState(false);

//   const [preJoinChoices, setPreJoinChoices] = React.useState<LocalUserChoices>();
//   const [connectionDetails, setConnectionDetails] = React.useState<ConnectionDetails>();

//   // ✅ IMPORTANT: avoid hydration mismatch by only reading window in effect
//   React.useEffect(() => {
//     setMounted(true);
//     const isEmbed =
//       typeof window !== "undefined" &&
//       new URLSearchParams(window.location.search).get("embed") === "true";
//     setEmbedEnabled(isEmbed);
//   }, []);

//   const defaultName =
//   (user as any)?.full_name ||
//   (user as any)?.name ||
//   (user as any)?.username ||
//   (user as any)?.email?.split("@")?.[0] ||
//   "Feedback User";

//   const preJoinDefaults = React.useMemo(
//     () => ({
//       username: defaultName,
//       videoEnabled: true,
//       audioEnabled: true,
//     }),
//     [defaultName]
//   );

//   const handlePreJoinSubmit = React.useCallback(
//     async (values: LocalUserChoices) => {
//       setPreJoinChoices(values);

//       const url = new URL(CONN_DETAILS_ENDPOINT, window.location.origin);
//       url.searchParams.append("roomName", props.roomName);
//       url.searchParams.append("participantName", values.username);

//       if (embedEnabled) url.searchParams.append("embed", "true");
//       if (props.region) url.searchParams.append("region", props.region);

//       const res = await fetch(url.toString());
//       if (!res.ok) {
//         const txt = await res.text();
//         console.error("connection-details failed:", res.status, txt);
//         alert(`connection-details failed: ${res.status}`);
//         return;
//       }

//       const raw = await res.text();
//       let data: any;
//       try {
//         data = JSON.parse(raw);
//       } catch {
//         console.error("Invalid JSON from connection-details:", raw);
//         alert("connection-details returned invalid JSON. Check console.");
//         return;
//       }

//       setConnectionDetails(data);
//     },
//     [props.roomName, props.region, embedEnabled]
//   );

//   // ✅ auto-join in embed mode (no mic/cam prompts)
//   React.useEffect(() => {
//     if (!mounted) return;
//     if (!embedEnabled) return;
//     if (loading) return;
//     if (preJoinChoices || connectionDetails) return;

//     handlePreJoinSubmit({
//       username: defaultName || "Feedback User",
//       audioEnabled: false,
//       videoEnabled: false,
//     } as LocalUserChoices);
//   }, [mounted, embedEnabled, loading, preJoinChoices, connectionDetails, handlePreJoinSubmit, defaultName]);

//   // ✅ stable first paint to avoid hydration mismatch
//   if (!mounted || loading) {
//     return (
//       <div className="h-screen grid place-items-center" data-lk-theme="default">
//         <div className="text-white/70">Loading…</div>
//       </div>
//     );
//   }

//   if (!preJoinChoices || !connectionDetails) {
//     if (embedEnabled) {
//       return (
//         <div className="h-screen grid place-items-center" data-lk-theme="default">
//           <div className="text-white/70">Connecting avatar…</div>
//         </div>
//       );
//     }

//     return (
//       <main className="h-screen grid place-items-center" data-lk-theme="default">
//         <PreJoin
//           defaults={preJoinDefaults}
//           persistUserChoices={false}
//           onSubmit={handlePreJoinSubmit}
//           onError={(e) => console.error(e)}
//         />
//       </main>
//     );
//   }

//   return (
//     <RoomContext.Provider value={props.roomName}>
//       <VideoConferenceComponent
//         roomName={props.roomName}
//         userChoices={preJoinChoices}
//         connectionDetails={connectionDetails}
//         options={{ codec: props.codec, hq: props.hq }}
//         embedEnabled={embedEnabled}
//       />
//     </RoomContext.Provider>
//   );
// }

// function VideoConferenceComponent(props: {
//   roomName: string;
//   userChoices: LocalUserChoices;
//   connectionDetails: ConnectionDetails;
//   options: { hq: boolean; codec: VideoCodec };
//   embedEnabled: boolean;
// }) {
//   const router = useRouter();

//   const e2eePassphrase =
//     typeof window !== "undefined"
//       ? decodePassphrase(window.location.hash.substring(1))
//       : undefined;

//   const worker =
//     typeof window !== "undefined" && typeof e2eePassphrase === "string"
//       ? new Worker(new URL("livekit-client/e2ee-worker", import.meta.url), { type: "module" })
//       : undefined;

//   const e2eeEnabled = Boolean(e2eePassphrase && worker);
//   const keyProvider = new ExternalE2EEKeyProvider();

//   const roomOptions: RoomOptions = {
//     videoCaptureDefaults: {
//       resolution: props.options.hq ? VideoPresets.h2160 : VideoPresets.h720,
//     },
//     publishDefaults: {
//       videoCodec: e2eeEnabled ? undefined : props.options.codec,
//       red: !e2eeEnabled,
//     },
//     adaptiveStream: true,
//     dynacast: true,
//     ...(e2eeEnabled && worker ? { e2ee: { keyProvider, worker } } : {}),
//   };

//   const room = React.useMemo(() => new Room(roomOptions), []);
//   const requestedAgentRef = React.useRef(false);

//   React.useEffect(() => {
//     if (e2eeEnabled && typeof e2eePassphrase === "string") {
//       keyProvider
//         .setKey(decodePassphrase(e2eePassphrase))
//         .then(() => room.setE2EEEnabled(true))
//         .catch((e) => {
//           if (e instanceof DeviceUnsupportedError) alert("Browser does not support E2EE");
//           else console.error(e);
//         });
//     }
//   }, [e2eeEnabled, e2eePassphrase, room]);

//   function EmbedOnlyStyles() {
//     return (
//       <style jsx global>{`
//         html,
//         body {
//           height: 100% !important;
//           margin: 0 !important;
//           overflow: hidden !important;
//           background: #000 !important;
//         }
//         body > div {
//           height: 100% !important;
//         }
//         nav,
//         header,
//         footer {
//           display: none !important;
//         }
//       `}</style>
//     );
//   }

//   async function requestAgentOnce() {
//     if (!props.embedEnabled) return;
//     if (requestedAgentRef.current) return;
//     requestedAgentRef.current = true;


//     try {
//       // ✅ IMPORTANT: route expects { room: ... }, NOT { roomName: ... }
//       const r = await fetch("/api/livekit/request-agent", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ room: props.roomName }),
//       });

//       if (!r.ok) {
//         const t = await r.text();
//         console.error("request-agent failed:", r.status, t);
//       }
//     } catch (e) {
//       console.error("Failed to request agent", e);
//     }
//   }

//   // ✅ receive transcript text from agent via data messages
//   React.useEffect(() => {
//     const onData = (payload: Uint8Array) => {
//       try {
//         const txt = new TextDecoder().decode(payload);
//         const parsed = (() => {
//           try { return JSON.parse(txt); } catch { return null; }
//         })();

//         const line =
//           (parsed && (parsed.text || parsed.message)) ||
//           txt;

//         const fn = (window as any).__writingFeedbackAppend;
//         if (typeof fn === "function") fn(String(line));
//       } catch (e) {
//         // ignore
//       }
//     };

//     room.on(RoomEvent.DataReceived, onData);
//     return () => {
//       room.off(RoomEvent.DataReceived, onData);
//     };
//   }, [room]);

//   return (
//     <div className="w-full h-screen max-h-screen overflow-hidden" data-lk-theme="default">
//       {props.embedEnabled && <EmbedOnlyStyles />}

//       <LiveKitRoom
//         room={room}
//         token={props.connectionDetails.participantToken}
//         serverUrl={props.connectionDetails.serverUrl}
//         connect
//         audio={props.userChoices.audioEnabled}
//         video={props.userChoices.videoEnabled}
//         connectOptions={{ autoSubscribe: true } as RoomConnectOptions}
//         onConnected={() => {
//           // ✅ request agent when feedback iframe connects
//           requestAgentOnce();
//         }}
//         onDisconnected={() => {
//           if (props.embedEnabled) return;
//           window.location.assign("/speaking");
//         }}
//       >
//         {props.embedEnabled ? (
//           <>
//             <RoomAudioRenderer />
//             <AvatarOnlyView room={room} />
//           </>
//         ) : (
//           <div className="w-full h-full">
//             <VideoConference
//               className="w-full h-full"
//               chatMessageFormatter={formatChatMessageLinks}
//               SettingsComponent={SHOW_SETTINGS_MENU ? SettingsMenu : undefined}
//             />
//           </div>
//         )}

//         <DebugMode />
//         <RecordingIndicator />
//       </LiveKitRoom>
//     </div>
//   );
// }

// function AvatarOnlyView({ room }: { room: Room }) {
//   const videoRef = React.useRef<HTMLVideoElement | null>(null);
//   const [track, setTrack] = React.useState<RemoteVideoTrack | null>(null);

//   const pickTargetParticipant = React.useCallback((): RemoteParticipant | null => {
//     const remotes = Array.from(room.remoteParticipants.values());

//     // try anam/avatar/agent identities first
//     const target =
//       remotes.find((p) => String(p.identity || "").includes("anam-avatar")) ||
//       remotes.find((p) => String(p.identity || "").toLowerCase().includes("agent")) ||
//       remotes[0];

//     return target || null;
//   }, [room]);

//   const refresh = React.useCallback(() => {
//     const p = pickTargetParticipant();
//     if (!p) {
//       setTrack(null);
//       return;
//     }

//     let found: RemoteVideoTrack | null = null;

//     for (const pub of p.trackPublications.values()) {
//       const t = pub.track;
//       if (!t || t.kind !== Track.Kind.Video) continue;

//       if (pub.source === Track.Source.Camera || pub.source === Track.Source.Unknown) {
//         found = t as RemoteVideoTrack;
//         break;
//       }

//       if (!found) found = t as RemoteVideoTrack;
//     }

//     setTrack(found);
//   }, [pickTargetParticipant]);

//   React.useEffect(() => {
//     refresh();

//     room.on(RoomEvent.ParticipantConnected, refresh);
//     room.on(RoomEvent.ParticipantDisconnected, refresh);
//     room.on(RoomEvent.TrackSubscribed, refresh);
//     room.on(RoomEvent.TrackUnsubscribed, refresh);
//     room.on(RoomEvent.TrackPublished, refresh);
//     room.on(RoomEvent.TrackUnpublished, refresh);

//     return () => {
//       room.off(RoomEvent.ParticipantConnected, refresh);
//       room.off(RoomEvent.ParticipantDisconnected, refresh);
//       room.off(RoomEvent.TrackSubscribed, refresh);
//       room.off(RoomEvent.TrackUnsubscribed, refresh);
//       room.off(RoomEvent.TrackPublished, refresh);
//       room.off(RoomEvent.TrackUnpublished, refresh);
//     };
//   }, [room, refresh]);

//   React.useEffect(() => {
//     const el = videoRef.current;
//     if (!el || !track) return;

//     track.attach(el);
//     return () => {
//       track.detach(el);
//     };
//   }, [track]);

//   return (
//     <div className="w-full h-screen bg-black">
//       {track ? (
//         <video ref={videoRef} className="h-full w-full object-cover" autoPlay playsInline />
//       ) : (
//         <div className="h-full w-full grid place-items-center text-white/70">
//           Waiting for avatar video…
//         </div>
//       )}
//     </div>
//   );
// }

"use client";

import React from "react";
import { useRouter } from "next/navigation";

import { decodePassphrase } from "../../lib/client-utils";
import { DebugMode } from "../../lib/Debug";
import { RecordingIndicator } from "../../lib/RecordingIndicator";
import { SettingsMenu } from "../../lib/SettingsMenu";
import { ConnectionDetails } from "../../lib/types";

import {
  LiveKitRoom,
  LocalUserChoices,
  RoomAudioRenderer,
  formatChatMessageLinks,
} from "@livekit/components-react";

import {
  ExternalE2EEKeyProvider,
  Room,
  RoomOptions,
  VideoCodec,
  VideoPresets,
  DeviceUnsupportedError,
  RoomConnectOptions,
  RoomEvent,
  RemoteVideoTrack,
  Track,
  RemoteParticipant,
} from "livekit-client";

import { RoomContext } from "./RoomContext";
import { VideoConference } from "./VideoConference";
import { PreJoin } from "./PreJoin";

import { useAuth } from "@/components/auth/AuthProvider";

const CONN_DETAILS_ENDPOINT = "/api/livekit/connection-details";
const SHOW_SETTINGS_MENU = process.env.NEXT_PUBLIC_SHOW_SETTINGS_MENU === "true";

export function PageClientImpl(props: {
  roomName: string;
  region?: string;
  hq: boolean;
  codec: VideoCodec;
}) {
  const { user, loading } = useAuth();

  const [mounted, setMounted] = React.useState(false);
  const [embedEnabled, setEmbedEnabled] = React.useState(false);

  const [preJoinChoices, setPreJoinChoices] = React.useState<LocalUserChoices>();
  const [connectionDetails, setConnectionDetails] = React.useState<ConnectionDetails>();

  // ✅ IMPORTANT: avoid hydration mismatch by only reading window in effect
  React.useEffect(() => {
    setMounted(true);
    const isEmbed =
      typeof window !== "undefined" &&
      new URLSearchParams(window.location.search).get("embed") === "true";
    setEmbedEnabled(isEmbed);
  }, []);

  const defaultName =
  (user as any)?.full_name ||
  (user as any)?.name ||
  (user as any)?.username ||
  (user as any)?.email?.split("@")?.[0] ||
  "Feedback User";

  const preJoinDefaults = React.useMemo(
    () => ({
      username: defaultName,
      videoEnabled: true,
      audioEnabled: true,
    }),
    [defaultName]
  );

  const handlePreJoinSubmit = React.useCallback(
    async (values: LocalUserChoices) => {
      setPreJoinChoices(values);

      const url = new URL(CONN_DETAILS_ENDPOINT, window.location.origin);
      url.searchParams.append("roomName", props.roomName);
      url.searchParams.append("participantName", values.username);

      if (embedEnabled) url.searchParams.append("embed", "true");
      if (props.region) url.searchParams.append("region", props.region);

      const res = await fetch(url.toString());
      if (!res.ok) {
        const txt = await res.text();
        console.error("connection-details failed:", res.status, txt);
        alert(`connection-details failed: ${res.status}`);
        return;
      }

      const raw = await res.text();
      let data: any;
      try {
        data = JSON.parse(raw);
      } catch {
        console.error("Invalid JSON from connection-details:", raw);
        alert("connection-details returned invalid JSON. Check console.");
        return;
      }

      setConnectionDetails(data);
    },
    [props.roomName, props.region, embedEnabled]
  );

  // ✅ auto-join in embed mode (no mic/cam prompts)
  React.useEffect(() => {
    if (!mounted) return;
    if (!embedEnabled) return;
    if (loading) return;
    if (preJoinChoices || connectionDetails) return;

    handlePreJoinSubmit({
      username: defaultName || "Feedback User",
      audioEnabled: false,
      videoEnabled: false,
    } as LocalUserChoices);
  }, [mounted, embedEnabled, loading, preJoinChoices, connectionDetails, handlePreJoinSubmit, defaultName]);

  // ✅ stable first paint to avoid hydration mismatch
  if (!mounted || loading) {
    return (
      <div className="h-screen grid place-items-center" data-lk-theme="default">
        <div className="text-white/70">Loading…</div>
      </div>
    );
  }

  if (!preJoinChoices || !connectionDetails) {
    if (embedEnabled) {
      return (
        <div className="h-screen grid place-items-center" data-lk-theme="default">
          <div className="text-white/70">Connecting avatar…</div>
        </div>
      );
    }

    return (
      <main className="h-screen grid place-items-center" data-lk-theme="default">
        <PreJoin
          defaults={preJoinDefaults}
          persistUserChoices={false}
          onSubmit={handlePreJoinSubmit}
          onError={(e) => console.error(e)}
        />
      </main>
    );
  }

  return (
    <RoomContext.Provider value={props.roomName}>
      <VideoConferenceComponent
        roomName={props.roomName}
        userChoices={preJoinChoices}
        connectionDetails={connectionDetails}
        options={{ codec: props.codec, hq: props.hq }}
        embedEnabled={embedEnabled}
      />
    </RoomContext.Provider>
  );
}

function VideoConferenceComponent(props: {
  roomName: string;
  userChoices: LocalUserChoices;
  connectionDetails: ConnectionDetails;
  options: { hq: boolean; codec: VideoCodec };
  embedEnabled: boolean;
}) {
  const router = useRouter();

  const e2eePassphrase =
    typeof window !== "undefined"
      ? decodePassphrase(window.location.hash.substring(1))
      : undefined;

  const worker =
    typeof window !== "undefined" && typeof e2eePassphrase === "string"
      ? new Worker(new URL("livekit-client/e2ee-worker", import.meta.url), { type: "module" })
      : undefined;

  const e2eeEnabled = Boolean(e2eePassphrase && worker);
  const keyProvider = new ExternalE2EEKeyProvider();

  const roomOptions: RoomOptions = {
    videoCaptureDefaults: {
      resolution: props.options.hq ? VideoPresets.h2160 : VideoPresets.h720,
    },
    publishDefaults: {
      videoCodec: e2eeEnabled ? undefined : props.options.codec,
      red: !e2eeEnabled,
    },
    adaptiveStream: true,
    dynacast: true,
    ...(e2eeEnabled && worker ? { e2ee: { keyProvider, worker } } : {}),
  };

  const room = React.useMemo(() => new Room(roomOptions), []);
  const requestedAgentRef = React.useRef(false);

  React.useEffect(() => {
    if (e2eeEnabled && typeof e2eePassphrase === "string") {
      keyProvider
        .setKey(decodePassphrase(e2eePassphrase))
        .then(() => room.setE2EEEnabled(true))
        .catch((e) => {
          if (e instanceof DeviceUnsupportedError) alert("Browser does not support E2EE");
          else console.error(e);
        });
    }
  }, [e2eeEnabled, e2eePassphrase, room]);

  function EmbedOnlyStyles() {
    return (
      <style jsx global>{`
        html,
        body {
          height: 100% !important;
          margin: 0 !important;
          overflow: hidden !important;
          background: #000 !important;
        }
        body > div {
          height: 100% !important;
        }
        nav,
        header,
        footer {
          display: none !important;
        }
      `}</style>
    );
  }

  async function requestAgentOnce() {
    if (!props.embedEnabled) return;
    if (requestedAgentRef.current) return;
    requestedAgentRef.current = true;

    try {
      // ✅ IMPORTANT: route expects { room: ... }, NOT { roomName: ... }
      const r = await fetch("/api/livekit/request-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // ✅ ADDED: pass writing scoring context (if present) to agent via metadata
        body: (() => {
          let writingFeedback: any = null;
          try {
            const raw = localStorage.getItem("writing_feedback_context");
            if (raw) writingFeedback = JSON.parse(raw);
          } catch {
            writingFeedback = null;
          }

          return JSON.stringify({
            room: props.roomName,
            metadata: {
              mode: "writing_feedback",
              writingFeedback,
            },
          });
        })(),
      });

      if (!r.ok) {
        const t = await r.text();
        console.error("request-agent failed:", r.status, t);
      }
    } catch (e) {
      console.error("Failed to request agent", e);
    }
  }

  // ✅ receive transcript text from agent via data messages
  React.useEffect(() => {
    const onData = (payload: Uint8Array) => {
      try {
        const txt = new TextDecoder().decode(payload);
        const parsed = (() => {
          try { return JSON.parse(txt); } catch { return null; }
        })();

        const line =
          (parsed && (parsed.text || parsed.message)) ||
          txt;

        const fn = (window as any).__writingFeedbackAppend;
        if (typeof fn === "function") fn(String(line));
      } catch (e) {
        // ignore
      }
    };

    room.on(RoomEvent.DataReceived, onData);
    return () => {
      room.off(RoomEvent.DataReceived, onData);
    };
  }, [room]);

  return (
    <div className="w-full h-screen max-h-screen overflow-hidden" data-lk-theme="default">
      {props.embedEnabled && <EmbedOnlyStyles />}

      <LiveKitRoom
        room={room}
        token={props.connectionDetails.participantToken}
        serverUrl={props.connectionDetails.serverUrl}
        connect
        audio={props.userChoices.audioEnabled}
        video={props.userChoices.videoEnabled}
        connectOptions={{ autoSubscribe: true } as RoomConnectOptions}
        onConnected={() => {
          // ✅ request agent when feedback iframe connects
          requestAgentOnce();
        }}
        onDisconnected={() => {
          if (props.embedEnabled) return;
          window.location.assign("/speaking");
        }}
      >
        {props.embedEnabled ? (
          <>
            <RoomAudioRenderer />
            <AvatarOnlyView room={room} />
          </>
        ) : (
          <div className="w-full h-full">
            <VideoConference
              className="w-full h-full"
              chatMessageFormatter={formatChatMessageLinks}
              SettingsComponent={SHOW_SETTINGS_MENU ? SettingsMenu : undefined}
            />
          </div>
        )}

        <DebugMode />
        <RecordingIndicator />
      </LiveKitRoom>
    </div>
  );
}

function AvatarOnlyView({ room }: { room: Room }) {
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const [track, setTrack] = React.useState<RemoteVideoTrack | null>(null);

  const pickTargetParticipant = React.useCallback((): RemoteParticipant | null => {
    const remotes = Array.from(room.remoteParticipants.values());

    // try anam/avatar/agent identities first
    const target =
      remotes.find((p) => String(p.identity || "").includes("anam-avatar")) ||
      remotes.find((p) => String(p.identity || "").toLowerCase().includes("agent")) ||
      remotes[0];

    return target || null;
  }, [room]);

  const refresh = React.useCallback(() => {
    const p = pickTargetParticipant();
    if (!p) {
      setTrack(null);
      return;
    }

    let found: RemoteVideoTrack | null = null;

    for (const pub of p.trackPublications.values()) {
      const t = pub.track;
      if (!t || t.kind !== Track.Kind.Video) continue;

      if (pub.source === Track.Source.Camera || pub.source === Track.Source.Unknown) {
        found = t as RemoteVideoTrack;
        break;
      }

      if (!found) found = t as RemoteVideoTrack;
    }

    setTrack(found);
  }, [pickTargetParticipant]);

  React.useEffect(() => {
    refresh();

    room.on(RoomEvent.ParticipantConnected, refresh);
    room.on(RoomEvent.ParticipantDisconnected, refresh);
    room.on(RoomEvent.TrackSubscribed, refresh);
    room.on(RoomEvent.TrackUnsubscribed, refresh);
    room.on(RoomEvent.TrackPublished, refresh);
    room.on(RoomEvent.TrackUnpublished, refresh);

    return () => {
      room.off(RoomEvent.ParticipantConnected, refresh);
      room.off(RoomEvent.ParticipantDisconnected, refresh);
      room.off(RoomEvent.TrackSubscribed, refresh);
      room.off(RoomEvent.TrackUnsubscribed, refresh);
      room.off(RoomEvent.TrackPublished, refresh);
      room.off(RoomEvent.TrackUnpublished, refresh);
    };
  }, [room, refresh]);

  React.useEffect(() => {
    const el = videoRef.current;
    if (!el || !track) return;

    track.attach(el);
    return () => {
      track.detach(el);
    };
  }, [track]);

  return (
    <div className="w-full h-screen bg-black">
      {track ? (
        <video ref={videoRef} className="h-full w-full object-cover" autoPlay playsInline />
      ) : (
        <div className="h-full w-full grid place-items-center text-white/70">
          Waiting for avatar video…
        </div>
      )}
    </div>
  );
}