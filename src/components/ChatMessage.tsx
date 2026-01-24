import { Message } from '../types';

interface ChatMessageProps {
  message: Message;
  onOptionClick?: (option: string) => void;
  isDark?: boolean;
}

export default function ChatMessage({ message, onOptionClick, isDark = false }: ChatMessageProps) {
  const hasCodeBlock = message.content.includes('```');
  const isCodeBlock = hasCodeBlock && message.content.startsWith('```');

  const renderContent = () => {
    if (!hasCodeBlock) {
      return <div className="whitespace-pre-wrap break-words font-mono text-sm leading-relaxed">{message.content}</div>;
    }

    const parts = message.content.split(/(```[\s\S]*?```)/g);

    return (
      <div className="space-y-2">
        {parts.map((part, index) => {
          if (part.startsWith('```')) {
            const code = part.replace(/^```\w*\n?/, '').replace(/\n?```$/, '');
            return (
              <pre
                key={index}
                className={`rounded-lg p-4 overflow-x-auto font-mono text-xs leading-relaxed ${
                  isDark
                    ? 'bg-slate-900 text-gray-200 border border-gray-700'
                    : 'bg-gray-50 text-gray-800 border border-gray-300'
                }`}
                style={{
                  lineHeight: '1.7',
                  tabSize: 2,
                }}
              >
                <code className={isDark ? 'text-gray-200' : 'text-gray-800'}>{code}</code>
              </pre>
            );
          } else if (part.trim()) {
            return (
              <div key={index} className="whitespace-pre-wrap break-words font-mono text-sm leading-relaxed">
                {part}
              </div>
            );
          }
          return null;
        })}
      </div>
    );
  };

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
              ? 'bg-gray-900 border border-gray-700 text-gray-100'
              : 'bg-white border border-gray-200 text-gray-900'
            : isDark
            ? 'bg-gray-800 text-gray-100'
            : 'bg-gray-100 text-gray-900'
        }`}
      >
        {renderContent()}
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
