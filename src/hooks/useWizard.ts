import { useState, useCallback } from 'react';
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

    const apiUrl = 'http://127.0.0.1:8000/optimize';
    const headers = {
      'Content-Type': 'application/json',
    };

    console.log('=== API REQUEST DEBUG ===');
    console.log('URL:', apiUrl);
    console.log('Method: POST');
    console.log('Headers:', JSON.stringify(headers, null, 2));
    console.log('Body:', JSON.stringify(requestPayload, null, 2));
    console.log('========================');

    const attemptFetch = async (timeoutMs: number): Promise<Response | null> => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      try {
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers,
          body: JSON.stringify(requestPayload),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        return response;
      } catch (error) {
        clearTimeout(timeoutId);
        if (error instanceof Error && error.name === 'AbortError') {
          return null;
        }
        throw error;
      }
    };

    const pollForResponse = async (maxAttempts = 20): Promise<void> => {
      for (let attempt = 0; attempt < maxAttempts; attempt++) {
        console.log(`Polling attempt ${attempt + 1}/${maxAttempts}`);

        try {
          const response = await attemptFetch(30000);

          if (response) {
            console.log('Response Status:', response.status);
            console.log('Response Status Text:', response.statusText);

            if (!response.ok) {
              const errorText = await response.text();
              console.error('Response Error Body:', errorText);
              throw new Error(`API returned status ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();
            console.log('Response Success:', result);
            displayResults(result);
            setIsProcessing(false);
            return;
          }

          if (attempt < maxAttempts - 1) {
            console.log('Request timed out, waiting 5 seconds before retry...');
            await new Promise(resolve => setTimeout(resolve, 5000));
          }
        } catch (error) {
          if (error instanceof Error && error.message.includes('API returned status')) {
            throw error;
          }
          console.error('Request error:', error);
          if (attempt < maxAttempts - 1) {
            console.log('Error occurred, waiting 5 seconds before retry...');
            await new Promise(resolve => setTimeout(resolve, 5000));
          }
        }
      }

      throw new Error('Maximum polling attempts reached without successful response');
    };

    try {
      await pollForResponse();
    } catch (error) {
      console.error('=== API REQUEST FAILED ===');
      console.error('Error:', error);
      console.error('=========================');

      addMessage(
        'assistant',
        `Server connection failed after multiple attempts.\n\nError Details:\n${error instanceof Error ? error.message : 'Unknown error'}\n\nThe API might be processing your request. Please try again in a moment.`
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
    lines.push(`Mass: ${result.material?.mass || 'N/A'} g`);
    lines.push(`Moisture Content: ${((result.material?.moisture || 0) * 100).toFixed(1)}%`);
    lines.push('');

    lines.push('PROCESS DESIGN');
    lines.push('─'.repeat(50));
    if (result.process_plan?.pyrolysis) {
      lines.push('Pyrolysis Conditions:');
      lines.push(`  • Temperature: ${result.process_plan.pyrolysis.temperature}°C`);
      lines.push(`  • Duration: ${result.process_plan.pyrolysis.duration} minutes`);
      lines.push(`  • Heating Rate: ${result.process_plan.pyrolysis.heating_rate}°C/min`);
      lines.push('');
    }

    if (result.process_plan?.activation) {
      lines.push('Activation Process:');
      lines.push(`  • Method: ${result.process_plan.activation.method}`);
      if (result.process_plan.activation.agent) {
        lines.push(`  • Agent: ${result.process_plan.activation.agent}`);
      }
      if (result.process_plan.activation.concentration) {
        lines.push(`  • Concentration: ${result.process_plan.activation.concentration}`);
      }
      if (result.process_plan.activation.temperature) {
        lines.push(`  • Temperature: ${result.process_plan.activation.temperature}°C`);
      }
      if (result.process_plan.activation.duration) {
        lines.push(`  • Duration: ${result.process_plan.activation.duration} minutes`);
      }
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
      lines.push(`CO₂ Adsorption Capacity: ${result.predicted_performance.co2_adsorption?.toFixed(2) || 'N/A'} mg/g`);
      lines.push(
        `  This represents the maximum amount of CO₂ that can be captured per gram of material.`
      );
      lines.push('');
      lines.push(`Stability Score: ${result.predicted_performance.stability_score?.toFixed(2) || 'N/A'}`);
      lines.push(`  This metric indicates the structural integrity and long-term performance stability.`);
      lines.push('');
      lines.push(`Model Confidence: ${((result.predicted_performance.confidence || 0) * 100).toFixed(1)}%`);
      lines.push(`  This reflects the statistical reliability of the predictions based on training data.`);
      lines.push('');
    }

    lines.push('RISK ASSESSMENT');
    lines.push('─'.repeat(50));
    if (result.risk_assessment) {
      lines.push(`Technical Risk Level: ${result.risk_assessment.technical_risk || 'N/A'}`);
      lines.push('');
      lines.push('Recommendation:');
      lines.push(result.risk_assessment.recommendation || 'N/A');
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

  return {
    messages,
    handleUserInput,
    isProcessing,
    currentStep,
  };
}
