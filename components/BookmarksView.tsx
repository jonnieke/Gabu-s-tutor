import React, { useState, useEffect } from 'react';
import { Bookmark } from '../types';
import { getBookmarks, deleteBookmark, searchBookmarks } from '../services/progressService';
import { BookmarkIcon, BookmarkFilledIcon, TrashIcon, SearchIcon, HomeIcon } from './Icons';

interface BookmarksViewProps {
  onClose: () => void;
  onHome: () => void;
  onSelectBookmark?: (bookmark: Bookmark) => void;
}

const BookmarksView: React.FC<BookmarksViewProps> = ({ onClose, onHome, onSelectBookmark }) => {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredBookmarks, setFilteredBookmarks] = useState<Bookmark[]>([]);

  useEffect(() => {
    const savedBookmarks = getBookmarks();
    setBookmarks(savedBookmarks);
    setFilteredBookmarks(savedBookmarks);
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = searchBookmarks(searchQuery);
      setFilteredBookmarks(filtered);
    } else {
      setFilteredBookmarks(bookmarks);
    }
  }, [searchQuery, bookmarks]);

  const handleDelete = (id: string) => {
    deleteBookmark(id);
    const updated = bookmarks.filter(b => b.id !== id);
    setBookmarks(updated);
    setFilteredBookmarks(updated.filter(b => 
      !searchQuery.trim() || 
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.topic.toLowerCase().includes(searchQuery.toLowerCase())
    ));
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTypeIcon = (type: Bookmark['type']) => {
    switch (type) {
      case 'explanation':
        return '📝';
      case 'quiz':
        return '❓';
      case 'illustration':
        return '🎨';
      default:
        return '📌';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <BookmarkFilledIcon className="w-6 h-6 text-purple-500" />
            <h2 className="text-2xl font-bold text-gray-800">My Bookmarks</h2>
            <span className="bg-purple-100 text-purple-600 px-2 py-1 rounded-full text-sm font-medium">
              {bookmarks.length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onHome}
              className="p-2 rounded-full hover:bg-purple-100 transition-colors"
              aria-label="Go Home"
            >
              <HomeIcon className="w-5 h-5 text-purple-600" />
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="p-6 border-b">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search bookmarks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Bookmarks List */}
        <div className="flex-1 overflow-y-auto p-6">
          {filteredBookmarks.length === 0 ? (
            <div className="text-center py-12">
              <BookmarkIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-500 mb-2">
                {searchQuery ? 'No bookmarks found' : 'No bookmarks yet'}
              </h3>
              <p className="text-gray-400">
                {searchQuery 
                  ? 'Try a different search term' 
                  : 'Save explanations, quizzes, and illustrations to access them later'
                }
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredBookmarks.map((bookmark) => (
                <div
                  key={bookmark.id}
                  className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors cursor-pointer group"
                  onClick={() => onSelectBookmark?.(bookmark)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">{getTypeIcon(bookmark.type)}</span>
                        <h3 className="font-semibold text-gray-800 truncate">
                          {bookmark.title}
                        </h3>
                        <span className="bg-purple-100 text-purple-600 px-2 py-1 rounded-full text-xs font-medium">
                          {bookmark.type}
                        </span>
                      </div>
                      
                      <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                        {bookmark.content}
                      </p>
                      
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>📚 {bookmark.topic}</span>
                        <span>🕒 {formatDate(bookmark.timestamp)}</span>
                        {bookmark.tags.length > 0 && (
                          <span>🏷️ {bookmark.tags.join(', ')}</span>
                        )}
                      </div>
                    </div>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(bookmark.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-all"
                      aria-label="Delete bookmark"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50 rounded-b-2xl">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              {filteredBookmarks.length} of {bookmarks.length} bookmarks
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-purple-600 text-white font-medium rounded-full hover:bg-purple-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookmarksView;
