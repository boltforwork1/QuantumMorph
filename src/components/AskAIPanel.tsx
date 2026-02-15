import { useState, useRef, useEffect } from 'react';
import { X, Send, MessageCircle, Loader2, Sparkles } from 'lucide-react';
import { generateResponse, getGuidedQuestions } from '../utils/offlineAI';

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
      content: 'Hello! I\'m here to help you understand your experiment results. Ask me anything about the data, the process, or the predictions.\n\nClick a suggested question below or type your own!',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [askedQuestions, setAskedQuestions] = useState<Set<string>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent, questionText?: string) => {
    e.preventDefault();
    const questionToAsk = questionText || input.trim();
    if (!questionToAsk || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: questionToAsk,
    };

    setMessages((prev) => [...prev, userMessage]);
    setAskedQuestions((prev) => new Set([...prev, questionToAsk]));
    setInput('');
    setIsLoading(true);

    setTimeout(() => {
      try {
        const response = generateResponse(
          questionToAsk,
          userType,
          inputJson,
          resultJson
        );

        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: response.answer,
        };

        setMessages((prev) => [...prev, assistantMessage]);
      } catch (error) {
        console.error('Error generating response:', error);
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'Sorry, I encountered an error processing your question. Please try again.',
        };
        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    }, 500);
  };

  const handleQuestionClick = (question: string) => {
    const syntheticEvent = { preventDefault: () => {} } as React.FormEvent;
    handleSubmit(syntheticEvent, question);
  };

  const guidedQuestions = getGuidedQuestions(userType, inputJson, resultJson);

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"
        onClick={onClose}
      />
      <div
        className={`fixed right-0 top-0 h-full w-full sm:w-[540px] z-50 shadow-2xl transform transition-transform duration-300 overflow-hidden flex flex-col ${
          isDark ? 'bg-gray-900' : 'bg-white'
        }`}
      >
        <div
          className={`flex items-center justify-between px-6 py-4 border-b ${
            isDark ? 'border-gray-700' : 'border-gray-200'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isDark ? 'bg-blue-900/30' : 'bg-blue-100'}`}>
              <Sparkles size={20} className={isDark ? 'text-blue-400' : 'text-blue-600'} />
            </div>
            <div>
              <h2 className={`text-xl font-semibold ${isDark ? 'text-gray-50' : 'text-gray-900'}`}>
                Ask the AI
              </h2>
              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                Offline Scientific Assistant
              </p>
            </div>
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
            {showSuggestions && (
              <div className="space-y-4 mb-6">
                <div className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} flex items-center gap-2`}>
                  <Sparkles size={16} className={isDark ? 'text-blue-400' : 'text-blue-600'} />
                  Suggested Questions
                </div>

                {Object.entries(guidedQuestions).map(([category, questions]) => (
                  <div key={category} className="space-y-2">
                    <div className={`text-xs font-semibold uppercase tracking-wide ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                      {category}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {questions.map((question) => (
                        <button
                          key={question}
                          onClick={() => handleQuestionClick(question)}
                          disabled={isLoading}
                          className={`px-3 py-2 rounded-lg text-sm transition-all duration-200 border ${
                            askedQuestions.has(question)
                              ? isDark
                                ? 'bg-gray-700 border-gray-600 text-gray-400'
                                : 'bg-gray-200 border-gray-400 text-gray-500'
                              : isDark
                              ? 'bg-gray-800 border-gray-700 text-gray-200 hover:bg-blue-900/30 hover:border-blue-500 disabled:opacity-50'
                              : 'bg-white border-gray-300 text-gray-700 hover:bg-blue-50 hover:border-blue-400 disabled:opacity-50'
                          }`}
                        >
                          {question}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

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
                    <span className="text-sm">Analyzing your experiment...</span>
                  </div>
                </div>
              </div>
            )}
            {!isLoading && messages.length > 1 && (
              <div className={`mt-6 pt-4 border-t text-xs ${isDark ? 'border-gray-700 text-gray-400' : 'border-gray-200 text-gray-500'}`}>
                <p>You can ask another question from the list above or type a new question below.</p>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <form
          onSubmit={(e) => handleSubmit(e)}
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
