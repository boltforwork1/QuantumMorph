import { supabase } from '../lib/supabase';

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

const saveToLocalStorage = (inputState: any, result: any): void => {
  try {
    const history = getFromLocalStorage();

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
    console.error('Failed to save experiment to localStorage:', error);
  }
};

const getFromLocalStorage = (): ExperimentRecord[] => {
  try {
    const stored = localStorage.getItem(HISTORY_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch (error) {
    console.error('Failed to load experiment history from localStorage:', error);
    return [];
  }
};

const deleteFromLocalStorage = (id: string): void => {
  try {
    const history = getFromLocalStorage();
    const filtered = history.filter((exp) => exp.id !== id);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Failed to delete experiment from localStorage:', error);
  }
};

export const saveExperiment = async (inputState: any, result: any, userId?: string): Promise<void> => {
  if (userId) {
    try {
      const { error } = await supabase.from('experiments').insert({
        user_id: userId,
        material_name: inputState.material_name || 'Unknown',
        category: inputState.category || 'Unknown',
        optimization_goal: inputState.optimization_goal || 'Unknown',
        co2_score: result.predicted_performance?.co2_adsorption_score ?? null,
        input_json: inputState,
        result_json: result,
      });

      if (error) {
        console.error('Failed to save experiment to Supabase:', error);
        saveToLocalStorage(inputState, result);
      }
    } catch (error) {
      console.error('Failed to save experiment to Supabase:', error);
      saveToLocalStorage(inputState, result);
    }
  } else {
    saveToLocalStorage(inputState, result);
  }
};

export const getExperimentHistory = async (userId?: string): Promise<ExperimentRecord[]> => {
  if (userId) {
    try {
      const { data, error } = await supabase
        .from('experiments')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(MAX_HISTORY);

      if (error) {
        console.error('Failed to load experiments from Supabase:', error);
        return getFromLocalStorage();
      }

      return data.map((exp) => ({
        id: exp.id,
        timestamp: new Date(exp.created_at).getTime(),
        material_name: exp.material_name,
        category: exp.category,
        optimization_goal: exp.optimization_goal,
        co2_score: exp.co2_score,
        full_input_json: exp.input_json,
        full_result_json: exp.result_json,
      }));
    } catch (error) {
      console.error('Failed to load experiments from Supabase:', error);
      return getFromLocalStorage();
    }
  } else {
    return getFromLocalStorage();
  }
};

export const deleteExperiment = async (id: string, userId?: string): Promise<void> => {
  if (userId) {
    try {
      const { error } = await supabase.from('experiments').delete().eq('id', id).eq('user_id', userId);

      if (error) {
        console.error('Failed to delete experiment from Supabase:', error);
      }
    } catch (error) {
      console.error('Failed to delete experiment from Supabase:', error);
    }
  } else {
    deleteFromLocalStorage(id);
  }
};

export const clearHistory = (): void => {
  try {
    localStorage.removeItem(HISTORY_KEY);
  } catch (error) {
    console.error('Failed to clear history:', error);
  }
};
