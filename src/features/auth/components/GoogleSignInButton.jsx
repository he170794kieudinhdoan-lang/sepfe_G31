import { useEffect, useRef } from 'react';
import { loadGoogleClient } from '@/shared/utils/loadGoogleClient';
import { cn } from '@/lib/utils';

const WRAPPER_CLASS =
  'w-full [&>div]:w-full [&>div>iframe]:w-full [&>div>iframe]:h-11 [&>div>iframe]:rounded-xl';

/**
 * Nút “Đăng nhập / Đăng ký với Google” (Google Identity Services).
 * @param {(credentialJwt: string) => void} onCredential
 */
export const GoogleSignInButton = ({
  onCredential,
  disabled = false,
  className,
}) => {
  const onCredRef = useRef(onCredential);
  onCredRef.current = onCredential;
  const hostRef = useRef(null);

  useEffect(() => {
    if (disabled) return;
    const el = hostRef.current;
    if (!el) return;

    let cancelled = false;

    const init = async () => {
      try {
        await loadGoogleClient();
        if (cancelled) return;

        const clientId = import.meta.env.VITE_AUTH_SOCIAL_GOOGLE_CLIENT_ID;
        if (!clientId) return;

        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: (response) => {
            if (!response?.credential) return;
            onCredRef.current(response.credential);
          },
        });

        window.google.accounts.id.renderButton(el, {
          theme: 'outline',
          size: 'large',
          width: '100%',
          text: 'signin_with',
          locale: 'vi',
        });
      } catch (e) {
        console.error('Lỗi khởi tạo Google:', e);
      }
    };

    init();

    return () => {
      cancelled = true;
    };
  }, [disabled]);

  return (
    <div className={cn(WRAPPER_CLASS, className)}>
      <div ref={hostRef} />
    </div>
  );
};
