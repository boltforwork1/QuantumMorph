export const exportToJSON = (data: any, filename: string = 'result.json') => {
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const generateReportText = (result: any): string => {
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
    const stabilityScore = result.predicted_performance.stability_score;
    const confidence = result.predicted_performance.confidence;

    if (co2Score !== undefined && co2Score !== null) {
      lines.push(`CO₂ Adsorption Score: ${co2Score.toFixed(2)}`);
      lines.push(`  This represents the predicted CO₂ adsorption capacity of the optimized material.`);
      lines.push('');
    }
    if (stabilityScore !== undefined && stabilityScore !== null) {
      lines.push(`Structural Stability Score: ${stabilityScore.toFixed(2)}`);
      lines.push(`  This represents the predicted mechanical stability of the optimized material.`);
      lines.push('');
    } else {
      lines.push('Structural Stability Score: Not available');
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

export const exportToPDF = (result: any, filename: string = 'report.pdf') => {
  import('jspdf').then(({ jsPDF }) => {
    const doc = new jsPDF();

    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;
    const maxWidth = pageWidth - 2 * margin;
    let y = 20;
    const lineHeight = 7;
    const sectionSpacing = 10;

    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('SCIENTIFIC ANALYSIS REPORT', margin, y);
    y += lineHeight + 5;

    doc.setLineWidth(0.5);
    doc.line(margin, y, pageWidth - margin, y);
    y += sectionSpacing;

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('MATERIAL SPECIFICATION', margin, y);
    y += lineHeight;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Material: ${result.material?.name || 'N/A'}`, margin, y);
    y += lineHeight;
    doc.text(`Category: ${result.material?.category || 'N/A'}`, margin, y);
    y += lineHeight;
    doc.text(`Mass: ${result.material?.input_mass_g || 'N/A'} g`, margin, y);
    y += lineHeight;
    doc.text(`Moisture Content: ${((result.material?.moisture || 0) * 100).toFixed(1)}%`, margin, y);
    y += sectionSpacing;

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('PROCESS DESIGN', margin, y);
    y += lineHeight;

    if (result.process_plan?.pyrolysis) {
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('Pyrolysis Conditions:', margin, y);
      y += lineHeight;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const temp = result.process_plan.pyrolysis.temperature_celsius;
      const duration = result.process_plan.pyrolysis.duration_hours;
      const heatingRate = result.process_plan.pyrolysis.heating_rate;

      if (temp !== undefined && temp !== null) {
        doc.text(`  • Temperature: ${temp}°C`, margin + 5, y);
        y += lineHeight;
      }
      if (duration !== undefined && duration !== null) {
        doc.text(`  • Duration: ${duration} hours`, margin + 5, y);
        y += lineHeight;
      }
      if (heatingRate !== undefined && heatingRate !== null) {
        doc.text(`  • Heating Rate: ${heatingRate}°C/min`, margin + 5, y);
        y += lineHeight;
      }
    }

    if (result.process_plan?.activation) {
      y += 3;
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('Activation Process:', margin, y);
      y += lineHeight;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const method = result.process_plan.activation.type;
      const agent = result.process_plan.activation.agent;
      const concentration = result.process_plan.activation.concentration;
      const temperature = result.process_plan.activation.temperature;
      const duration = result.process_plan.activation.duration;

      if (method) {
        doc.text(`  • Method: ${method}`, margin + 5, y);
        y += lineHeight;
      }
      if (agent) {
        doc.text(`  • Agent: ${agent}`, margin + 5, y);
        y += lineHeight;
      }
      if (concentration !== undefined && concentration !== null) {
        doc.text(`  • Concentration: ${concentration}`, margin + 5, y);
        y += lineHeight;
      }
      if (temperature !== undefined && temperature !== null) {
        doc.text(`  • Temperature: ${temperature}°C`, margin + 5, y);
        y += lineHeight;
      }
      if (duration !== undefined && duration !== null) {
        doc.text(`  • Duration: ${duration} minutes`, margin + 5, y);
        y += lineHeight;
      }
    }

    if (result.process_plan?.composite) {
      y += 3;
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('Composite Configuration:', margin, y);
      y += lineHeight;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`  • Strategy: ${result.process_plan.composite.strategy}`, margin + 5, y);
      y += lineHeight;
      if (result.process_plan.composite.matrix) {
        doc.text(`  • Matrix: ${result.process_plan.composite.matrix}`, margin + 5, y);
        y += lineHeight;
      }
      if (result.process_plan.composite.ratio) {
        doc.text(`  • Ratio: ${result.process_plan.composite.ratio}`, margin + 5, y);
        y += lineHeight;
      }
    }

    y += sectionSpacing;
    if (y > 250) {
      doc.addPage();
      y = 20;
    }

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('PREDICTED PERFORMANCE', margin, y);
    y += lineHeight;

    if (result.predicted_performance) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const co2Score = result.predicted_performance.co2_adsorption_score;
      const stabilityScore = result.predicted_performance.stability_score;
      const confidence = result.predicted_performance.confidence;

      if (co2Score !== undefined && co2Score !== null) {
        doc.text(`CO2 Adsorption Score: ${co2Score.toFixed(2)}`, margin, y);
        y += lineHeight;
        const descText = 'This represents the predicted CO2 adsorption capacity of the optimized material.';
        const splitDesc = doc.splitTextToSize(descText, maxWidth - 10);
        doc.text(splitDesc, margin + 5, y);
        y += lineHeight * splitDesc.length + 3;
      }
      if (stabilityScore !== undefined && stabilityScore !== null) {
        doc.text(`Structural Stability Score: ${stabilityScore.toFixed(2)}`, margin, y);
        y += lineHeight;
        const stabilityText = 'This represents the predicted mechanical stability of the optimized material.';
        const splitStability = doc.splitTextToSize(stabilityText, maxWidth - 10);
        doc.text(splitStability, margin + 5, y);
        y += lineHeight * splitStability.length + 3;
      } else {
        doc.text('Structural Stability Score: Not available', margin, y);
        y += lineHeight + 3;
      }
      if (confidence !== undefined && confidence !== null) {
        doc.text(`Model Confidence: ${(confidence * 100).toFixed(1)}%`, margin, y);
        y += lineHeight;
        const confText = 'This reflects the statistical reliability of the predictions based on training data.';
        const splitConf = doc.splitTextToSize(confText, maxWidth - 10);
        doc.text(splitConf, margin + 5, y);
        y += lineHeight * splitConf.length;
      }
    }

    y += sectionSpacing;
    if (y > 250) {
      doc.addPage();
      y = 20;
    }

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('RISK ASSESSMENT', margin, y);
    y += lineHeight;

    if (result.risk_assessment) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const overallRisk = result.risk_assessment.overall_risk;
      if (overallRisk) {
        doc.text(`Overall Risk Level: ${overallRisk}`, margin, y);
        y += lineHeight + 3;
      }
      if (result.risk_assessment.recommendation) {
        doc.setFont('helvetica', 'bold');
        doc.text('Recommendation:', margin, y);
        y += lineHeight;
        doc.setFont('helvetica', 'normal');
        const splitRec = doc.splitTextToSize(result.risk_assessment.recommendation, maxWidth - 5);
        doc.text(splitRec, margin, y);
        y += lineHeight * splitRec.length;
      }
    }

    y += sectionSpacing;
    if (y > 240) {
      doc.addPage();
      y = 20;
    }

    if (result.scientific_explanation) {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('SCIENTIFIC RATIONALE', margin, y);
      y += lineHeight;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const splitExp = doc.splitTextToSize(result.scientific_explanation, maxWidth - 5);
      doc.text(splitExp, margin, y);
      y += lineHeight * splitExp.length + sectionSpacing;
    }

    if (y > 260) {
      doc.addPage();
      y = 20;
    }

    doc.setLineWidth(0.5);
    doc.line(margin, y, pageWidth - margin, y);
    y += 5;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    const footer1 = 'This recipe has been optimized using quantum-inspired algorithms';
    const footer2 = 'and validated against experimental databases.';
    doc.text(footer1, margin, y);
    y += lineHeight;
    doc.text(footer2, margin, y);

    doc.save(filename);
  });
};
