'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '../../lib/AuthContext';
import { useRouter } from 'next/navigation';
import { useTranslation } from '../../lib/hooks/useTranslation';
import { motion } from 'framer-motion';


interface Message {
  id: string;
  subject: string;
  sender: string;
  content: string;
  read: boolean;
  createdAt: string;
}


export default function InboxPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const { t, locale, isRTL } = useTranslation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [deleteConfirmation, setDeleteConfirmation] = useState<string | null>(null);
  const messageListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }

    if (user) {
      fetchMessages();
    }
  }, [user, isLoading, router]);

  // Scroll selected message into view
  useEffect(() => {
    if (selectedMessage && messageListRef.current) {
      const messageElement = document.getElementById(`message-${selectedMessage.id}`);
      if (messageElement) {
        messageElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [selectedMessage]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/user/messages');
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setMessages(data.messages || []);
      
      // Calculate unread count
      const unread = (data.messages || []).filter((msg: Message) => !msg.read).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error('Error fetching messages:', error);
      setError(t('inbox.error_loading') || 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (messageId: string) => {
    try {
      const response = await fetch('/api/user/messages', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messageId }),
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      // Update local state
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg.id === messageId ? { ...msg, read: true } : msg
        )
      );
      
      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      return true;
    } catch (error) {
      console.error('Error marking message as read:', error);
      return false;
    }
  };

  const handleMessageClick = async (message: Message) => {
    setSelectedMessage(message);
    
    // If message is unread, mark as read
    if (!message.read) {
      const success = await markAsRead(message.id);
      if (success) {
        console.log(`Message ${message.id} marked as read`);
      }
    }
  };

  const markAllAsRead = async () => {
    try {
      setLoading(true);
      
      // Get all unread message IDs
      const unreadMessages = messages.filter(msg => !msg.read);
      
      // Mark each message as read
      const promises = unreadMessages.map(msg => markAsRead(msg.id));
      await Promise.all(promises);
      
      // Refresh messages to update UI
      await fetchMessages();
      
    } catch (error) {
      console.error('Error marking all messages as read:', error);
      setError(t('inbox.error_mark_all') || 'Failed to mark all messages as read');
    } finally {
      setLoading(false);
    }
  };

  const deleteMessage = async (messageId: string) => {
    try {
      setDeleteConfirmation(null);
      setLoading(true);
      
      const response = await fetch(`/api/user/messages?id=${messageId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      // Remove from local state
      setMessages(prevMessages => prevMessages.filter(msg => msg.id !== messageId));
      
      // If deleted message was selected, clear selection
      if (selectedMessage?.id === messageId) {
        setSelectedMessage(null);
      }
      
      // Update unread count if needed
      const deletedMessage = messages.find(msg => msg.id === messageId);
      if (deletedMessage && !deletedMessage.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting message:', error);
      setError(t('inbox.error_delete') || 'Failed to delete message');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = (messageId: string) => {
    setDeleteConfirmation(messageId);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(locale) + ' ' + date.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-center items-center h-64">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 relative">
      {/* Background elements */}
      <div className="absolute inset-0 z-0">
        <div className="animated-bg opacity-20">
          <div className="line"></div>
          <div className="line"></div>
          <div className="line"></div>
          <div className="line"></div>
          <div className="line"></div>
        </div>
        
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary/30 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse-slow animation-delay-2000"></div>
        
        <div className="particles-container absolute inset-0">
          {Array.from({ length: 15 }).map((_, i) => (
            <div 
              key={i}
              className="particle absolute w-1 h-1 rounded-full bg-primary/50"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${3 + Math.random() * 7}s`
              }}
            ></div>
          ))}
        </div>
      </div>
      
      <div className="max-w-6xl mx-auto px-4 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold text-white cyberpunk-border inline-block">
              {t('inbox.title') || 'Inbox'}
            </h1>
            <p className="text-gray-400 mt-2">
              {unreadCount > 0 
                ? t('inbox.unread_count') || `You have ${unreadCount} unread message(s)`
                : t('inbox.no_unread') || 'No unread messages'}
            </p>
          </div>
          <div className={`flex gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
            {unreadCount > 0 && (
              <motion.button 
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={markAllAsRead}
                className="btn-primary flex items-center gap-2"
                disabled={loading}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {t('inbox.mark_all_read') || 'Mark All Read'}
              </motion.button>
            )}
            <motion.button 
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={fetchMessages}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md transition-colors flex items-center gap-2"
              disabled={loading}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {t('inbox.refresh') || 'Refresh'}
            </motion.button>
            <Link href="/profile">
              <motion.button 
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="px-4 py-2 bg-secondary hover:bg-secondary/80 text-white rounded-md transition-colors"
              >
                {t('inbox.back_to_profile') || 'Back to Profile'}
              </motion.button>
            </Link>
          </div>
        </motion.div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6"
          >
            <p className="text-red-400">{error}</p>
            <button 
              onClick={fetchMessages} 
              className="mt-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-md transition-colors"
            >
              {t('common.try_again') || 'Try Again'}
            </button>
          </motion.div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div 
            initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="game-card md:col-span-1 overflow-hidden flex flex-col"
          >
            <div className="p-4 bg-gray-800/70 border-b border-gray-700 flex justify-between items-center">
              <h2 className="text-lg font-medium text-white">{t('inbox.messages') || 'Messages'}</h2>
              <span className="bg-primary/20 text-primary px-2 py-0.5 rounded-full text-xs">
                {messages.length}
              </span>
            </div>
            <div 
              ref={messageListRef}
              className="divide-y divide-gray-800 max-h-[600px] overflow-y-auto flex-grow"
              dir={isRTL ? 'rtl' : 'ltr'}
            >
              {messages.length > 0 ? (
                messages.map((message, index) => (
                  <motion.div 
                    id={`message-${message.id}`}
                    key={message.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className={`p-4 cursor-pointer ${
                      selectedMessage?.id === message.id 
                        ? 'bg-primary/10 border-l-2 border-r-2 border-primary' 
                        : 'hover:bg-gray-800/30 border-l-2 border-r-2 border-transparent'
                    } transition-all duration-200`}
                    onClick={() => handleMessageClick(message)}
                  >
                    <div className={`flex items-start ${isRTL ? 'flex-row-reverse' : ''} justify-between`}>
                      <div className={`flex-1 ${isRTL ? 'text-right' : 'text-left'}`}>
                        <div className={`flex items-center ${isRTL ? 'flex-row-reverse justify-start' : 'justify-start'} gap-2`}>
                          <span className={`font-medium ${message.read ? 'text-gray-300' : 'text-white'}`}>
                            {message.subject}
                          </span>
                          {!message.read && (
                            <span className="w-2 h-2 bg-primary rounded-full"></span>
                          )}
                        </div>
                        <p className={`text-sm text-gray-400 truncate mt-1 ${isRTL ? 'text-right' : 'text-left'}`}>
                          {t('inbox.from') || 'From'}: {message.sender}
                        </p>
                        <p className={`text-xs text-gray-500 mt-1 ${isRTL ? 'text-right' : 'text-left'}`}>
                          {formatDate(message.createdAt)}
                        </p>
                      </div>
                      <div className={isRTL ? 'mr-2' : 'ml-2'}>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!message.read) markAsRead(message.id);
                          }}
                          className={`p-1 rounded-full ${!message.read ? 'text-blue-400 hover:bg-blue-500/20' : 'text-gray-600'}`}
                          disabled={message.read}
                          title={message.read ? t('inbox.already_read') || 'Already read' : t('inbox.mark_read') || 'Mark as read'}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="p-8 text-center text-gray-400 flex flex-col items-center justify-center h-64">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {t('inbox.no_messages') || 'No messages found'}
                </div>
              )}
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: isRTL ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="game-card md:col-span-2 overflow-hidden flex flex-col"
            dir={isRTL ? 'rtl' : 'ltr'}
          >
            {selectedMessage ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col h-full"
              >
                <div className="p-4 bg-gray-800/70 border-b border-gray-700 flex justify-between items-center">
                  <div className={`flex-1 ${isRTL ? 'text-right' : 'text-left'}`}>
                    <h2 className="text-lg font-medium text-white">{selectedMessage.subject}</h2>
                    <div className={`flex justify-between mt-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <p className="text-sm text-gray-400">
                        {t('inbox.from') || 'From'}: {selectedMessage.sender}
                      </p>
                      <p className="text-sm text-gray-400">{formatDate(selectedMessage.createdAt)}</p>
                    </div>
                  </div>
                  {deleteConfirmation === selectedMessage.id ? (
                    <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <button
                        onClick={() => deleteMessage(selectedMessage.id)}
                        className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-md transition-colors"
                      >
                        {t('inbox.confirm') || 'Confirm'}
                      </button>
                      <button
                        onClick={() => setDeleteConfirmation(null)}
                        className="p-2 bg-gray-700/50 hover:bg-gray-700/70 text-gray-300 rounded-md transition-colors"
                      >
                        {t('inbox.cancel') || 'Cancel'}
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => confirmDelete(selectedMessage.id)}
                      className="p-2 text-red-400 hover:bg-red-500/20 rounded-full transition-colors"
                      title={t('inbox.delete_message') || 'Delete message'}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
                <div className="p-6 flex-grow overflow-y-auto">
                  <div className={`text-gray-300 whitespace-pre-wrap ${isRTL ? 'text-right' : 'text-left'}`}>
                    {selectedMessage.content}
                  </div>
                </div>
                <div className="p-4 pt-0 border-t border-gray-800 mt-auto">
                  <motion.button 
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    className="btn-primary"
                  >
                    {t('inbox.reply') || 'Reply'}
                  </motion.button>
                </div>
              </motion.div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ 
                    duration: 0.5,
                    repeat: Infinity,
                    repeatType: "reverse",
                    repeatDelay: 2
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </motion.div>
                <p>{t('inbox.select_message') || 'Select a message to view'}</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
} 