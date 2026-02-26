'use client';

import { useEffect, useRef } from 'react';

const VERSION_CHECK_INTERVAL_MS = 60 * 1000; // 1 minute

export default function UpdateChecker() {
  const buildIdRef = useRef<string | null>(null);

  useEffect(() => {
    function checkForUpdate() {
      fetch('/api/version', { cache: 'no-store' })
        .then((res) => res.json())
        .then((data: { buildId: string }) => {
          if (buildIdRef.current === null) {
            buildIdRef.current = data.buildId;
            return;
          }
          if (data.buildId !== buildIdRef.current) {
            buildIdRef.current = data.buildId;
            window.location.reload();
          }
        })
        .catch(() => {});
    }

    checkForUpdate();
    const interval = setInterval(checkForUpdate, VERSION_CHECK_INTERVAL_MS);

    function onVisibilityChange() {
      if (document.visibilityState === 'visible') checkForUpdate();
    }
    function onFocus() {
      checkForUpdate();
    }

    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('focus', onFocus);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('focus', onFocus);
    };
  }, []);

  return null;
}
