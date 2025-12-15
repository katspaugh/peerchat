import { useState, useCallback, useEffect } from 'react';
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

  const stopLocalStream = useCallback((connection: RTCPeerConnection | null) => {
    if (localStream && connection) {
      // Remove tracks from the peer connection
      const senders = connection.getSenders();
      senders.forEach((sender) => {
        if (sender.track && localStream.getTracks().includes(sender.track)) {
          connection.removeTrack(sender);
        }
      });
    }

    MediaService.stopMediaStream(localStream);
    setLocalStream(null);
  }, [localStream]);

  const handleRemoteTrack = useCallback((event: RTCTrackEvent) => {
    console.log('Remote track received:', event.track.kind);
    const [stream] = event.streams;
    console.log('Remote stream:', stream, 'tracks:', stream.getTracks().length);
    setRemoteStream(stream);
  }, []);

  const stopRemoteStream = useCallback(() => {
    setRemoteStream(null);
  }, []);

  // Monitor remote stream for track changes
  useEffect(() => {
    if (!remoteStream) return;

    const checkStreamTracks = () => {
      const activeTracks = remoteStream.getTracks().filter(track => track.readyState === 'live');
      console.log('Remote stream tracks check:', {
        total: remoteStream.getTracks().length,
        active: activeTracks.length,
      });

      if (activeTracks.length === 0) {
        console.log('No active tracks in remote stream, clearing it');
        setRemoteStream(null);
      }
    };

    // Listen for tracks being removed from the stream
    const handleRemoveTrack = (event: MediaStreamTrackEvent) => {
      console.log('Track removed from remote stream:', event.track.kind);
      checkStreamTracks();
    };

    // Listen for tracks ending
    const handleTrackEnded = (event: Event) => {
      const track = event.target as MediaStreamTrack;
      console.log('Remote track ended:', track.kind);
      checkStreamTracks();
    };

    remoteStream.addEventListener('removetrack', handleRemoveTrack as EventListener);

    // Add ended listeners to all tracks
    remoteStream.getTracks().forEach(track => {
      track.addEventListener('ended', handleTrackEnded);
    });

    return () => {
      remoteStream.removeEventListener('removetrack', handleRemoveTrack as EventListener);
      remoteStream.getTracks().forEach(track => {
        track.removeEventListener('ended', handleTrackEnded);
      });
    };
  }, [remoteStream]);

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
