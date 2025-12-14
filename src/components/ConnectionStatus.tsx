import { Badge } from './ui/badge';
import type { ConnectionState } from '@/types';

const statusConfig: Record<ConnectionState, { label: string; variant: 'default' | 'secondary' | 'destructive' }> = {
  disconnected: { label: 'Disconnected', variant: 'destructive' },
  'creating-offer': { label: 'Creating...', variant: 'default' },
  'waiting-for-code': { label: 'Waiting', variant: 'secondary' },
  connecting: { label: 'Connecting', variant: 'secondary' },
  connected: { label: 'Connected', variant: 'default' },
  failed: { label: 'Failed', variant: 'destructive' },
};

interface ConnectionStatusProps {
  state: ConnectionState;
}

export function ConnectionStatus({ state }: ConnectionStatusProps) {
  const config = statusConfig[state] || statusConfig.disconnected;

  return <Badge variant={config.variant}>{config.label}</Badge>;
}
