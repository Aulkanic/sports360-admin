import { useState, useCallback } from 'react';
import type { Court } from '@/types/court.types';

export const useCourtModals = () => {
  const [selectedCourt, setSelectedCourt] = useState<Court | null>(null);
  const [showBookingsModal, setShowBookingsModal] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const openBookingsModal = useCallback((court: Court) => {
    setSelectedCourt(court);
    setShowBookingsModal(true);
  }, []);

  const closeBookingsModal = useCallback(() => {
    setShowBookingsModal(false);
    setSelectedCourt(null);
  }, []);

  const openDeleteConfirm = useCallback((courtId: string) => {
    setConfirmId(courtId);
  }, []);

  const closeDeleteConfirm = useCallback(() => {
    setConfirmId(null);
  }, []);

  return {
    selectedCourt,
    showBookingsModal,
    confirmId,
    openBookingsModal,
    closeBookingsModal,
    openDeleteConfirm,
    closeDeleteConfirm,
  };
};
