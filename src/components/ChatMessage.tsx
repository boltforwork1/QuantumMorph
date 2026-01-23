import { Message } from '../types';

interface ChatMessageProps {
  message: Message;
  onOptionClick?: (option: string) => void;
}

export default function ChatMessage({ message, onOptionClick }: ChatMessageProps) {
  return (
    <div
      className={`flex ${
        message.role === 'user' ? 'justify-end' : 'justify-start'
      } mb-4`}
    >
      <div
        className={`max-w-[80%] rounded-lg px-4 py-3 ${
          message.role === 'user'
            ? 'bg-blue-600 text-white'
            : message.isResult
            ? 'bg-white border border-gray-200'
            : 'bg-gray-100 text-gray-900'
        }`}
      >
        <div className="whitespace-pre-wrap break-words">{message.content}</div>
        {message.options && message.options.length > 0 && onOptionClick && (
          <div className="mt-3 flex flex-wrap gap-2">
            {message.options.map((option) => (
              <button
                key={option}
                onClick={() => onOptionClick(option)}
                className="px-3 py-1.5 bg-white border border-gray-300 rounded text-sm text-gray-700 hover:bg-blue-50 hover:border-blue-400 transition-colors cursor-pointer"
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
