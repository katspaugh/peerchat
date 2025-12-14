import type { EncodedSessionData } from '@/types';

export class SignalingService {
  static encode(sessionDescription: RTCSessionDescriptionInit): string {
    const data: EncodedSessionData = {
      type: sessionDescription.type as 'offer' | 'answer',
      data: sessionDescription,
    };
    const json = JSON.stringify(data);
    return btoa(json);
  }

  static decode(encoded: string): RTCSessionDescriptionInit {
    try {
      const json = atob(encoded);
      const data: EncodedSessionData = JSON.parse(json);
      return data.data;
    } catch {
      throw new Error('Invalid session code');
    }
  }

  static createShareableLink(offer: RTCSessionDescriptionInit): string {
    const encoded = this.encode(offer);
    const url = new URL(window.location.href);
    url.searchParams.set('session', encoded);
    return url.toString();
  }

  static getSessionFromUrl(): RTCSessionDescriptionInit | null {
    const params = new URLSearchParams(window.location.search);
    const session = params.get('session');
    if (!session) return null;

    try {
      return this.decode(session);
    } catch {
      return null;
    }
  }
}
