import { useState, useCallback, useEffect } from 'react';
import { Message, WizardState } from '../types';
import { saveExperiment, ExperimentRecord } from '../utils/experimentHistory';
import { useAuth } from '../contexts/AuthContext';

type Step =
  | 'user_type'
  | 'moisture_known'
  | 'moisture_value'
  | 'category'
  | 'material'
  | 'material_custom'
  | 'mass'
  | 'processing_goal'
  | 'optimization_goal'
  | 'activation_method'
  | 'activation_agent'
  | 'concentration_known'
  | 'concentration_value'
  | 'composite_strategy'
  | 'num_trials'
  | 'complete';

const STEP_SEQUENCE: Step[] = [
  'user_type',
  'moisture_known',
  'moisture_value',
  'category',
  'material',
  'material_custom',
  'mass',
  'processing_goal',
  'optimization_goal',
  'activation_method',
  'activation_agent',
  'concentration_known',
  'concentration_value',
  'composite_strategy',
  'num_trials',
];

const FIXED_TOTAL_STEPS = 10;

export function useWizard() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Welcome to Quantum-Morph AI Lab.\n\nWho are you?',
      options: ['Researcher / Scientist', 'Industrial User (Factory)', 'Student / Learning Mode'],
    },
  ]);
  const [state, setState] = useState<WizardState>({});
  const [currentStep, setCurrentStep] = useState<Step>('user_type');
  const [isProcessing, setIsProcessing] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [resultData, setResultData] = useState<any>(null);
  const [stepIndex, setStepIndex] = useState<number>(0);
  const [navigationHistory, setNavigationHistory] = useState<{ step: Step; state: WizardState; stepIndex: number; messages: Message[] }[]>([]);

  useEffect(() => {
    const savedState = localStorage.getItem('wizard_state');
    const savedStep = localStorage.getItem('wizard_step') as Step | null;
    const savedJobId = localStorage.getItem('wizard_job_id');
    const savedMessages = localStorage.getItem('wizard_messages');
    const savedResultData = localStorage.getItem('wizard_result_data');
    const savedStepIndex = localStorage.getItem('wizard_step_index');

    if (savedResultData) {
      try {
        const parsedResult = JSON.parse(savedResultData);
        setResultData(parsedResult);
        setCurrentStep('complete');
        setStepIndex(FIXED_TOTAL_STEPS);

        if (savedMessages) {
          const parsedMessages = JSON.parse(savedMessages);
          setMessages(parsedMessages);
        }
        if (savedState) {
          const parsedState = JSON.parse(savedState);
          setState(parsedState);
        }
      } catch (error) {
        console.error('Failed to restore result from localStorage:', error);
      }
    } else if (savedState) {
      try {
        const parsedState = JSON.parse(savedState);
        setState(parsedState);
        if (savedStep) setCurrentStep(savedStep);
        if (savedStepIndex) setStepIndex(parseInt(savedStepIndex));
        if (savedMessages) {
          const parsedMessages = JSON.parse(savedMessages);
          setMessages(parsedMessages);
        }
        if (savedJobId) {
          setJobId(savedJobId);
          setIsProcessing(true);
        }
      } catch (error) {
        console.error('Failed to restore state from localStorage:', error);
      }
    }
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (isInitialized && jobId && isProcessing) {
      resumePolling(jobId);
    }
  }, [isInitialized]);

  useEffect(() => {
    if (isInitialized && currentStep !== 'user_type') {
      localStorage.setItem('wizard_state', JSON.stringify(state));
      localStorage.setItem('wizard_step', currentStep);
      localStorage.setItem('wizard_step_index', stepIndex.toString());
    }
  }, [state, currentStep, isInitialized, stepIndex]);

  useEffect(() => {
    if (isInitialized && messages.length > 1) {
      localStorage.setItem('wizard_messages', JSON.stringify(messages));
    }
  }, [messages, isInitialized]);

  useEffect(() => {
    if (isInitialized && resultData) {
      localStorage.setItem('wizard_result_data', JSON.stringify(resultData));
    }
  }, [resultData, isInitialized]);

  const clearLocalStorage = useCallback(() => {
    localStorage.removeItem('wizard_state');
    localStorage.removeItem('wizard_step');
    localStorage.removeItem('wizard_job_id');
    localStorage.removeItem('wizard_messages');
    localStorage.removeItem('wizard_result_data');
    localStorage.removeItem('wizard_step_index');
  }, []);

  const saveToHistory = useCallback((step: Step, newState: WizardState, index: number) => {
    setMessages((currentMessages) => {
      setNavigationHistory((prev) => [...prev, { step, state: newState, stepIndex: index, messages: currentMessages }]);
      return currentMessages;
    });
  }, []);

  const addMessage = useCallback((role: 'assistant' | 'user', content: string, options?: string[], isResult?: boolean) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      role,
      content,
      options,
      isResult,
    };
    setMessages((prev) => [...prev, newMessage]);
  }, []);

  const handleUserInput = useCallback(
    (input: string) => {
      addMessage('user', input);

      setTimeout(() => {
        processStep(input);
      }, 500);
    },
    [currentStep, state]
  );

  const processStep = (input: string) => {
    switch (currentStep) {
      case 'user_type':
        handleUserType(input);
        break;
      case 'moisture_known':
        handleMoistureKnown(input);
        break;
      case 'moisture_value':
        handleMoistureValue(input);
        break;
      case 'category':
        handleCategory(input);
        break;
      case 'material':
        handleMaterial(input);
        break;
      case 'material_custom':
        handleMaterialCustom(input);
        break;
      case 'mass':
        handleMass(input);
        break;
      case 'processing_goal':
        handleProcessingGoal(input);
        break;
      case 'optimization_goal':
        handleOptimizationGoal(input);
        break;
      case 'activation_method':
        handleActivationMethod(input);
        break;
      case 'activation_agent':
        handleActivationAgent(input);
        break;
      case 'concentration_known':
        handleConcentrationKnown(input);
        break;
      case 'concentration_value':
        handleConcentrationValue(input);
        break;
      case 'composite_strategy':
        handleCompositeStrategy(input);
        break;
      case 'num_trials':
        handleNumTrials(input);
        break;
    }
  };

  const handleUserType = (input: string) => {
    let userType: 'researcher' | 'industrial' | 'student';
    if (input.toLowerCase().includes('researcher') || input.toLowerCase().includes('scientist')) {
      userType = 'researcher';
    } else if (input.toLowerCase().includes('industrial') || input.toLowerCase().includes('factory')) {
      userType = 'industrial';
    } else if (input.toLowerCase().includes('student') || input.toLowerCase().includes('learning')) {
      userType = 'student';
    } else {
      addMessage('assistant', 'Please select one of the provided options.');
      return;
    }

    const newState = { ...state, user_type: userType };
    saveToHistory('user_type', newState, 0);
    setState(newState);
    setCurrentStep('moisture_known');
    setStepIndex(1);
    addMessage('assistant', 'Do you know the moisture content?', ['Yes', 'No']);
  };

  const handleMoistureKnown = (input: string) => {
    const knowsMoisture = input.toLowerCase().includes('yes');
    let newState = { ...state, knowsMoisture };

    if (knowsMoisture) {
      saveToHistory('moisture_known', newState, 1);
      setState(newState);
      setCurrentStep('moisture_value');
      setStepIndex(2);
      addMessage('assistant', 'Enter moisture content (value between 0 and 1):');
    } else {
      newState = { ...newState, moisture: 0.3 };
      saveToHistory('moisture_known', newState, 1);
      setState(newState);
      setCurrentStep('category');
      setStepIndex(2);
      addMessage('assistant', 'Select material category:', [
        'agricultural',
        'biomass',
        'plastic',
        'mixed',
      ]);
    }
  };

  const handleMoistureValue = (input: string) => {
    const moisture = parseFloat(input);
    if (isNaN(moisture) || moisture < 0 || moisture > 1) {
      addMessage('assistant', 'Please enter a valid number between 0 and 1.');
      return;
    }

    const newState = { ...state, moisture };
    saveToHistory('moisture_value', newState, 2);
    setState(newState);
    setCurrentStep('category');
    setStepIndex(3);
    addMessage('assistant', 'Select material category:', ['agricultural', 'biomass', 'plastic', 'mixed']);
  };

  const handleCategory = (input: string) => {
    const category = input.toLowerCase() as 'agricultural' | 'biomass' | 'plastic' | 'mixed';
    if (!['agricultural', 'biomass', 'plastic', 'mixed'].includes(category)) {
      addMessage('assistant', 'Please select one of the provided categories.');
      return;
    }

    const newState = { ...state, category };
    saveToHistory('category', newState, 3);
    setState(newState);
    setCurrentStep('material');
    setStepIndex(3);
    addMessage('assistant', 'Select material:', ['Rice Straw', 'Date Palm Seeds', 'Other']);
  };

  const handleMaterial = (input: string) => {
    if (input.toLowerCase() === 'other') {
      saveToHistory('material', state, 3);
      setCurrentStep('material_custom');
      setStepIndex(4);
      addMessage('assistant', 'Enter custom material name:');
    } else {
      const newState = { ...state, material_name: input };
      saveToHistory('material', newState, 3);
      setState(newState);
      setCurrentStep('mass');
      setStepIndex(4);
      addMessage('assistant', 'Enter sample mass (grams):');
    }
  };

  const handleMaterialCustom = (input: string) => {
    const newState = { ...state, material_name: input };
    saveToHistory('material_custom', newState, 4);
    setState(newState);
    setCurrentStep('mass');
    setStepIndex(5);
    addMessage('assistant', 'Enter sample mass (grams):');
  };

  const handleMass = (input: string) => {
    const mass = parseFloat(input);
    if (isNaN(mass) || mass <= 0) {
      addMessage('assistant', 'Please enter a valid positive number.');
      return;
    }

    const newState = { ...state, mass };
    saveToHistory('mass', newState, 4);
    setState(newState);
    setCurrentStep('processing_goal');
    setStepIndex(5);
    addMessage('assistant', 'Select processing target:', [
      'raw_biochar',
      'activated_carbon',
      'composite_filter',
    ]);
  };

  const handleProcessingGoal = (input: string) => {
    const goal = input.toLowerCase() as 'raw_biochar' | 'activated_carbon' | 'composite_filter';
    if (!['raw_biochar', 'activated_carbon', 'composite_filter'].includes(goal)) {
      addMessage('assistant', 'Please select one of the provided options.');
      return;
    }

    const newState = { ...state, processing_goal: goal };
    saveToHistory('processing_goal', newState, 5);
    setState(newState);
    setCurrentStep('optimization_goal');
    setStepIndex(6);
    addMessage('assistant', 'Select optimization objective:', ['max_co2', 'balanced', 'max_stability']);
  };

  const handleOptimizationGoal = (input: string) => {
    const goal = input.toLowerCase() as 'max_co2' | 'balanced' | 'max_stability';
    if (!['max_co2', 'balanced', 'max_stability'].includes(goal)) {
      addMessage('assistant', 'Please select one of the provided options.');
      return;
    }

    const newState = { ...state, optimization_goal: goal };
    saveToHistory('optimization_goal', newState, 6);
    setState(newState);

    if (state.processing_goal === 'activated_carbon' || state.processing_goal === 'composite_filter') {
      setCurrentStep('activation_method');
      setStepIndex(7);
      addMessage('assistant', 'Select activation method:', ['chemical', 'physical']);
    } else {
      setCurrentStep('num_trials');
      setStepIndex(9);
      addMessage('assistant', 'Enter number of virtual experiments (num_trials):');
    }
  };

  const handleActivationMethod = (input: string) => {
    const method = input.toLowerCase() as 'chemical' | 'physical';
    if (!['chemical', 'physical'].includes(method)) {
      addMessage('assistant', 'Please select either chemical or physical.');
      return;
    }

    const newState = { ...state, activation: { type: method } };
    saveToHistory('activation_method', newState, 7);
    setState(newState);

    if (method === 'chemical') {
      setCurrentStep('activation_agent');
      setStepIndex(8);
      addMessage('assistant', 'Select activation agent:', ['HCl', 'KOH', 'H3PO4']);
    } else {
      if (state.processing_goal === 'composite_filter') {
        setCurrentStep('composite_strategy');
        setStepIndex(8);
        addMessage('assistant', 'Select composite strategy:', ['manual', 'auto']);
      } else {
        setCurrentStep('num_trials');
        setStepIndex(9);
        addMessage('assistant', 'Enter number of virtual experiments (num_trials):');
      }
    }
  };

  const handleActivationAgent = (input: string) => {
    const agent = input as 'HCl' | 'KOH' | 'H3PO4';
    if (!['HCl', 'KOH', 'H3PO4'].includes(agent)) {
      addMessage('assistant', 'Please select one of the provided agents.');
      return;
    }

    const newState = {
      ...state,
      activation: { ...state.activation!, agent },
    };
    saveToHistory('activation_agent', newState, 8);
    setState(newState);

    setCurrentStep('concentration_known');
    setStepIndex(8);
    addMessage('assistant', 'Do you know the concentration?', ['Yes', 'No']);
  };

  const handleConcentrationKnown = (input: string) => {
    const knowsConcentration = input.toLowerCase().includes('yes');

    if (knowsConcentration) {
      setCurrentStep('concentration_value');
      setStepIndex(8);
      addMessage('assistant', 'Enter concentration value:');
    } else {
      setState((prev) => ({
        ...prev,
        activation: { ...prev.activation!, concentration: 'auto' },
      }));

      if (state.processing_goal === 'composite_filter') {
        setCurrentStep('composite_strategy');
        setStepIndex(9);
        addMessage('assistant', 'Select composite strategy:', ['manual', 'auto']);
      } else {
        setCurrentStep('num_trials');
        setStepIndex(9);
        addMessage('assistant', 'Enter number of virtual experiments (num_trials):');
      }
    }
  };

  const handleConcentrationValue = (input: string) => {
    const concentration = parseFloat(input);
    if (isNaN(concentration) || concentration <= 0) {
      addMessage('assistant', 'Please enter a valid positive number.');
      return;
    }

    const newState = {
      ...state,
      activation: { ...state.activation!, concentration },
    };
    saveToHistory('concentration_value', newState, 8);
    setState(newState);

    if (state.processing_goal === 'composite_filter') {
      setCurrentStep('composite_strategy');
      setStepIndex(9);
      addMessage('assistant', 'Select composite strategy:', ['manual', 'auto']);
    } else {
      setCurrentStep('num_trials');
      setStepIndex(9);
      addMessage('assistant', 'Enter number of virtual experiments (num_trials):');
    }
  };

  const handleCompositeStrategy = (input: string) => {
    const strategy = input.toLowerCase() as 'manual' | 'auto';
    if (!['manual', 'auto'].includes(strategy)) {
      addMessage('assistant', 'Please select either manual or auto.');
      return;
    }

    const newState = { ...state, composite: { strategy } };
    saveToHistory('composite_strategy', newState, 9);
    setState(newState);
    setCurrentStep('num_trials');
    setStepIndex(9);
    addMessage('assistant', 'Enter number of virtual experiments (num_trials):');
  };

  const handleNumTrials = async (input: string) => {
    const numTrials = parseInt(input);
    if (isNaN(numTrials) || numTrials <= 0) {
      addMessage('assistant', 'Please enter a valid positive integer.');
      return;
    }

    setState((prev) => ({ ...prev, num_trials: numTrials }));
    setCurrentStep('complete');
    setStepIndex(FIXED_TOTAL_STEPS);
    setIsProcessing(true);

    addMessage('assistant', 'Processing your request and generating optimal recipe...');

    const finalState = { ...state, num_trials: numTrials };
    await submitToAPI(finalState);
  };

  const pollJobStatus = async (jobIdParam: string, baseUrl: string): Promise<void> => {
    const statusUrl = `${baseUrl}/status/${jobIdParam}`;
    let isComplete = false;
    let maxAttempts = 120;
    let attempt = 0;

    while (!isComplete && attempt < maxAttempts) {
      attempt++;
      console.log(`Status check attempt ${attempt}/${maxAttempts}`);

      try {
        const statusResponse = await fetch(statusUrl);

        if (!statusResponse.ok) {
          console.error('Status check failed:', statusResponse.status);
          await new Promise(resolve => setTimeout(resolve, 5000));
          continue;
        }

        const statusData = await statusResponse.json();
        console.log('Status response:', statusData);

        if (statusData.status === 'done' && statusData.result) {
          console.log('Job complete, displaying results');
          displayResults(statusData.result);
          setIsProcessing(false);
          setJobId(null);
          localStorage.removeItem('wizard_job_id');
          clearLocalStorage();
          isComplete = true;
          return;
        }

        if (attempt < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 5000));
        }
      } catch (error) {
        console.error('Error checking status:', error);
        if (attempt < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 5000));
        }
      }
    }

    throw new Error('Job processing timeout after 10 minutes');
  };

  const resumePolling = async (jobIdParam: string) => {
    const baseUrl = 'https://quantummorph-production-05bf.up.railway.app';
    try {
      await pollJobStatus(jobIdParam, baseUrl);
    } catch (error) {
      console.error('Error resuming polling:', error);
      addMessage(
        'assistant',
        `Error resuming job status. Please refresh the page or start a new session.`
      );
      setIsProcessing(false);
    }
  };

  const validatePayload = (payload: any): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!payload.user_type) errors.push('user_type is required');
    if (!payload.category) errors.push('category is required');
    if (!payload.material_name) errors.push('material_name is required');
    if (!payload.mass || payload.mass <= 0) errors.push('mass must be a positive number');
    if (!payload.processing_goal) errors.push('processing_goal is required');
    if (!payload.optimization_goal) errors.push('optimization_goal is required');
    if (payload.moisture === undefined || payload.moisture === null) errors.push('moisture is required');
    if (!payload.num_trials || payload.num_trials <= 0) errors.push('num_trials must be a positive number');

    return {
      valid: errors.length === 0,
      errors,
    };
  };

  const submitToAPI = async (finalState: WizardState) => {
    const requestPayload = {
      user_type: finalState.user_type!,
      category: finalState.category!,
      material_name: finalState.material_name!,
      mass: finalState.mass!,
      processing_goal: finalState.processing_goal!,
      optimization_goal: finalState.optimization_goal!,
      activation: finalState.activation || null,
      composite: finalState.composite || null,
      moisture: finalState.moisture!,
      num_trials: finalState.num_trials!,
    };

    const validation = validatePayload(requestPayload);
    if (!validation.valid) {
      addMessage(
        'assistant',
        `Validation Error:\n${validation.errors.join('\n')}`
      );
      setIsProcessing(false);
      return;
    }

    const baseUrl = 'https://quantummorph-production-05bf.up.railway.app';
    const optimizeUrl = `${baseUrl}/optimize`;
    const headers = {
      'Content-Type': 'application/json',
    };

    console.log('=== API REQUEST DEBUG ===');
    console.log('URL:', optimizeUrl);
    console.log('Method: POST');
    console.log('Headers:', JSON.stringify(headers, null, 2));
    console.log('Body:', JSON.stringify(requestPayload, null, 2));
    console.log('========================');

    try {
      const optimizeResponse = await fetch(optimizeUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestPayload),
      });

      console.log('Optimize Response Status:', optimizeResponse.status);

      if (!optimizeResponse.ok) {
        const errorText = await optimizeResponse.text();
        console.error('Optimize Response Error:', errorText);
        throw new Error(`Failed to submit job: ${optimizeResponse.status}`);
      }

      const jobData = await optimizeResponse.json();
      const newJobId = jobData.job_id;

      console.log('Job ID received:', newJobId);
      setJobId(newJobId);
      localStorage.setItem('wizard_job_id', newJobId);

      await pollJobStatus(newJobId, baseUrl);
    } catch (error) {
      console.error('=== API REQUEST FAILED ===');
      console.error('Error:', error);
      console.error('=========================');

      addMessage(
        'assistant',
        `Server connection failed.\n\nError Details:\n${error instanceof Error ? error.message : 'Unknown error'}\n\nPlease try again.`
      );
      setIsProcessing(false);
    }
  };

  const displayResults = (result: any) => {
    setResultData(result);
    const jsonBlock = '```json\n' + JSON.stringify(result, null, 2) + '\n```';
    addMessage('assistant', jsonBlock, undefined, true);

    const explanation = generateExplanation(result);
    addMessage('assistant', explanation, undefined, true);

    saveExperiment(state, result, user?.id);
  };

  const generateExplanation = (result: any): string => {
    const lines: string[] = [];

    lines.push('SCIENTIFIC ANALYSIS REPORT');
    lines.push('═'.repeat(50));
    lines.push('');

    lines.push('MATERIAL SPECIFICATION');
    lines.push(`Material: ${result.material?.name || 'N/A'}`);
    lines.push(`Category: ${result.material?.category || 'N/A'}`);
    lines.push(`Mass: ${result.material?.input_mass_g || 'N/A'} g`);
    lines.push(`Moisture Content: ${((result.material?.moisture || 0) * 100).toFixed(1)}%`);
    lines.push('');

    lines.push('PROCESS DESIGN');
    lines.push('─'.repeat(50));
    if (result.process_plan?.pyrolysis) {
      lines.push('Pyrolysis Conditions:');
      const temp = result.process_plan.pyrolysis.temperature_celsius;
      const duration = result.process_plan.pyrolysis.duration_hours;
      const heatingRate = result.process_plan.pyrolysis.heating_rate;

      if (temp !== undefined && temp !== null) lines.push(`  • Temperature: ${temp}°C`);
      if (duration !== undefined && duration !== null) lines.push(`  • Duration: ${duration} hours`);
      if (heatingRate !== undefined && heatingRate !== null) lines.push(`  • Heating Rate: ${heatingRate}°C/min`);
      lines.push('');
    }

    if (result.process_plan?.activation) {
      lines.push('Activation Process:');
      const method = result.process_plan.activation.type;
      const agent = result.process_plan.activation.agent;
      const concentration = result.process_plan.activation.concentration;
      const temperature = result.process_plan.activation.temperature;
      const duration = result.process_plan.activation.duration;

      if (method) lines.push(`  • Method: ${method}`);
      if (agent) lines.push(`  • Agent: ${agent}`);
      if (concentration !== undefined && concentration !== null) lines.push(`  • Concentration: ${concentration}`);
      if (temperature !== undefined && temperature !== null) lines.push(`  • Temperature: ${temperature}°C`);
      if (duration !== undefined && duration !== null) lines.push(`  • Duration: ${duration} minutes`);
      lines.push('');
    }

    if (result.process_plan?.composite) {
      lines.push('Composite Configuration:');
      lines.push(`  • Strategy: ${result.process_plan.composite.strategy}`);
      if (result.process_plan.composite.matrix) {
        lines.push(`  • Matrix: ${result.process_plan.composite.matrix}`);
      }
      if (result.process_plan.composite.ratio) {
        lines.push(`  • Ratio: ${result.process_plan.composite.ratio}`);
      }
      lines.push('');
    }

    lines.push('PREDICTED PERFORMANCE');
    lines.push('─'.repeat(50));
    if (result.predicted_performance) {
      const co2Score = result.predicted_performance.co2_adsorption_score;
      const confidence = result.predicted_performance.confidence;

      if (co2Score !== undefined && co2Score !== null) {
        lines.push(`CO2 Adsorption Score: ${co2Score.toFixed(2)}`);
        lines.push(`  This represents the predicted CO2 adsorption capacity of the optimized material.`);
        lines.push('');
      }
      if (confidence !== undefined && confidence !== null) {
        lines.push(`Model Confidence: ${(confidence * 100).toFixed(1)}%`);
        lines.push(`  This reflects the statistical reliability of the predictions based on training data.`);
        lines.push('');
      }
    }

    lines.push('RISK ASSESSMENT');
    lines.push('─'.repeat(50));
    if (result.risk_assessment) {
      const overallRisk = result.risk_assessment.overall_risk;
      if (overallRisk) lines.push(`Overall Risk Level: ${overallRisk}`);
      if (result.risk_assessment.recommendation) {
        lines.push('');
        lines.push('Recommendation:');
        lines.push(result.risk_assessment.recommendation);
      }
      lines.push('');
    }

    if (result.scientific_explanation) {
      lines.push('SCIENTIFIC RATIONALE');
      lines.push('─'.repeat(50));
      lines.push(result.scientific_explanation);
      lines.push('');
    }

    lines.push('═'.repeat(50));
    lines.push('This recipe has been optimized using quantum-inspired algorithms');
    lines.push('and validated against experimental databases.');

    return lines.join('\n');
  };

  const resetWizard = useCallback(() => {
    clearLocalStorage();
    setMessages([
      {
        id: '1',
        role: 'assistant',
        content: 'Welcome to Quantum-Morph AI Lab.\n\nWho are you?',
        options: ['Researcher / Scientist', 'Industrial User (Factory)', 'Student / Learning Mode'],
      },
    ]);
    setState({});
    setCurrentStep('user_type');
    setIsProcessing(false);
    setJobId(null);
    setResultData(null);
    setStepIndex(0);
    setNavigationHistory([]);
  }, [clearLocalStorage]);

  const goBack = useCallback(() => {
    if (navigationHistory.length === 0) return;

    const previousEntry = navigationHistory[navigationHistory.length - 1];
    const newHistory = navigationHistory.slice(0, -1);

    let restoredMessages = [...previousEntry.messages];
    if (restoredMessages.length > 0 && restoredMessages[restoredMessages.length - 1].role === 'user') {
      restoredMessages = restoredMessages.slice(0, -1);
    }

    setState(previousEntry.state);
    setCurrentStep(previousEntry.step);
    setStepIndex(previousEntry.stepIndex);
    setMessages(restoredMessages);
    setNavigationHistory(newHistory);
    setResultData(null);
  }, [navigationHistory]);

  const loadExperiment = useCallback((experiment: ExperimentRecord) => {
    clearLocalStorage();

    const loadedState = experiment.full_input_json;
    const loadedResult = experiment.full_result_json;

    setState(loadedState);
    setResultData(loadedResult);
    setCurrentStep('complete');
    setStepIndex(FIXED_TOTAL_STEPS);
    setIsProcessing(false);
    setJobId(null);

    const loadNotification: Message = {
      id: Date.now().toString(),
      role: 'assistant',
      content: `Loaded experiment from ${new Date(experiment.timestamp).toLocaleString()}\n\nMaterial: ${loadedState.material_name}\nCategory: ${loadedState.category}\nOptimization: ${loadedState.optimization_goal}`,
    };

    const jsonBlock = '```json\n' + JSON.stringify(loadedResult, null, 2) + '\n```';
    const jsonMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: jsonBlock,
      isResult: true,
    };

    const explanation = generateExplanation(loadedResult);
    const explanationMessage: Message = {
      id: (Date.now() + 2).toString(),
      role: 'assistant',
      content: explanation,
      isResult: true,
    };

    setMessages([loadNotification, jsonMessage, explanationMessage]);
  }, []);

  return {
    messages,
    handleUserInput,
    isProcessing,
    currentStep,
    resetWizard,
    loadExperiment,
    goBack,
    currentStepNumber: stepIndex,
    totalSteps: FIXED_TOTAL_STEPS,
    resultData,
    canGoBack: navigationHistory.length > 0,
    state,
  };
}
