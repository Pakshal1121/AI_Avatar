import { supportsScreenSharing } from "@livekit/components-core";
import {
  ChatIcon,
  ChatToggle,
  ControlBarProps,
  DisconnectButton,
  LeaveIcon,
  MediaDeviceMenu,
  StartMediaButton,
  TrackToggle,
  useLocalParticipantPermissions,
  useMaybeLayoutContext,
  usePersistentUserChoices,
  useRoomContext,
} from "@livekit/components-react";
import { Track } from "livekit-client";
import * as React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useRoomName } from "./RoomContext";
import { useMediaQuery } from "./useMediaQuery";
import { Bot, BotOff } from "lucide-react";

export function ControlBar({
  variation,
  controls,
  saveUserChoices = true,
  onDeviceError,
  ...props
}: ControlBarProps) {
  const roomName = useRoomName();
  const router = useRouter();

  // ✅ LiveKit Room instance (for reliable redirect on disconnect)
  const room = useRoomContext();

  const [isChatOpen, setIsChatOpen] = React.useState(false);
  const [agentCalling, setAgentCalling] = useState(false);
  const [agentStopping, setAgentStopping] = useState(false);

  // ✅ Prevent double redirects
  const redirectedRef = React.useRef(false);

  const leaveTriggeredRef = React.useRef(false);


  // ✅ If disconnect happens by ANY method, push to /speaking
  React.useEffect(() => {
    if (!room) return;

    const onDisconnected = () => {
      if (redirectedRef.current) return;
      redirectedRef.current = true;
       // ✅ Hard navigation prevents the black-screen issue completely
      window.location.assign("/speaking");
    };

    room.on("disconnected", onDisconnected);
    return () => {
      room.off("disconnected", onDisconnected);
    };
  }, [room]);

  const layoutContext = useMaybeLayoutContext();
  React.useEffect(() => {
    if (layoutContext?.widget.state?.showChat !== undefined) {
      setIsChatOpen(layoutContext?.widget.state?.showChat);
    }
  }, [layoutContext?.widget.state?.showChat]);

  const isTooLittleSpace = useMediaQuery(
    `(max-width: ${isChatOpen ? 1000 : 760}px)`
  );

  
  const findAgentIdentity = React.useCallback(() => {
    const agentName = process.env.NEXT_PUBLIC_AGENT_NAME || "livekit-agent";
    const candidates = Array.from(room?.remoteParticipants?.values?.() ?? []);

    // best match first
    const exact =
      candidates.find((p) => p.identity === agentName || p.name === agentName) ||
      candidates.find((p) =>
        (p.identity || "").toLowerCase().includes(agentName.toLowerCase())
      ) ||
      candidates.find((p) =>
        (p.name || "").toLowerCase().includes(agentName.toLowerCase())
      ) ||
      // fallback: anything that looks like agent
      candidates.find((p) => (p.identity || "").toLowerCase().includes("agent")) ||
      candidates.find((p) => (p.name || "").toLowerCase().includes("agent"));

    return exact?.identity;
  }, [room]);

  const defaultVariation = isTooLittleSpace ? "minimal" : "verbose";
  variation ??= defaultVariation;

  const visibleControls = { leave: true, ...controls };

  const localPermissions = useLocalParticipantPermissions();

  if (!localPermissions) {
    visibleControls.camera = false;
    visibleControls.chat = false;
    visibleControls.microphone = false;
    visibleControls.screenShare = false;
  } else {
    visibleControls.camera ??= localPermissions.canPublish;
    visibleControls.microphone ??= localPermissions.canPublish;
    visibleControls.screenShare ??= localPermissions.canPublish;
    visibleControls.chat ??= localPermissions.canPublishData && controls?.chat;
  }

  const showIcon = React.useMemo(
    () => variation === "minimal" || variation === "verbose",
    [variation]
  );
  const showText = React.useMemo(
    () => variation === "textOnly" || variation === "verbose",
    [variation]
  );

  const browserSupportsScreenSharing = supportsScreenSharing();

  const [isScreenShareEnabled, setIsScreenShareEnabled] = React.useState(false);

  const onScreenShareChange = React.useCallback((enabled: boolean) => {
    setIsScreenShareEnabled(enabled);
  }, []);

  const {
    saveAudioInputEnabled,
    saveVideoInputEnabled,
    saveAudioInputDeviceId,
    saveVideoInputDeviceId,
  } = usePersistentUserChoices({ preventSave: !saveUserChoices });

  const microphoneOnChange = React.useCallback(
    (enabled: boolean, isUserInitiated: boolean) =>
      isUserInitiated ? saveAudioInputEnabled(enabled) : null,
    [saveAudioInputEnabled]
  );

  const cameraOnChange = React.useCallback(
    (enabled: boolean, isUserInitiated: boolean) =>
      isUserInitiated ? saveVideoInputEnabled(enabled) : null,
    [saveVideoInputEnabled]
  );

  // Custom Agent Calling
  // ==================================================================
  const onRequestAgent = React.useCallback(async () => {
    try {
      setAgentCalling(true);

      window.dispatchEvent(new Event("lk:show-agent-tracks"));
      

      const response = await fetch("/api/livekit/request-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ room: roomName }),
      });

      if (!response.ok) throw new Error("Network response was not ok");
      window.dispatchEvent(new Event("lk:open-agent-panel"));

      const responseData = await response.json();
      console.log("Response:", responseData);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setAgentCalling(false);
    }
  }, [roomName]);


//   if (agentStopping) return;

//   try {
//     setAgentStopping(true);
//     window.dispatchEvent(new Event("lk:close-agent-panel"));

//     const agentIdentity = findAgentIdentity();

//     const url =
//       `/api/livekit/stop-agent?roomName=${encodeURIComponent(roomName)}` +
//       (agentIdentity ? `&identity=${encodeURIComponent(agentIdentity)}` : "");

//     const response = await fetch(url, { method: "DELETE" });
//     if (!response.ok) throw new Error("Network response was not ok");

//     console.log(await response.text());
//   } catch (error) {
//     console.error("Error:", error);
//   } finally {
//     setAgentStopping(false);
//   }
// }, [roomName, agentStopping, findAgentIdentity]);

  // ==================================================================

  // ✅ Leave button: trigger disconnect, then redirect (no refresh)
 
  const onCloseAgent = React.useCallback(async () => {
  if (agentStopping) return;

  try {
    setAgentStopping(true);
    window.dispatchEvent(new Event("lk:close-agent-panel"));
    window.dispatchEvent(new Event("lk:hide-agent-tracks"));

    const agentIdentity = findAgentIdentity();

    const url =
      `/api/livekit/stop-agent?roomName=${encodeURIComponent(roomName)}` +
      (agentIdentity ? `&identity=${encodeURIComponent(agentIdentity)}` : "");

    const response = await fetch(url, { method: "DELETE" });
    if (!response.ok) throw new Error("Network response was not ok");

    console.log(await response.text());
    

    // ✅ stop “full screen tile” behavior
    try {
      (layoutContext as any)?.setPinnedTrack?.(undefined);
      (layoutContext as any)?.setPin?.(undefined);
      const current = (layoutContext as any)?.widget?.state?.showChat;
      if (typeof current === "boolean") {
        (layoutContext as any)?.widget?.setState?.({ showChat: current });
      }
    } catch {}
  } catch (error) {
    console.error("Error:", error);
  } finally {
    setAgentStopping(false);
  }
}, [roomName, agentStopping, findAgentIdentity, layoutContext]);

 
  const onLeaveClick = React.useCallback(() => {
    // DisconnectButton will call disconnect internally.
    // We just set a short fallback redirect in case the event is delayed.
    window.dispatchEvent(new Event("lk:close-agent-panel"));

    // prevent double navigation
  if (redirectedRef.current) return;
 
  // trigger a clean disconnect; our room.on('disconnected') will handle router.replace
  try {
    room?.disconnect();
  } catch (e) {
    // fallback: if disconnect throws for some reason, still navigate
    redirectedRef.current = true;
    router.replace("/speaking");
    router.refresh();
  }
}, [room, router]);


  return (
    <div {...props} className="lk-control-bar">
      {visibleControls.microphone && (
        <div className="lk-button-group">
          <TrackToggle
            source={Track.Source.Microphone}
            showIcon={showIcon}
            onChange={microphoneOnChange}
            onDeviceError={(error) =>
              onDeviceError?.({ source: Track.Source.Microphone, error })
            }
          >
            {showText && "Microphone"}
          </TrackToggle>
          <div className="lk-button-group-menu">
            <MediaDeviceMenu
              kind="audioinput"
              onActiveDeviceChange={(_kind, deviceId) =>
                saveAudioInputDeviceId(deviceId ?? "default")
              }
            />
          </div>
        </div>
      )}

      {visibleControls.camera && (
        <div className="lk-button-group">
          <TrackToggle
            source={Track.Source.Camera}
            showIcon={showIcon}
            onChange={cameraOnChange}
            onDeviceError={(error) =>
              onDeviceError?.({ source: Track.Source.Camera, error })
            }
          >
            {showText && "Camera"}
          </TrackToggle>
          <div className="lk-button-group-menu">
            <MediaDeviceMenu
              kind="videoinput"
              onActiveDeviceChange={(_kind, deviceId) =>
                saveVideoInputDeviceId(deviceId ?? "default")
              }
            />
          </div>
        </div>
      )}

      {visibleControls.screenShare && browserSupportsScreenSharing && (
        <TrackToggle
          source={Track.Source.ScreenShare}
          captureOptions={{ audio: true, selfBrowserSurface: "include" }}
          showIcon={showIcon}
          onChange={onScreenShareChange}
          onDeviceError={(error) =>
            onDeviceError?.({ source: Track.Source.ScreenShare, error })
          }
        >
          {showText &&
            (isScreenShareEnabled ? "Stop screen share" : "Share screen")}
        </TrackToggle>
      )}

      {visibleControls.chat && (
        <ChatToggle>
          {showIcon && <ChatIcon />}
          {showText && "Chat"}
        </ChatToggle>
      )}

      <button
        className="lk-button"
        onClick={onRequestAgent}
        disabled={agentCalling}
      >
        <Bot className="max-w-5" />
        {showText && "AI Agent"}
      </button>

      <button
        className="lk-button !text-red-600 !border !border-solid !border-red-600"
        onClick={onCloseAgent}
        disabled={agentStopping}
      >
        <BotOff className="max-w-5" />
        {showText && (agentStopping ? "Stopping..." : "Stop Agent")}
    </button>


    {visibleControls.leave && (
      <DisconnectButton
        onClick={() => {
          window.dispatchEvent(new Event("lk:close-agent-panel"));
          leaveTriggeredRef.current = true;
          // Let DisconnectButton do the actual disconnect
        }}
      >
        {showIcon && <LeaveIcon />}
        {showText && "Leave"}
      </DisconnectButton>
    )}

      {/* {visibleControls.leave && (
        <button type="button" className="lk-button" onClick={onLeaveClick}>
          {showIcon && <LeaveIcon />}
          {showText && "Leave"}
        </button>
      )} */}

      <StartMediaButton />
    </div>
  );
}
