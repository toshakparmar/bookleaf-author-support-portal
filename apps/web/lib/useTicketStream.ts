'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

export interface TicketStreamEvent {
  type: 'ticket.created' | 'ticket.updated' | 'ticket.message' | 'ticket.ai_ready' | 'heartbeat';
  payload: any;
  timestamp: string;
}

export function useTicketStream(
  onEvent?: (event: TicketStreamEvent) => void,
  pollingCallback?: () => void,
) {
  const [isConnected, setIsConnected] = useState(false);
  const [isUsingPollingFallback, setIsUsingPollingFallback] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fallback Polling (every 5 seconds)
  const startPollingFallback = useCallback(() => {
    if (pollIntervalRef.current) return;
    setIsUsingPollingFallback(true);
    setIsConnected(false);

    pollIntervalRef.current = setInterval(() => {
      if (pollingCallback) {
        pollingCallback();
      }
    }, 5000);
  }, [pollingCallback]);

  const stopPollingFallback = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    setIsUsingPollingFallback(false);
  }, []);

  useEffect(() => {
    let unmounted = false;

    function connectSSE() {
      if (unmounted) return;

      try {
        const es = new EventSource('/api/events/stream', { withCredentials: true });
        eventSourceRef.current = es;

        es.onopen = () => {
          if (unmounted) return;
          setIsConnected(true);
          stopPollingFallback();
        };

        es.onmessage = (e) => {
          if (unmounted) return;
          try {
            const parsed: TicketStreamEvent = JSON.parse(e.data);
            if (parsed.type !== 'heartbeat' && onEvent) {
              onEvent(parsed);
            }
          } catch {
            // Ignore malformed payloads
          }
        };

        es.onerror = () => {
          if (unmounted) return;
          es.close();
          eventSourceRef.current = null;
          setIsConnected(false);

          // Activate 5s polling fallback immediately
          startPollingFallback();

          // Try reconnecting SSE after 8 seconds with backoff
          reconnectTimeoutRef.current = setTimeout(() => {
            connectSSE();
          }, 8000);
        };
      } catch {
        startPollingFallback();
      }
    }

    connectSSE();

    return () => {
      unmounted = true;
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      stopPollingFallback();
    };
  }, [onEvent, startPollingFallback, stopPollingFallback]);

  return { isConnected, isUsingPollingFallback };
}
