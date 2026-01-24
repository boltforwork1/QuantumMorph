import { Download, FileJson, GitCompare, MessageCircle } from 'lucide-react';
import { exportToJSON, exportToPDF } from '../utils/export';

interface ActionBarProps {
  resultData: any;
  isDark: boolean;
  onOpenCompare?: () => void;
  onOpenAskAI?: () => void;
}

export default function ActionBar({ resultData, isDark, onOpenCompare, onOpenAskAI }: ActionBarProps) {
  const handleExportJSON = () => {
    const timestamp = new Date().toISOString().slice(0, 10);
    exportToJSON(resultData, `quantum-morph-result-${timestamp}.json`);
  };

  const handleDownloadPDF = () => {
    const timestamp = new Date().toISOString().slice(0, 10);
    exportToPDF(resultData, `quantum-morph-report-${timestamp}.pdf`);
  };

  if (!resultData) {
    return null;
  }

  return (
    <div className={`border-t px-4 py-4 transition-colors duration-200 ${isDark ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
      <div className="max-w-4xl mx-auto flex gap-3 flex-wrap">
        {onOpenAskAI && (
          <button
            onClick={onOpenAskAI}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              isDark
                ? 'bg-green-700 text-white hover:bg-green-600'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
            title="Ask AI about your experiment"
          >
            <MessageCircle size={16} />
            Ask the AI
          </button>
        )}

        {onOpenCompare && (
          <button
            onClick={onOpenCompare}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              isDark
                ? 'bg-teal-700 text-white hover:bg-teal-600'
                : 'bg-teal-600 text-white hover:bg-teal-700'
            }`}
            title="Compare this experiment with another"
          >
            <GitCompare size={16} />
            Compare with Another
          </button>
        )}

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
