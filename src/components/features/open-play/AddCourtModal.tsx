import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Court } from '@/components/features/open-play/types';
import { Clock, Trophy, Users, X } from 'lucide-react';

interface AddCourtModalProps {
  open: boolean;
  onClose: () => void;
  onAddCourt: (data: {
    courtId: string;
    team1Name: string;
    team2Name: string;
    matchDuration: number; // in minutes
  }) => Promise<void>;
  selectedCourt?: Court;
}

const durationHelpers = [
  { value: 30, label: '30 mins', description: 'Quick match' },
  { value: 60, label: '1 hr', description: 'Standard match' },
  { value: 90, label: '1.5 hrs', description: 'Extended match' },
  { value: 120, label: '2 hrs', description: 'Long match' },
  { value: 180, label: '3 hrs', description: 'Marathon match' },
];


const AddCourtModal: React.FC<AddCourtModalProps> = ({
  open,
  onClose,
  onAddCourt,
  selectedCourt
}) => {
  const [formData, setFormData] = useState({
    courtId: selectedCourt?.id || '',
    team1Name: '',
    team2Name: '',
    matchDuration: 60
  });

  // Debug: Log when selectedCourt changes
  useEffect(() => {
    if (selectedCourt) {
      setFormData(prev => ({ ...prev, courtId: selectedCourt.id }));
    }
  }, [selectedCourt]);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleDurationChange = (value: string) => {
    const numericValue = parseInt(value) || 0;
    handleInputChange('matchDuration', numericValue);
  };

  const setDuration = (minutes: number) => {
    handleInputChange('matchDuration', minutes);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.team1Name.trim()) {
      newErrors.team1Name = 'Team 1 name is required';
    }

    if (!formData.team2Name.trim()) {
      newErrors.team2Name = 'Team 2 name is required';
    }

    if (formData.team1Name.trim() === formData.team2Name.trim() && formData.team1Name.trim()) {
      newErrors.team2Name = 'Team names must be different';
    }

    if (!formData.matchDuration || formData.matchDuration <= 0) {
      newErrors.matchDuration = 'Match duration must be greater than 0 minutes';
    }

    if (formData.matchDuration > 480) {
      newErrors.matchDuration = 'Match duration cannot exceed 8 hours (480 minutes)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsSubmitting(true);
      try {
        await onAddCourt(formData);
        // Reset form
        setFormData({
          courtId: selectedCourt?.id || '',
          team1Name: '',
          team2Name: '',
          matchDuration: 60
        });
        setErrors({});
        onClose();
      } catch (error) {
        console.error('Error creating game match:', error);
        // Error is already handled in the parent component
        // Don't close modal on error
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleClose = () => {
    setFormData({
      courtId: selectedCourt?.id || '',
      team1Name: '',
      team2Name: '',
      matchDuration: 60
    });
    setErrors({});
    onClose();
  };

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl mx-4 bg-white shadow-2xl">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Trophy className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl">Create New Match</CardTitle>
                <CardDescription>
                  Set up a new match on {selectedCourt?.name || 'selected court'}
                </CardDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              disabled={isSubmitting}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Court Info */}
          {selectedCourt && (
            <div className="p-4 bg-muted/50 rounded-lg border">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Users className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-medium text-sm">Selected Court</h3>
                  <p className="text-sm text-muted-foreground">{selectedCourt.name}</p>
                  <div className="flex gap-2 mt-1">
                    <Badge variant="secondary" className="text-xs">
                      Capacity: {selectedCourt.capacity} players
                    </Badge>
                    {selectedCourt.location && (
                      <Badge variant="outline" className="text-xs">
                        {selectedCourt.location}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Team Names */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-foreground">Team Configuration</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="team1Name" className="text-sm font-medium">
                    Team 1 Name
                  </Label>
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
                  <Label htmlFor="team2Name" className="text-sm font-medium">
                    Team 2 Name
                  </Label>
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
            </div>

            {/* Match Duration */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-foreground">Match Duration</h3>
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Duration (minutes)</Label>
                  <div className="relative">
                    <Input
                      type="number"
                      value={formData.matchDuration || ''}
                      onChange={(e) => handleDurationChange(e.target.value)}
                      placeholder="Enter duration in minutes"
                      className={`pr-10 ${errors.matchDuration ? 'border-red-500' : ''}`}
                      min="1"
                      max="480"
                    />
                    <Clock className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  </div>
                  {errors.matchDuration && (
                    <p className="text-sm text-red-500">{errors.matchDuration}</p>
                  )}
                </div>

                {/* Duration Helper Buttons */}
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Quick select:</Label>
                  <div className="flex flex-wrap gap-2">
                    {durationHelpers.map((helper) => (
                      <Button
                        key={helper.value}
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setDuration(helper.value)}
                        className={`h-8 px-3 text-xs ${
                          formData.matchDuration === helper.value 
                            ? 'bg-primary text-primary-foreground border-primary' 
                            : 'hover:bg-muted'
                        }`}
                        title={helper.description}
                      >
                        {helper.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </div>


            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleClose}
                disabled={isSubmitting}
                className="px-6"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="px-6"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating Match...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Trophy className="h-4 w-4" />
                    Create Match
                  </div>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddCourtModal;