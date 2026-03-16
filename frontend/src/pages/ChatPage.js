import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import remarkGfm from "remark-gfm";
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { ScrollArea } from '../components/ui/scroll-area';
import MoleculeViewer from "../components/ui/MoleculeViewer";

import {
  Send,
  Plus,
  History,
  Menu,
  X,
  Beaker,
  LogOut,
  FlaskConical,
  FileText,
  Database,
  Settings,
  Trash2,
  Loader2,
  ArrowLeft,
  MessageSquare,
  Brain
} from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function ChatPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { sessionId: urlSessionId } = useParams();
  
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(urlSessionId || null);
  const [chatHistory, setChatHistory] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(true);
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    fetchChatHistory();
  }, []);

  useEffect(() => {
    if (urlSessionId) {
      loadSession(urlSessionId);
    }
  }, [urlSessionId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchChatHistory = async () => {
    try {
      const res = await axios.get(`${API}/chat-history`);
      setChatHistory(res.data);
    } catch (e) {
      console.error('Failed to fetch history', e);
    } finally {
      setHistoryLoading(false);
    }
  };

  const loadSession = async (sid) => {
    try {
      const res = await axios.get(`${API}/chat-history/${sid}`);
      setMessages(res.data.messages || []);
      setSessionId(sid);
    } catch (e) {
      console.error('Failed to load session', e);
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setSessionId(null);
    navigate('/chat');
    inputRef.current?.focus();
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage, timestamp: new Date().toISOString() }]);
    setLoading(true);

    try {
      const res = await axios.post(`${API}/chat`, {
        message: userMessage,
        session_id: sessionId,
        language: navigator.language?.split('-')[0] || 'en'
      });

      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: res.data.response, 
        timestamp: new Date().toISOString() 
      }]);
      
      if (!sessionId) {
        setSessionId(res.data.session_id);
        navigate(`/chat/${res.data.session_id}`, { replace: true });
      }
      
      fetchChatHistory();
    } catch (e) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error. Please try again.', 
        timestamp: new Date().toISOString() 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSession = async (sid, e) => {
    e.stopPropagation();
    try {
      await axios.delete(`${API}/chat-history/${sid}`);
      setChatHistory(prev => prev.filter(s => s.session_id !== sid));
      if (sessionId === sid) {
        handleNewChat();
      }
    } catch (e) {
      console.error('Failed to delete session', e);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const navItems = [
    { icon: MessageSquare, label: 'Chat', path: '/chat' },
    { icon: FlaskConical, label: 'Formulation', path: '/formulation' },
    { icon: FileText, label: 'Documents', path: '/documents' },
    { icon: Database, label: 'Knowledge', path: '/knowledge' },
    { icon: Brain, label: 'Training', path: '/training' },
  ];

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-72' : 'w-0'} transition-all duration-300 bg-white border-r border-slate-200 flex flex-col overflow-hidden`}>
        {/* Logo */}
        <div className="p-4 border-b border-slate-200">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-orange-500 flex items-center justify-center">
              <Beaker className="w-5 h-5 text-white" />
            </div>
            <span className="font-heading font-bold text-lg text-slate-900">ElastoAI</span>
          </Link>
        </div>

        {/* New Chat Button */}
        <div className="p-4">
          <Button
            onClick={handleNewChat}
            data-testid="new-chat-btn"
            className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Chat
          </Button>
        </div>

        {/* Navigation */}
        <nav className="px-3 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                location.pathname.startsWith(item.path)
                  ? 'bg-slate-100 text-slate-900'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Chat History */}
        <div className="flex-1 overflow-hidden flex flex-col mt-4">
          <div className="px-4 py-2 flex items-center gap-2 text-sm font-medium text-slate-500">
            <History className="w-4 h-4" />
            Recent Chats
          </div>
          <ScrollArea className="flex-1 px-3">
            {historyLoading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
              </div>
            ) : chatHistory.length === 0 ? (
              <p className="text-sm text-slate-400 px-3 py-2">No chat history</p>
            ) : (
              chatHistory.map((session) => (
                <div
                  key={session.session_id}
                  onClick={() => navigate(`/chat/${session.session_id}`)}
                  className={`group flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer mb-1 ${
                    sessionId === session.session_id
                      ? 'bg-slate-100'
                      : 'hover:bg-slate-50'
                  }`}
                  data-testid={`chat-session-${session.session_id}`}
                >
                  <span className="text-sm text-slate-700 truncate flex-1">
                    {session.title}
                  </span>
                  <button
                    onClick={(e) => handleDeleteSession(session.session_id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-200 rounded"
                    data-testid={`delete-session-${session.session_id}`}
                  >
                    <Trash2 className="w-4 h-4 text-slate-400" />
                  </button>
                </div>
              ))
            )}
          </ScrollArea>
        </div>

        {/* User section */}
        <div className="p-4 border-t border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center">
              <span className="text-sm font-medium text-slate-600">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">{user?.name}</p>
              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
            </div>
            <button
              onClick={logout}
              className="p-2 hover:bg-slate-100 rounded-lg"
              data-testid="logout-btn"
            >
              <LogOut className="w-4 h-4 text-slate-500" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center px-4 gap-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-slate-100 rounded-lg lg:hidden"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-slate-100 rounded-lg hidden lg:block"
          >
            <Menu className="w-5 h-5 text-slate-600" />
          </button>
          <h1 className="font-heading font-semibold text-slate-900">
            {sessionId ? 'Chat Session' : 'New Conversation'}
          </h1>
        </header>

        
        {/* Messages */}
<div className="flex-1 overflow-y-auto p-6">
  {messages.length === 0 ? (
    <div className="h-full flex flex-col items-center justify-center text-center px-4">
      <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-6">
        <MessageSquare className="w-8 h-8 text-slate-400" />
      </div>

      <h2 className="font-heading text-2xl font-bold text-slate-900 mb-2">
        Ask me anything about elastomers
      </h2>

      <p className="text-slate-500 max-w-md mb-8">
        I can help with formulation questions, material selection, processing parameters, and more.
      </p>
    </div>
  ) : (
    <div className="max-w-3xl mx-auto space-y-6">

      {messages.map((msg, idx) => (
        <div
          key={idx}
          className={`flex ${
            msg.role === "user" ? "justify-end" : "justify-start"
          } animate-slide-in`}
        >
          <div
            className={`max-w-[85%] px-4 py-3 ${
              msg.role === "user"
                ? "message-user"
                : "message-assistant"
            }`}
          >

            {msg.role === "assistant" ? (
              <div className="prose prose-sm max-w-none">

                {msg.content?.includes("VIEWER:") ? (

                  <MoleculeViewer
                    pdbUrl={msg.content.split("VIEWER:")[1].trim()}
                  />

                ) : msg.content?.includes("SMILES:") ? (

                  <MoleculeViewer
                    smiles={msg.content.split("SMILES:")[1].trim()}
                  />

                ) : (

                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      p: ({node, ...props}) => (
                        <p style={{marginBottom: "10px", lineHeight: "1.6"}} {...props} />
                      )
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>

                )}

              </div>
            ) : (
              <p className="whitespace-pre-wrap">{msg.content}</p>
            )}

          </div>
        </div>
      ))}

      {loading && (
        <div className="flex justify-start">
          <div className="message-assistant px-4 py-3 flex items-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
            <span className="text-sm text-slate-400">Thinking...</span>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />

    </div>
  )}
</div>

        {/* Input Area */}
        <div className="chat-input-area">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-end gap-3">
              <div className="flex-1 relative">
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about elastomer formulations, properties, processing..."
                  className="pr-12 h-12 bg-slate-50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-slate-900"
                  data-testid="chat-input"
                  disabled={loading}
                />
              </div>
              <Button
                onClick={handleSend}
                disabled={!input.trim() || loading}
                data-testid="send-message-btn"
                className="h-12 w-12 bg-slate-900 hover:bg-slate-800 text-white rounded-full p-0"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </Button>
            </div>
            <p className="text-xs text-slate-400 mt-2 text-center">
              ElastoAI may produce inaccurate information. Always verify formulations experimentally.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
