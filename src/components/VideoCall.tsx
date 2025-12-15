import { useEffect, useRef } from 'react';
import { Card } from './ui/card';

interface VideoCallProps {
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
}

export function VideoCall({ localStream, remoteStream }: VideoCallProps) {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  if (!localStream && !remoteStream) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl mx-auto mb-6">
      {remoteStream && (
        <Card className="overflow-hidden">
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full aspect-video bg-black"
          />
          <div className="p-2 text-center text-sm">Remote</div>
        </Card>
      )}
      {localStream && (
        <Card className="overflow-hidden">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full aspect-video bg-black scale-x-[-1]"
          />
          <div className="p-2 text-center text-sm">You</div>
        </Card>
      )}
    </div>
  );
}
