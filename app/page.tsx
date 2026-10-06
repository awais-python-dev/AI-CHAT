'use client';

import { useState, useRef, useEffect } from 'react';

// =========================================================
// TYPESCRIPT REQUIREMENTS
// =========================================================
type MessageRole = "user" | "assistant";

interface Message {
  id: string;
  role: MessageRole;
  content: string;
  createdAt: Date;
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
}

export default function ChatApp() {
  // State 1: Multiple Chat Sessions
  const [chats, setChats] = useState<ChatSession[]>([
    {
      id: 'session-1',
      title: 'New Conversation',
      messages: [
        {
          id: 'msg-1',
          role: 'assistant',
          content: "hy!",
          createdAt: new Date(),
        },
      ],
    },
  ]);

  // State 2: Active Chat Focus
  const [activeChatId, setActiveChatId] = useState<string>('session-1');

  // State 3: Input Field & Typing Indicator
  const [input, setInput] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);

  // State 4: Mobile Sidebar Overlay Toggle
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  // Ref for Auto-scroll
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Derive current active chat
  const currentChat = chats.find((c) => c.id === activeChatId) || chats[0];

  // Auto-scroll logic
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentChat?.messages, isTyping]);

  // New Chat Handler
  const handleNewChat = () => {
    const newSessionId = `session-${Date.now()}`;
    const newSession: ChatSession = {
      id: newSessionId,
      title: 'New Conversation',
      messages: [],
    };

    setChats((prev) => [newSession, ...prev]);
    setActiveChatId(newSessionId);
    setIsSidebarOpen(false);  
  };

  // Send Message Handler
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userText = input.trim();

    const userMsg: Message = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: userText,
      createdAt: new Date(),
    };

    // Update state with user message & dynamic title
    setChats((prevChats) =>
      prevChats.map((chat) => {
        if (chat.id === activeChatId) {
          const isFirstMessage = chat.messages.length === 0;
          const dynamicTitle = isFirstMessage
            ? userText.length > 20
              ? userText.substring(0, 20) + '...'
              : userText
            : chat.title;

          return {
            ...chat,
            title: dynamicTitle,
            messages: [...chat.messages, userMsg],
          };
        }
        return chat;
      })
    );

    setInput('');
    setIsTyping(true);

    // Simulated Assistant Reply (Repeats userText cleanly)
    setTimeout(() => {
      const assistantMsg: Message = {
        id: `ast-${Date.now()}`,
        role: 'assistant',
        content: userText,
        createdAt: new Date(),
      };

      setChats((prevChats) =>
        prevChats.map((chat) => {
          if (chat.id === activeChatId) {
            return {
              ...chat,
              messages: [...chat.messages, assistantMsg],
            };
          }
          return chat;
        })
      );

      setIsTyping(false);
    }, 1000);
  }; // <--- Properly closed function brace

  return (
    <div className="flex h-screen bg-slate-900 text-slate-100 antialiased overflow-hidden">
      
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-20 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-30 w-72 bg-slate-950 border-r border-slate-800 flex flex-col transition-transform duration-200 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <span className="font-bold text-slate-200 text-lg">AI Assistant</span>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden text-slate-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        <div className="p-3">
          <button
            onClick={handleNewChat}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2.5 px-4 rounded-xl transition"
          >
            <span className="text-xl leading-none">+</span>
            <span>New Chat</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
          <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Chat History
          </p>

          {chats.map((chat) => {
            const isActive = chat.id === activeChatId;
            return (
              <button
                key={chat.id}
                onClick={() => {
                  setActiveChatId(chat.id);
                  setIsSidebarOpen(false);
                }}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm truncate flex items-center gap-2 ${
                  isActive
                    ? 'bg-slate-800 text-white font-medium border border-slate-700'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                }`}
              >
                <span>💬</span>
                <span className="truncate">{chat.title}</span>
              </button>
            );
          })}
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col h-full bg-slate-900 relative">
        
        <header className="h-14 border-b border-slate-800 px-4 flex items-center gap-3 bg-slate-900">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="md:hidden text-slate-400 hover:text-white"
          >
            ☰
          </button>
          <h2 className="font-semibold text-slate-200 text-base truncate">
            {currentChat?.title}
          </h2>
        </header>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {currentChat?.messages.length === 0 ? (
            <div className="text-center text-slate-500 mt-20">
              No messages yet. Send a message to get started!
            </div>
          ) : (
            currentChat?.messages.map((msg) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    isUser ? 'items-end' : 'items-start'
                  }`}
                >
                  <div
                    className={`max-w-[80%] md:max-w-[70%] px-4 py-2.5 rounded-2xl text-sm ${
                      isUser
                        ? 'bg-purple-600 text-white rounded-br-none'
                        : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-bl-none'
                    }`}
                  >
                    {msg.content}
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1 px-1">
                    {msg.createdAt.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              );
            })
          )}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex items-start">
              <div className="bg-slate-800 border border-slate-700 px-4 py-3 rounded-2xl rounded-bl-none flex items-center gap-1.5">
                <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 md:p-4 border-t border-slate-800 bg-slate-950">
          <form onSubmit={handleSendMessage} className="flex gap-2 max-w-3xl mx-auto">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-medium px-5 py-2.5 rounded-xl text-sm transition"
            >
              Send
            </button>
          </form>
        </div>

      </main>
    </div>
  );
}