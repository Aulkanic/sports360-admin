import { useState } from 'react';

export const useSplashVideo = () => {
  const [showSplashVideo, setShowSplashVideo] = useState(false);
  const [pendingCourtId, setPendingCourtId] = useState<string | null>(null);

  const triggerSplashVideo = (courtId: string) => {
    setPendingCourtId(courtId);
    setShowSplashVideo(true);
  };

  const handleSplashVideoEnd = (onCourtFocus: (courtId: string) => void) => {
    if (pendingCourtId) {
      onCourtFocus(pendingCourtId);
      setPendingCourtId(null);
    }
    setShowSplashVideo(false);
  };

  return {
    showSplashVideo,
    pendingCourtId,
    triggerSplashVideo,
    handleSplashVideoEnd
  };
};
