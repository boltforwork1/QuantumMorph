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
  lines.push(`Input Mass: ${result.material?.input_mass_g !== undefined && result.material?.input_mass_g !== null ? result.material.input_mass_g + ' g' : 'N/A'}`);
  lines.push(`Moisture Content: ${result.material?.moisture !== undefined && result.material?.moisture !== null ? (result.material.moisture * 100).toFixed(1) + '%' : 'N/A'}`);
  lines.push('');

  lines.push('PROCESS DESIGN');
  lines.push('─'.repeat(50));

  if (result.process_plan?.pyrolysis) {
    lines.push('Pyrolysis Conditions:');
    const pyro = result.process_plan.pyrolysis;

    if (pyro.temperature_celsius !== undefined && pyro.temperature_celsius !== null) {
      lines.push(`  • Temperature: ${pyro.temperature_celsius}°C`);
    }
    if (pyro.duration_hours !== undefined && pyro.duration_hours !== null) {
      lines.push(`  • Duration: ${pyro.duration_hours} hours`);
    }
    if (pyro.heating_rate !== undefined && pyro.heating_rate !== null) {
      lines.push(`  • Heating Rate: ${pyro.heating_rate}°C/min`);
    }
    if (pyro.atmosphere) {
      lines.push(`  • Atmosphere: ${pyro.atmosphere}`);
    }
    lines.push('');
  }

  if (result.process_plan?.activation) {
    const act = result.process_plan.activation;
    lines.push('Activation Process:');
    lines.push(`  • Status: Enabled`);

    if (act.type) {
      lines.push(`  • Method: ${act.type}`);
    }
    if (act.agent) {
      lines.push(`  • Agent: ${act.agent}`);
    }
    if (act.concentration !== undefined && act.concentration !== null) {
      lines.push(`  • Concentration: ${act.concentration}${typeof act.concentration === 'number' ? ' % w/v' : ''}`);
    }
    if (act.solution_volume_ml !== undefined && act.solution_volume_ml !== null) {
      lines.push(`  • Solution Volume: ${act.solution_volume_ml} mL`);
    }
    if (act.chemical_mass_g !== undefined && act.chemical_mass_g !== null) {
      lines.push(`  • Chemical Mass: ${act.chemical_mass_g} g`);
    }
    if (act.soaking_time_hours !== undefined && act.soaking_time_hours !== null) {
      lines.push(`  • Soaking Time: ${act.soaking_time_hours} hours`);
    }
    if (act.temperature !== undefined && act.temperature !== null) {
      lines.push(`  • Activation Temperature: ${act.temperature}°C`);
    }
    if (act.duration !== undefined && act.duration !== null) {
      lines.push(`  • Activation Duration: ${act.duration} minutes`);
    }
    if (act.acid_mass_g !== undefined && act.acid_mass_g !== null) {
      lines.push(`  • Acid Mass: ${act.acid_mass_g} g`);
    }
    lines.push('');
  } else if (result.process_plan) {
    lines.push('Activation Process:');
    lines.push(`  • Status: Disabled`);
    lines.push('');
  }

  if (result.process_plan?.washing) {
    lines.push('Washing Step:');
    if (result.process_plan.washing.enabled !== undefined) {
      lines.push(`  • Status: ${result.process_plan.washing.enabled ? 'Enabled' : 'Disabled'}`);
    }
    if (result.process_plan.washing.method) {
      lines.push(`  • Method: ${result.process_plan.washing.method}`);
    }
    lines.push('');
  }

  if (result.process_plan?.drying) {
    lines.push('Drying Conditions:');
    const dry = result.process_plan.drying;

    if (dry.temperature_celsius !== undefined && dry.temperature_celsius !== null) {
      lines.push(`  • Temperature: ${dry.temperature_celsius}°C`);
    }
    if (dry.duration_hours !== undefined && dry.duration_hours !== null) {
      lines.push(`  • Duration: ${dry.duration_hours} hours`);
    }
    lines.push('');
  }

  if (result.process_plan?.composite_formation?.enabled === true) {
    lines.push('COMPOSITE FORMATION');
    lines.push('─'.repeat(50));

    const fractions = result.process_plan.composite_formation.fractions;
    const masses = result.process_plan.composite_formation.masses_g;

    if (fractions) {
      lines.push('Composite Composition:');
      if (fractions.biochar !== undefined && fractions.biochar !== null) {
        lines.push(`  • Biochar Fraction: ${(fractions.biochar * 100).toFixed(1)}%`);
      }
      if (fractions.binder !== undefined && fractions.binder !== null) {
        lines.push(`  • Binder Fraction: ${(fractions.binder * 100).toFixed(1)}%`);
      }
      if (fractions.plasticizer !== undefined && fractions.plasticizer !== null) {
        lines.push(`  • Plasticizer Fraction: ${(fractions.plasticizer * 100).toFixed(1)}%`);
      }
      lines.push('');
    }

    if (masses) {
      lines.push('Component Mass Distribution:');
      if (masses.biochar !== undefined && masses.biochar !== null) {
        lines.push(`  • Biochar: ${masses.biochar.toFixed(2)} g`);
      }
      if (masses.binder !== undefined && masses.binder !== null) {
        lines.push(`  • Binder: ${masses.binder.toFixed(2)} g`);
      }
      if (masses.plasticizer !== undefined && masses.plasticizer !== null) {
        lines.push(`  • Plasticizer: ${masses.plasticizer.toFixed(2)} g`);
      }
      lines.push('');
    }
  }

  lines.push('PREDICTED PERFORMANCE');
  lines.push('─'.repeat(50));
  if (result.predicted_performance) {
    const perf = result.predicted_performance;

    if (perf.co2_adsorption_score !== undefined && perf.co2_adsorption_score !== null) {
      lines.push(`CO₂ Adsorption Score: ${perf.co2_adsorption_score.toFixed(2)}`);
    }
    if (perf.stability_score !== undefined && perf.stability_score !== null) {
      lines.push(`Structural Stability Score: ${perf.stability_score.toFixed(2)}`);
    }
    if (perf.structural_regime) {
      lines.push(`Structural Regime: ${perf.structural_regime}`);
    }
    if (perf.confidence !== undefined && perf.confidence !== null) {
      lines.push(`Model Confidence: ${(perf.confidence * 100).toFixed(1)}%`);
    }
    lines.push('');
  }

  lines.push('RISK ASSESSMENT');
  lines.push('─'.repeat(50));
  if (result.risk_assessment) {
    const risk = result.risk_assessment;

    if (risk.overall_risk) {
      lines.push(`Overall Risk Level: ${risk.overall_risk}`);
    }
    if (risk.most_sensitive_step) {
      lines.push(`Most Sensitive Process Step: ${risk.most_sensitive_step}`);
    }
    if (risk.recommendation) {
      lines.push('');
      lines.push('Recommendation:');
      lines.push(risk.recommendation);
    }
    lines.push('');
  }

  if (result.scientific_explanation) {
    lines.push('SCIENTIFIC RATIONALE');
    lines.push('─'.repeat(50));
    lines.push(result.scientific_explanation);

    if (result.predicted_performance?.co2_adsorption_score !== undefined &&
        result.predicted_performance?.stability_score !== undefined) {
      lines.push('');
      lines.push('The optimization algorithm balances the trade-off between CO₂ adsorption capacity and structural stability to achieve the specified objective while maintaining material integrity.');
    }
    lines.push('');
  }

  lines.push('═'.repeat(50));
  lines.push('FINAL NOTE');
  lines.push('─'.repeat(50));
  lines.push('These results represent model-based predictions generated using quantum-inspired');
  lines.push('optimization techniques. The process parameters have been optimized based on');
  lines.push('computational models and should be validated through experimental trials before');
  lines.push('implementation at scale.');

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

    const checkPageBreak = () => {
      if (y > 260) {
        doc.addPage();
        y = 20;
      }
    };

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
    const inputMass = result.material?.input_mass_g !== undefined && result.material?.input_mass_g !== null ? result.material.input_mass_g + ' g' : 'N/A';
    doc.text(`Input Mass: ${inputMass}`, margin, y);
    y += lineHeight;
    const moisture = result.material?.moisture !== undefined && result.material?.moisture !== null ? (result.material.moisture * 100).toFixed(1) + '%' : 'N/A';
    doc.text(`Moisture Content: ${moisture}`, margin, y);
    y += sectionSpacing;

    checkPageBreak();
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
      const pyro = result.process_plan.pyrolysis;

      if (pyro.temperature_celsius !== undefined && pyro.temperature_celsius !== null) {
        doc.text(`  • Temperature: ${pyro.temperature_celsius}°C`, margin + 5, y);
        y += lineHeight;
      }
      if (pyro.duration_hours !== undefined && pyro.duration_hours !== null) {
        doc.text(`  • Duration: ${pyro.duration_hours} hours`, margin + 5, y);
        y += lineHeight;
      }
      if (pyro.heating_rate !== undefined && pyro.heating_rate !== null) {
        doc.text(`  • Heating Rate: ${pyro.heating_rate}°C/min`, margin + 5, y);
        y += lineHeight;
      }
      if (pyro.atmosphere) {
        doc.text(`  • Atmosphere: ${pyro.atmosphere}`, margin + 5, y);
        y += lineHeight;
      }
    }

    if (result.process_plan?.activation) {
      checkPageBreak();
      y += 3;
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('Activation Process:', margin, y);
      y += lineHeight;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const act = result.process_plan.activation;

      doc.text(`  • Status: Enabled`, margin + 5, y);
      y += lineHeight;

      if (act.type) {
        doc.text(`  • Method: ${act.type}`, margin + 5, y);
        y += lineHeight;
      }
      if (act.agent) {
        doc.text(`  • Agent: ${act.agent}`, margin + 5, y);
        y += lineHeight;
      }
      if (act.concentration !== undefined && act.concentration !== null) {
        const concText = typeof act.concentration === 'number' ? `${act.concentration} % w/v` : act.concentration;
        doc.text(`  • Concentration: ${concText}`, margin + 5, y);
        y += lineHeight;
      }
      if (act.solution_volume_ml !== undefined && act.solution_volume_ml !== null) {
        doc.text(`  • Solution Volume: ${act.solution_volume_ml} mL`, margin + 5, y);
        y += lineHeight;
      }
      if (act.chemical_mass_g !== undefined && act.chemical_mass_g !== null) {
        doc.text(`  • Chemical Mass: ${act.chemical_mass_g} g`, margin + 5, y);
        y += lineHeight;
      }
      if (act.soaking_time_hours !== undefined && act.soaking_time_hours !== null) {
        doc.text(`  • Soaking Time: ${act.soaking_time_hours} hours`, margin + 5, y);
        y += lineHeight;
      }
      if (act.temperature !== undefined && act.temperature !== null) {
        doc.text(`  • Activation Temperature: ${act.temperature}°C`, margin + 5, y);
        y += lineHeight;
      }
      if (act.duration !== undefined && act.duration !== null) {
        doc.text(`  • Activation Duration: ${act.duration} minutes`, margin + 5, y);
        y += lineHeight;
      }
      if (act.acid_mass_g !== undefined && act.acid_mass_g !== null) {
        doc.text(`  • Acid Mass: ${act.acid_mass_g} g`, margin + 5, y);
        y += lineHeight;
      }
    } else if (result.process_plan) {
      y += 3;
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('Activation Process:', margin, y);
      y += lineHeight;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`  • Status: Disabled`, margin + 5, y);
      y += lineHeight;
    }

    if (result.process_plan?.washing) {
      checkPageBreak();
      y += 3;
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('Washing Step:', margin, y);
      y += lineHeight;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      if (result.process_plan.washing.enabled !== undefined) {
        doc.text(`  • Status: ${result.process_plan.washing.enabled ? 'Enabled' : 'Disabled'}`, margin + 5, y);
        y += lineHeight;
      }
      if (result.process_plan.washing.method) {
        const methodLines = doc.splitTextToSize(`  • Method: ${result.process_plan.washing.method}`, maxWidth - 10);
        doc.text(methodLines, margin + 5, y);
        y += lineHeight * methodLines.length;
      }
    }

    if (result.process_plan?.drying) {
      checkPageBreak();
      y += 3;
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('Drying Conditions:', margin, y);
      y += lineHeight;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const dry = result.process_plan.drying;

      if (dry.temperature_celsius !== undefined && dry.temperature_celsius !== null) {
        doc.text(`  • Temperature: ${dry.temperature_celsius}°C`, margin + 5, y);
        y += lineHeight;
      }
      if (dry.duration_hours !== undefined && dry.duration_hours !== null) {
        doc.text(`  • Duration: ${dry.duration_hours} hours`, margin + 5, y);
        y += lineHeight;
      }
    }

    if (result.process_plan?.composite_formation?.enabled === true) {
      checkPageBreak();
      y += sectionSpacing;

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('COMPOSITE FORMATION', margin, y);
      y += lineHeight;

      doc.setLineWidth(0.3);
      doc.line(margin, y, pageWidth - margin, y);
      y += lineHeight;

      const fractions = result.process_plan.composite_formation.fractions;
      const masses = result.process_plan.composite_formation.masses_g;

      if (fractions) {
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text('Composite Composition:', margin, y);
        y += lineHeight;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        if (fractions.biochar !== undefined && fractions.biochar !== null) {
          doc.text(`  • Biochar Fraction: ${(fractions.biochar * 100).toFixed(1)}%`, margin + 5, y);
          y += lineHeight;
        }
        if (fractions.binder !== undefined && fractions.binder !== null) {
          doc.text(`  • Binder Fraction: ${(fractions.binder * 100).toFixed(1)}%`, margin + 5, y);
          y += lineHeight;
        }
        if (fractions.plasticizer !== undefined && fractions.plasticizer !== null) {
          doc.text(`  • Plasticizer Fraction: ${(fractions.plasticizer * 100).toFixed(1)}%`, margin + 5, y);
          y += lineHeight;
        }
        y += 3;
      }

      if (masses) {
        checkPageBreak();
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text('Component Mass Distribution:', margin, y);
        y += lineHeight;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        if (masses.biochar !== undefined && masses.biochar !== null) {
          doc.text(`  • Biochar: ${masses.biochar.toFixed(2)} g`, margin + 5, y);
          y += lineHeight;
        }
        if (masses.binder !== undefined && masses.binder !== null) {
          doc.text(`  • Binder: ${masses.binder.toFixed(2)} g`, margin + 5, y);
          y += lineHeight;
        }
        if (masses.plasticizer !== undefined && masses.plasticizer !== null) {
          doc.text(`  • Plasticizer: ${masses.plasticizer.toFixed(2)} g`, margin + 5, y);
          y += lineHeight;
        }
      }
    }

    y += sectionSpacing;
    checkPageBreak();

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('PREDICTED PERFORMANCE', margin, y);
    y += lineHeight;

    if (result.predicted_performance) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const perf = result.predicted_performance;

      if (perf.co2_adsorption_score !== undefined && perf.co2_adsorption_score !== null) {
        doc.text(`CO2 Adsorption Score: ${perf.co2_adsorption_score.toFixed(2)}`, margin, y);
        y += lineHeight;
      }
      if (perf.stability_score !== undefined && perf.stability_score !== null) {
        doc.text(`Structural Stability Score: ${perf.stability_score.toFixed(2)}`, margin, y);
        y += lineHeight;
      }
      if (perf.structural_regime) {
        doc.text(`Structural Regime: ${perf.structural_regime}`, margin, y);
        y += lineHeight;
      }
      if (perf.confidence !== undefined && perf.confidence !== null) {
        doc.text(`Model Confidence: ${(perf.confidence * 100).toFixed(1)}%`, margin, y);
        y += lineHeight;
      }
    }

    y += sectionSpacing;
    checkPageBreak();

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('RISK ASSESSMENT', margin, y);
    y += lineHeight;

    if (result.risk_assessment) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const risk = result.risk_assessment;

      if (risk.overall_risk) {
        doc.text(`Overall Risk Level: ${risk.overall_risk}`, margin, y);
        y += lineHeight;
      }
      if (risk.most_sensitive_step) {
        doc.text(`Most Sensitive Process Step: ${risk.most_sensitive_step}`, margin, y);
        y += lineHeight + 3;
      }
      if (risk.recommendation) {
        doc.setFont('helvetica', 'bold');
        doc.text('Recommendation:', margin, y);
        y += lineHeight;
        doc.setFont('helvetica', 'normal');
        const splitRec = doc.splitTextToSize(risk.recommendation, maxWidth - 5);
        doc.text(splitRec, margin, y);
        y += lineHeight * splitRec.length;
      }
    }

    y += sectionSpacing;
    checkPageBreak();

    if (result.scientific_explanation) {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('SCIENTIFIC RATIONALE', margin, y);
      y += lineHeight;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const splitExp = doc.splitTextToSize(result.scientific_explanation, maxWidth - 5);
      doc.text(splitExp, margin, y);
      y += lineHeight * splitExp.length;

      if (result.predicted_performance?.co2_adsorption_score !== undefined &&
          result.predicted_performance?.stability_score !== undefined) {
        y += 3;
        const tradeoffText = 'The optimization algorithm balances the trade-off between CO2 adsorption capacity and structural stability to achieve the specified objective while maintaining material integrity.';
        const splitTradeoff = doc.splitTextToSize(tradeoffText, maxWidth - 5);
        doc.text(splitTradeoff, margin, y);
        y += lineHeight * splitTradeoff.length;
      }

      y += sectionSpacing;
    }

    checkPageBreak();

    doc.setLineWidth(0.5);
    doc.line(margin, y, pageWidth - margin, y);
    y += 5;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('FINAL NOTE', margin, y);
    y += lineHeight + 2;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    const finalNote1 = 'These results represent model-based predictions generated using quantum-inspired';
    const finalNote2 = 'optimization techniques. The process parameters have been optimized based on';
    const finalNote3 = 'computational models and should be validated through experimental trials before';
    const finalNote4 = 'implementation at scale.';
    doc.text(finalNote1, margin, y);
    y += lineHeight;
    doc.text(finalNote2, margin, y);
    y += lineHeight;
    doc.text(finalNote3, margin, y);
    y += lineHeight;
    doc.text(finalNote4, margin, y);

    doc.save(filename);
  });
};
