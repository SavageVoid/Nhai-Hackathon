export type SyncStatus = 'PENDING' | 'IN_FLIGHT' | 'ACKED' | 'FAILED';

export async function syncPendingEvents(): Promise<void> {
  // TODO: Read pending local events, batch upload with HMAC, and purge upon server ACK.
}
