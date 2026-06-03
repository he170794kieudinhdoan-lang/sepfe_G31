export const extractApiErrorMessage = (error, fallback = '') => {
  const message = error?.response?.data?.message || error?.message || fallback;
  return Array.isArray(message) ? message.join(', ') : String(message || '');
};

export const isInsufficientPointError = (error) => {
  const normalized = extractApiErrorMessage(error).toLowerCase();
  return (
    normalized.includes('số dư điểm không đủ') ||
    normalized.includes('số dư point không đủ') ||
    normalized.includes('so du diem khong du') ||
    normalized.includes('so du point khong du') ||
    normalized.includes('insufficient point') ||
    normalized.includes('insufficient balance')
  );
};

const RESUME_KEY_PREFIX = 'wallet-point-resume:';

export const createWalletResumeKey = () =>
  `${RESUME_KEY_PREFIX}${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

export const saveWalletResumeState = (resumeKey, payload) => {
  if (!resumeKey || !payload) return;
  sessionStorage.setItem(resumeKey, JSON.stringify(payload));
};

export const consumeWalletResumeState = (resumeKey) => {
  if (!resumeKey) return null;
  const raw = sessionStorage.getItem(resumeKey);
  if (!raw) return null;
  sessionStorage.removeItem(resumeKey);
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const goToWalletTopup = ({ navigate, location, resumePayload }) => {
  const resumeKey = createWalletResumeKey();
  saveWalletResumeState(resumeKey, resumePayload);

  const returnTo = `${location.pathname}${location.search || ''}`;
  const params = new URLSearchParams();
  params.set('returnTo', returnTo);
  params.set('resumeKey', resumeKey);

  navigate(`/employer/wallet?${params.toString()}`);
};

