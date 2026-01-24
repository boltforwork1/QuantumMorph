import { useState } from 'react';
import { Send } from 'lucide-react';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
  isDark?: boolean;
}

export default function ChatInput({ onSend, disabled, placeholder, isDark = false }: ChatInputProps) {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !disabled) {
      onSend(input.trim());
      setInput('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`border-t p-4 transition-colors duration-200 ${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`}>
      <div className="flex gap-2 max-w-4xl mx-auto">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={placeholder || 'Type your answer...'}
          disabled={disabled}
          className={`flex-1 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 disabled:cursor-not-allowed ${
            isDark
              ? 'bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-500 disabled:bg-gray-900 disabled:opacity-50'
              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 disabled:bg-gray-100'
          }`}
        />
        <button
          type="submit"
          disabled={disabled || !input.trim()}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2 font-medium"
        >
          <Send size={18} />
        </button>
      </div>
    </form>
  );
}
