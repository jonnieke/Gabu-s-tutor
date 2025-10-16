import React from 'react';
import GabuAvatar from './GabuAvatar';
import { ChatMessage } from '../../types';

interface ChatBubbleProps {
  message: ChatMessage;
  isLastMessage?: boolean;
  onCopy?: (text: string) => void;
  onBookmark?: (message: ChatMessage) => void;
  isBookmarked?: boolean;
  showHighlight?: boolean;
  highlightRange?: { start: number; end: number };
}

const ChatBubble: React.FC<ChatBubbleProps> = ({
  message,
  isLastMessage = false,
  onCopy,
  onBookmark,
  isBookmarked = false,
  showHighlight = false,
  highlightRange
}) => {
  const isUser = message.role === 'user';
  const isModel = message.role === 'model';

  const renderTextWithHighlight = (text: string) => {
    if (!showHighlight || !highlightRange) {
      return text;
    }
    
    return (
      <>
        {text.substring(0, highlightRange.start)}
        <span className="bg-yellow-300/70 rounded-md px-1">
          {text.substring(highlightRange.start, highlightRange.end)}
        </span>
        {text.substring(highlightRange.end)}
      </>
    );
  };

  const formatTime = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (!dateObj || isNaN(dateObj.getTime())) return '';
    return dateObj.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  return (
    <div className={`flex items-end gap-3 w-full ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <GabuAvatar 
          size="sm" 
          isTyping={isLastMessage && isModel}
          className="flex-shrink-0"
        />
      )}
      
      <div className={`flex flex-col max-w-xs lg:max-w-md ${isUser ? 'items-end' : 'items-start'}`}>
        <div className={`relative group px-4 py-3 rounded-2xl shadow-sm ${
          isUser 
            ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white' 
            : 'bg-white text-gray-800 border border-gray-100'
        }`}>
          {/* Attachment preview */}
          {message.attachment?.type === 'image' && (
            <img 
              src={`data:${message.attachment.mimeType};base64,${message.attachment.data}`} 
              alt="User upload" 
              className="rounded-lg mb-3 max-h-32 object-contain w-full"
            />
          )}
          
          {message.attachment?.type === 'audio' && (
            <div className={`flex items-center gap-2 p-2 rounded-lg mb-3 ${
              isUser ? 'bg-orange-400' : 'bg-gray-100'
            }`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                isUser ? 'bg-white text-orange-500' : 'bg-gray-300 text-gray-600'
              }`}>
                🎵
              </div>
              <span className="text-sm font-medium">Audio attached</span>
            </div>
          )}
          
          {/* Message content */}
          {message.content && (
            <p className="text-sm leading-relaxed break-words">
              {renderTextWithHighlight(message.content)}
            </p>
          )}
          
          {/* Action buttons for model messages */}
          {isModel && message.content && (
            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              {onBookmark && (
                <button
                  onClick={() => onBookmark(message)}
                  className="p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                  title={isBookmarked ? "Bookmarked" : "Bookmark"}
                >
                  {isBookmarked ? '📌' : '🔖'}
                </button>
              )}
              
              {onCopy && (
                <button
                  onClick={() => onCopy(message.content)}
                  className="p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                  title="Copy message"
                >
                  📋
                </button>
              )}
            </div>
          )}
        </div>
        
        {/* Timestamp */}
        <p className={`text-xs text-gray-400 mt-1 px-2 ${isUser ? 'mr-0' : 'ml-10'}`}>
          {formatTime(message.timestamp)}
        </p>
      </div>
      
      {isUser && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center flex-shrink-0">
          <span className="text-white text-sm font-medium">U</span>
        </div>
      )}
    </div>
  );
};

export default ChatBubble;