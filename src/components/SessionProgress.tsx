import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface SessionProgressProps {
  step: string;
  percent: number;
}

export function SessionProgress({ step, percent }: SessionProgressProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Creating Session...</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{step}</span>
            <span className="font-medium">{percent}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
            <div
              className="bg-primary h-full transition-all duration-300 ease-out"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Please wait while we prepare your connection...
        </p>
      </CardContent>
    </Card>
  );
}
