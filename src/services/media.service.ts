export class MediaService {
  static async getUserMedia(): Promise<MediaStream> {
    try {
      return await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
    } catch {
      throw new Error('Failed to access camera and microphone');
    }
  }

  static stopMediaStream(stream: MediaStream | null): void {
    if (!stream) return;
    stream.getTracks().forEach((track) => track.stop());
  }

  static addTracksToConnection(
    stream: MediaStream,
    connection: RTCPeerConnection
  ): void {
    stream.getTracks().forEach((track) => {
      connection.addTrack(track, stream);
    });
  }
}
