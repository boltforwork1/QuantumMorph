import { useEffect, useRef, useState } from 'react';
import { useWizard } from './hooks/useWizard';
import ChatMessage from './components/ChatMessage';
import ChatInput from './components/ChatInput';
import ActionBar from './components/ActionBar';
import ProgressIndicator from './components/ProgressIndicator';
import { Atom, Moon, Sun } from 'lucide-react';

function App() {
  const { messages, handleUserInput, isProcessing, resetWizard, currentStepNumber, totalSteps, resultData } = useWizard();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme_preference');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

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

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  return (
    <div className={`flex flex-col h-screen transition-colors duration-200 ${isDark ? 'dark bg-gray-950' : 'bg-white'}`}>
      <header className={`border-b px-4 py-3 flex items-center justify-between shadow-sm transition-colors duration-200 ${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg">
            <Atom className="text-white" size={24} />
          </div>
          <div>
            <h1 className={`text-xl font-semibold transition-colors duration-200 ${isDark ? 'text-gray-50' : 'text-gray-900'}`}>Quantum-Morph AI Lab</h1>
            <p className={`text-xs transition-colors duration-200 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Scientific Design Wizard</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
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

      {resultData && <ActionBar resultData={resultData} isDark={isDark} onStartNew={resetWizard} />}

      <ChatInput
        onSend={handleUserInput}
        disabled={isProcessing}
        placeholder={isProcessing ? 'Processing...' : 'Type your answer or click an option above...'}
        isDark={isDark}
      />
    </div>
  );
}

export default App;
