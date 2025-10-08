
import React from 'react';
import { AppStep } from '../types';

interface StepIndicatorProps {
  currentStep: AppStep;
  onStepClick: (step: AppStep) => void;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep, onStepClick }) => {
  const steps = [
    { id: AppStep.Level, label: 'Nível' },
    { id: AppStep.Location, label: 'Local' },
    { id: AppStep.Duration, label: 'Duração' },
    { id: AppStep.Focus, label: 'Foco' },
    { id: AppStep.Equipment, label: 'Equipamento' },
  ];

  return (
    <div className="w-full max-w-2xl mx-auto">
      <ol className="flex items-center w-full">
        {steps.map((step, index) => {
          const isCompleted = currentStep > step.id;
          const isActive = currentStep === step.id;
          const isClickable = isCompleted;

          return (
            <li
              key={step.id}
              onClick={() => isClickable && onStepClick(step.id)}
              className={`flex w-full items-center transition-all duration-200 ${
                isClickable ? 'cursor-pointer' : ''
              } ${
                index !== steps.length - 1 ? "after:content-[''] after:w-full after:h-1 after:border-b after:border-4 after:inline-block" : ""
              } ${isCompleted ? 'after:border-blue-500' : 'after:border-gray-200 dark:after:border-gray-700'}`}
            >
              <div className="flex flex-col items-center justify-center">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full lg:h-12 lg:w-12 shrink-0 transition-transform duration-200
                    ${isClickable ? 'hover:scale-110' : ''}
                    ${isActive ? 'bg-blue-500 text-white' : ''}
                    ${isCompleted ? 'bg-blue-500 text-white' : ''}
                    ${!isActive && !isCompleted ? 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300' : ''}
                  `}
                >
                  {isCompleted ? (
                    <svg className="w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 12">
                      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 5.917 5.724 10.5 15 1.5"/>
                    </svg>
                  ) : (
                    <span className="font-bold">{index + 1}</span>
                  )}
                </div>
                <span className={`text-sm sm:text-base font-medium mt-2 text-center ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}>{step.label}</span>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
};

export default StepIndicator;
