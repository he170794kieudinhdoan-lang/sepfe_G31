import { useState, useEffect } from 'react';

export function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    console.log('🟡 Effect chạy - value hiện tại:', value);

    const handler = setTimeout(() => {
      console.log('🟢 Timeout xong - cập nhật debouncedValue:', value);
      setDebouncedValue(value);
    }, delay);

    return () => {
      console.log('🔴 Cleanup - huỷ timeout cho value:', value);
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
