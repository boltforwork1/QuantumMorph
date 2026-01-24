import { useState, useCallback, useEffect } from 'react';
import { Message, WizardState } from '../types';

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

export function useWizard() {
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

  useEffect(() => {
    const savedState = localStorage.getItem('wizard_state');
    const savedStep = localStorage.getItem('wizard_step') as Step | null;
    const savedJobId = localStorage.getItem('wizard_job_id');
    const savedMessages = localStorage.getItem('wizard_messages');

    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState);
        setState(parsedState);
        if (savedStep) setCurrentStep(savedStep);
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
    }
  }, [state, currentStep, isInitialized]);

  useEffect(() => {
    if (isInitialized && messages.length > 1) {
      localStorage.setItem('wizard_messages', JSON.stringify(messages));
    }
  }, [messages, isInitialized]);

  const clearLocalStorage = useCallback(() => {
    localStorage.removeItem('wizard_state');
    localStorage.removeItem('wizard_step');
    localStorage.removeItem('wizard_job_id');
    localStorage.removeItem('wizard_messages');
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

    setState((prev) => ({ ...prev, user_type: userType }));
    setCurrentStep('moisture_known');
    addMessage('assistant', 'Do you know the moisture content?', ['Yes', 'No']);
  };

  const handleMoistureKnown = (input: string) => {
    const knowsMoisture = input.toLowerCase().includes('yes');
    setState((prev) => ({ ...prev, knowsMoisture }));

    if (knowsMoisture) {
      setCurrentStep('moisture_value');
      addMessage('assistant', 'Enter moisture content (value between 0 and 1):');
    } else {
      setState((prev) => ({ ...prev, moisture: 0.3 }));
      setCurrentStep('category');
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

    setState((prev) => ({ ...prev, moisture }));
    setCurrentStep('category');
    addMessage('assistant', 'Select material category:', ['agricultural', 'biomass', 'plastic', 'mixed']);
  };

  const handleCategory = (input: string) => {
    const category = input.toLowerCase() as 'agricultural' | 'biomass' | 'plastic' | 'mixed';
    if (!['agricultural', 'biomass', 'plastic', 'mixed'].includes(category)) {
      addMessage('assistant', 'Please select one of the provided categories.');
      return;
    }

    setState((prev) => ({ ...prev, category }));
    setCurrentStep('material');
    addMessage('assistant', 'Select material:', ['Rice Straw', 'Date Palm Seeds', 'Other']);
  };

  const handleMaterial = (input: string) => {
    if (input.toLowerCase() === 'other') {
      setCurrentStep('material_custom');
      addMessage('assistant', 'Enter custom material name:');
    } else {
      setState((prev) => ({ ...prev, material_name: input }));
      setCurrentStep('mass');
      addMessage('assistant', 'Enter sample mass (grams):');
    }
  };

  const handleMaterialCustom = (input: string) => {
    setState((prev) => ({ ...prev, material_name: input }));
    setCurrentStep('mass');
    addMessage('assistant', 'Enter sample mass (grams):');
  };

  const handleMass = (input: string) => {
    const mass = parseFloat(input);
    if (isNaN(mass) || mass <= 0) {
      addMessage('assistant', 'Please enter a valid positive number.');
      return;
    }

    setState((prev) => ({ ...prev, mass }));
    setCurrentStep('processing_goal');
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

    setState((prev) => ({ ...prev, processing_goal: goal }));
    setCurrentStep('optimization_goal');
    addMessage('assistant', 'Select optimization objective:', ['max_co2', 'balanced', 'max_stability']);
  };

  const handleOptimizationGoal = (input: string) => {
    const goal = input.toLowerCase() as 'max_co2' | 'balanced' | 'max_stability';
    if (!['max_co2', 'balanced', 'max_stability'].includes(goal)) {
      addMessage('assistant', 'Please select one of the provided options.');
      return;
    }

    setState((prev) => ({ ...prev, optimization_goal: goal }));

    if (state.processing_goal === 'activated_carbon' || state.processing_goal === 'composite_filter') {
      setCurrentStep('activation_method');
      addMessage('assistant', 'Select activation method:', ['chemical', 'physical']);
    } else {
      setCurrentStep('num_trials');
      addMessage('assistant', 'Enter number of virtual experiments (num_trials):');
    }
  };

  const handleActivationMethod = (input: string) => {
    const method = input.toLowerCase() as 'chemical' | 'physical';
    if (!['chemical', 'physical'].includes(method)) {
      addMessage('assistant', 'Please select either chemical or physical.');
      return;
    }

    setState((prev) => ({ ...prev, activation: { type: method } }));

    if (method === 'chemical') {
      setCurrentStep('activation_agent');
      addMessage('assistant', 'Select activation agent:', ['HCl', 'KOH', 'H3PO4']);
    } else {
      if (state.processing_goal === 'composite_filter') {
        setCurrentStep('composite_strategy');
        addMessage('assistant', 'Select composite strategy:', ['manual', 'auto']);
      } else {
        setCurrentStep('num_trials');
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

    setState((prev) => ({
      ...prev,
      activation: { ...prev.activation!, agent },
    }));

    setCurrentStep('concentration_known');
    addMessage('assistant', 'Do you know the concentration?', ['Yes', 'No']);
  };

  const handleConcentrationKnown = (input: string) => {
    const knowsConcentration = input.toLowerCase().includes('yes');

    if (knowsConcentration) {
      setCurrentStep('concentration_value');
      addMessage('assistant', 'Enter concentration value:');
    } else {
      setState((prev) => ({
        ...prev,
        activation: { ...prev.activation!, concentration: 'auto' },
      }));

      if (state.processing_goal === 'composite_filter') {
        setCurrentStep('composite_strategy');
        addMessage('assistant', 'Select composite strategy:', ['manual', 'auto']);
      } else {
        setCurrentStep('num_trials');
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

    setState((prev) => ({
      ...prev,
      activation: { ...prev.activation!, concentration },
    }));

    if (state.processing_goal === 'composite_filter') {
      setCurrentStep('composite_strategy');
      addMessage('assistant', 'Select composite strategy:', ['manual', 'auto']);
    } else {
      setCurrentStep('num_trials');
      addMessage('assistant', 'Enter number of virtual experiments (num_trials):');
    }
  };

  const handleCompositeStrategy = (input: string) => {
    const strategy = input.toLowerCase() as 'manual' | 'auto';
    if (!['manual', 'auto'].includes(strategy)) {
      addMessage('assistant', 'Please select either manual or auto.');
      return;
    }

    setState((prev) => ({ ...prev, composite: { strategy } }));
    setCurrentStep('num_trials');
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
    const jsonBlock = '```json\n' + JSON.stringify(result, null, 2) + '\n```';
    addMessage('assistant', jsonBlock, undefined, true);

    const explanation = generateExplanation(result);
    addMessage('assistant', explanation, undefined, true);
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
        lines.push(`CO₂ Adsorption Score: ${co2Score.toFixed(2)}`);
        lines.push(`  This represents the predicted CO₂ adsorption capacity of the optimized material.`);
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

  const resetWizard = () => {
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
  };

  return {
    messages,
    handleUserInput,
    isProcessing,
    currentStep,
    resetWizard,
  };
}
