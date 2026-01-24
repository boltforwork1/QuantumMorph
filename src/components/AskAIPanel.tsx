import { useState, useRef, useEffect } from 'react';
import { X, Send, MessageCircle, Loader2 } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface AskAIPanelProps {
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
  userType: string;
  inputJson: any;
  resultJson: any;
}

export default function AskAIPanel({
  isOpen,
  onClose,
  isDark,
  userType,
  inputJson,
  resultJson,
}: AskAIPanelProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m here to help you understand your experiment results. Ask me anything about the data, the process, or the predictions.',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ask-ai`;
      const headers = {
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      };

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          question: userMessage.content,
          user_type: userType,
          input_json: inputJson,
          result_json: resultJson,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.answer,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error asking AI:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error processing your question. Please try again.',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"
        onClick={onClose}
      />
      <div
        className={`fixed right-0 top-0 h-full w-full sm:w-[480px] z-50 shadow-2xl transform transition-transform duration-300 overflow-hidden flex flex-col ${
          isDark ? 'bg-gray-900' : 'bg-white'
        }`}
      >
        <div
          className={`flex items-center justify-between px-6 py-4 border-b ${
            isDark ? 'border-gray-700' : 'border-gray-200'
          }`}
        >
          <div className="flex items-center gap-3">
            <MessageCircle size={24} className={isDark ? 'text-blue-400' : 'text-blue-600'} />
            <h2 className={`text-xl font-semibold ${isDark ? 'text-gray-50' : 'text-gray-900'}`}>
              Ask the AI
            </h2>
          </div>
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
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                } animate-fade-in`}
              >
                <div
                  className={`max-w-[85%] rounded-lg px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : isDark
                      ? 'bg-gray-800 text-gray-100'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <div className="whitespace-pre-wrap break-words text-sm leading-relaxed">
                    {message.content}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start animate-fade-in">
                <div
                  className={`max-w-[85%] rounded-lg px-4 py-3 ${
                    isDark ? 'bg-gray-800 text-gray-100' : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Loader2 size={16} className="animate-spin" />
                    <span className="text-sm">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className={`border-t p-4 ${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`}
        >
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question about your experiment..."
              disabled={isLoading}
              className={`flex-1 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors disabled:cursor-not-allowed ${
                isDark
                  ? 'bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-500 disabled:bg-gray-900 disabled:opacity-50'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 disabled:bg-gray-100'
              }`}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2 font-medium"
            >
              <Send size={18} />
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
