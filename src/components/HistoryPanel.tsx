import { X, Clock, Trash2, RotateCcw, GitCompare } from 'lucide-react';
import { ExperimentRecord, getExperimentHistory, deleteExperiment } from '../utils/experimentHistory';
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface HistoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadExperiment: (experiment: ExperimentRecord) => void;
  onCompare: (experimentA: ExperimentRecord, experimentB: ExperimentRecord) => void;
  isDark: boolean;
}

export default function HistoryPanel({ isOpen, onClose, onLoadExperiment, onCompare, isDark }: HistoryPanelProps) {
  const { user } = useAuth();
  const [experiments, setExperiments] = useState<ExperimentRecord[]>([]);
  const [compareMode, setCompareMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      (async () => {
        const history = await getExperimentHistory(user?.id);
        setExperiments(history);
        setSelectedIds([]);
        setCompareMode(false);
      })();
    }
  }, [isOpen, user]);

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((existingId) => existingId !== id);
      } else if (prev.length < 2) {
        return [...prev, id];
      }
      return prev;
    });
  };

  const handleCompareClick = () => {
    if (selectedIds.length === 2) {
      const expA = experiments.find((exp) => exp.id === selectedIds[0]);
      const expB = experiments.find((exp) => exp.id === selectedIds[1]);
      if (expA && expB) {
        onCompare(expA, expB);
      }
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await deleteExperiment(id, user?.id);
    setExperiments(experiments.filter((exp) => exp.id !== id));
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString();
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"
        onClick={onClose}
      />
      <div
        className={`fixed right-0 top-0 h-full w-full sm:w-[480px] z-50 shadow-2xl transform transition-transform duration-300 overflow-hidden flex flex-col ${
          isDark ? 'bg-gray-900' : 'bg-white'
        }`}
      >
        <div className={`px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'} space-y-3`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Clock size={24} className={isDark ? 'text-blue-400' : 'text-blue-600'} />
              <h2 className={`text-xl font-semibold ${isDark ? 'text-gray-50' : 'text-gray-900'}`}>
                Previous Experiments
              </h2>
            </div>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition-colors ${
                isDark ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
              }`}
            >
              <X size={20} />
            </button>
          </div>

          {experiments.length >= 2 && (
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setCompareMode(!compareMode);
                  setSelectedIds([]);
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  compareMode
                    ? isDark
                      ? 'bg-blue-600 text-white'
                      : 'bg-blue-600 text-white'
                    : isDark
                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <GitCompare size={16} />
                {compareMode ? 'Cancel Compare' : 'Compare Mode'}
              </button>

              {compareMode && (
                <button
                  onClick={handleCompareClick}
                  disabled={selectedIds.length !== 2}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    selectedIds.length === 2
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : isDark
                      ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <GitCompare size={16} />
                  Compare Selected ({selectedIds.length}/2)
                </button>
              )}
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {experiments.length === 0 ? (
            <div className="text-center py-12">
              <Clock size={48} className={`mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
              <p className={`text-lg font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                No experiments yet
              </p>
              <p className={`text-sm mt-2 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                Complete your first experiment to see it here
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {experiments.map((exp) => {
                const isSelected = selectedIds.includes(exp.id);
                const isDisabled = compareMode && selectedIds.length === 2 && !isSelected;

                return (
                  <div
                    key={exp.id}
                    onClick={() => compareMode && !isDisabled && toggleSelection(exp.id)}
                    className={`rounded-lg border p-4 transition-all duration-200 ${
                      compareMode ? 'cursor-pointer' : ''
                    } ${
                      isSelected
                        ? isDark
                          ? 'bg-blue-900/30 border-blue-500 shadow-lg'
                          : 'bg-blue-50 border-blue-400 shadow-md'
                        : isDisabled
                        ? isDark
                          ? 'bg-gray-800 border-gray-700 opacity-50'
                          : 'bg-white border-gray-200 opacity-50'
                        : isDark
                        ? 'bg-gray-800 border-gray-700 hover:border-blue-500 hover:shadow-lg'
                        : 'bg-white border-gray-200 hover:border-blue-400 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-3 flex-1">
                        {compareMode && (
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => !isDisabled && toggleSelection(exp.id)}
                            disabled={isDisabled}
                            className="mt-1.5 w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer disabled:cursor-not-allowed"
                            onClick={(e) => e.stopPropagation()}
                          />
                        )}
                        <div className="flex-1">
                          <h3 className={`font-semibold text-lg ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
                            {exp.material_name}
                          </h3>
                          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {exp.category}
                          </p>
                        </div>
                      </div>
                      {!compareMode && (
                        <button
                          onClick={(e) => handleDelete(exp.id, e)}
                          className={`p-2 rounded-lg transition-colors ${
                            isDark
                              ? 'hover:bg-gray-700 text-gray-500 hover:text-red-400'
                              : 'hover:bg-gray-100 text-gray-400 hover:text-red-500'
                          }`}
                          title="Delete experiment"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>

                    <div className="space-y-2 mb-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Optimization:</span>
                        <span className={`font-medium ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
                          {exp.optimization_goal}
                        </span>
                      </div>
                      {exp.co2_score !== null && (
                        <div className="flex items-center justify-between text-sm">
                          <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>CO₂ Score:</span>
                          <span className={`font-semibold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                            {exp.co2_score.toFixed(2)}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center justify-between text-xs">
                        <span className={isDark ? 'text-gray-500' : 'text-gray-500'}>
                          {formatDate(exp.timestamp)}
                        </span>
                      </div>
                    </div>

                    {!compareMode && (
                      <button
                        onClick={() => onLoadExperiment(exp)}
                        className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                          isDark
                            ? 'bg-blue-600 text-white hover:bg-blue-500'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                      >
                        <RotateCcw size={16} />
                        Load This Experiment
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
