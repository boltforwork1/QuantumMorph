import { Message } from '../types';

interface ChatMessageProps {
  message: Message;
  onOptionClick?: (option: string) => void;
  isDark?: boolean;
}

export default function ChatMessage({ message, onOptionClick, isDark = false }: ChatMessageProps) {
  return (
    <div
      className={`flex ${
        message.role === 'user' ? 'justify-end' : 'justify-start'
      } mb-4 animate-fade-in`}
    >
      <div
        className={`max-w-[80%] rounded-lg px-4 py-3 transition-colors duration-200 ${
          message.role === 'user'
            ? 'bg-blue-600 text-white'
            : message.isResult
            ? isDark
              ? 'bg-gray-900 border border-gray-700'
              : 'bg-white border border-gray-200'
            : isDark
            ? 'bg-gray-800 text-gray-100'
            : 'bg-gray-100 text-gray-900'
        }`}
      >
        <div className="whitespace-pre-wrap break-words font-mono text-sm">{message.content}</div>
        {message.options && message.options.length > 0 && onOptionClick && (
          <div className="mt-3 flex flex-wrap gap-2">
            {message.options.map((option) => (
              <button
                key={option}
                onClick={() => onOptionClick(option)}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-colors cursor-pointer ${
                  isDark
                    ? 'bg-gray-700 border border-gray-600 text-gray-100 hover:bg-gray-600 hover:border-blue-500'
                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-blue-50 hover:border-blue-400'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
