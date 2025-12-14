import { useState, useCallback } from 'react';
import { MediaService } from '@/services/media.service';

export function useMediaStream() {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isRequestingMedia, setIsRequestingMedia] = useState(false);

  const startLocalStream = useCallback(async (connection: RTCPeerConnection) => {
    if (localStream) return localStream;

    setIsRequestingMedia(true);
    try {
      const stream = await MediaService.getUserMedia();
      setLocalStream(stream);
      MediaService.addTracksToConnection(stream, connection);
      return stream;
    } catch (error) {
      console.error('Failed to get user media:', error);
      throw error;
    } finally {
      setIsRequestingMedia(false);
    }
  }, [localStream]);

  const stopLocalStream = useCallback(() => {
    MediaService.stopMediaStream(localStream);
    setLocalStream(null);
  }, [localStream]);

  const handleRemoteTrack = useCallback((event: RTCTrackEvent) => {
    const [stream] = event.streams;
    setRemoteStream(stream);
  }, []);

  const stopRemoteStream = useCallback(() => {
    setRemoteStream(null);
  }, []);

  return {
    localStream,
    remoteStream,
    isRequestingMedia,
    startLocalStream,
    stopLocalStream,
    handleRemoteTrack,
    stopRemoteStream,
  };
}
