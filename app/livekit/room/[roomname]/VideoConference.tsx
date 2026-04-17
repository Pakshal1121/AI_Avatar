import type { TrackReferenceOrPlaceholder, WidgetState } from "@livekit/components-core";
import { isEqualTrackRef, isTrackReference, isWeb, log } from "@livekit/components-core";
import type { MessageFormatter } from "@livekit/components-react";
import {
  CarouselLayout,
  Chat,
  ConnectionStateToast,
  FocusLayout,
  FocusLayoutContainer,
  GridLayout,
  LayoutContextProvider,
  RoomAudioRenderer,
  useCreateLayoutContext,
  useLocalParticipant,
  usePinnedTracks,
  useTracks,
} from "@livekit/components-react";
import { RoomEvent, Track } from "livekit-client";
import * as React from "react";
import { ControlBar } from "./ControlBar";
import { ParticipantTile } from "./ParticipantTile";

export interface VideoConferenceProps extends React.HTMLAttributes<HTMLDivElement> {
  chatMessageFormatter?: MessageFormatter;
  /** @alpha */
  SettingsComponent?: React.ComponentType;
}

export function VideoConference({
  chatMessageFormatter,
  SettingsComponent,
  ...props
}: VideoConferenceProps) {
  const [widgetState, setWidgetState] = React.useState<WidgetState>({
    showChat: false,
    unreadMessages: 0,
    showSettings: false,
  });

  const lastAutoFocusedScreenShareTrack =
    React.useRef<TrackReferenceOrPlaceholder | null>(null);

  const [isAgentPanelOpen, setIsAgentPanelOpen] = React.useState(false);
  const [hideAgentTracks, setHideAgentTracks] = React.useState(false);


  React.useEffect(() => {
    const open = () => {
      setIsAgentPanelOpen(true);
      setHideAgentTracks(false); // ✅ show agent when opening
    };
    const close = () => setIsAgentPanelOpen(false);

    const hide = () => setHideAgentTracks(true);  // ✅ stop agent -> hide agent tiles
    const show = () => setHideAgentTracks(false); // ✅ start agent -> allow agent tiles


    window.addEventListener("lk:open-agent-panel", open as EventListener);
    window.addEventListener("lk:close-agent-panel", close as EventListener);
    window.addEventListener("lk:hide-agent-tracks", hide as EventListener);
    window.addEventListener("lk:show-agent-tracks", show as EventListener);

    return () => {
      window.removeEventListener("lk:open-agent-panel", open as EventListener);
      window.removeEventListener("lk:close-agent-panel", close as EventListener);
      window.removeEventListener("lk:hide-agent-tracks", hide as EventListener);
      window.removeEventListener("lk:show-agent-tracks", show as EventListener);
    };
  }, []);

  // ✅ Use SID instead of identity (SID is always stable)
  const { localParticipant } = useLocalParticipant();
  const localSid = localParticipant?.sid;

  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: false },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { updateOnlyOn: [RoomEvent.ActiveSpeakersChanged], onlySubscribed: false }
  );

  const realTracks = React.useMemo(() => tracks.filter(isTrackReference), [tracks]);

  //  const visibleTracks = React.useMemo(() => {
      
  //   if (!isAgentPanelOpen && !hideAgentTracks) return realTracks;

  //     return realTracks.filter((t) => {
  //       const p = t.participant;
  //       const agentType = p.attributes?.["agentType"];
  //       const identity = (p.identity || "").toLowerCase();
  //       const name = (p.name || "").toLowerCase();

  //       const isAvatar =
  //         agentType === "avatar" ||
  //         identity.includes("avatar") ||
  //         name.includes("mia");

  //       const isLocal = !!localSid && p.sid === localSid;

  //       // ✅ Agent panel open => only local user + avatar
  //       return isLocal || isAvatar;
  //     });
  //   }, [realTracks, isAgentPanelOpen, localSid]);

   const visibleTracks = React.useMemo(() => {
  // if local not ready yet, avoid flashes
  if (!localSid) return [];

  // ✅ If user clicked Stop Agent -> show ONLY local user
  if (hideAgentTracks) {
    return realTracks.filter((t) => t.participant.sid === localSid);
  }

  // ✅ Normal meeting view (agent panel closed): show everyone
  if (!isAgentPanelOpen) {
    return realTracks;
  }

  // ✅ Agent panel open: show local user + avatar only
  return realTracks.filter((t) => {
    const p = t.participant;
    const agentType = p.attributes?.["agentType"];
    const identity = (p.identity || "").toLowerCase();
    const name = (p.name || "").toLowerCase();

    const isAvatar =
      agentType === "avatar" ||
      identity.includes("avatar") ||
      name.includes("mia");

    const isLocal = p.sid === localSid;
    return isLocal || isAvatar;
  });
}, [realTracks, isAgentPanelOpen, hideAgentTracks, localSid]);



  const widgetUpdate = (state: WidgetState) => {
    log.debug("updating widget state", state);
    setWidgetState(state);
  };

  const layoutContext = useCreateLayoutContext();

  const screenShareTracks = visibleTracks.filter(
    (track) => track.publication.source === Track.Source.ScreenShare
  );

  const focusTrack = usePinnedTracks(layoutContext)?.[0];

  const carouselTracks = React.useMemo(() => {
    if (!focusTrack) return visibleTracks;
    return visibleTracks.filter((track) => !isEqualTrackRef(track, focusTrack));
  }, [visibleTracks, focusTrack]);

  React.useEffect(() => {
    if (
      screenShareTracks.some((track) => track.publication.isSubscribed) &&
      lastAutoFocusedScreenShareTrack.current === null
    ) {
      layoutContext.pin.dispatch?.({
        msg: "set_pin",
        trackReference: screenShareTracks[0],
      });
      lastAutoFocusedScreenShareTrack.current = screenShareTracks[0];
    } else if (
      lastAutoFocusedScreenShareTrack.current &&
      !screenShareTracks.some(
        (track) =>
          track.publication.trackSid ===
          lastAutoFocusedScreenShareTrack.current?.publication?.trackSid
      )
    ) {
      layoutContext.pin.dispatch?.({ msg: "clear_pin" });
      lastAutoFocusedScreenShareTrack.current = null;
    }
  }, [
    screenShareTracks
      .map((ref) => `${ref.publication.trackSid}_${ref.publication.isSubscribed}`)
      .join(),
    layoutContext.pin,
  ]);

  return (
    <div
      className={`lk-video-conference relative w-full h-full ${props.className ?? ""}`}
      {...props}
    >
      {isWeb() && (
        <LayoutContextProvider value={layoutContext} onWidgetChange={widgetUpdate}>
          <div className="lk-video-conference-inner w-full h-full pb-20">
            {!focusTrack ? (
              <div className="lk-grid-layout-wrapper w-full h-full">
                <GridLayout tracks={visibleTracks}>
                  <ParticipantTile />
                </GridLayout>
              </div>
            ) : (
              <div className="lk-focus-layout-wrapper w-full h-full">
                <FocusLayoutContainer>
                  <CarouselLayout tracks={carouselTracks}>
                    <ParticipantTile />
                  </CarouselLayout>
                  {focusTrack && <FocusLayout trackRef={focusTrack} />}
                </FocusLayoutContainer>
              </div>
            )}

            <ControlBar controls={{ chat: true, settings: !!SettingsComponent }} />
          </div>

          <Chat
            style={{ display: widgetState.showChat ? "grid" : "none" }}
            messageFormatter={chatMessageFormatter}
          />

          {SettingsComponent && (
            <div
              className="lk-settings-menu-modal"
              style={{ display: widgetState.showSettings ? "block" : "none" }}
            >
              <SettingsComponent />
            </div>
          )}
        </LayoutContextProvider>
      )}

      <RoomAudioRenderer />
      <ConnectionStateToast />
    </div>
  );
}
