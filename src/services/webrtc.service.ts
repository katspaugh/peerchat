const STUN_SERVER = 'stun:stun.l.google.com:19302';

export class WebRTCService {
  private connection: RTCPeerConnection;

  constructor() {
    this.connection = new RTCPeerConnection({
      iceServers: [{ urls: STUN_SERVER }],
    });
  }

  getConnection(): RTCPeerConnection {
    return this.connection;
  }

  async createOffer(): Promise<RTCSessionDescriptionInit> {
    const offer = await this.connection.createOffer();
    await this.connection.setLocalDescription(offer);

    await this.waitForIceGathering();

    return this.connection.localDescription!;
  }

  async createAnswer(): Promise<RTCSessionDescriptionInit> {
    const answer = await this.connection.createAnswer();
    await this.connection.setLocalDescription(answer);

    await this.waitForIceGathering();

    return this.connection.localDescription!;
  }

  async setRemoteOffer(offer: RTCSessionDescriptionInit): Promise<void> {
    await this.connection.setRemoteDescription(offer);
  }

  async setRemoteAnswer(answer: RTCSessionDescriptionInit): Promise<void> {
    await this.connection.setRemoteDescription(answer);
  }

  private waitForIceGathering(): Promise<void> {
    return new Promise((resolve) => {
      if (this.connection.iceGatheringState === 'complete') {
        resolve();
        return;
      }

      const checkState = () => {
        if (this.connection.iceGatheringState === 'complete') {
          this.connection.removeEventListener('icegatheringstatechange', checkState);
          resolve();
        }
      };

      this.connection.addEventListener('icegatheringstatechange', checkState);
    });
  }

  close(): void {
    this.connection.close();
  }
}
