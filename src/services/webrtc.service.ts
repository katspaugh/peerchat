const STUN_SERVER = 'stun:stun.l.google.com:19302';

export type ProgressCallback = (step: string, progress: number) => void;

export class WebRTCService {
  private connection: RTCPeerConnection;
  private isOfferer: boolean = false;
  private makingOffer: boolean = false;
  private ignoreOffer: boolean = false;
  private progressCallback?: ProgressCallback;

  constructor(progressCallback?: ProgressCallback) {
    this.connection = new RTCPeerConnection({
      iceServers: [{ urls: STUN_SERVER }],
    });
    this.progressCallback = progressCallback;
  }

  getConnection(): RTCPeerConnection {
    return this.connection;
  }

  setIsOfferer(value: boolean): void {
    this.isOfferer = value;
  }

  setNegotiationCallback(
    callback: (description: RTCSessionDescriptionInit) => void
  ): void {
    this.connection.onnegotiationneeded = async () => {
      try {
        console.log('Negotiation needed');
        this.makingOffer = true;
        await this.connection.setLocalDescription();
        console.log('Sending negotiation offer');
        callback(this.connection.localDescription!);
      } catch (error) {
        console.error('Error during negotiation:', error);
      } finally {
        this.makingOffer = false;
      }
    };
  }

  async handleNegotiationOffer(
    description: RTCSessionDescriptionInit,
    sendAnswer: (answer: RTCSessionDescriptionInit) => void
  ): Promise<void> {
    const offerCollision =
      description.type === 'offer' &&
      (this.makingOffer || this.connection.signalingState !== 'stable');

    this.ignoreOffer = !this.isOfferer && offerCollision;
    if (this.ignoreOffer) {
      console.log('Ignoring offer due to collision');
      return;
    }

    await this.connection.setRemoteDescription(description);

    if (description.type === 'offer') {
      await this.connection.setLocalDescription();
      console.log('Sending negotiation answer');
      sendAnswer(this.connection.localDescription!);
    }
  }

  async createOffer(): Promise<RTCSessionDescriptionInit> {
    console.log('Creating offer...');
    this.progressCallback?.('Creating offer...', 5);

    const offer = await this.connection.createOffer();

    console.log('Offer created, setting local description...');
    this.progressCallback?.('Setting local description...', 15);
    await this.connection.setLocalDescription(offer);

    console.log('Waiting for ICE gathering...');
    this.progressCallback?.('Gathering connection candidates...', 25);
    await this.waitForIceGathering();

    console.log('ICE gathering complete');
    this.progressCallback?.('Connection ready!', 100);

    return this.connection.localDescription!;
  }

  async createAnswer(): Promise<RTCSessionDescriptionInit> {
    console.log('Creating answer...');
    this.progressCallback?.('Creating answer...', 5);

    const answer = await this.connection.createAnswer();

    console.log('Setting local description...');
    this.progressCallback?.('Setting local description...', 15);
    await this.connection.setLocalDescription(answer);

    console.log('Waiting for ICE gathering...');
    this.progressCallback?.('Gathering connection candidates...', 25);
    await this.waitForIceGathering();

    console.log('ICE gathering complete');
    this.progressCallback?.('Code generated!', 100);

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
        this.progressCallback?.('Gathering connection candidates...', 90);
        resolve();
        return;
      }

      let currentProgress = 25;
      let candidateCount = 0;

      // Gradually increment progress as candidates are gathered
      const incrementProgress = () => {
        if (currentProgress < 90) {
          currentProgress = Math.min(90, currentProgress + 8);
          this.progressCallback?.('Gathering connection candidates...', currentProgress);
        }
      };

      // Listen for ICE candidates to show progress
      const handleCandidate = (event: RTCPeerConnectionIceEvent) => {
        if (event.candidate) {
          candidateCount++;
          incrementProgress();
        }
      };

      this.connection.addEventListener('icecandidate', handleCandidate);

      // Also increment progress periodically in case candidates come slowly
      const progressInterval = setInterval(() => {
        incrementProgress();
      }, 300);

      // Set a timeout to prevent hanging forever (reduced from 5s to 2s)
      const timeout = setTimeout(() => {
        clearInterval(progressInterval);
        this.connection.removeEventListener('icegatheringstatechange', checkState);
        this.connection.removeEventListener('icecandidate', handleCandidate);
        console.log('ICE gathering timeout - current state:', this.connection.iceGatheringState);
        this.progressCallback?.('Gathering connection candidates...', 90);
        // Resolve anyway - we can still try to connect with what we have
        resolve();
      }, 2000);

      const checkState = () => {
        console.log('ICE gathering state changed to:', this.connection.iceGatheringState);
        if (this.connection.iceGatheringState === 'complete') {
          clearTimeout(timeout);
          clearInterval(progressInterval);
          this.connection.removeEventListener('icegatheringstatechange', checkState);
          this.connection.removeEventListener('icecandidate', handleCandidate);
          this.progressCallback?.('Gathering connection candidates...', 90);
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
