import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface SessionCreatorProps {
  onCreateSession: () => void;
}

export function SessionCreator({ onCreateSession }: SessionCreatorProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Start a Session</CardTitle>
      </CardHeader>
      <CardContent>
        <Button onClick={onCreateSession} size="lg">
          Create Session
        </Button>
      </CardContent>
    </Card>
  );
}
