import { useState, useCallback, useRef } from 'react';
import { MessageService } from '@/services/message.service';
import type { Message } from '@/types';

export function useDataChannel() {
  const [messages, setMessages] = useState<Message[]>([]);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);

  const createDataChannel = useCallback((connection: RTCPeerConnection) => {
    const channel = connection.createDataChannel('chat');
    dataChannelRef.current = channel;

    channel.onopen = () => {
      console.log('Data channel opened');
    };

    channel.onmessage = (event) => {
      const data = MessageService.deserialize(event.data);
      const message = MessageService.createRemoteMessage(data);
      setMessages((prev) => [...prev, message]);
    };

    return channel;
  }, []);

  const handleDataChannel = useCallback((event: RTCDataChannelEvent) => {
    const channel = event.channel;
    dataChannelRef.current = channel;

    channel.onopen = () => {
      console.log('Data channel opened');
    };

    channel.onmessage = (event) => {
      const data = MessageService.deserialize(event.data);
      const message = MessageService.createRemoteMessage(data);
      setMessages((prev) => [...prev, message]);
    };
  }, []);

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

  return {
    messages,
    createDataChannel,
    handleDataChannel,
    sendMessage,
  };
}
