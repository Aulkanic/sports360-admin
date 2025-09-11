import React from 'react';
import { Check } from 'lucide-react';

interface Step {
  readonly key: string;
  readonly label: string;
  readonly icon: React.ReactNode;
}

interface StepProgressProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (stepIndex: number) => void;
  className?: string;
}

const StepProgress: React.FC<StepProgressProps> = ({
  steps,
  currentStep,
  onStepClick,
  className = ''
}) => {
  return (
    <div className={`flex items-center gap-2 overflow-x-auto ${className}`}>
      {steps.map((step, index) => {
        const isActive = index === currentStep;
        const isCompleted = index < currentStep;
        const isClickable = onStepClick && index <= currentStep;
        
        return (
          <button
            key={step.key}
            type="button"
            onClick={() => isClickable && onStepClick(index)}
            disabled={!isClickable}
            className={`
              flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full border text-xs sm:text-sm whitespace-nowrap
              transition-all duration-200 transform hover:scale-105
              ${isActive
                ? "bg-gradient-to-br from-[#F2851E] to-[#D14125] text-white border-transparent shadow-lg"
                : isCompleted
                ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"
              }
              ${isClickable ? "cursor-pointer" : "cursor-default"}
            `}
          >
            <span className="grid place-items-center">
              {isCompleted ? (
                <Check className="h-4 w-4" />
              ) : (
                step.icon
              )}
            </span>
            <span className="font-medium">{step.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default StepProgress;
