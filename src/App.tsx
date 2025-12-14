import { useCallback, useEffect, useState } from 'react';
import { Button } from './components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Input } from './components/ui/input';
import { ConnectionStatus } from './components/ConnectionStatus';
import { ChatInterface } from './components/ChatInterface';
import { VideoCall } from './components/VideoCall';
import { usePeerConnection } from './hooks/usePeerConnection';
import { useDataChannel } from './hooks/useDataChannel';
import { useMediaStream } from './hooks/useMediaStream';
import { SignalingService } from './services/signaling.service';

function App() {
  const [answerCode, setAnswerCode] = useState('');
  const [myAnswerCode, setMyAnswerCode] = useState('');
  const [isVideoCallActive, setIsVideoCallActive] = useState(false);
  const [isJoiner, setIsJoiner] = useState(false);

  const {
    localStream,
    remoteStream,
    isRequestingMedia,
    startLocalStream,
    stopLocalStream,
    handleRemoteTrack,
    stopRemoteStream,
  } = useMediaStream();

  const { messages, createDataChannel, handleDataChannel, sendMessage } = useDataChannel();

  const { state, shareableLink, createSession, joinSession, submitAnswer, getConnection } =
    usePeerConnection({
      onTrack: handleRemoteTrack,
      onDataChannel: handleDataChannel,
      createDataChannel,
    });

  useEffect(() => {
    const offerFromUrl = SignalingService.getSessionFromUrl();
    if (offerFromUrl) {
      // This is initialization logic that only runs once on mount
      setIsJoiner(true);

      // Call joinSession directly to avoid dependency loop
      joinSession(offerFromUrl)
        .then((code) => {
          setMyAnswerCode(code);
        })
        .catch((error) => {
          console.error('Failed to join session:', error);
        });
    }
    // Empty deps array - only run once on mount since URL doesn't change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreateSession = async () => {
    console.log('handleCreateSession called');
    try {
      console.log('Calling createSession...');
      await createSession();
      console.log('createSession completed successfully');
    } catch (error) {
      console.error('Failed to create session:', error);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!answerCode.trim()) return;

    try {
      await submitAnswer(answerCode);
      setAnswerCode('');
    } catch (error) {
      console.error('Failed to submit answer:', error);
    }
  };

  const handleStartVideoCall = async () => {
    const connection = getConnection();
    if (!connection) return;

    try {
      await startLocalStream(connection);
      setIsVideoCallActive(true);
    } catch (error) {
      console.error('Failed to start video call:', error);
    }
  };

  const handleEndVideoCall = () => {
    stopLocalStream();
    stopRemoteStream();
    setIsVideoCallActive(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">P2P Chat</h1>
          <ConnectionStatus state={state} />
        </header>

        {state === 'disconnected' && !isJoiner && (
          <Card>
            <CardHeader>
              <CardTitle>Start a Session</CardTitle>
            </CardHeader>
            <CardContent>
              <Button onClick={handleCreateSession} className="w-full">
                Create Session
              </Button>
            </CardContent>
          </Card>
        )}

        {state === 'waiting-for-code' && (
          <Card>
            <CardHeader>
              <CardTitle>Share this link</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input value={shareableLink} readOnly className="flex-1" />
                <Button onClick={() => copyToClipboard(shareableLink)}>Copy</Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Send this link to the person you want to connect with. They will send you a code.
              </p>
              <div className="border-t pt-4">
                <label className="text-sm font-medium">Paste the code they send you:</label>
                <div className="flex gap-2 mt-2">
                  <Input
                    value={answerCode}
                    onChange={(e) => setAnswerCode(e.target.value)}
                    placeholder="Paste code here..."
                    className="flex-1"
                  />
                  <Button onClick={handleSubmitAnswer} disabled={!answerCode.trim()}>
                    Submit
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {isJoiner && myAnswerCode && state !== 'connected' && (
          <Card>
            <CardHeader>
              <CardTitle>Send this code to start the session</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input value={myAnswerCode} readOnly className="flex-1 font-mono text-sm" />
                <Button onClick={() => copyToClipboard(myAnswerCode)}>Copy</Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Copy this code and send it to the person who shared the link with you.
              </p>
            </CardContent>
          </Card>
        )}

        {state === 'connected' && (
          <>
            <VideoCall localStream={localStream} remoteStream={remoteStream} />

            <div className="flex flex-col items-center gap-3">
              <div className="flex justify-center gap-4">
                {!isVideoCallActive && (
                  <Button onClick={handleStartVideoCall} disabled={isRequestingMedia} size="lg">
                    {isRequestingMedia ? 'Requesting permissions...' : 'Start My Video'}
                  </Button>
                )}
                {isVideoCallActive && (
                  <Button onClick={handleEndVideoCall} variant="destructive" size="lg">
                    Stop My Video
                  </Button>
                )}
              </div>
              {!isVideoCallActive && remoteStream && (
                <p className="text-sm text-muted-foreground">
                  The other person has started their video. Click "Start My Video" to join.
                </p>
              )}
              {isVideoCallActive && !remoteStream && (
                <p className="text-sm text-muted-foreground">
                  Waiting for the other person to start their video...
                </p>
              )}
            </div>

            <ChatInterface messages={messages} onSendMessage={sendMessage} />
          </>
        )}
      </div>
    </div>
  );
}

export default App;
