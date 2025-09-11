import React, { useState } from 'react';
import { Input } from './input';
import { CheckCircle, XCircle, Eye, EyeOff } from 'lucide-react';

interface EnhancedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  success?: boolean;
  icon?: React.ReactNode;
  showPasswordToggle?: boolean;
  helpText?: string;
  required?: boolean;
  onValidationChange?: (isValid: boolean) => void;
}

const EnhancedInput: React.FC<EnhancedInputProps> = ({
  label,
  error,
  success,
  icon,
  showPasswordToggle = false,
  helpText,
  required = false,
  onValidationChange,
  className = '',
  type = 'text',
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const inputType = showPasswordToggle && type === 'password' 
    ? (showPassword ? 'text' : 'password') 
    : type;

  const getInputStyles = () => {
    let baseStyles = "transition-all duration-200";
    
    if (error) {
      baseStyles += " border-red-500 focus:border-red-500 focus:ring-red-200";
    } else if (success) {
      baseStyles += " border-green-500 focus:border-green-500 focus:ring-green-200";
    } else if (isFocused) {
      baseStyles += " border-[#F2851E] focus:border-[#F2851E] focus:ring-[#F2851E]/20";
    } else {
      baseStyles += " border-gray-300 focus:border-[#F2851E] focus:ring-[#F2851E]/20";
    }
    
    return `${baseStyles} ${className}`;
  };

  const getIconColor = () => {
    if (error) return "text-red-500";
    if (success) return "text-green-500";
    if (isFocused) return "text-[#F2851E]";
    return "text-gray-500";
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-800">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <div className="relative">
        {icon && (
          <div className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${getIconColor()}`}>
            {icon}
          </div>
        )}
        
        <Input
          {...props}
          type={inputType}
          className={`${getInputStyles()} ${icon ? 'pl-10' : ''} ${showPasswordToggle ? 'pr-10' : ''}`}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
          onChange={(e) => {
            props.onChange?.(e);
            // Trigger validation change callback
            if (onValidationChange) {
              const isValid = !error && e.target.value.trim().length > 0;
              onValidationChange(isValid);
            }
          }}
        />
        
        {/* Success/Error Icons */}
        {success && !showPasswordToggle && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <CheckCircle className="h-4 w-4 text-green-500" />
          </div>
        )}
        
        {error && !showPasswordToggle && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <XCircle className="h-4 w-4 text-red-500" />
          </div>
        )}
        
        {/* Password Toggle */}
        {showPasswordToggle && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
      </div>
      
      {/* Help Text */}
      {helpText && !error && (
        <p className="text-xs text-gray-600">{helpText}</p>
      )}
      
      {/* Error Message */}
      {error && (
        <p className="text-xs text-red-600 flex items-center gap-1">
          <XCircle className="h-3 w-3" />
          {error}
        </p>
      )}
    </div>
  );
};

export default EnhancedInput;
