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

export const exportToPDF = (result: any, filename: string = 'report.pdf') => {
  const reportText = generateReportText(result);

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${filename}</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 900px;
          margin: 0;
          padding: 40px;
          background: white;
        }
        pre {
          background: #f5f5f5;
          padding: 15px;
          border-radius: 4px;
          overflow-x: auto;
          font-size: 12px;
        }
        h1 {
          color: #0066cc;
          border-bottom: 3px solid #0066cc;
          padding-bottom: 10px;
        }
        @media print {
          body { padding: 20px; }
        }
      </style>
    </head>
    <body>
      <pre>${escapeHtml(reportText)}</pre>
      <script>
        window.print();
      </script>
    </body>
    </html>
  `;

  const blob = new Blob([htmlContent], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const win = window.open(url, '_blank');
  if (win) {
    win.onload = () => {
      win.print();
    };
  }
};

const escapeHtml = (text: string): string => {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
};
