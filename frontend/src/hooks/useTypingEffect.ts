import { useState, useEffect } from 'react';

export const useTypingEffect = (text: string, duration: number) => {
  const [typedText, setTypedText] = useState('');

  useEffect(() => {
    if (text) {
      const timeout = setTimeout(() => {
        setTypedText(text.slice(0, typedText.length + 1));
      }, duration);

      return () => clearTimeout(timeout);
    }
  }, [text, typedText, duration]);

  return typedText;
}; 