import type { Message, MessageData } from '@/types';

export class MessageService {
  static serialize(text: string): string {
    const data: MessageData = {
      text,
      timestamp: Date.now(),
    };
    return JSON.stringify(data);
  }

  static deserialize(json: string): MessageData {
    return JSON.parse(json) as MessageData;
  }

  static createLocalMessage(text: string): Message {
    return {
      text,
      timestamp: Date.now(),
      from: 'local',
    };
  }

  static createRemoteMessage(data: MessageData): Message {
    return {
      text: data.text,
      timestamp: data.timestamp,
      from: 'remote',
    };
  }

  static formatTime(timestamp: number): string {
    const date = new Date(timestamp);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }
}
