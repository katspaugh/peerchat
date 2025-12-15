import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';

interface ShareLinkProps {
  shareableLink: string;
  answerCode: string;
  copied: boolean;
  onCopy: () => void;
  onAnswerCodeChange: (code: string) => void;
  onSubmitAnswer: () => void;
}

export function ShareLink({
  shareableLink,
  answerCode,
  copied,
  onCopy,
  onAnswerCodeChange,
  onSubmitAnswer,
}: ShareLinkProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Share this link</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input value={shareableLink} readOnly className="flex-1" />
          <Button
            onClick={onCopy}
            variant={copied ? 'default' : 'default'}
            className={copied ? 'bg-green-600 hover:bg-green-700' : ''}
          >
            {copied ? '✓ Copied!' : 'Copy'}
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Send this link to the person you want to connect with. They will send you a code.
        </p>
        <div className="border-t pt-4">
          <label className="text-sm font-medium">Paste the code they send you:</label>
          <div className="flex gap-2 mt-2">
            <Input
              value={answerCode}
              onChange={(e) => onAnswerCodeChange(e.target.value)}
              placeholder="Paste code here..."
              className="flex-1"
            />
            <Button onClick={onSubmitAnswer} disabled={!answerCode.trim()}>
              Submit
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
