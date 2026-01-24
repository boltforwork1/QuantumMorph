import { X, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { ExperimentRecord } from '../utils/experimentHistory';

interface ComparePanelProps {
  isOpen: boolean;
  onClose: () => void;
  experimentA: ExperimentRecord | null;
  experimentB: ExperimentRecord | null;
  isDark: boolean;
}

interface ComparisonRow {
  label: string;
  valueA: string | number;
  valueB: string | number;
  highlight?: 'a' | 'b' | 'none';
}

export default function ComparePanel({
  isOpen,
  onClose,
  experimentA,
  experimentB,
  isDark,
}: ComparePanelProps) {
  if (!isOpen || !experimentA || !experimentB) return null;

  const extractValue = (exp: ExperimentRecord, path: string): any => {
    const parts = path.split('.');
    let value: any = exp.full_result_json;
    for (const part of parts) {
      if (value && typeof value === 'object') {
        value = value[part];
      } else {
        return 'N/A';
      }
    }
    return value !== undefined && value !== null ? value : 'N/A';
  };

  const co2A = experimentA.co2_score ?? 0;
  const co2B = experimentB.co2_score ?? 0;

  const confidenceA = extractValue(experimentA, 'predicted_performance.confidence');
  const confidenceB = extractValue(experimentB, 'predicted_performance.confidence');

  const riskA = extractValue(experimentA, 'risk_assessment.overall_risk');
  const riskB = extractValue(experimentB, 'risk_assessment.overall_risk');

  const pyrolysisTempA = extractValue(experimentA, 'process_plan.pyrolysis.temperature_celsius');
  const pyrolysisTempB = extractValue(experimentB, 'process_plan.pyrolysis.temperature_celsius');

  const pyrolysisDurationA = extractValue(experimentA, 'process_plan.pyrolysis.duration_hours');
  const pyrolysisDurationB = extractValue(experimentB, 'process_plan.pyrolysis.duration_hours');

  const activationTypeA = extractValue(experimentA, 'process_plan.activation.type') || 'None';
  const activationTypeB = extractValue(experimentB, 'process_plan.activation.type') || 'None';

  const activationAgentA = extractValue(experimentA, 'process_plan.activation.agent') || '-';
  const activationAgentB = extractValue(experimentB, 'process_plan.activation.agent') || '-';

  const getRiskScore = (risk: string): number => {
    const riskStr = String(risk).toLowerCase();
    if (riskStr.includes('low')) return 1;
    if (riskStr.includes('medium') || riskStr.includes('moderate')) return 2;
    if (riskStr.includes('high')) return 3;
    return 2;
  };

  const riskScoreA = getRiskScore(riskA);
  const riskScoreB = getRiskScore(riskB);

  const scoreA = co2A + (typeof confidenceA === 'number' ? confidenceA * 10 : 0) - riskScoreA * 2;
  const scoreB = co2B + (typeof confidenceB === 'number' ? confidenceB * 10 : 0) - riskScoreB * 2;

  const recommendedExperiment = scoreA > scoreB ? 'A' : scoreB > scoreA ? 'B' : 'Equal';

  const rows: ComparisonRow[] = [
    {
      label: 'Material Name',
      valueA: experimentA.material_name,
      valueB: experimentB.material_name,
      highlight: 'none',
    },
    {
      label: 'Category',
      valueA: experimentA.category,
      valueB: experimentB.category,
      highlight: 'none',
    },
    {
      label: 'Optimization Goal',
      valueA: experimentA.optimization_goal,
      valueB: experimentB.optimization_goal,
      highlight: 'none',
    },
    {
      label: 'Pyrolysis Temperature (°C)',
      valueA: pyrolysisTempA !== 'N/A' ? pyrolysisTempA : 'N/A',
      valueB: pyrolysisTempB !== 'N/A' ? pyrolysisTempB : 'N/A',
      highlight: 'none',
    },
    {
      label: 'Pyrolysis Duration (hours)',
      valueA: pyrolysisDurationA !== 'N/A' ? pyrolysisDurationA : 'N/A',
      valueB: pyrolysisDurationB !== 'N/A' ? pyrolysisDurationB : 'N/A',
      highlight: 'none',
    },
    {
      label: 'Activation Method',
      valueA: activationTypeA,
      valueB: activationTypeB,
      highlight: 'none',
    },
    {
      label: 'Activation Agent',
      valueA: activationAgentA,
      valueB: activationAgentB,
      highlight: 'none',
    },
    {
      label: 'CO₂ Adsorption Score',
      valueA: co2A.toFixed(2),
      valueB: co2B.toFixed(2),
      highlight: co2A > co2B ? 'a' : co2B > co2A ? 'b' : 'none',
    },
    {
      label: 'Model Confidence',
      valueA: typeof confidenceA === 'number' ? `${(confidenceA * 100).toFixed(1)}%` : 'N/A',
      valueB: typeof confidenceB === 'number' ? `${(confidenceB * 100).toFixed(1)}%` : 'N/A',
      highlight:
        typeof confidenceA === 'number' && typeof confidenceB === 'number'
          ? confidenceA > confidenceB
            ? 'a'
            : confidenceB > confidenceA
            ? 'b'
            : 'none'
          : 'none',
    },
    {
      label: 'Risk Level',
      valueA: String(riskA),
      valueB: String(riskB),
      highlight: riskScoreA < riskScoreB ? 'a' : riskScoreB < riskScoreA ? 'b' : 'none',
    },
  ];

  const getHighlightClass = (highlight: 'a' | 'b' | 'none', column: 'a' | 'b'): string => {
    if (highlight === 'none' || highlight !== column) return '';
    return isDark
      ? 'bg-green-900/40 text-green-300 font-semibold'
      : 'bg-green-100 text-green-800 font-semibold';
  };

  const getIcon = (highlight: 'a' | 'b' | 'none', column: 'a' | 'b') => {
    if (highlight === 'none') return <Minus size={14} className="opacity-30" />;
    if (highlight === column) return <TrendingUp size={14} className="text-green-500" />;
    return <TrendingDown size={14} className="text-red-500" />;
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"
        onClick={onClose}
      />
      <div
        className={`fixed inset-4 sm:inset-8 md:inset-16 z-50 shadow-2xl rounded-lg overflow-hidden flex flex-col ${
          isDark ? 'bg-gray-900' : 'bg-white'
        }`}
      >
        <div
          className={`flex items-center justify-between px-6 py-4 border-b ${
            isDark ? 'border-gray-700' : 'border-gray-200'
          }`}
        >
          <h2 className={`text-xl font-semibold ${isDark ? 'text-gray-50' : 'text-gray-900'}`}>
            Experiment Comparison
          </h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ${
              isDark ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
            }`}
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-5xl mx-auto">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr
                    className={`border-b-2 ${
                      isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-300 bg-gray-50'
                    }`}
                  >
                    <th
                      className={`text-left p-4 font-semibold ${
                        isDark ? 'text-gray-300' : 'text-gray-700'
                      }`}
                    >
                      Parameter
                    </th>
                    <th
                      className={`text-left p-4 font-semibold ${
                        isDark ? 'text-blue-400' : 'text-blue-600'
                      }`}
                    >
                      Experiment A
                    </th>
                    <th
                      className={`text-left p-4 font-semibold ${
                        isDark ? 'text-purple-400' : 'text-purple-600'
                      }`}
                    >
                      Experiment B
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, index) => (
                    <tr
                      key={index}
                      className={`border-b ${
                        isDark ? 'border-gray-700' : 'border-gray-200'
                      } hover:bg-opacity-50 ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-50'}`}
                    >
                      <td
                        className={`p-4 font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
                      >
                        {row.label}
                      </td>
                      <td
                        className={`p-4 ${isDark ? 'text-gray-200' : 'text-gray-900'} ${getHighlightClass(
                          row.highlight || 'none',
                          'a'
                        )}`}
                      >
                        <div className="flex items-center gap-2">
                          {row.highlight && row.highlight !== 'none' && getIcon(row.highlight, 'a')}
                          <span>{row.valueA}</span>
                        </div>
                      </td>
                      <td
                        className={`p-4 ${isDark ? 'text-gray-200' : 'text-gray-900'} ${getHighlightClass(
                          row.highlight || 'none',
                          'b'
                        )}`}
                      >
                        <div className="flex items-center gap-2">
                          {row.highlight && row.highlight !== 'none' && getIcon(row.highlight, 'b')}
                          <span>{row.valueB}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div
              className={`mt-8 p-6 rounded-lg border-2 ${
                recommendedExperiment === 'A'
                  ? isDark
                    ? 'bg-blue-900/20 border-blue-500'
                    : 'bg-blue-50 border-blue-400'
                  : recommendedExperiment === 'B'
                  ? isDark
                    ? 'bg-purple-900/20 border-purple-500'
                    : 'bg-purple-50 border-purple-400'
                  : isDark
                  ? 'bg-gray-800 border-gray-600'
                  : 'bg-gray-100 border-gray-400'
              }`}
            >
              <h3
                className={`text-lg font-semibold mb-2 ${
                  isDark ? 'text-gray-100' : 'text-gray-900'
                }`}
              >
                Recommendation
              </h3>
              <p className={`text-base ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {recommendedExperiment === 'Equal' ? (
                  <>
                    Both experiments show comparable overall performance. Consider other factors such
                    as cost, scalability, or specific application requirements.
                  </>
                ) : (
                  <>
                    <span className="font-semibold">
                      Recommended: Experiment {recommendedExperiment}
                    </span>
                    <br />
                    Based on combined CO₂ adsorption score, model confidence, and risk assessment,
                    Experiment {recommendedExperiment} offers better overall performance for your
                    application.
                  </>
                )}
              </p>
              <div
                className={`mt-4 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} space-y-1`}
              >
                <p>
                  Score A: {scoreA.toFixed(2)} (CO₂: {co2A.toFixed(2)} + Confidence:{' '}
                  {typeof confidenceA === 'number' ? (confidenceA * 10).toFixed(2) : '0.00'} - Risk:{' '}
                  {(riskScoreA * 2).toFixed(2)})
                </p>
                <p>
                  Score B: {scoreB.toFixed(2)} (CO₂: {co2B.toFixed(2)} + Confidence:{' '}
                  {typeof confidenceB === 'number' ? (confidenceB * 10).toFixed(2) : '0.00'} - Risk:{' '}
                  {(riskScoreB * 2).toFixed(2)})
                </p>
              </div>
            </div>

            <div className={`mt-6 text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
              <p>
                Experiment A: {experimentA.material_name} (
                {new Date(experimentA.timestamp).toLocaleString()})
              </p>
              <p>
                Experiment B: {experimentB.material_name} (
                {new Date(experimentB.timestamp).toLocaleString()})
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
