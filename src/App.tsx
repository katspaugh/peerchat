import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from './components/ui/button';
import { ConnectionStatus } from './components/ConnectionStatus';
import { ChatInterface } from './components/ChatInterface';
import { VideoCall } from './components/VideoCall';
import { SessionCreator } from './components/SessionCreator';
import { SessionProgress } from './components/SessionProgress';
import { ShareLink } from './components/ShareLink';
import { JoinerCode } from './components/JoinerCode';
import { usePeerConnection } from './hooks/usePeerConnection';
import { useDataChannel } from './hooks/useDataChannel';
import { useMediaStream } from './hooks/useMediaStream';
import { SignalingService } from './services/signaling.service';

function App() {
  const [answerCode, setAnswerCode] = useState('');
  const [myAnswerCode, setMyAnswerCode] = useState('');
  const [isVideoCallActive, setIsVideoCallActive] = useState(false);
  const [isJoiner, setIsJoiner] = useState(false);
  const [progressStep, setProgressStep] = useState('');
  const [progressPercent, setProgressPercent] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Use refs to break circular dependency between hooks
  const handleNegotiationRef = useRef<
    (description: RTCSessionDescriptionInit, sendAnswer: (answer: RTCSessionDescriptionInit) => void) => void
  >();
  const sendNegotiationRef = useRef<(description: RTCSessionDescriptionInit) => void>();

  const {
    localStream,
    remoteStream,
    isRequestingMedia,
    startLocalStream,
    stopLocalStream,
    handleRemoteTrack,
    stopRemoteStream,
  } = useMediaStream();

  const { messages, createDataChannel, handleDataChannel, sendMessage, sendNegotiation } =
    useDataChannel({
      onNegotiation: (description: RTCSessionDescriptionInit) => {
        if (handleNegotiationRef.current && sendNegotiationRef.current) {
          handleNegotiationRef.current(description, sendNegotiationRef.current);
        }
      },
    });

  const {
    state,
    shareableLink,
    createSession,
    joinSession,
    submitAnswer,
    getConnection,
    handleNegotiation,
    enableNegotiation,
  } = usePeerConnection({
    onTrack: handleRemoteTrack,
    onDataChannel: handleDataChannel,
    createDataChannel,
    onNegotiationNeeded: (description: RTCSessionDescriptionInit) => {
      console.log('Negotiation needed, sending via data channel');
      sendNegotiation(description);
    },
    onProgress: (step: string, progress: number) => {
      setProgressStep(step);
      setProgressPercent(progress);
    },
  });

  // Update refs after hooks are initialized
  handleNegotiationRef.current = handleNegotiation;
  sendNegotiationRef.current = sendNegotiation;

  // Enable renegotiation only after connection is established
  useEffect(() => {
    if (state === 'connected') {
      enableNegotiation();
    }
  }, [state, enableNegotiation]);

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
    setProgressStep('');
    setProgressPercent(0);
    try {
      console.log('Calling createSession...');
      await createSession();
      console.log('createSession completed successfully');
    } catch (error) {
      console.error('Failed to create session:', error);
      setProgressStep('');
      setProgressPercent(0);
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
    const connection = getConnection();
    stopLocalStream(connection);
    stopRemoteStream();
    setIsVideoCallActive(false);
  };

  const handleCopyLink = useCallback(() => {
    navigator.clipboard.writeText(shareableLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  }, [shareableLink]);

  const handleCopyCode = useCallback(() => {
    navigator.clipboard.writeText(myAnswerCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  }, [myAnswerCode]);

  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">P2P Chat</h1>
          <ConnectionStatus state={state} />
        </header>

        {state === 'disconnected' && !isJoiner && (
          <SessionCreator onCreateSession={handleCreateSession} />
        )}

        {state === 'creating-offer' && !isJoiner && (
          <SessionProgress step={progressStep} percent={progressPercent} />
        )}

        {state === 'waiting-for-code' && (
          <ShareLink
            shareableLink={shareableLink}
            answerCode={answerCode}
            copied={copiedLink}
            onCopy={handleCopyLink}
            onAnswerCodeChange={setAnswerCode}
            onSubmitAnswer={handleSubmitAnswer}
          />
        )}

        {isJoiner && state !== 'connected' && (
          myAnswerCode ? (
            <JoinerCode code={myAnswerCode} copied={copiedCode} onCopy={handleCopyCode} />
          ) : (
            <SessionProgress step={progressStep} percent={progressPercent} />
          )
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
