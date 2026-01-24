export interface ExperimentRecord {
  id: string;
  timestamp: number;
  material_name: string;
  category: string;
  optimization_goal: string;
  co2_score: number | null;
  full_input_json: any;
  full_result_json: any;
}

const HISTORY_KEY = 'experiment_history';
const MAX_HISTORY = 20;

export const saveExperiment = (inputState: any, result: any): void => {
  try {
    const history = getExperimentHistory();

    const newRecord: ExperimentRecord = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      material_name: inputState.material_name || 'Unknown',
      category: inputState.category || 'Unknown',
      optimization_goal: inputState.optimization_goal || 'Unknown',
      co2_score: result.predicted_performance?.co2_adsorption_score ?? null,
      full_input_json: inputState,
      full_result_json: result,
    };

    history.unshift(newRecord);

    if (history.length > MAX_HISTORY) {
      history.splice(MAX_HISTORY);
    }

    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch (error) {
    console.error('Failed to save experiment to history:', error);
  }
};

export const getExperimentHistory = (): ExperimentRecord[] => {
  try {
    const stored = localStorage.getItem(HISTORY_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch (error) {
    console.error('Failed to load experiment history:', error);
    return [];
  }
};

export const deleteExperiment = (id: string): void => {
  try {
    const history = getExperimentHistory();
    const filtered = history.filter((exp) => exp.id !== id);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Failed to delete experiment:', error);
  }
};

export const clearHistory = (): void => {
  try {
    localStorage.removeItem(HISTORY_KEY);
  } catch (error) {
    console.error('Failed to clear history:', error);
  }
};
