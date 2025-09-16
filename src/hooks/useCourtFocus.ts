import { useState, useEffect } from 'react';

export const useCourtFocus = () => {
  const [focusedCourtId, setFocusedCourtId] = useState<string | null>(null);

  // Initialize focused court from localStorage
  useEffect(() => {
    const activeCourtId = localStorage.getItem('activeCourtId');
    if (activeCourtId) {
      setFocusedCourtId(activeCourtId);
    }
  }, []);

  const focusCourt = (courtId: string) => {
    setFocusedCourtId(courtId);
    localStorage.setItem('activeCourtId', courtId);
  };

  const showAllCourts = () => {
    setFocusedCourtId(null);
    localStorage.removeItem('activeCourtId');
  };

  // Cleanup localStorage when component unmounts (window closes)
  useEffect(() => {
    const handleBeforeUnload = () => {
      localStorage.removeItem('activeCourtId');
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      localStorage.removeItem('activeCourtId');
    };
  }, []);

  return {
    focusedCourtId,
    setFocusedCourtId,
    focusCourt,
    showAllCourts
  };
};
