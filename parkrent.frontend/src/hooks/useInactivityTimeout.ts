import { useEffect, useRef, useCallback } from 'react';

const TIMEOUT_MS = 30 * 60 * 1000; 

export const useInactivityTimeout = (onTimeout: () => void, active: boolean) => {
    const lastActivityRef = useRef<number>(Date.now());
    const onTimeoutRef = useRef(onTimeout);
    onTimeoutRef.current = onTimeout;

    const resetTimer = useCallback(() => {
        lastActivityRef.current = Date.now();
    }, []);

    useEffect(() => {
        if (!active) return;

        const events: (keyof WindowEventMap)[] = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
        events.forEach(e => window.addEventListener(e, resetTimer, { passive: true }));

        const interval = setInterval(() => {
            if (Date.now() - lastActivityRef.current > TIMEOUT_MS) {
                onTimeoutRef.current();
            }
        }, 30_000);

        return () => {
            events.forEach(e => window.removeEventListener(e, resetTimer));
            clearInterval(interval);
        };
    }, [active, resetTimer]);

    return resetTimer;
};
