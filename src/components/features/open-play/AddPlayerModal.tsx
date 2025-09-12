import React, { useState } from 'react';
import ResponsiveOverlay from '@/components/responsive-overlay';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { addPlayerToSession, type AddPlayerRequest } from '@/services/open-play.service';
import { 
  User, 
  UserPlus, 
  CreditCard, 
  QrCode, 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle,
  Phone,
  Mail,
  Calendar,
  Clock,
  DollarSign
} from 'lucide-react';

export interface PlayerFormData {
  // Step 1: Player Information
  playerType: 'guest' | 'user';
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  accountId?: string; // For registered users
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  notes?: string;
  
  // Step 2: Payment Information
  paymentMethod: 'walkin' | 'qr';
  amount: number;
  paymentStatus: 'Pending' | 'Paid' | 'Rejected';
  qrCodeData?: string;
}

interface AddPlayerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sessionTitle: string;
  sessionPrice: number;
  occurrenceId: string;
  onAddPlayer: (playerData: PlayerFormData) => void;
  onSuccess?: () => void;
  onError?: (error: any) => void;
  isLoading?: boolean;
}

const AddPlayerModal: React.FC<AddPlayerModalProps> = ({
  open,
  onOpenChange,
  sessionTitle,
  sessionPrice,
  occurrenceId,
  onAddPlayer,
  onSuccess,
  onError,
  isLoading = false
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<PlayerFormData>({
    playerType: 'guest',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    accountId: '',
    level: 'Intermediate',
    notes: '',
    paymentMethod: 'walkin',
    amount: sessionPrice,
    paymentStatus: 'Pending'
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

  const validateStep1 = (): boolean => {
    const newErrors: Record<string, string> = {};
    
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
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (formData.amount <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    }
  };

  const handleBack = () => {
    if (currentStep === 2) {
      setCurrentStep(1);
    }
  };

  const handleSubmit = async () => {
    if (currentStep === 2 && validateStep2()) {
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
          phoneNumber: formData.phone,
          skillLevel: formData.level.toLowerCase() as 'beginner' | 'intermediate' | 'advanced',
          additionalNotes: formData.notes,
          paymentMethodId: formData.paymentMethod === 'walkin' ? 1 : 2, // 1 = walk-in, 2 = QR
          paymentAmount: formData.amount,
          paymentStatus: formData.paymentStatus.toLowerCase() as 'pending' | 'confirmed' | 'rejected'
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
          phone: '',
          accountId: '',
          level: 'Intermediate',
          notes: '',
          paymentMethod: 'walkin',
          amount: sessionPrice,
          paymentStatus: 'Pending'
        });
        setCurrentStep(1);
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

  const generateQRCode = () => {
    // Generate QR code data for payment
    const qrData = {
      sessionId: 'current-session',
      playerName: `${formData.firstName} ${formData.lastName}`,
      playerType: formData.playerType,
      accountId: formData.playerType === 'user' ? formData.accountId : undefined,
      amount: formData.amount,
      timestamp: new Date().toISOString()
    };
    return JSON.stringify(qrData);
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
            {currentStep === 1 ? 'Step 1 of 2: Player Information' : 'Step 2 of 2: Payment Information'}
          </div>
          <div className="flex items-center gap-3">
            {currentStep === 2 && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleBack}
                className="h-10 border-primary/20 hover:bg-primary/10 hover:border-primary/30"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            )}
            {currentStep === 1 ? (
              <Button 
                type="button" 
                onClick={handleNext}
                className="h-10 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-primary/25 transition-all duration-200"
              >
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
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
            )}
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
              <DollarSign className="h-4 w-4" />
              <span>₱{sessionPrice} per player</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>2 hours duration</span>
            </div>
          </div>
        </div>

        {/* Step Progress */}
        <div className="flex items-center justify-center space-x-4">
          <div className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all",
            currentStep >= 1 
              ? "bg-primary text-primary-foreground" 
              : "bg-muted text-muted-foreground"
          )}>
            <User className="h-4 w-4" />
            Player Info
          </div>
          <div className="w-8 h-0.5 bg-muted"></div>
          <div className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all",
            currentStep >= 2 
              ? "bg-primary text-primary-foreground" 
              : "bg-muted text-muted-foreground"
          )}>
            <CreditCard className="h-4 w-4" />
            Payment
          </div>
        </div>

        {/* Step 1: Player Information */}
        {currentStep === 1 && (
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Phone Number *</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="Enter phone number"
                    className={cn("h-11 pl-10", errors.phone && "border-red-500")}
                    type="tel"
                  />
                </div>
                {errors.phone && (
                  <p className="text-sm text-red-600">{errors.phone}</p>
                )}
              </div>
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
                {(['Beginner', 'Intermediate', 'Advanced'] as const).map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => handleInputChange('level', level)}
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

            {/* Additional Notes */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Additional Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Any special requirements or notes..."
                className="w-full min-h-20 rounded-md border bg-background px-3 py-2 text-sm resize-none"
                rows={3}
              />
            </div>
          </div>
        )}

        {/* Step 2: Payment Information */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 pb-2 border-b border-primary/20">
              <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center">
                <CreditCard className="h-4 w-4 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Payment Information</h3>
            </div>

            {/* Payment Method Selection */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground">Payment Method *</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleInputChange('paymentMethod', 'walkin')}
                  className={cn(
                    "p-4 border rounded-lg text-left transition-all hover:shadow-md",
                    formData.paymentMethod === 'walkin'
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-5 w-5" />
                    <div>
                      <div className="font-medium">Walk-in Payment</div>
                      <div className="text-sm text-muted-foreground">Cash or card at venue</div>
                    </div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => handleInputChange('paymentMethod', 'qr')}
                  className={cn(
                    "p-4 border rounded-lg text-left transition-all hover:shadow-md",
                    formData.paymentMethod === 'walkin'
                      ? "border-border hover:border-primary/50"
                      : "border-primary bg-primary/10 text-primary"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <QrCode className="h-5 w-5" />
                    <div>
                      <div className="font-medium">QR Code Payment</div>
                      <div className="text-sm text-muted-foreground">Scan to pay online</div>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Payment Amount */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Payment Amount (₱) *</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground font-medium">₱</span>
                <Input
                  value={formData.amount}
                  onChange={(e) => handleInputChange('amount', parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  className={cn("h-11 pl-8", errors.amount && "border-red-500")}
                  type="number"
                  min="0"
                  step="0.01"
                />
              </div>
              {errors.amount && (
                <p className="text-sm text-red-600">{errors.amount}</p>
              )}
            </div>

            {/* QR Code Payment Section */}
            {formData.paymentMethod === 'qr' && (
              <div className="space-y-4">
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <QrCode className="h-5 w-5 text-primary" />
                    <h4 className="font-medium text-foreground">QR Code for Payment</h4>
                  </div>
                  <div className="text-center space-y-3">
                    <div className="bg-white p-4 rounded-lg border-2 border-dashed border-primary/30">
                      <div className="w-32 h-32 mx-auto bg-muted rounded-lg flex items-center justify-center">
                        <QrCode className="h-16 w-16 text-muted-foreground" />
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        QR Code will be generated here
                      </p>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <p>Player: {formData.firstName} {formData.lastName}</p>
                      {formData.playerType === 'user' && formData.accountId && (
                        <p>Account ID: {formData.accountId}</p>
                      )}
                      <p>Amount: <span className="font-semibold text-primary">₱{formData.amount.toFixed(2)}</span></p>
                      <p>Session: {sessionTitle}</p>
                      <p className="text-xs text-green-600 font-medium">✓ Player will be ready to play after payment</p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        const qrData = generateQRCode();
                        handleInputChange('qrCodeData', qrData);
                      }}
                      className="text-primary border-primary/30 hover:bg-primary/10"
                    >
                      <QrCode className="h-4 w-4 mr-2" />
                      Generate QR Code
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Walk-in Payment Section */}
            {formData.paymentMethod === 'walkin' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  <h4 className="font-medium text-green-800">Walk-in Payment Instructions</h4>
                </div>
                <div className="text-sm text-green-700 space-y-1">
                  <p>• Player will pay <span className="font-semibold">₱{formData.amount.toFixed(2)}</span> at the venue</p>
                  <p>• Accept cash or card payments</p>
                  <p>• Confirm payment before adding to session</p>
                  <p>• Player will be added as "Ready to Play" after payment confirmation</p>
                </div>
              </div>
            )}

            {/* Payment Status */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Payment Status</label>
              <select
                value={formData.paymentStatus}
                onChange={(e) => handleInputChange('paymentStatus', e.target.value)}
                className="w-full h-11 rounded-md border bg-background px-3 text-sm"
              >
                <option value="Pending">Pending Payment (Will be on Waitlist)</option>
                <option value="Paid">Payment Received (Ready to Play)</option>
                <option value="Rejected">Payment Rejected</option>
              </select>
              <p className="text-xs text-muted-foreground">
                {formData.paymentStatus === 'Paid' 
                  ? '✓ Player will be added as "Ready to Play"'
                  : formData.paymentStatus === 'Pending'
                  ? '⚠ Player will be added to Waitlist until payment is confirmed'
                  : '❌ Player will not be added to the session'
                }
              </p>
            </div>
          </div>
        )}

        {/* Error Display */}
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
