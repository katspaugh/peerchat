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
    console.log('Creating offer...');
    const offer = await this.connection.createOffer();
    console.log('Offer created, setting local description...');
    await this.connection.setLocalDescription(offer);

    console.log('Waiting for ICE gathering...');
    await this.waitForIceGathering();
    console.log('ICE gathering complete');

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
    return new Promise((resolve, reject) => {
      console.log('Current ICE gathering state:', this.connection.iceGatheringState);

      if (this.connection.iceGatheringState === 'complete') {
        resolve();
        return;
      }

      // Set a timeout to prevent hanging forever
      const timeout = setTimeout(() => {
        this.connection.removeEventListener('icegatheringstatechange', checkState);
        console.log('ICE gathering timeout - current state:', this.connection.iceGatheringState);
        // Resolve anyway - we can still try to connect with what we have
        resolve();
      }, 5000);

      const checkState = () => {
        console.log('ICE gathering state changed to:', this.connection.iceGatheringState);
        if (this.connection.iceGatheringState === 'complete') {
          clearTimeout(timeout);
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
