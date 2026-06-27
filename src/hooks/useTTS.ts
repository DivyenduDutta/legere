import { useRef, useCallback } from "react";

export function useTTS(onEnd?: () => void) {
  const activeRef = useRef(false);

  const speakText = useCallback(
    (text: string) => {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.onend = () => {
        activeRef.current = false;
        onEnd?.();
      };
      activeRef.current = true;
      window.speechSynthesis.speak(utterance);
    },
    [onEnd]
  );

  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
    activeRef.current = false;
  }, []);

  return { speakText, stop };
}
