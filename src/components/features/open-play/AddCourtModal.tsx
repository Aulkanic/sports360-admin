import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Court } from '@/components/features/open-play/types';

interface AddCourtModalProps {
  open: boolean;
  onClose: () => void;
  onAddCourt: (data: {
    courtId: string;
    team1Name: string;
    team2Name: string;
    matchName: string;
  }) => void;
  availableCourts: Court[];
}

const AddCourtModal: React.FC<AddCourtModalProps> = ({
  open,
  onClose,
  onAddCourt,
  availableCourts
}) => {
  const [formData, setFormData] = useState({
    courtId: '',
    team1Name: '',
    team2Name: '',
    matchName: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.courtId) {
      newErrors.courtId = 'Please select a court';
    }

    if (!formData.team1Name.trim()) {
      newErrors.team1Name = 'Team 1 name is required';
    }

    if (!formData.team2Name.trim()) {
      newErrors.team2Name = 'Team 2 name is required';
    }

    if (!formData.matchName.trim()) {
      newErrors.matchName = 'Match name is required';
    }

    if (formData.team1Name.trim() === formData.team2Name.trim() && formData.team1Name.trim()) {
      newErrors.team2Name = 'Team names must be different';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onAddCourt(formData);
      // Reset form
      setFormData({
        courtId: '',
        team1Name: '',
        team2Name: '',
        matchName: ''
      });
      setErrors({});
      onClose();
    }
  };

  const handleClose = () => {
    setFormData({
      courtId: '',
      team1Name: '',
      team2Name: '',
      matchName: ''
    });
    setErrors({});
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="mb-4">
          <h2 className="text-lg font-semibold">Add New Court Match</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="courtId" className="block text-sm font-medium">Select Court</label>
            <select 
              id="courtId"
              value={formData.courtId} 
              onChange={(e) => handleInputChange('courtId', e.target.value)}
              className={`w-full p-2 border rounded-md ${errors.courtId ? 'border-red-500' : 'border-gray-300'}`}
            >
              <option value="">Choose a court...</option>
              {availableCourts.map((court) => (
                <option key={court.id} value={court.id}>
                  {court.name} (Capacity: {court.capacity})
                </option>
              ))}
            </select>
            {errors.courtId && (
              <p className="text-sm text-red-500">{errors.courtId}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="matchName" className="block text-sm font-medium">Match Name</label>
            <Input
              id="matchName"
              value={formData.matchName}
              onChange={(e) => handleInputChange('matchName', e.target.value)}
              placeholder="e.g., Championship Match"
              className={errors.matchName ? 'border-red-500' : ''}
            />
            {errors.matchName && (
              <p className="text-sm text-red-500">{errors.matchName}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="team1Name" className="block text-sm font-medium">Team 1 Name</label>
              <Input
                id="team1Name"
                value={formData.team1Name}
                onChange={(e) => handleInputChange('team1Name', e.target.value)}
                placeholder="e.g., Team Alpha"
                className={errors.team1Name ? 'border-red-500' : ''}
              />
              {errors.team1Name && (
                <p className="text-sm text-red-500">{errors.team1Name}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="team2Name" className="block text-sm font-medium">Team 2 Name</label>
              <Input
                id="team2Name"
                value={formData.team2Name}
                onChange={(e) => handleInputChange('team2Name', e.target.value)}
                placeholder="e.g., Team Beta"
                className={errors.team2Name ? 'border-red-500' : ''}
              />
              {errors.team2Name && (
                <p className="text-sm text-red-500">{errors.team2Name}</p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit">
              Add Court Match
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCourtModal;
