import { useEffect, useRef, useState } from 'react';
import { useWizard } from './hooks/useWizard';
import { useAuth } from './contexts/AuthContext';
import ChatMessage from './components/ChatMessage';
import ChatInput from './components/ChatInput';
import ActionBar from './components/ActionBar';
import ProgressIndicator from './components/ProgressIndicator';
import HistoryPanel from './components/HistoryPanel';
import ComparePanel from './components/ComparePanel';
import AuthModal from './components/AuthModal';
import { ExperimentRecord } from './utils/experimentHistory';
import { Atom, Moon, Sun, Clock, ChevronLeft, RotateCcw, LogIn, LogOut } from 'lucide-react';

function App() {
  const { user, signOut } = useAuth();
  const { messages, handleUserInput, isProcessing, resetWizard, loadExperiment, currentStepNumber, totalSteps, resultData, goBack, canGoBack } = useWizard();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const prevUserRef = useRef(user);
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme_preference');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [compareExperimentA, setCompareExperimentA] = useState<ExperimentRecord | null>(null);
  const [compareExperimentB, setCompareExperimentB] = useState<ExperimentRecord | null>(null);
  const [compareFromResult, setCompareFromResult] = useState(false);

  useEffect(() => {
    localStorage.setItem('theme_preference', isDark ? 'dark' : 'light');
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const prevUser = prevUserRef.current;
    const currentUserId = user?.id;
    const prevUserId = prevUser?.id;

    if (prevUserId !== currentUserId) {
      resetWizard();
    }

    prevUserRef.current = user;
  }, [user, resetWizard]);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  const handleCompare = (experimentA: ExperimentRecord, experimentB: ExperimentRecord) => {
    setCompareExperimentA(experimentA);
    setCompareExperimentB(experimentB);
    setIsHistoryOpen(false);
    setIsCompareOpen(true);
  };

  const handleOpenCompareFromResult = () => {
    setIsHistoryOpen(true);
  };

  return (
    <div className={`flex flex-col h-screen transition-colors duration-200 ${isDark ? 'dark bg-gray-950' : 'bg-white'}`}>
      <header className={`border-b px-4 py-3 flex items-center justify-between shadow-sm transition-colors duration-200 ${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="flex items-center gap-3">
          {canGoBack && (
            <button
              onClick={goBack}
              className={`p-2 rounded-lg transition-colors duration-200 ${isDark ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
              title="Go back to previous step"
            >
              <ChevronLeft size={20} />
            </button>
          )}
          <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg">
            <Atom className="text-white" size={24} />
          </div>
          <div>
            <h1 className={`text-xl font-semibold transition-colors duration-200 ${isDark ? 'text-gray-50' : 'text-gray-900'}`}>Quantum-Morph AI Lab</h1>
            <p className={`text-xs transition-colors duration-200 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Scientific Design Wizard</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <div className={`hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
                <span className="font-medium">{user.email}</span>
              </div>
              <button
                onClick={signOut}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors duration-200 font-medium text-sm ${isDark ? 'bg-gray-800 hover:bg-gray-700 text-gray-200' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
                title="Logout"
              >
                <LogOut size={18} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors duration-200 font-medium text-sm bg-blue-600 hover:bg-blue-700 text-white`}
              title="Login or Sign Up"
            >
              <LogIn size={18} />
              <span className="hidden sm:inline">Login</span>
            </button>
          )}
          <button
            onClick={() => setIsHistoryOpen(true)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors duration-200 font-medium text-sm ${isDark ? 'bg-gray-800 hover:bg-gray-700 text-gray-200' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
            title="View previous experiments"
          >
            <Clock size={18} />
            <span className="hidden sm:inline">Previous Experiments</span>
          </button>
          <button
            onClick={resetWizard}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors duration-200 font-medium text-sm ${isDark ? 'bg-gray-800 hover:bg-gray-700 text-gray-200' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
            title="Clear and start a new experiment"
          >
            <RotateCcw size={18} />
            <span className="hidden sm:inline">Start New Experiment</span>
          </button>
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-lg transition-colors duration-200 ${isDark ? 'bg-gray-800 hover:bg-gray-700 text-yellow-400' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
            title="Toggle dark mode"
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </header>

      <ProgressIndicator currentStep={currentStepNumber} totalSteps={totalSteps} isDark={isDark} />

      <div className={`flex-1 overflow-y-auto transition-colors duration-200 ${isDark ? 'bg-gray-950' : 'bg-gray-50'}`}>
        <div className="max-w-4xl mx-auto px-4 py-6">
          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message}
              onOptionClick={handleUserInput}
              isDark={isDark}
            />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <ActionBar resultData={resultData} isDark={isDark} onOpenCompare={handleOpenCompareFromResult} />

      <ChatInput
        onSend={handleUserInput}
        disabled={isProcessing}
        placeholder={isProcessing ? 'Processing...' : 'Type your answer or click an option above...'}
        isDark={isDark}
      />

      <HistoryPanel
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        onLoadExperiment={(experiment) => {
          loadExperiment(experiment);
          setIsHistoryOpen(false);
        }}
        onCompare={handleCompare}
        isDark={isDark}
      />

      <ComparePanel
        isOpen={isCompareOpen}
        onClose={() => setIsCompareOpen(false)}
        experimentA={compareExperimentA}
        experimentB={compareExperimentB}
        isDark={isDark}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        isDark={isDark}
      />
    </div>
  );
}

export default App;
