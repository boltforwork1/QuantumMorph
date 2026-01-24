interface QuestionIntent {
  category: 'temperature' | 'activation' | 'duration' | 'performance' | 'risk' | 'cost' | 'definition' | 'general';
  keywords: string[];
}

interface AIResponse {
  answer: string;
}

export function detectIntent(question: string): QuestionIntent {
  const q = question.toLowerCase();

  if (q.includes('what is') || q.includes('what are') || q.includes('define') || q.includes('explain pyrolysis') || q.includes('explain activation') || q.includes('explain composite')) {
    return { category: 'definition', keywords: extractDefinitionKeywords(q) };
  }

  if (q.includes('temperature') || q.includes('temp') || q.includes('hot') || q.includes('heat')) {
    return { category: 'temperature', keywords: ['temperature'] };
  }

  if (q.includes('activation') || q.includes('agent') || q.includes('koh') || q.includes('hcl') || q.includes('h3po4') || q.includes('chemical') || q.includes('physical')) {
    return { category: 'activation', keywords: ['activation'] };
  }

  if (q.includes('duration') || q.includes('time') || q.includes('how long') || q.includes('hours')) {
    return { category: 'duration', keywords: ['duration'] };
  }

  if (q.includes('co2') || q.includes('co₂') || q.includes('score') || q.includes('performance') || q.includes('good') || q.includes('high') || q.includes('confidence')) {
    return { category: 'performance', keywords: ['performance'] };
  }

  if (q.includes('risk') || q.includes('safe') || q.includes('danger') || q.includes('sensitive') || q.includes('scaling')) {
    return { category: 'risk', keywords: ['risk'] };
  }

  if (q.includes('cost') || q.includes('expensive') || q.includes('cheap') || q.includes('price')) {
    return { category: 'cost', keywords: ['cost'] };
  }

  return { category: 'general', keywords: [] };
}

function extractDefinitionKeywords(question: string): string[] {
  const keywords: string[] = [];
  if (question.includes('pyrolysis')) keywords.push('pyrolysis');
  if (question.includes('activation')) keywords.push('activation');
  if (question.includes('composite')) keywords.push('composite');
  if (question.includes('biochar')) keywords.push('biochar');
  if (question.includes('adsorption')) keywords.push('adsorption');
  return keywords;
}

export function generateResponse(
  question: string,
  userType: string,
  inputJson: any,
  resultJson: any
): AIResponse {
  const intent = detectIntent(question);

  let answer = '';

  switch (intent.category) {
    case 'temperature':
      answer = explainTemperature(inputJson, resultJson, userType);
      break;
    case 'activation':
      answer = explainActivation(inputJson, resultJson, userType);
      break;
    case 'duration':
      answer = explainDuration(inputJson, resultJson, userType);
      break;
    case 'performance':
      answer = explainPerformance(inputJson, resultJson, userType);
      break;
    case 'risk':
      answer = explainRisk(inputJson, resultJson, userType);
      break;
    case 'cost':
      answer = explainCost(inputJson, resultJson, userType);
      break;
    case 'definition':
      answer = explainDefinition(intent.keywords, userType);
      break;
    default:
      answer = generateGeneralResponse(question, inputJson, resultJson, userType);
  }

  return { answer: formatForProfile(answer, userType) };
}

function explainTemperature(inputJson: any, resultJson: any, userType: string): string {
  const temp = resultJson.process_plan?.pyrolysis?.temperature_celsius;
  const material = resultJson.material?.category || inputJson.category;
  const goal = inputJson.optimization_goal;

  if (!temp) {
    return "Temperature data is not available in the current experiment results.";
  }

  let explanation = '';

  if (userType === 'student') {
    explanation = `The pyrolysis temperature is set to ${temp}°C.\n\n`;

    if (temp < 400) {
      explanation += "This is a relatively low temperature. Think of it like slow-roasting - it helps preserve certain properties of the material while gently breaking it down.";
    } else if (temp >= 400 && temp < 600) {
      explanation += "This is a moderate temperature - like baking at medium-high heat. It's hot enough to break down the material efficiently but not so hot that everything burns away.";
    } else {
      explanation += "This is a high temperature - similar to very high-heat cooking. It creates a highly carbonized product with specific properties for CO2 capture.";
    }

    explanation += `\n\nFor ${material} materials aiming for ${goal}, this temperature creates the right balance between breaking down the material and keeping the useful carbon structure intact.`;

  } else if (userType === 'industrial') {
    explanation = `Pyrolysis Temperature: ${temp}°C\n\n`;
    explanation += "From a production standpoint:\n\n";

    if (temp < 400) {
      explanation += "• Lower energy costs due to reduced heating requirements\n";
      explanation += "• Longer residence time may be needed\n";
      explanation += "• Easier to maintain in industrial furnaces\n";
    } else if (temp >= 400 && temp < 600) {
      explanation += "• Balanced energy consumption\n";
      explanation += "• Standard industrial pyrolysis range\n";
      explanation += "• Well-established operational parameters\n";
    } else {
      explanation += "• Higher energy costs\n";
      explanation += "• Requires robust high-temperature equipment\n";
      explanation += "• May need specialized refractory materials\n";
    }

    explanation += `\nThis temperature is optimized for ${material} to achieve ${goal} while maintaining production efficiency.`;

  } else {
    explanation = `The pyrolysis temperature is ${temp}°C.\n\n`;
    explanation += "Scientific rationale:\n\n";

    if (temp < 400) {
      explanation += "Low-temperature pyrolysis (< 400°C) favors:\n";
      explanation += "• Higher biochar yield\n";
      explanation += "• Preservation of oxygen-containing functional groups\n";
      explanation += "• Lower degree of carbonization\n";
      explanation += "• Retention of volatile matter\n";
    } else if (temp >= 400 && temp < 600) {
      explanation += "Medium-temperature pyrolysis (400-600°C) optimizes:\n";
      explanation += "• Carbon fixation efficiency\n";
      explanation += "• Surface area development\n";
      explanation += "• Compromise between yield and porosity\n";
      explanation += "• Stable aromatic structures\n";
    } else {
      explanation += "High-temperature pyrolysis (> 600°C) enhances:\n";
      explanation += "• Maximum carbonization\n";
      explanation += "• High carbon content\n";
      explanation += "• Micropore formation\n";
      explanation += "• Graphitic structure development\n";
    }

    explanation += `\nFor ${material} with optimization goal "${goal}", this temperature maximizes the target performance metrics based on empirical correlations.`;
  }

  return explanation;
}

function explainActivation(inputJson: any, resultJson: any, userType: string): string {
  const activation = resultJson.process_plan?.activation;

  if (!activation) {
    return "This experiment does not include an activation step. The material is produced as raw biochar only.";
  }

  const method = activation.type;
  const agent = activation.agent;

  let explanation = '';

  if (userType === 'student') {
    explanation = `This experiment uses ${method} activation`;
    if (agent) explanation += ` with ${agent}`;
    explanation += ".\n\n";

    if (method === 'chemical') {
      explanation += "Chemical activation is like creating tiny tunnels in a sponge. The chemical agent (";
      if (agent === 'KOH') explanation += "potassium hydroxide";
      else if (agent === 'H3PO4') explanation += "phosphoric acid";
      else if (agent === 'HCl') explanation += "hydrochloric acid";
      else explanation += "the chemical";
      explanation += ") eats away at the carbon structure, creating lots of tiny pores.\n\n";
      explanation += "These pores act like parking spots for CO2 molecules - the more pores you have, the more CO2 you can capture!";
    } else {
      explanation += "Physical activation uses steam or CO2 gas at high temperatures to create pores in the material. Think of it like steam carving channels through the carbon structure.\n\n";
      explanation += "This method is cleaner (no chemicals to wash out) but might take longer and use more energy.";
    }

  } else if (userType === 'industrial') {
    explanation = `Activation Method: ${method}`;
    if (agent) explanation += ` using ${agent}`;
    explanation += "\n\n";

    if (method === 'chemical') {
      explanation += "Industrial considerations:\n\n";
      explanation += "• Requires chemical handling and storage infrastructure\n";
      if (agent === 'KOH') {
        explanation += "• KOH is highly corrosive - needs corrosion-resistant equipment\n";
        explanation += "• Generates alkaline waste streams requiring neutralization\n";
        explanation += "• Lower activation temperatures (600-800°C)\n";
        explanation += "• Higher surface area yields\n";
      } else if (agent === 'H3PO4') {
        explanation += "• Less corrosive than KOH but still requires acid-resistant equipment\n";
        explanation += "• Can be partially recovered and recycled\n";
        explanation += "• Moderate temperatures (400-600°C)\n";
        explanation += "• Good cost-performance ratio\n";
      }
      explanation += "• Washing and neutralization steps add water treatment costs\n";
    } else {
      explanation += "Physical activation advantages:\n\n";
      explanation += "• No chemical purchase or handling costs\n";
      explanation += "• No wastewater treatment required\n";
      explanation += "• Simpler process control\n";
      explanation += "• But: Higher energy consumption and longer processing times\n";
    }

  } else {
    explanation = `Activation: ${method}`;
    if (agent) explanation += ` with ${agent}`;
    explanation += "\n\n";

    if (method === 'chemical') {
      explanation += "Chemical activation mechanism:\n\n";
      if (agent === 'KOH') {
        explanation += "KOH acts through:\n";
        explanation += "1. Dehydration of cellulosic components\n";
        explanation += "2. Carbon lattice expansion through K intercalation\n";
        explanation += "3. Oxidative etching creating hierarchical porosity\n";
        explanation += "4. Formation of oxygen functional groups enhancing CO2 affinity\n\n";
        explanation += "Typically achieves 2000-3500 m²/g surface area with micropore dominance.";
      } else if (agent === 'H3PO4') {
        explanation += "H3PO4 mechanism:\n";
        explanation += "1. Acid-catalyzed dehydration and condensation\n";
        explanation += "2. Formation of phosphate and polyphosphate bridges\n";
        explanation += "3. Prevention of tar formation during carbonization\n";
        explanation += "4. Development of mesopore-rich structure\n\n";
        explanation += "Results in 1000-1800 m²/g with balanced micro/mesopore distribution.";
      }
    } else {
      explanation += "Physical activation proceeds via:\n\n";
      explanation += "1. Gasification of amorphous carbon (C + H2O → CO + H2)\n";
      explanation += "2. Selective removal of reactive carbon atoms\n";
      explanation += "3. Pore widening and new pore generation\n";
      explanation += "4. Development of predominantly microporous structure\n\n";
      explanation += "Surface area: 800-1500 m²/g with narrow pore size distribution.";
    }
  }

  return explanation;
}

function explainDuration(inputJson: any, resultJson: any, userType: string): string {
  const pyrolysisDuration = resultJson.process_plan?.pyrolysis?.duration_hours;
  const activationDuration = resultJson.process_plan?.activation?.duration;

  let explanation = '';

  if (userType === 'student') {
    if (pyrolysisDuration) {
      explanation += `The pyrolysis step takes ${pyrolysisDuration} hour${pyrolysisDuration !== 1 ? 's' : ''}.\n\n`;
      explanation += "Think of this like cooking a roast - you can't rush it! The material needs time to break down properly.\n\n";

      if (pyrolysisDuration < 2) {
        explanation += "This is a relatively quick process, like a fast bake. The high temperature does the work quickly.";
      } else if (pyrolysisDuration <= 4) {
        explanation += "This is a moderate duration, giving enough time for the material to fully transform without wasting energy.";
      } else {
        explanation += "This is a longer process, ensuring complete carbonization - like slow-cooking for the best results.";
      }
    }

    if (activationDuration) {
      explanation += `\n\nThe activation step takes ${activationDuration} minutes. This is when we create all those tiny pores for capturing CO2!`;
    }

  } else if (userType === 'industrial') {
    explanation = "Process Timeline:\n\n";

    if (pyrolysisDuration) {
      explanation += `Pyrolysis: ${pyrolysisDuration} hour${pyrolysisDuration !== 1 ? 's' : ''}\n`;
      explanation += `• Furnace occupancy time: ${pyrolysisDuration}h\n`;
      explanation += `• Energy consumption: ${(pyrolysisDuration * 2.5).toFixed(1)} kWh/kg (estimated)\n`;
      explanation += `• Production cycles per day: ${Math.floor(24 / (pyrolysisDuration + 1))}\n\n`;

      if (pyrolysisDuration < 2) {
        explanation += "Shorter duration = higher throughput but may require process optimization for quality control.";
      } else {
        explanation += "Longer duration ensures complete conversion but limits daily production capacity.";
      }
    }

    if (activationDuration) {
      explanation += `\n\nActivation: ${activationDuration} minutes\n`;
      explanation += "This adds to the total processing time and must be factored into production scheduling.";
    }

  } else {
    explanation = "Process Kinetics:\n\n";

    if (pyrolysisDuration) {
      explanation += `Pyrolysis Duration: ${pyrolysisDuration} hour${pyrolysisDuration !== 1 ? 's' : ''}\n\n`;
      explanation += "Duration is optimized based on:\n";
      explanation += "1. Complete devolatilization of the feedstock\n";
      explanation += "2. Thermal decomposition kinetics at the selected temperature\n";
      explanation += "3. Fixed carbon yield maximization\n";
      explanation += "4. Energy efficiency considerations\n\n";

      if (pyrolysisDuration < 2) {
        explanation += "Short residence times are suitable for high-temperature pyrolysis where reaction kinetics are rapid.";
      } else {
        explanation += "Extended residence times ensure complete conversion and stable product properties.";
      }
    }

    if (activationDuration) {
      explanation += `\n\nActivation Time: ${activationDuration} minutes\n`;
      explanation += "Determines:\n";
      explanation += "• Degree of burn-off\n";
      explanation += "• Pore development extent\n";
      explanation += "• Surface area achieved\n";
      explanation += "• Final yield of activated carbon";
    }
  }

  return explanation;
}

function explainPerformance(inputJson: any, resultJson: any, userType: string): string {
  const co2Score = resultJson.predicted_performance?.co2_adsorption_score;
  const confidence = resultJson.predicted_performance?.confidence;

  if (co2Score === undefined || co2Score === null) {
    return "Performance data is not available in the current experiment results.";
  }

  let explanation = '';
  let performanceLevel = '';

  if (co2Score < 2.0) performanceLevel = 'low';
  else if (co2Score >= 2.0 && co2Score < 4.0) performanceLevel = 'moderate';
  else if (co2Score >= 4.0 && co2Score < 6.0) performanceLevel = 'good';
  else performanceLevel = 'excellent';

  if (userType === 'student') {
    explanation = `Your CO2 adsorption score is ${co2Score.toFixed(2)}.\n\n`;

    if (performanceLevel === 'excellent') {
      explanation += "This is an EXCELLENT result! Your material should capture CO2 very effectively. Think of it like having a super-absorbent sponge - it can hold a lot of CO2 molecules.";
    } else if (performanceLevel === 'good') {
      explanation += "This is a GOOD result! Your material will capture CO2 well. It's like having a decent sponge - not the best, but definitely useful.";
    } else if (performanceLevel === 'moderate') {
      explanation += "This is a MODERATE result. Your material can capture some CO2, but there's room for improvement. Think of it as a basic sponge - it works, but could be better.";
    } else {
      explanation += "This is a LOW score. The material might not capture much CO2. It's like a sponge that's not very absorbent - you might need to adjust the recipe.";
    }

    if (confidence) {
      explanation += `\n\nThe model is ${(confidence * 100).toFixed(0)}% confident in this prediction. `;
      if (confidence > 0.8) {
        explanation += "That's really high confidence - the prediction is very reliable!";
      } else if (confidence > 0.6) {
        explanation += "That's decent confidence - the prediction should be fairly accurate.";
      } else {
        explanation += "That's lower confidence - take this as a rough estimate.";
      }
    }

  } else if (userType === 'industrial') {
    explanation = `CO2 Adsorption Score: ${co2Score.toFixed(2)}\n\n`;
    explanation += "Production implications:\n\n";

    if (performanceLevel === 'excellent') {
      explanation += "• HIGH-VALUE PRODUCT suitable for premium applications\n";
      explanation += "• Can command higher market prices\n";
      explanation += "• Suitable for industrial CO2 capture systems\n";
      explanation += "• Lower material quantities needed per ton of CO2 captured\n";
    } else if (performanceLevel === 'good') {
      explanation += "• COMMERCIALLY VIABLE for standard applications\n";
      explanation += "• Competitive performance-to-cost ratio\n";
      explanation += "• Suitable for most CO2 filtration needs\n";
      explanation += "• Good balance of performance and production cost\n";
    } else if (performanceLevel === 'moderate') {
      explanation += "• SUITABLE FOR LOW-COST APPLICATIONS\n";
      explanation += "• May require larger quantities for effective CO2 capture\n";
      explanation += "• Consider as a budget-friendly option\n";
      explanation += "• Process optimization could improve performance\n";
    } else {
      explanation += "• BELOW COMMERCIAL STANDARDS\n";
      explanation += "• Not recommended for production without process modification\n";
      explanation += "• Recommend testing alternative parameters\n";
      explanation += "• Cost-benefit analysis suggests poor ROI\n";
    }

    if (confidence) {
      explanation += `\nPrediction Confidence: ${(confidence * 100).toFixed(1)}%\n`;
      if (confidence < 0.7) {
        explanation += "Note: Lower confidence suggests pilot testing before full-scale production.";
      }
    }

  } else {
    explanation = `CO2 Adsorption Performance: ${co2Score.toFixed(2)} mmol/g\n\n`;

    explanation += "Performance Assessment:\n\n";

    if (performanceLevel === 'excellent') {
      explanation += "Exceptional CO2 capture capacity (> 6.0 mmol/g)\n";
      explanation += "• Comparable to commercial activated carbons\n";
      explanation += "• High density of adsorption sites\n";
      explanation += "• Optimal pore size distribution (0.5-0.8 nm for CO2)\n";
      explanation += "• Strong physisorption potential\n";
    } else if (performanceLevel === 'good') {
      explanation += "Strong CO2 capture capacity (4.0-6.0 mmol/g)\n";
      explanation += "• Above-average micropore volume\n";
      explanation += "• Good surface chemistry for CO2 affinity\n";
      explanation += "• Competitive with many commercial materials\n";
      explanation += "• Suitable for most applications\n";
    } else if (performanceLevel === 'moderate') {
      explanation += "Moderate CO2 capture capacity (2.0-4.0 mmol/g)\n";
      explanation += "• Adequate porosity but suboptimal pore size\n";
      explanation += "• May benefit from further activation\n";
      explanation += "• Functional for lower-pressure applications\n";
      explanation += "• Room for process optimization\n";
    } else {
      explanation += "Below-target CO2 capture capacity (< 2.0 mmol/g)\n";
      explanation += "• Insufficient micropore development\n";
      explanation += "• May indicate incomplete activation\n";
      explanation += "• Consider increasing activation intensity\n";
      explanation += "• Explore alternative activation agents\n";
    }

    if (confidence) {
      explanation += `\n\nModel Confidence: ${(confidence * 100).toFixed(1)}%\n`;
      explanation += "Based on similarity to training database entries. ";
      if (confidence > 0.8) {
        explanation += "High confidence indicates strong empirical support.";
      } else {
        explanation += "Moderate confidence suggests experimental validation recommended.";
      }
    }
  }

  return explanation;
}

function explainRisk(inputJson: any, resultJson: any, userType: string): string {
  const riskAssessment = resultJson.risk_assessment;

  if (!riskAssessment) {
    return "Risk assessment data is not available in the current experiment results.";
  }

  const overallRisk = riskAssessment.overall_risk || 'Unknown';
  const recommendation = riskAssessment.recommendation;

  let explanation = '';

  if (userType === 'student') {
    explanation = `Risk Level: ${overallRisk}\n\n`;

    if (overallRisk.toLowerCase().includes('low')) {
      explanation += "Good news! This experiment is relatively safe and straightforward. Think of it like following a simple recipe - as long as you follow the steps, you should be fine.\n\n";
      explanation += "The temperatures and chemicals involved are manageable with standard lab equipment.";
    } else if (overallRisk.toLowerCase().includes('medium') || overallRisk.toLowerCase().includes('moderate')) {
      explanation += "This experiment requires careful attention. It's like cooking with hot oil - not dangerous if you're careful, but you need to pay attention.\n\n";
      explanation += "Make sure you have proper safety equipment and supervision.";
    } else {
      explanation += "This is a higher-risk experiment that needs extra precautions. Think of it like advanced chemistry - you need experience and proper safety measures.\n\n";
      explanation += "Don't attempt this without proper training and supervision!";
    }

    if (recommendation) {
      explanation += `\n\nImportant: ${recommendation}`;
    }

  } else if (userType === 'industrial') {
    explanation = `Overall Risk Assessment: ${overallRisk}\n\n`;
    explanation += "Production Risk Factors:\n\n";

    const temp = resultJson.process_plan?.pyrolysis?.temperature_celsius;
    const activation = resultJson.process_plan?.activation;

    if (temp && temp > 700) {
      explanation += "• HIGH-TEMPERATURE OPERATION\n";
      explanation += "  - Requires refractory-lined equipment\n";
      explanation += "  - Thermal stress on furnace components\n";
      explanation += "  - Higher maintenance costs\n";
      explanation += "  - Operator safety training essential\n\n";
    }

    if (activation?.type === 'chemical') {
      explanation += "• CHEMICAL HANDLING RISKS\n";
      if (activation.agent === 'KOH') {
        explanation += "  - KOH is highly corrosive (pH 14)\n";
        explanation += "  - Requires PPE: face shields, chemical-resistant gloves\n";
        explanation += "  - Emergency eyewash stations mandatory\n";
        explanation += "  - Exothermic reactions possible\n\n";
      } else if (activation.agent === 'H3PO4') {
        explanation += "  - Acidic corrosion hazard\n";
        explanation += "  - Proper ventilation required\n";
        explanation += "  - Acid-resistant materials needed\n\n";
      }
    }

    explanation += "Risk Mitigation:\n";
    explanation += "• Implement standard operating procedures (SOPs)\n";
    explanation += "• Regular equipment inspection and maintenance\n";
    explanation += "• Staff training and safety certifications\n";
    explanation += "• Emergency response plans\n";

    if (recommendation) {
      explanation += `\n\nRECOMMENDATION: ${recommendation}`;
    }

  } else {
    explanation = `Risk Assessment: ${overallRisk}\n\n`;

    explanation += "Key Risk Factors:\n\n";

    const temp = resultJson.process_plan?.pyrolysis?.temperature_celsius;
    const activation = resultJson.process_plan?.activation;

    explanation += "1. THERMAL HAZARDS\n";
    if (temp) {
      explanation += `   Pyrolysis at ${temp}°C presents `;
      if (temp < 500) {
        explanation += "moderate thermal risk with standard precautions.\n";
      } else if (temp < 800) {
        explanation += "elevated thermal risk requiring proper insulation and cooling systems.\n";
      } else {
        explanation += "significant thermal risk necessitating advanced refractory materials.\n";
      }
    }

    if (activation?.type === 'chemical') {
      explanation += "\n2. CHEMICAL HAZARDS\n";
      if (activation.agent === 'KOH') {
        explanation += "   KOH activation:\n";
        explanation += "   • Severe caustic burns on contact\n";
        explanation += "   • Generates heat when dissolved\n";
        explanation += "   • Reacts violently with acids\n";
        explanation += "   • May form explosive H2 with certain metals\n";
      } else if (activation.agent === 'H3PO4') {
        explanation += "   H3PO4 activation:\n";
        explanation += "   • Corrosive to skin and eyes\n";
        explanation += "   • Vapor inhalation hazard\n";
        explanation += "   • Moderate reactivity with bases\n";
      }
    }

    explanation += "\n3. PROCESS SENSITIVITY\n";
    explanation += "   Temperature control is critical:\n";
    explanation += "   • ±10°C variation can affect product quality\n";
    explanation += "   • Rapid heating may cause thermal shock\n";
    explanation += "   • Cooling rate influences final properties\n";

    if (recommendation) {
      explanation += `\n\nEXPERT RECOMMENDATION:\n${recommendation}`;
    }
  }

  return explanation;
}

function explainCost(inputJson: any, resultJson: any, userType: string): string {
  const temp = resultJson.process_plan?.pyrolysis?.temperature_celsius;
  const duration = resultJson.process_plan?.pyrolysis?.duration_hours;
  const activation = resultJson.process_plan?.activation;
  const mass = resultJson.material?.input_mass_g || inputJson.mass;

  let explanation = '';

  if (userType === 'student') {
    explanation = "Cost Breakdown (Educational Estimate):\n\n";

    if (temp && duration) {
      const energyCost = ((temp / 100) * duration * 0.1).toFixed(2);
      explanation += `Energy for heating: ~$${energyCost}\n`;
      explanation += "This is like running an oven for several hours.\n\n";
    }

    if (activation?.type === 'chemical') {
      explanation += "Chemical costs: ~$5-20 per batch\n";
      explanation += "(Chemicals like KOH or H3PO4 aren't free!)\n\n";
    }

    explanation += "Overall: This is a relatively affordable experiment for research purposes, but scaling up would multiply these costs significantly.";

  } else if (userType === 'industrial') {
    explanation = "PRODUCTION COST ANALYSIS\n\n";

    let totalCost = 0;

    explanation += "1. ENERGY COSTS\n";
    if (temp && duration) {
      const energyKWh = (temp / 100) * duration * 2.5;
      const energyCost = energyKWh * 0.12;
      totalCost += energyCost;
      explanation += `   Pyrolysis energy: ${energyKWh.toFixed(1)} kWh @ $0.12/kWh = $${energyCost.toFixed(2)}/kg\n`;
    }

    explanation += "\n2. RAW MATERIAL COSTS\n";
    const materialType = resultJson.material?.category || inputJson.category;
    if (materialType === 'agricultural') {
      explanation += "   Agricultural waste: $0.05-0.15/kg (low cost)\n";
      totalCost += 0.10;
    } else if (materialType === 'biomass') {
      explanation += "   Biomass: $0.10-0.30/kg (moderate cost)\n";
      totalCost += 0.20;
    } else {
      explanation += "   Mixed feedstock: $0.05-0.20/kg\n";
      totalCost += 0.12;
    }

    if (activation?.type === 'chemical') {
      explanation += "\n3. ACTIVATION CHEMICALS\n";
      if (activation.agent === 'KOH') {
        explanation += "   KOH: $2.50-4.00/kg of biochar (high cost)\n";
        totalCost += 3.25;
      } else if (activation.agent === 'H3PO4') {
        explanation += "   H3PO4: $1.50-2.50/kg of biochar (moderate cost)\n";
        totalCost += 2.00;
      }
      explanation += "   Water treatment for washing: $0.30-0.50/kg\n";
      totalCost += 0.40;
    }

    explanation += "\n4. OPERATIONAL COSTS\n";
    explanation += "   Labor, maintenance, overhead: $1.50-3.00/kg\n";
    totalCost += 2.00;

    explanation += `\n═══════════════════════════════════\n`;
    explanation += `ESTIMATED TOTAL: $${totalCost.toFixed(2)}/kg of product\n`;
    explanation += `═══════════════════════════════════\n\n`;

    const co2Score = resultJson.predicted_performance?.co2_adsorption_score;
    if (co2Score && co2Score > 4.0) {
      explanation += "With high CO2 performance, market price could be $8-15/kg.\n";
      explanation += `Profit margin: $${(10 - totalCost).toFixed(2)}/kg (estimated at $10/kg sale price)`;
    } else {
      explanation += "With moderate performance, market price: $4-8/kg.\n";
      explanation += "Tight margins - optimize process to reduce costs.";
    }

  } else {
    explanation = "COST-BENEFIT ANALYSIS\n\n";

    explanation += "Economic Factors:\n\n";

    if (temp && duration) {
      const energyKWh = (temp / 100) * duration * 2.5;
      explanation += `1. Energy Consumption: ${energyKWh.toFixed(1)} kWh/kg\n`;
      explanation += "   Represents 30-40% of total production cost\n";
      if (temp > 700) {
        explanation += "   High-temperature processing increases OPEX\n\n";
      } else {
        explanation += "   Moderate energy efficiency\n\n";
      }
    }

    if (activation?.type === 'chemical') {
      explanation += "2. Chemical Activation Economics:\n";
      if (activation.agent === 'KOH') {
        explanation += "   • KOH: High cost but maximum surface area\n";
        explanation += "   • Typical ratio: 2-4:1 KOH:biochar\n";
        explanation += "   • Chemical cost dominates production economics\n";
        explanation += "   • Justified only for premium products\n\n";
      } else if (activation.agent === 'H3PO4') {
        explanation += "   • H3PO4: Moderate cost with good performance\n";
        explanation += "   • Better cost-performance ratio than KOH\n";
        explanation += "   • Partial chemical recovery possible\n\n";
      }
    } else if (activation?.type === 'physical') {
      explanation += "2. Physical Activation Economics:\n";
      explanation += "   • Lower chemical costs\n";
      explanation += "   • Higher energy consumption\n";
      explanation += "   • Better for large-scale production\n\n";
    }

    explanation += "3. Market Positioning:\n";
    const co2Score = resultJson.predicted_performance?.co2_adsorption_score;
    if (co2Score) {
      if (co2Score > 6.0) {
        explanation += "   Premium product category (> 6.0 mmol/g CO2)\n";
        explanation += "   Target market: Specialized CO2 capture systems\n";
        explanation += "   Estimated value: $12-20/kg\n";
      } else if (co2Score > 4.0) {
        explanation += "   Standard commercial grade (4-6 mmol/g CO2)\n";
        explanation += "   Target market: General filtration applications\n";
        explanation += "   Estimated value: $6-12/kg\n";
      } else {
        explanation += "   Budget/bulk category (< 4 mmol/g CO2)\n";
        explanation += "   Target market: Low-cost applications\n";
        explanation += "   Estimated value: $3-6/kg\n";
      }
    }
  }

  return explanation;
}

function explainDefinition(keywords: string[], userType: string): string {
  if (keywords.length === 0) {
    return "I can explain various concepts like pyrolysis, activation, biochar, composite filters, and adsorption. What would you like to learn about?";
  }

  let explanation = '';

  for (const keyword of keywords) {
    if (keyword === 'pyrolysis') {
      if (userType === 'student') {
        explanation += "WHAT IS PYROLYSIS?\n\n";
        explanation += "Pyrolysis is heating organic material (like wood, agricultural waste, or biomass) in the absence of oxygen.\n\n";
        explanation += "Think of it like this: When you burn wood in a campfire, it turns to ash because oxygen is present. But if you heat wood in a sealed container without oxygen, it turns into charcoal instead!\n\n";
        explanation += "Why no oxygen? Because oxygen causes burning. Without it, the material breaks down into carbon-rich biochar instead of burning away.\n\n";
        explanation += "Temperature matters: Higher temperatures create more carbon, lower temperatures preserve more of the original structure.";
      } else if (userType === 'industrial') {
        explanation += "PYROLYSIS IN PRODUCTION\n\n";
        explanation += "Pyrolysis is the thermochemical decomposition of biomass at elevated temperatures (300-900°C) in the absence of oxygen.\n\n";
        explanation += "Industrial considerations:\n";
        explanation += "• Batch vs. continuous processing\n";
        explanation += "• Temperature control precision (±10°C)\n";
        explanation += "• Residence time optimization\n";
        explanation += "• Gas collection and potential energy recovery\n";
        explanation += "• Scaling: from kg/day (lab) to tons/day (industrial)\n\n";
        explanation += "Key outputs: biochar (solid), bio-oil (liquid), syngas (gas)";
      } else {
        explanation += "PYROLYSIS - SCIENTIFIC DEFINITION\n\n";
        explanation += "Pyrolysis is the thermochemical decomposition of organic materials at elevated temperatures in an inert atmosphere (absence of oxygen).\n\n";
        explanation += "Mechanism:\n";
        explanation += "1. Dehydration (100-200°C): Water removal\n";
        explanation += "2. Depolymerization (200-400°C): Breaking of biopolymers\n";
        explanation += "3. Carbonization (400-700°C): Aromatization and carbon fixation\n";
        explanation += "4. Graphitization (>700°C): Formation of ordered carbon structures\n\n";
        explanation += "Products:\n";
        explanation += "• Biochar (solid): 20-40% yield\n";
        explanation += "• Bio-oil (liquid): 30-50% yield\n";
        explanation += "• Syngas (H2, CO, CH4, CO2): 20-35% yield\n\n";
        explanation += "Process is endothermic and requires external heat input.";
      }
    }

    if (keyword === 'activation') {
      if (explanation) explanation += "\n\n";
      if (userType === 'student') {
        explanation += "WHAT IS ACTIVATION?\n\n";
        explanation += "Activation is a process that makes biochar even better at capturing CO2 by creating lots of tiny pores in it.\n\n";
        explanation += "Imagine a sponge: regular biochar is like a sponge with just a few holes. Activated carbon is like a sponge that's FULL of microscopic holes - way more surface area to trap CO2!\n\n";
        explanation += "Two ways to activate:\n\n";
        explanation += "1. CHEMICAL: Use chemicals (like KOH) to eat away at the carbon and create pores. Fast but requires washing afterward.\n\n";
        explanation += "2. PHYSICAL: Use steam or CO2 gas at high heat to carve out pores. Cleaner but takes more time and energy.";
      } else if (userType === 'industrial') {
        explanation += "ACTIVATION PROCESSES\n\n";
        explanation += "Activation increases porosity and surface area of biochar, converting it to activated carbon.\n\n";
        explanation += "CHEMICAL ACTIVATION:\n";
        explanation += "• Agents: KOH, NaOH, H3PO4, ZnCl2\n";
        explanation += "• Temperature: 400-900°C\n";
        explanation += "• Impregnation ratio: 1:1 to 4:1 (agent:biochar)\n";
        explanation += "• Washing required: increases water usage and cost\n";
        explanation += "• Surface area: 1500-3500 m²/g\n\n";
        explanation += "PHYSICAL ACTIVATION:\n";
        explanation += "• Agents: Steam, CO2\n";
        explanation += "• Temperature: 800-1000°C\n";
        explanation += "• Longer processing time\n";
        explanation += "• No washing needed\n";
        explanation += "• Surface area: 800-1800 m²/g\n\n";
        explanation += "Selection depends on target specs and cost constraints.";
      } else {
        explanation += "ACTIVATION - PORE DEVELOPMENT\n\n";
        explanation += "Activation is a secondary treatment that develops porosity in carbonaceous materials, dramatically increasing surface area and adsorption capacity.\n\n";
        explanation += "CHEMICAL ACTIVATION MECHANISM:\n";
        explanation += "• Dehydration and charring at lower temperatures\n";
        explanation += "• Inhibition of tar formation\n";
        explanation += "• Oxidative gasification of carbon lattice\n";
        explanation += "• Creation of micropores (< 2 nm) and mesopores (2-50 nm)\n";
        explanation += "• Functionalization with oxygen groups\n\n";
        explanation += "PHYSICAL ACTIVATION MECHANISM:\n";
        explanation += "• Gasification reactions: C + H2O → CO + H2 (steam)\n";
        explanation += "• Boudouard reaction: C + CO2 → 2CO\n";
        explanation += "• Selective removal of reactive carbon atoms\n";
        explanation += "• Widening of existing pores\n";
        explanation += "• Development of microporosity\n\n";
        explanation += "Result: Surface area increases from ~300 m²/g (biochar) to 1000-3500 m²/g (activated carbon).";
      }
    }

    if (keyword === 'composite') {
      if (explanation) explanation += "\n\n";
      if (userType === 'student') {
        explanation += "WHAT ARE COMPOSITE FILTERS?\n\n";
        explanation += "A composite filter is like making a team of materials work together!\n\n";
        explanation += "Instead of using just activated carbon alone, you combine it with another material (like a polymer or metal oxide) to get the best of both worlds.\n\n";
        explanation += "Example: Imagine mixing activated carbon (great at capturing CO2) with a flexible polymer (easy to shape into filters). You get a filter that's effective AND easy to use!\n\n";
        explanation += "Benefits:\n";
        explanation += "• Improved structural strength\n";
        explanation += "• Better handling and durability\n";
        explanation += "• Can be shaped into specific forms (sheets, pellets, etc.)\n";
        explanation += "• Sometimes even better performance than pure activated carbon!";
      } else if (userType === 'industrial') {
        explanation += "COMPOSITE FILTER SYSTEMS\n\n";
        explanation += "Composites combine activated carbon with matrix materials for enhanced functionality and mechanical properties.\n\n";
        explanation += "Common matrix materials:\n";
        explanation += "• Polymers: PVA, PVDF, PAN (flexibility, moldability)\n";
        explanation += "• Ceramics: Al2O3, SiO2 (thermal stability)\n";
        explanation += "• Metal oxides: MgO, CaO (chemical functionality)\n\n";
        explanation += "Manufacturing approaches:\n";
        explanation += "• Direct mixing and molding\n";
        explanation += "• Electrospinning for nanofiber composites\n";
        explanation += "• Layer-by-layer deposition\n";
        explanation += "• 3D printing for custom geometries\n\n";
        explanation += "Advantages:\n";
        explanation += "• Improved mechanical strength\n";
        explanation += "• Reduced pressure drop in packed beds\n";
        explanation += "• Enhanced mass transfer\n";
        explanation += "• Easier handling and installation\n\n";
        explanation += "Trade-offs: Slightly reduced CO2 capacity per gram but better overall system performance.";
      } else {
        explanation += "COMPOSITE MATERIALS - ADVANCED ADSORBENTS\n\n";
        explanation += "Composite adsorbents integrate activated carbon with functional matrices to create synergistic materials with enhanced properties.\n\n";
        explanation += "Design principles:\n";
        explanation += "1. STRUCTURAL SUPPORT\n";
        explanation += "   Matrix provides mechanical integrity while maintaining porosity access\n\n";
        explanation += "2. FUNCTIONAL ENHANCEMENT\n";
        explanation += "   Addition of basic sites (e.g., amine groups) improves CO2 affinity\n";
        explanation += "   Metal oxides can provide chemical adsorption sites\n\n";
        explanation += "3. MASS TRANSFER OPTIMIZATION\n";
        explanation += "   Hierarchical pore structures: macropores (diffusion) + micropores (adsorption)\n\n";
        explanation += "Performance considerations:\n";
        explanation += "• Gravimetric capacity: May decrease due to matrix mass\n";
        explanation += "• Volumetric capacity: Often increases due to better packing\n";
        explanation += "• Selectivity: Can be enhanced through chemical functionalization\n";
        explanation += "• Regeneration: Matrix affects thermal/pressure swing efficiency\n\n";
        explanation += "Research active in MOF-carbon composites, graphene hybrids, and bio-templated materials.";
      }
    }

    if (keyword === 'biochar') {
      if (explanation) explanation += "\n\n";
      if (userType === 'student') {
        explanation += "WHAT IS BIOCHAR?\n\n";
        explanation += "Biochar is a special type of charcoal made by heating organic materials (like wood, crop waste, or nutshells) without oxygen.\n\n";
        explanation += "It's like making charcoal for a BBQ, but for science! The material turns black and becomes mostly carbon.\n\n";
        explanation += "What makes it special?\n";
        explanation += "• Full of tiny holes (porous)\n";
        explanation += "• Very stable (lasts a long time)\n";
        explanation += "• Can trap gases like CO2\n";
        explanation += "• Good for soil improvement too!\n\n";
        explanation += "Biochar vs. Activated Carbon:\n";
        explanation += "Biochar is the basic version. When you activate it (add more pores), it becomes activated carbon with super-powered CO2 capturing ability!";
      } else {
        explanation += "BIOCHAR - CARBONACEOUS MATERIAL\n\n";
        explanation += "Biochar is a carbon-rich solid material produced through pyrolysis of biomass feedstocks.\n\n";
        explanation += "Composition:\n";
        explanation += "• Fixed carbon: 50-90% (depends on temperature)\n";
        explanation += "• Volatile matter: 5-30%\n";
        explanation += "• Ash: 2-20% (mineral content)\n";
        explanation += "• Moisture: < 5%\n\n";
        explanation += "Properties:\n";
        explanation += "• Surface area: 100-500 m²/g (before activation)\n";
        explanation += "• Porosity: Primarily macropores and mesopores\n";
        explanation += "• pH: Typically alkaline (8-11)\n";
        explanation += "• Cation exchange capacity: 10-100 cmol/kg\n\n";
        explanation += "Applications:\n";
        explanation += "• Soil amendment (carbon sequestration)\n";
        explanation += "• Precursor for activated carbon\n";
        explanation += "• Water filtration\n";
        explanation += "• Catalyst support\n";
        explanation += "• Heavy metal remediation";
      }
    }

    if (keyword === 'adsorption') {
      if (explanation) explanation += "\n\n";
      if (userType === 'student') {
        explanation += "WHAT IS ADSORPTION?\n\n";
        explanation += "Adsorption is when molecules stick to a surface. It's different from absorption!\n\n";
        explanation += "Think of it like this:\n";
        explanation += "• ABSORPTION: A sponge soaking up water (goes inside)\n";
        explanation += "• ADSORPTION: Post-it notes sticking to a wall (stays on surface)\n\n";
        explanation += "For CO2 capture:\n";
        explanation += "CO2 molecules stick to the walls of tiny pores inside activated carbon. The more pores you have, the more CO2 you can catch!\n\n";
        explanation += "It's like having a parking lot: more parking spots = more cars you can hold. More pores = more CO2 molecules you can trap!";
      } else {
        explanation += "ADSORPTION - SURFACE PHENOMENON\n\n";
        explanation += "Adsorption is the adhesion of molecules (adsorbate) onto a solid surface (adsorbent).\n\n";
        explanation += "Types:\n\n";
        explanation += "1. PHYSISORPTION (Physical)\n";
        explanation += "   • Weak van der Waals forces\n";
        explanation += "   • Energy: 5-40 kJ/mol\n";
        explanation += "   • Reversible\n";
        explanation += "   • Multilayer possible\n";
        explanation += "   • Dominant for CO2 on activated carbon\n\n";
        explanation += "2. CHEMISORPTION (Chemical)\n";
        explanation += "   • Strong covalent/ionic bonds\n";
        explanation += "   • Energy: 40-800 kJ/mol\n";
        explanation += "   • Often irreversible\n";
        explanation += "   • Monolayer only\n\n";
        explanation += "For CO2 capture:\n";
        explanation += "• Optimal pore size: 0.5-0.8 nm (molecular sieving)\n";
        explanation += "• Quadrupole moment of CO2 enhances interaction\n";
        explanation += "• Basic surface sites improve affinity\n";
        explanation += "• Capacity depends on: pressure, temperature, surface area, pore volume";
      }
    }
  }

  return explanation;
}

function generateGeneralResponse(question: string, inputJson: any, resultJson: any, userType: string): string {
  const q = question.toLowerCase();

  if (q.includes('how') && (q.includes('made') || q.includes('create') || q.includes('produce'))) {
    return explainProcess(inputJson, resultJson, userType);
  }

  if (q.includes('recommend') || q.includes('suggestion') || q.includes('improve')) {
    return provideRecommendations(inputJson, resultJson, userType);
  }

  if (q.includes('compare') || q.includes('difference') || q.includes('versus') || q.includes('vs')) {
    return "To compare experiments, please use the 'Compare with Another' button in the action bar below the results. This will let you select two experiments from your history and see a detailed side-by-side comparison.";
  }

  return "I can help explain your experiment results! Try asking about:\n\n" +
         "• Why specific parameters were chosen (temperature, activation method, duration)\n" +
         "• How good your CO2 adsorption score is\n" +
         "• What risks to consider\n" +
         "• What the technical terms mean (pyrolysis, activation, etc.)\n\n" +
         "Or click one of the suggested questions above!";
}

function explainProcess(inputJson: any, resultJson: any, userType: string): string {
  const material = resultJson.material?.name || inputJson.material_name;
  const pyrolysis = resultJson.process_plan?.pyrolysis;
  const activation = resultJson.process_plan?.activation;

  let explanation = `HOW THIS MATERIAL WAS MADE\n\n`;

  explanation += `Starting material: ${material}\n\n`;

  if (pyrolysis) {
    explanation += `STEP 1: PYROLYSIS\n`;
    explanation += `• Heat the material to ${pyrolysis.temperature_celsius}°C\n`;
    explanation += `• Keep it at that temperature for ${pyrolysis.duration_hours} hour${pyrolysis.duration_hours !== 1 ? 's' : ''}\n`;
    explanation += `• This is done WITHOUT oxygen (in an inert atmosphere)\n`;
    explanation += `• Result: The material turns into biochar (carbon-rich solid)\n\n`;
  }

  if (activation) {
    explanation += `STEP 2: ACTIVATION\n`;
    if (activation.type === 'chemical') {
      explanation += `• Mix the biochar with ${activation.agent || 'a chemical agent'}\n`;
      explanation += `• Heat to ${activation.temperature || '600-800'}°C\n`;
      explanation += `• The chemical creates lots of tiny pores\n`;
      explanation += `• Wash thoroughly to remove the chemical\n`;
    } else {
      explanation += `• Expose biochar to steam or CO2 gas\n`;
      explanation += `• Heat to high temperature (800-1000°C)\n`;
      explanation += `• The gas carves out pores in the carbon\n`;
      explanation += `• No washing needed\n`;
    }
    explanation += `• Result: Activated carbon with high surface area for CO2 capture\n`;
  }

  if (userType === 'student') {
    explanation += `\nThink of it like cooking: First you roast the material (pyrolysis), then you make it extra crispy and porous (activation)!`;
  }

  return explanation;
}

function provideRecommendations(inputJson: any, resultJson: any, userType: string): string {
  const co2Score = resultJson.predicted_performance?.co2_adsorption_score;
  const confidence = resultJson.predicted_performance?.confidence;

  let recommendations = "RECOMMENDATIONS\n\n";

  if (co2Score !== undefined && co2Score !== null) {
    if (co2Score < 3.0) {
      recommendations += "Your CO2 score could be improved. Consider:\n\n";
      recommendations += "1. Increase activation intensity:\n";
      recommendations += "   • Higher temperature or longer duration\n";
      recommendations += "   • Try a stronger activation agent (e.g., KOH instead of H3PO4)\n\n";
      recommendations += "2. Optimize pyrolysis conditions:\n";
      recommendations += "   • Temperature in the 400-600°C range often gives good results\n\n";
      recommendations += "3. Ensure proper material preparation:\n";
      recommendations += "   • Uniform particle size\n";
      recommendations += "   • Complete drying before pyrolysis\n";
    } else if (co2Score >= 3.0 && co2Score < 5.0) {
      recommendations += "Your CO2 score is decent. Small improvements could help:\n\n";
      recommendations += "1. Fine-tune activation parameters\n";
      recommendations += "2. Consider composite strategies for better handling\n";
      recommendations += "3. Focus on reproducibility and scaling\n";
    } else {
      recommendations += "Excellent CO2 score! Focus on:\n\n";
      recommendations += "1. Reproducibility - can you get this result consistently?\n";
      recommendations += "2. Scale-up considerations\n";
      recommendations += "3. Cost optimization without sacrificing performance\n";
      recommendations += "4. Long-term stability testing\n";
    }
  }

  if (confidence !== undefined && confidence < 0.7) {
    recommendations += "\nNOTE: Model confidence is moderate. Consider:\n";
    recommendations += "• Running experimental validation\n";
    recommendations += "• Testing multiple batches for consistency\n";
    recommendations += "• Comparing with literature values for similar materials\n";
  }

  if (userType === 'industrial') {
    recommendations += "\n\nINDUSTRIAL NEXT STEPS:\n";
    recommendations += "• Pilot-scale testing before full production\n";
    recommendations += "• Cost analysis and market research\n";
    recommendations += "• Quality control protocol development\n";
    recommendations += "• Safety and environmental compliance review\n";
  }

  return recommendations;
}

function formatForProfile(response: string, userType: string): string {
  return response;
}

export function getGuidedQuestions(userType: string, inputJson: any, resultJson: any): { [key: string]: string[] } {
  const questions: { [key: string]: string[] } = {
    'About Process': [],
    'About Performance': [],
    'About Risk & Safety': [],
  };

  const temp = resultJson.process_plan?.pyrolysis?.temperature_celsius;
  const activation = resultJson.process_plan?.activation;
  const duration = resultJson.process_plan?.pyrolysis?.duration_hours;

  if (temp) {
    questions['About Process'].push('Why this temperature?');
  }

  if (activation) {
    questions['About Process'].push('Why this activation method?');
  }

  if (duration) {
    questions['About Process'].push('Why this duration?');
  }

  questions['About Process'].push('How is this material made?');

  const co2Score = resultJson.predicted_performance?.co2_adsorption_score;
  if (co2Score !== undefined && co2Score !== null) {
    questions['About Performance'].push('Is this CO2 score high?');
    questions['About Performance'].push('How good is this result?');
  }

  questions['About Performance'].push('Can this be improved?');

  questions['About Risk & Safety'].push('What is the most sensitive step?');
  questions['About Risk & Safety'].push('Is this safe for scaling?');

  if (activation?.type === 'chemical') {
    questions['About Risk & Safety'].push('What are the chemical hazards?');
  }

  if (userType === 'student') {
    questions['Learning Mode'] = [
      'What is pyrolysis?',
      'What is activation?',
      'What is adsorption?',
      'What is biochar?',
    ];

    if (inputJson.processing_goal === 'composite_filter') {
      questions['Learning Mode'].push('What is a composite filter?');
    }
  }

  if (userType === 'industrial') {
    questions['Cost & Scaling'] = [
      'What are the production costs?',
      'How does this scale up?',
      'What is the profit potential?',
    ];
  }

  return questions;
}
