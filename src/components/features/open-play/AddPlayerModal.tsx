import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import ResponsiveOverlay from '@/components/responsive-overlay';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { addPlayerToSession, type AddPlayerRequest } from '@/services/open-play.service';
import { 
  User, 
  UserPlus, 
  CheckCircle,
  Mail,
  Calendar,
  Clock
} from 'lucide-react';

export interface PlayerFormData {
  // Player Information
  playerType: 'guest' | 'user';
  firstName: string;
  lastName: string;
  email: string;
  accountId?: string; // For registered users
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  levelId: number; // Skill level ID (1=Beginner, 2=Intermediate, 3=Advanced)
}

interface AddPlayerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sessionTitle: string;
  onAddPlayer: (playerData: PlayerFormData) => void;
  onSuccess?: () => void;
  onError?: (error: any) => void;
  isLoading?: boolean;
}

const AddPlayerModal: React.FC<AddPlayerModalProps> = ({
  open,
  onOpenChange,
  sessionTitle,
  onAddPlayer,
  onSuccess,
  onError,
  isLoading = false
}) => {
  const { id } = useParams();
  
  // Get occurrence ID from URL path parameter
  const occurrenceId = id || '';
  const [formData, setFormData] = useState<PlayerFormData>({
    playerType: 'guest',
    firstName: '',
    lastName: '',
    email: '',
    accountId: '',
    level: 'Intermediate',
    levelId: 2 // Default to Intermediate (ID: 2)
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: keyof PlayerFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!occurrenceId) {
      newErrors.occurrenceId = 'Occurrence ID is missing from URL path';
    }
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    if (formData.playerType === 'user' && !formData.email.trim()) {
      newErrors.email = 'Email is required for registered users';
    }
    if (formData.playerType === 'user' && !formData.accountId?.trim()) {
      newErrors.accountId = 'Account ID is required for registered users';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (validateForm()) {
      setIsSubmitting(true);
      
      try {
        // Map form data to API format
        const apiData: AddPlayerRequest = {
          occurrenceId,
          playerType: formData.playerType === 'user' ? 'registered' : 'guest',
          userId: formData.playerType === 'user' ? formData.accountId : undefined,
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phoneNumber: '', // No phone number required
          skillId: formData.levelId, // Pass the skill level ID instead of description
          paymentMethodId: 1, // Default to walk-in
          paymentAmount: 0, // No payment required
          paymentStatus: 'confirmed' // Default to confirmed
        };

        // Call the API
        await addPlayerToSession(apiData);
        
        // Call the original onAddPlayer callback with form data
        onAddPlayer(formData);
        
        // Call success callback if provided
        if (onSuccess) {
          onSuccess();
        }
        
        // Reset form after successful submission
        setFormData({
          playerType: 'guest',
          firstName: '',
          lastName: '',
          email: '',
          accountId: '',
          level: 'Intermediate',
          levelId: 2
        });
        setErrors({});
        
        // Close modal
        onOpenChange(false);
        
      } catch (error) {
        console.error('Error adding player:', error);
        
        // Call error callback if provided
        if (onError) {
          onError(error);
        }
        
        // Set error message
        setErrors({ submit: 'Failed to add player. Please try again.' });
      } finally {
        setIsSubmitting(false);
      }
    }
  };


  const levelColors = {
    Beginner: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    Intermediate: 'bg-amber-100 text-amber-800 border-amber-200',
    Advanced: 'bg-indigo-100 text-indigo-800 border-indigo-200'
  };

  return (
    <ResponsiveOverlay
      open={open}
      onOpenChange={onOpenChange}
      title="Add Player to Session"
      ariaLabel="Add Player Modal"
      className="max-w-2xl w-[95vw]"
      headerClassName="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20"
      contentClassName="bg-gradient-to-b from-background to-primary/5"
      footer={
        <div className="flex items-center justify-between bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
          <div className="text-sm text-muted-foreground">
            Add new player to session
          </div>
          <div className="flex items-center gap-3">
            <Button 
              type="button" 
              onClick={handleSubmit}
              disabled={isLoading || isSubmitting}
              className="h-10 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-primary/25 transition-all duration-200"
            >
              {(isLoading || isSubmitting) ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Adding Player...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Add Player
                </>
              )}
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Session Info */}
        <div className="bg-card rounded-lg p-4 border border-primary/20 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="h-4 w-4 text-primary" />
            <h3 className="font-semibold text-foreground">{sessionTitle}</h3>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>2 hours duration</span>
            </div>
          </div>
        </div>

        {/* Player Information */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 pb-2 border-b border-primary/20">
            <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Player Information</h3>
          </div>

            {/* Player Type Selection */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground">Player Type *</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleInputChange('playerType', 'guest')}
                  className={cn(
                    "p-4 border rounded-lg text-left transition-all hover:shadow-md",
                    formData.playerType === 'guest'
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <UserPlus className="h-5 w-5" />
                    <div>
                      <div className="font-medium">Guest Player</div>
                      <div className="text-sm text-muted-foreground">One-time participant</div>
                    </div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => handleInputChange('playerType', 'user')}
                  className={cn(
                    "p-4 border rounded-lg text-left transition-all hover:shadow-md",
                    formData.playerType === 'user'
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5" />
                    <div>
                      <div className="font-medium">Registered User</div>
                      <div className="text-sm text-muted-foreground">Existing member</div>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Personal Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">First Name *</label>
                <Input
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  placeholder="Enter first name"
                  className={cn("h-11", errors.firstName && "border-red-500")}
                />
                {errors.firstName && (
                  <p className="text-sm text-red-600">{errors.firstName}</p>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Last Name *</label>
                <Input
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  placeholder="Enter last name"
                  className={cn("h-11", errors.lastName && "border-red-500")}
                />
                {errors.lastName && (
                  <p className="text-sm text-red-600">{errors.lastName}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Email {formData.playerType === 'user' && '*'}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Enter email address"
                  className={cn("h-11 pl-10", errors.email && "border-red-500")}
                  type="email"
                />
              </div>
              {errors.email && (
                <p className="text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Account ID field - only shown for registered users */}
            {formData.playerType === 'user' && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Account ID/Number *</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={formData.accountId}
                    onChange={(e) => handleInputChange('accountId', e.target.value)}
                    placeholder="Enter player's account ID or number"
                    className={cn("h-11 pl-10", errors.accountId && "border-red-500")}
                  />
                </div>
                {errors.accountId && (
                  <p className="text-sm text-red-600">{errors.accountId}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Enter the registered player's account ID or member number
                </p>
              </div>
            )}

            {/* Skill Level */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground">Skill Level *</label>
              <div className="grid grid-cols-3 gap-3">
                {([
                  { level: 'Beginner' as const, id: 1 },
                  { level: 'Intermediate' as const, id: 2 },
                  { level: 'Advanced' as const, id: 3 }
                ]).map(({ level, id }) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => {
                      handleInputChange('level', level);
                      handleInputChange('levelId', id);
                    }}
                    className={cn(
                      "p-3 border rounded-lg text-center transition-all hover:shadow-md",
                      formData.level === level
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <Badge className={cn("text-xs", levelColors[level])}>
                      {level}
                    </Badge>
                  </button>
                ))}
              </div>
            </div>

        </div>

        {/* Error Display */}
        {errors.occurrenceId && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-red-600 text-sm font-bold">!</span>
              </div>
              <p className="text-red-800 font-medium">Configuration Error</p>
            </div>
            <p className="text-red-700 mt-1">{errors.occurrenceId}</p>
          </div>
        )}
        {errors.submit && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-red-600 text-sm font-bold">!</span>
              </div>
              <p className="text-red-800 font-medium">Error</p>
            </div>
            <p className="text-red-700 mt-1">{errors.submit}</p>
          </div>
        )}
      </div>
    </ResponsiveOverlay>
  );
};

export default AddPlayerModal;
