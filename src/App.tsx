import { useEffect, useRef } from 'react';
import { useWizard } from './hooks/useWizard';
import ChatMessage from './components/ChatMessage';
import ChatInput from './components/ChatInput';
import { Atom } from 'lucide-react';

function App() {
  const { messages, handleUserInput, isProcessing } = useWizard();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex flex-col h-screen bg-white">
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 shadow-sm">
        <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg">
          <Atom className="text-white" size={24} />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Quantum-Morph AI Lab</h1>
          <p className="text-xs text-gray-500">Scientific Design Wizard</p>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-6">
          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message}
              onOptionClick={handleUserInput}
            />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <ChatInput
        onSend={handleUserInput}
        disabled={isProcessing}
        placeholder={isProcessing ? 'Processing...' : 'Type your answer or click an option above...'}
      />
    </div>
  );
}

export default App;
