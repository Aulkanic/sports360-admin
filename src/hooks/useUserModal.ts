import { useState, useMemo } from 'react';
import type { User } from '@/services/user.service';

export const useUserModal = () => {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);

  const isEditing = useMemo(() => Boolean(editing), [editing]);

  const handleAddClick = () => {
    setEditing(null);
    setOpen(true);
  };

  const handleEditOpen = (user: User) => {
    setEditing(user);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditing(null);
  };

  return {
    open,
    setOpen,
    editing,
    isEditing,
    handleAddClick,
    handleEditOpen,
    handleClose
  };
};
