export type ConnectionState =
  | 'disconnected'
  | 'creating-offer'
  | 'waiting-for-code'
  | 'connecting'
  | 'connected'
  | 'failed';

export interface Message {
  text: string;
  timestamp: number;
  from: 'local' | 'remote';
}

export interface ChatMessageData {
  type: 'chat';
  text: string;
  timestamp: number;
}

export interface NegotiationMessageData {
  type: 'negotiation';
  description: RTCSessionDescriptionInit;
}

export type MessageData = ChatMessageData | NegotiationMessageData;

export interface EncodedSessionData {
  type: 'offer' | 'answer';
  data: RTCSessionDescriptionInit;
}
