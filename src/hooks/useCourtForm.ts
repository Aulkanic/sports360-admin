import { useState, useCallback } from 'react';
import type { Court, CourtFormData } from '@/types/court.types';
import { getDefaultFormData } from '@/utils/court.utils';

export const useCourtForm = () => {
  const [form, setForm] = useState<CourtFormData>(getDefaultFormData());
  const [editing, setEditing] = useState<Court | null>(null);
  const [open, setOpen] = useState(false);

  const openCreate = useCallback(() => {
    setEditing(null);
    setForm(getDefaultFormData());
    setOpen(true);
  }, []);

  const openEdit = useCallback((court: Court) => {
    setEditing(court);
    setForm({
      name: court.name,
      location: court.location,
      status: court.status,
      images: court.images && court.images.length ? court.images : [""],
      capacity: court.capacity ?? 0,
      openingHours: court.openingHours ?? "",
      reservations: court.reservations ?? 0,
      description: court.description || "",
      hourlyRate: court.hourlyRate ?? 0,
      minHours: court.minHours ?? 1,
      hubId: court.hubId || "",
      courtNumber: court.courtNumber || "",
      isActive: court.isActive ?? true,
      availability: court.availability ?? getDefaultFormData().availability,
    });
    setOpen(true);
  }, []);

  const closeForm = useCallback(() => {
    setOpen(false);
    setEditing(null);
    setForm(getDefaultFormData());
  }, []);

  const updateForm = useCallback((updates: Partial<CourtFormData> | ((prev: CourtFormData) => CourtFormData)) => {
    if (typeof updates === 'function') {
      setForm(updates);
    } else {
      setForm(prev => ({ ...prev, ...updates }));
    }
  }, []);

  return {
    form,
    setForm: updateForm,
    editing,
    open,
    openCreate,
    openEdit,
    closeForm,
  };
};
