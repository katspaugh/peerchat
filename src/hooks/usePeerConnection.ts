import { useState, useCallback, useRef, useEffect } from 'react';
import { WebRTCService, type ProgressCallback } from '@/services/webrtc.service';
import { SignalingService } from '@/services/signaling.service';
import type { ConnectionState } from '@/types';

interface UsePeerConnectionCallbacks {
  onTrack?: (event: RTCTrackEvent) => void;
  onDataChannel?: (event: RTCDataChannelEvent) => void;
  createDataChannel?: (connection: RTCPeerConnection) => void;
  onNegotiationNeeded?: (description: RTCSessionDescriptionInit) => void;
  onProgress?: ProgressCallback;
}

export function usePeerConnection(callbacks: UsePeerConnectionCallbacks) {
  const [state, setState] = useState<ConnectionState>('disconnected');
  const [shareableLink, setShareableLink] = useState<string>('');
  const webrtcServiceRef = useRef<WebRTCService | null>(null);

  const initializeConnection = useCallback(() => {
    if (webrtcServiceRef.current) {
      webrtcServiceRef.current.close();
    }

    const service = new WebRTCService(callbacks.onProgress);
    webrtcServiceRef.current = service;

    const connection = service.getConnection();

    connection.onconnectionstatechange = () => {
      const connectionState = connection.connectionState;
      console.log('Connection state changed:', connectionState);
      if (connectionState === 'connected') {
        setState('connected');
      } else if (connectionState === 'failed') {
        console.error('Connection failed! State:', connectionState);
        setState('failed');
      }
    };

    if (callbacks.onTrack) {
      connection.ontrack = callbacks.onTrack;
    }

    if (callbacks.onDataChannel) {
      connection.ondatachannel = callbacks.onDataChannel;
    }

    return service;
  }, [callbacks.onTrack, callbacks.onDataChannel, callbacks.onProgress]);

  const createSession = useCallback(async () => {
    setState('creating-offer');

    const service = initializeConnection();
    const connection = service.getConnection();

    // Set this peer as the offerer for perfect negotiation
    service.setIsOfferer(true);

    // Create data channel before creating offer
    if (callbacks.createDataChannel) {
      callbacks.createDataChannel(connection);
    }

    const offer = await service.createOffer();
    const link = SignalingService.createShareableLink(offer);

    setShareableLink(link);
    setState('waiting-for-code');
  }, [initializeConnection, callbacks]);

  const joinSession = useCallback(
    async (offerFromUrl: RTCSessionDescriptionInit) => {
      setState('creating-offer');

      const service = initializeConnection();
      const connection = service.getConnection();

      // This peer is NOT the offerer (perfect negotiation)
      service.setIsOfferer(false);

      // Create data channel before setting remote offer for joiner
      if (callbacks.createDataChannel) {
        callbacks.createDataChannel(connection);
      }

      await service.setRemoteOffer(offerFromUrl);
      const answer = await service.createAnswer();

      const encodedAnswer = SignalingService.encode(answer);
      return encodedAnswer;
    },
    [initializeConnection, callbacks]
  );

  const submitAnswer = useCallback(async (code: string) => {
    if (!webrtcServiceRef.current) {
      throw new Error('No active connection');
    }

    setState('connecting');

    try {
      const answer = SignalingService.decode(code);
      await webrtcServiceRef.current.setRemoteAnswer(answer);
    } catch (error) {
      setState('failed');
      throw error;
    }
  }, []);

  const getConnection = useCallback((): RTCPeerConnection | null => {
    return webrtcServiceRef.current?.getConnection() ?? null;
  }, []);

  const handleNegotiation = useCallback(
    async (
      description: RTCSessionDescriptionInit,
      sendAnswer: (answer: RTCSessionDescriptionInit) => void
    ) => {
      if (!webrtcServiceRef.current) {
        console.error('No active connection for negotiation');
        return;
      }

      await webrtcServiceRef.current.handleNegotiationOffer(description, sendAnswer);
    },
    []
  );

  const enableNegotiation = useCallback(() => {
    if (!webrtcServiceRef.current) {
      console.error('No active connection to enable negotiation');
      return;
    }

    if (callbacks.onNegotiationNeeded) {
      console.log('Enabling renegotiation for adding media tracks');
      webrtcServiceRef.current.setNegotiationCallback(callbacks.onNegotiationNeeded);
    }
  }, [callbacks]);

  useEffect(() => {
    return () => {
      if (webrtcServiceRef.current) {
        webrtcServiceRef.current.close();
      }
    };
  }, []);

  return {
    state,
    shareableLink,
    createSession,
    joinSession,
    submitAnswer,
    getConnection,
    handleNegotiation,
    enableNegotiation,
  };
}
