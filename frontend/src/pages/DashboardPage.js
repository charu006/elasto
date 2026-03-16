import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Button } from '../components/ui/button';
import {
  Beaker,
  FlaskConical,
  MessageSquare,
  FileText,
  Database,
  LogOut,
  ArrowRight,
  Clock,
  Sparkles,
  Plus,
  ChevronRight,
  Brain
} from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [recentChats, setRecentChats] = useState([]);
  const [recentFormulations, setRecentFormulations] = useState([]);
  const [knowledgeCount, setKnowledgeCount] = useState(0);
  const [documentCount, setDocumentCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [chats, formulations, knowledge, docs] = await Promise.all([
        axios.get(`${API}/chat-history`),
        axios.get(`${API}/formulation-history`),
        axios.get(`${API}/knowledge`),
        axios.get(`${API}/documents`)
      ]);
      
      setRecentChats(chats.data.slice(0, 3));
      setRecentFormulations(formulations.data.slice(0, 3));
      setKnowledgeCount(knowledge.data.length);
      setDocumentCount(docs.data.length);
    } catch (e) {
      console.error('Failed to fetch dashboard data', e);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      icon: MessageSquare,
      title: 'Ask ElastoAI',
      description: 'Get answers about elastomer chemistry and formulations',
      path: '/chat',
      color: 'bg-blue-500'
    },
    {
      icon: FlaskConical,
      title: 'Predict Formulation',
      description: 'Generate formulations based on target properties',
      path: '/formulation',
      color: 'bg-orange-500'
    },
    {
      icon: FileText,
      title: 'Analyze Document',
      description: 'Upload and analyze research papers or datasheets',
      path: '/documents',
      color: 'bg-green-500'
    },
    {
      icon: Database,
      title: 'Add Knowledge',
      description: 'Build your custom elastomer knowledge base',
      path: '/knowledge',
      color: 'bg-purple-500'
    }
  ];

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
      <div className="w-72 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-4 border-b border-slate-200">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-orange-500 flex items-center justify-center">
              <Beaker className="w-5 h-5 text-white" />
            </div>
            <span className="font-heading font-bold text-lg text-slate-900">ElastoAI</span>
          </Link>
        </div>

        <div className="p-4">
          <Button
            onClick={() => navigate('/chat')}
            data-testid="new-chat-btn"
            className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Chat
          </Button>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

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

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-8">
          <div className="max-w-5xl mx-auto">
            {/* Welcome Header */}
            <div className="mb-8">
              <h1 className="font-heading text-3xl font-bold text-slate-900 mb-2">
                Welcome back, {user?.name?.split(' ')[0]}
              </h1>
              <p className="text-slate-600">
                What would you like to explore in elastomer science today?
              </p>
            </div>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {quickActions.map((action, idx) => (
                <Link
                  key={idx}
                  to={action.path}
                  className="bg-white rounded-xl border border-slate-200 p-5 hover:border-orange-300 hover:shadow-md transition-all group"
                  data-testid={`quick-action-${action.path.slice(1)}`}
                >
                  <div className={`w-10 h-10 rounded-lg ${action.color} flex items-center justify-center mb-3`}>
                    <action.icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-heading font-semibold text-slate-900 mb-1 group-hover:text-orange-600 transition-colors">
                    {action.title}
                  </h3>
                  <p className="text-sm text-slate-500">{action.description}</p>
                </Link>
              ))}
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <p className="text-sm text-slate-500 mb-1">Chat Sessions</p>
                <p className="font-heading text-2xl font-bold text-slate-900">{recentChats.length}</p>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <p className="text-sm text-slate-500 mb-1">Formulations</p>
                <p className="font-heading text-2xl font-bold text-slate-900">{recentFormulations.length}</p>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <p className="text-sm text-slate-500 mb-1">Knowledge Entries</p>
                <p className="font-heading text-2xl font-bold text-slate-900">{knowledgeCount}</p>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <p className="text-sm text-slate-500 mb-1">Documents</p>
                <p className="font-heading text-2xl font-bold text-slate-900">{documentCount}</p>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Recent Chats */}
              <div className="bg-white rounded-xl border border-slate-200 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-heading font-semibold text-slate-900 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-400" />
                    Recent Conversations
                  </h2>
                  <Link to="/chat" className="text-sm text-orange-500 hover:text-orange-600 flex items-center gap-1">
                    View all
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
                
                {recentChats.length === 0 ? (
                  <div className="text-center py-6">
                    <MessageSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm text-slate-500">No conversations yet</p>
                    <Button
                      onClick={() => navigate('/chat')}
                      variant="ghost"
                      className="mt-2 text-orange-500 hover:text-orange-600"
                    >
                      Start a chat
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {recentChats.map((chat) => (
                      <Link
                        key={chat.session_id}
                        to={`/chat/${chat.session_id}`}
                        className="block p-3 rounded-lg hover:bg-slate-50 transition-colors"
                      >
                        <p className="text-sm font-medium text-slate-900 truncate">{chat.title}</p>
                        <p className="text-xs text-slate-500">
                          {new Date(chat.updated_at).toLocaleDateString()}
                        </p>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent Formulations */}
              <div className="bg-white rounded-xl border border-slate-200 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-heading font-semibold text-slate-900 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-slate-400" />
                    Recent Formulations
                  </h2>
                  <Link to="/formulation" className="text-sm text-orange-500 hover:text-orange-600 flex items-center gap-1">
                    New
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
                
                {recentFormulations.length === 0 ? (
                  <div className="text-center py-6">
                    <FlaskConical className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm text-slate-500">No formulations yet</p>
                    <Button
                      onClick={() => navigate('/formulation')}
                      variant="ghost"
                      className="mt-2 text-orange-500 hover:text-orange-600"
                    >
                      Create formulation
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {recentFormulations.map((form, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-lg bg-slate-50"
                      >
                        <p className="text-sm font-medium text-slate-900">
                          {form.request?.elastomer_type || 'Custom'} Formulation
                        </p>
                        <p className="text-xs text-slate-500">
                          {form.request?.hardness_shore_a && `${form.request.hardness_shore_a} Shore A`}
                          {form.request?.application && ` • ${form.request.application}`}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Tips Section */}
            <div className="mt-8 bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-6 text-white">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-orange-500 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-lg mb-2">Pro Tip</h3>
                  <p className="text-slate-300 text-sm">
                    Upload your company's technical datasheets and formulation guides to the Knowledge Base. 
                    This helps ElastoAI provide more relevant and customized recommendations based on your specific materials and processes.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
