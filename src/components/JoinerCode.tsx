import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';

interface JoinerCodeProps {
  code: string;
  copied: boolean;
  onCopy: () => void;
}

export function JoinerCode({ code, copied, onCopy }: JoinerCodeProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Send this code to start the session</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input value={code} readOnly className="flex-1 font-mono text-sm" />
          <Button
            onClick={onCopy}
            variant={copied ? 'default' : 'default'}
            className={copied ? 'bg-green-600 hover:bg-green-700' : ''}
          >
            {copied ? '✓ Copied!' : 'Copy'}
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Copy this code and send it to the person who shared the link with you.
        </p>
      </CardContent>
    </Card>
  );
}
