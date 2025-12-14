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

export interface MessageData {
  text: string;
  timestamp: number;
}

export interface EncodedSessionData {
  type: 'offer' | 'answer';
  data: RTCSessionDescriptionInit;
}
