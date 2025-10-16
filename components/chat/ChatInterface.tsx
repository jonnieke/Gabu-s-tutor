import React, { useState, useRef, useEffect } from 'react';
import ChatBubble from './ChatBubble';
import GabuAvatar from './GabuAvatar';
import { ChatMessage, FileAttachment, UserSettings } from '../../types';

interface ChatInterfaceProps {
  chatHistory: ChatMessage[];
  onSendMessage: (message: string, attachment?: FileAttachment) => void;
  onHome: () => void;
  onOpenSettings: () => void;
  isReplying: boolean;
  userSettings: UserSettings;
  attachment?: FileAttachment | null;
  onAttachmentChange?: (attachment: FileAttachment | null) => void;
  isRecording?: boolean;
  onMicClick?: () => void;
  onFileSelect?: (file: File) => void;
  highlightRange?: { start: number; end: number };
  onCopy?: (text: string) => void;
  onBookmark?: (message: ChatMessage) => void;
  bookmarkedMessages?: Set<number>;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  chatHistory,
  onSendMessage,
  onHome,
  onOpenSettings,
  isReplying,
  userSettings,
  attachment,
  onAttachmentChange,
  isRecording = false,
  onMicClick,
  onFileSelect,
  highlightRange,
  onCopy,
  onBookmark,
  bookmarkedMessages = new Set()
}) => {
  const [userInput, setUserInput] = useState('');
  const [isTtsPlaying, setIsTtsPlaying] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sample prompts
  const samplePrompts = [
    "Explain photosynthesis simply",
    "How do I solve this math problem?",
    "What's the capital of Kenya?",
    "Help me understand fractions"
  ];

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory, isReplying]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userInput.trim() || attachment) {
      onSendMessage(userInput, attachment);
      setUserInput('');
      onAttachmentChange?.(null);
    }
  };

  const handleSamplePrompt = (prompt: string) => {
    setUserInput(prompt);
  };

  const handleFileSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && onFileSelect) {
      onFileSelect(file);
    }
    event.target.value = '';
  };

  const handleTtsToggle = () => {
    setIsTtsPlaying(!isTtsPlaying);
  };

  const clearAttachment = () => {
    onAttachmentChange?.(null);
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="flex items-center gap-3">
          <GabuAvatar size="sm" />
          <div>
            <h1 className="text-lg font-bold text-gray-800">Gabu</h1>
            <p className="text-sm text-gray-500">
              {isReplying ? 'Thinking...' : 'Ready to help!'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={handleTtsToggle}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            title={isTtsPlaying ? "Stop TTS" : "Play TTS"}
          >
            {isTtsPlaying ? '🔇' : '🔊'}
          </button>
          
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            title="Settings"
          >
            ⚙️
          </button>
          
          <button
            onClick={onHome}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            title="Home"
          >
            🏠
          </button>
        </div>
      </div>

      {/* Chat Messages */}
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {chatHistory.map((message, index) => (
          <ChatBubble
            key={index}
            message={message}
            isLastMessage={index === chatHistory.length - 1}
            onCopy={onCopy}
            onBookmark={onBookmark}
            isBookmarked={bookmarkedMessages.has(index)}
            showHighlight={index === chatHistory.length - 1}
            highlightRange={highlightRange}
          />
        ))}

        {/* Typing indicator */}
        {isReplying && (
          <div className="flex items-end gap-3">
            <GabuAvatar isTyping={true} size="sm" />
            <div className="bg-white px-4 py-3 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-1">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                </div>
                <span className="text-sm text-gray-500 ml-2">Gabu is thinking...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sample Prompts */}
      {chatHistory.length === 0 && (
        <div className="px-4 pb-4">
          <p className="text-sm text-gray-500 mb-3">Try asking:</p>
          <div className="flex flex-wrap gap-2">
            {samplePrompts.map((prompt, index) => (
              <button
                key={index}
                onClick={() => handleSamplePrompt(prompt)}
                className="px-3 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-600 hover:border-purple-300 hover:text-purple-600 transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Attachment Preview */}
      {attachment && (
        <div className="mx-4 mb-4 p-3 bg-white rounded-lg border border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>📎</span>
            <span className="text-sm text-gray-700">
              {attachment.type === 'image' ? 'Image' : 'Audio'} attached
            </span>
          </div>
          <button
            onClick={clearAttachment}
            className="text-red-500 hover:text-red-700 text-sm font-medium"
          >
            Remove
          </button>
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-gray-200">
        <form onSubmit={handleSubmit} className="flex items-end gap-3">
          <input
            type="file"
            accept="image/*,audio/*"
            ref={fileInputRef}
            onChange={handleFileSelected}
            className="hidden"
          />
          
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-3 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
            title="Attach file"
          >
            📎
          </button>
          
          <div className="flex-1 relative">
            <textarea
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Ask Gabu anything..."
              disabled={isReplying}
              className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent resize-none max-h-32"
              rows={1}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
          </div>
          
          <button
            type="button"
            onClick={onMicClick}
            disabled={isReplying}
            className={`p-3 rounded-full transition-colors ${
              isRecording
                ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
                : 'bg-indigo-500 hover:bg-indigo-600 text-white'
            }`}
            title={isRecording ? "Stop recording" : "Start recording"}
          >
            {isRecording ? '🎤' : '🎙️'}
          </button>
          
          <button
            type="submit"
            disabled={isReplying || (!userInput.trim() && !attachment)}
            className="p-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 rounded-full transition-colors"
            title="Send message"
          >
            ➤
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;