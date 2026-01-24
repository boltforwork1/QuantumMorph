interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  isDark: boolean;
}

export default function ProgressIndicator({ currentStep, totalSteps, isDark }: ProgressIndicatorProps) {
  const progress = totalSteps > 0 ? (currentStep / totalSteps) * 100 : 0;

  return (
    <div className={`px-4 py-4 border-b transition-colors duration-200 ${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`}>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-2">
          <p className={`text-sm font-medium transition-colors duration-200 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Progress: Step {currentStep} of {totalSteps}
          </p>
          <p className={`text-xs transition-colors duration-200 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            {Math.round(progress)}%
          </p>
        </div>
        <div className={`h-2 rounded-full overflow-hidden transition-colors duration-200 ${isDark ? 'bg-gray-800' : 'bg-gray-200'}`}>
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
