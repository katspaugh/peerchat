import { useState, useCallback, useRef } from 'react';
import { MessageService } from '@/services/message.service';
import type { Message, NegotiationMessageData } from '@/types';

interface UseDataChannelCallbacks {
  onNegotiation?: (description: RTCSessionDescriptionInit) => void;
}

export function useDataChannel(callbacks?: UseDataChannelCallbacks) {
  const [messages, setMessages] = useState<Message[]>([]);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);

  const handleMessage = useCallback((event: MessageEvent) => {
    const data = MessageService.deserialize(event.data);

    if (data.type === 'chat') {
      const message = MessageService.createRemoteMessage(data);
      setMessages((prev) => [...prev, message]);
    } else if (data.type === 'negotiation' && callbacks?.onNegotiation) {
      console.log('Received negotiation message');
      callbacks.onNegotiation(data.description);
    }
  }, [callbacks]);

  const createDataChannel = useCallback((connection: RTCPeerConnection) => {
    const channel = connection.createDataChannel('chat');
    dataChannelRef.current = channel;

    channel.onopen = () => {
      console.log('Data channel opened');
    };

    channel.onmessage = handleMessage;

    return channel;
  }, [handleMessage]);

  const handleDataChannel = useCallback((event: RTCDataChannelEvent) => {
    const channel = event.channel;
    dataChannelRef.current = channel;

    channel.onopen = () => {
      console.log('Data channel opened');
    };

    channel.onmessage = handleMessage;
  }, [handleMessage]);

  const sendMessage = useCallback((text: string) => {
    if (!dataChannelRef.current || dataChannelRef.current.readyState !== 'open') {
      console.error('Data channel not ready');
      return;
    }

    const serialized = MessageService.serialize(text);
    dataChannelRef.current.send(serialized);

    const message = MessageService.createLocalMessage(text);
    setMessages((prev) => [...prev, message]);
  }, []);

  const sendNegotiation = useCallback((description: RTCSessionDescriptionInit) => {
    if (!dataChannelRef.current || dataChannelRef.current.readyState !== 'open') {
      console.error('Data channel not ready for negotiation');
      return;
    }

    const data: NegotiationMessageData = {
      type: 'negotiation',
      description,
    };
    dataChannelRef.current.send(JSON.stringify(data));
  }, []);

  return {
    messages,
    createDataChannel,
    handleDataChannel,
    sendMessage,
    sendNegotiation,
  };
}
