import dynamic from 'next/dynamic';

// Dynamic import disables SSR — required because the client uses LiveKit
// which depends on browser APIs (WebRTC, MediaDevices, etc.)
const ListeningRoomClient = dynamic(
  () => import('./ListeningRoomClient'),
  { ssr: false }
);

// Next.js 14: params and searchParams are synchronous in page components
// but must be typed as potentially async-compatible
interface PageProps {
  params: { roomname: string };
  searchParams: { section?: string };
}

export default function ListeningRoomPage({ params, searchParams }: PageProps) {
  const roomName = params.roomname;
  const sectionKey = searchParams?.section || 'section1';

  return (
    <div className="h-screen w-full">
      <ListeningRoomClient
        roomName={roomName}
        sectionKey={sectionKey}
      />
    </div>
  );
}
