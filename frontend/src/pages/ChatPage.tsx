import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Send, MessageSquare, ShieldCheck, User as UserIcon, Image as ImageIcon } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ConversationItem, MessageItem } from '../types';

export const ChatPage: React.FC = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const recipientParam = searchParams.get('recipient');
  const listingParam = searchParams.get('listing');

  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [activeConv, setActiveConv] = useState<ConversationItem | null>(null);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [newMessage, setNewMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    setIsLoading(true);
    api.getConversations()
      .then((data) => {
        setConversations(data);
        if (data.length > 0) {
          setActiveConv(data[0]);
          loadMessages(data[0].id);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  }, []);

  const loadMessages = async (convId: string) => {
    try {
      const msgs = await api.getMessages(convId);
      setMessages(msgs);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConv) return;

    const receiverId = activeConv.participant1_id === user?.id
      ? activeConv.participant2_id
      : activeConv.participant1_id;

    try {
      const sent = await api.sendMessage(receiverId, newMessage, activeConv.listing_id || undefined);
      setMessages((prev) => [...prev, sent]);
      setNewMessage('');
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-[calc(100vh-140px)] min-h-[600px]">
      <div className="h-full glass-panel rounded-3xl border border-slate-200 dark:border-slate-800 shadow-elevated overflow-hidden grid grid-cols-1 md:grid-cols-12">
        
        {/* Left Col: Conversation Threads (4 Cols) */}
        <div className="md:col-span-4 border-r border-slate-200 dark:border-slate-800 flex flex-col h-full bg-slate-50/50 dark:bg-slate-900/50">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <h2 className="font-display font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-emerald-600" />
              <span>Messages</span>
            </h2>
            <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-2 py-0.5 rounded-full">
              Escrow Chat
            </span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
            {conversations.length === 0 ? (
              <div className="text-center py-12 p-4 text-xs text-slate-400">
                No active conversations yet. Start a chat from any listing page!
              </div>
            ) : (
              conversations.map((c) => {
                const otherUser = c.participant1_id === user?.id ? c.participant2 : c.participant1;
                const isSelected = activeConv?.id === c.id;

                return (
                  <div
                    key={c.id}
                    onClick={() => {
                      setActiveConv(c);
                      loadMessages(c.id);
                    }}
                    className={`p-4 flex items-center gap-3 cursor-pointer transition ${
                      isSelected
                        ? 'bg-white dark:bg-slate-800 border-l-4 border-emerald-500 shadow-sm'
                        : 'hover:bg-slate-100/60 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <img
                      src={otherUser?.profile_image || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200"}
                      alt={otherUser?.name || "User"}
                      className="w-11 h-11 rounded-full object-cover ring-2 ring-emerald-500/20 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-xs text-slate-900 dark:text-white truncate">
                          {otherUser?.name || "Member"}
                        </p>
                        <span className="text-[10px] text-slate-400">Active</span>
                      </div>
                      <p className="text-xs text-slate-500 truncate mt-0.5">
                        {c.latest_message?.content || "Tap to chat"}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Col: Active Conversation Thread (8 Cols) */}
        <div className="md:col-span-8 flex flex-col h-full bg-white dark:bg-slate-900">
          {activeConv ? (
            <>
              {/* Header */}
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/40 dark:bg-slate-900/60">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                      {activeConv.participant1_id === user?.id
                        ? activeConv.participant2?.name
                        : activeConv.participant1?.name}
                    </h3>
                    <p className="text-[10px] text-slate-400">
                      End-to-end verified communication • Admin audited for dispute resolution
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950 px-2.5 py-1 rounded-lg">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Verified Host</span>
                </div>
              </div>

              {/* Message List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 ? (
                  <div className="text-center py-16 text-xs text-slate-400">
                    Send a message to discuss delivery time, item inspection, or rental questions.
                  </div>
                ) : (
                  messages.map((m) => {
                    const isMe = m.sender_id === user?.id;
                    return (
                      <div
                        key={m.id}
                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`max-w-md px-4 py-2.5 rounded-2xl text-xs font-medium ${
                            isMe
                              ? 'bg-emerald-600 text-white rounded-br-xs shadow-sm'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-xs'
                          }`}
                        >
                          {m.content}
                        </div>
                        <span className="text-[10px] text-slate-400 mt-1 px-1">
                          {new Date(m.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Input Bar */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-100 dark:border-slate-800 flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition disabled:opacity-50 flex items-center gap-1.5"
                >
                  <span>Send</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400 text-xs">
              <MessageSquare className="w-12 h-12 text-slate-300 mb-2" />
              <p>Select a conversation to start chatting</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
