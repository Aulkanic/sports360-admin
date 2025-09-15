import { useState, useCallback } from 'react';
import type { CreateSessionFormData } from '@/components/features/open-play/CreateSessionForm';

const getDefaultFormData = (): CreateSessionFormData => ({
  title: "",
  description: "",
  date: "",
  startTime: "",
  endTime: "",
  maxPlayers: 10,
  price: 0,
  isFreeJoin: false,
  courtId: "",
  eventType: "one-time",
  frequency: "weekly",
  endDate: "",
  tournamentFormat: "single-elimination",
  prize: "",
  registrationDeadline: "",
  levels: { Beginner: true, Intermediate: false, Advanced: false },
});

export const useCreateSessionForm = () => {
  const [form, setForm] = useState<CreateSessionFormData>(getDefaultFormData());
  const [isOpen, setIsOpen] = useState(false);

  const openForm = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeForm = useCallback(() => {
    setIsOpen(false);
    setForm(getDefaultFormData());
  }, []);

  const updateForm = useCallback((updates: Partial<CreateSessionFormData> | ((prev: CreateSessionFormData) => CreateSessionFormData)) => {
    if (typeof updates === 'function') {
      setForm(updates);
    } else {
      setForm(prev => ({ ...prev, ...updates }));
    }
  }, []);

  const resetForm = useCallback(() => {
    setForm(getDefaultFormData());
  }, []);

  return {
    form,
    setForm: updateForm,
    isOpen,
    openForm,
    closeForm,
    resetForm,
  };
};
