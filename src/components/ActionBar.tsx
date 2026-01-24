import { Download, FileJson, RotateCcw } from 'lucide-react';
import { exportToJSON, exportToPDF } from '../utils/export';

interface ActionBarProps {
  resultData: any;
  isDark: boolean;
  onStartNew: () => void;
}

export default function ActionBar({ resultData, isDark, onStartNew }: ActionBarProps) {
  const handleExportJSON = () => {
    const timestamp = new Date().toISOString().slice(0, 10);
    exportToJSON(resultData, `quantum-morph-result-${timestamp}.json`);
  };

  const handleDownloadPDF = () => {
    const timestamp = new Date().toISOString().slice(0, 10);
    exportToPDF(resultData, `quantum-morph-report-${timestamp}.pdf`);
  };

  return (
    <div className={`border-t px-4 py-4 transition-colors duration-200 ${isDark ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
      <div className="max-w-4xl mx-auto flex gap-3 flex-wrap">
        <button
          onClick={onStartNew}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
            isDark
              ? 'bg-gray-800 text-gray-200 hover:bg-gray-700'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
          title="Clear and start a new experiment"
        >
          <RotateCcw size={16} />
          Start New Experiment
        </button>

        <button
          onClick={handleExportJSON}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
            isDark
              ? 'bg-gray-800 text-gray-200 hover:bg-gray-700'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
          title="Download raw result as JSON"
        >
          <FileJson size={16} />
          Export JSON
        </button>

        <button
          onClick={handleDownloadPDF}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-white bg-blue-600 hover:bg-blue-700 transition-all duration-200`}
          title="Download scientific report as PDF"
        >
          <Download size={16} />
          Download Report PDF
        </button>
      </div>
    </div>
  );
}
