import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { ScrollArea } from '../components/ui/scroll-area';
import { Progress } from '../components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../components/ui/tabs';
import {
  Beaker,
  FlaskConical,
  MessageSquare,
  FileText,
  Database,
  LogOut,
  Plus,
  Trash2,
  Download,
  Upload,
  Loader2,
  Brain,
  Sparkles,
  Target,
  CheckCircle,
  AlertCircle,
  Copy,
  FileJson,
  History
} from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function TrainingDataPage() {
  const { user, logout } = useAuth();
  const [examples, setExamples] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [chatSessions, setChatSessions] = useState([]);
  const [selectedTab, setSelectedTab] = useState('examples');
  
  const [newExample, setNewExample] = useState({
    prompt: '',
    completion: '',
    category: 'formulation',
    tags: ''
  });

  const categories = [
    { value: 'formulation', label: 'Formulation' },
    { value: 'material_properties', label: 'Material Properties' },
    { value: 'processing', label: 'Processing' },
    { value: 'troubleshooting', label: 'Troubleshooting' },
    { value: 'applications', label: 'Applications' },
    { value: 'testing', label: 'Testing Methods' },
    { value: 'general', label: 'General Q&A' }
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [examplesRes, statsRes, chatsRes] = await Promise.all([
        axios.get(`${API}/training-data`),
        axios.get(`${API}/training-data/stats`),
        axios.get(`${API}/chat-history`)
      ]);
      setExamples(examplesRes.data);
      setStats(statsRes.data);
      setChatSessions(chatsRes.data);
    } catch (e) {
      console.error('Failed to fetch data', e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddExample = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const payload = {
        prompt: newExample.prompt,
        completion: newExample.completion,
        category: newExample.category,
        tags: newExample.tags.split(',').map(t => t.trim()).filter(t => t)
      };
      
      await axios.post(`${API}/training-data`, payload);
      setNewExample({ prompt: '', completion: '', category: 'formulation', tags: '' });
      setDialogOpen(false);
      fetchData();
    } catch (e) {
      console.error('Failed to add example', e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API}/training-data/${id}`);
      setExamples(prev => prev.filter(e => e.id !== id));
      fetchData(); // Refresh stats
    } catch (e) {
      console.error('Failed to delete example', e);
    }
  };

  const handleExport = async (format) => {
    setExporting(true);
    try {
      const res = await axios.get(`${API}/training-data/export?format=${format}`);
      
      // Create downloadable file
      const content = format === 'jsonl' 
        ? res.data.data.map(d => JSON.stringify(d)).join('\n')
        : JSON.stringify(res.data.data, null, 2);
      
      const blob = new Blob([content], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `elastoai_training_data.${format}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Failed to export', e);
    } finally {
      setExporting(false);
    }
  };

  const handleConvertChat = async (sessionId) => {
    try {
      const res = await axios.post(`${API}/training-data/generate-from-chat/${sessionId}`);
      alert(`Created ${res.data.count} training examples from chat!`);
      fetchData();
    } catch (e) {
      console.error('Failed to convert chat', e);
    }
  };

  const navItems = [
    { icon: MessageSquare, label: 'Chat', path: '/chat' },
    { icon: FlaskConical, label: 'Formulation', path: '/formulation' },
    { icon: FileText, label: 'Documents', path: '/documents' },
    { icon: Database, label: 'Knowledge', path: '/knowledge' },
    { icon: Brain, label: 'Training', path: '/training' },
  ];

  const progressPercent = stats ? Math.min((stats.total_examples / stats.recommended_for_fine_tuning) * 100, 100) : 0;

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

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                item.path === '/training'
                  ? 'bg-slate-100 text-slate-900'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
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
            </div>
            <button onClick={logout} className="p-2 hover:bg-slate-100 rounded-lg">
              <LogOut className="w-4 h-4 text-slate-500" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6">
          <div className="flex items-center">
            <Brain className="w-5 h-5 text-orange-500 mr-3" />
            <h1 className="font-heading font-semibold text-slate-900">Fine-Tuning Training Data</h1>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => handleExport('jsonl')}
              disabled={exporting || !stats?.total_examples}
              className="border-slate-200"
              data-testid="export-jsonl-btn"
            >
              {exporting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Download className="w-4 h-4 mr-2" />}
              Export JSONL
            </Button>
            
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button data-testid="add-training-btn" className="bg-slate-900 hover:bg-slate-800 text-white rounded-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Example
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="font-heading">Add Training Example</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddExample} className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label>User Prompt (Question)</Label>
                    <Textarea
                      value={newExample.prompt}
                      onChange={(e) => setNewExample(prev => ({ ...prev, prompt: e.target.value }))}
                      placeholder="e.g., What formulation would you recommend for an automotive fuel hose requiring oil resistance up to 120°C?"
                      className="min-h-[100px]"
                      data-testid="training-prompt-input"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>AI Completion (Ideal Answer)</Label>
                    <Textarea
                      value={newExample.completion}
                      onChange={(e) => setNewExample(prev => ({ ...prev, completion: e.target.value }))}
                      placeholder="Provide the ideal, detailed response that the AI should learn to give..."
                      className="min-h-[150px]"
                      data-testid="training-completion-input"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Category</Label>
                      <Select value={newExample.category} onValueChange={(v) => setNewExample(prev => ({ ...prev, category: v }))}>
                        <SelectTrigger className="h-11" data-testid="training-category-select">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat.value} value={cat.value}>
                              {cat.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Tags (comma-separated)</Label>
                      <Input
                        value={newExample.tags}
                        onChange={(e) => setNewExample(prev => ({ ...prev, tags: e.target.value }))}
                        placeholder="e.g., NBR, fuel hose, heat resistant"
                        className="h-11"
                        data-testid="training-tags-input"
                      />
                    </div>
                  </div>
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="w-full h-11 bg-orange-500 hover:bg-orange-600 text-white rounded-full"
                    data-testid="save-training-btn"
                  >
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Add Training Example'}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </header>

        <div className="h-[calc(100vh-64px)] overflow-y-auto p-6">
          <div className="max-w-6xl mx-auto">
            {/* Stats Cards */}
            {stats && (
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-xl border border-slate-200 p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-slate-500">Total Examples</span>
                    <Target className="w-5 h-5 text-orange-500" />
                  </div>
                  <p className="font-heading text-3xl font-bold text-slate-900">{stats.total_examples}</p>
                  <p className="text-sm text-slate-500 mt-1">
                    Minimum: {stats.minimum_for_fine_tuning} | Recommended: {stats.recommended_for_fine_tuning}
                  </p>
                </div>
                
                <div className="bg-white rounded-xl border border-slate-200 p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-slate-500">Progress to Fine-Tuning</span>
                    {progressPercent >= 100 ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-amber-500" />
                    )}
                  </div>
                  <Progress value={progressPercent} className="h-2 mb-2" />
                  <p className="text-sm text-slate-600">
                    {progressPercent >= 100 
                      ? 'Ready for fine-tuning!' 
                      : `${Math.round(progressPercent)}% complete (${stats.recommended_for_fine_tuning - stats.total_examples} more needed)`
                    }
                  </p>
                </div>
                
                <div className="bg-white rounded-xl border border-slate-200 p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-slate-500">Categories</span>
                    <Sparkles className="w-5 h-5 text-purple-500" />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(stats.by_category || {}).map(([cat, count]) => (
                      <span key={cat} className="px-2 py-1 bg-slate-100 rounded-full text-xs text-slate-600">
                        {cat}: {count}
                      </span>
                    ))}
                    {Object.keys(stats.by_category || {}).length === 0 && (
                      <span className="text-sm text-slate-400">No data yet</span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Tabs */}
            <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
              <TabsList className="bg-white border border-slate-200">
                <TabsTrigger value="examples" className="data-[state=active]:bg-slate-100">
                  Training Examples
                </TabsTrigger>
                <TabsTrigger value="import" className="data-[state=active]:bg-slate-100">
                  Import from Chats
                </TabsTrigger>
                <TabsTrigger value="guide" className="data-[state=active]:bg-slate-100">
                  Fine-Tuning Guide
                </TabsTrigger>
              </TabsList>

              {/* Examples Tab */}
              <TabsContent value="examples">
                {loading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
                  </div>
                ) : examples.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
                    <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                      <Brain className="w-8 h-8 text-slate-400" />
                    </div>
                    <h3 className="font-heading font-semibold text-slate-900 mb-2">
                      No training examples yet
                    </h3>
                    <p className="text-slate-500 mb-4 max-w-md mx-auto">
                      Add question-answer pairs to train your custom elastomer AI model. 
                      You need at least 50 examples for fine-tuning.
                    </p>
                    <Button onClick={() => setDialogOpen(true)} className="bg-orange-500 hover:bg-orange-600 text-white rounded-full">
                      <Plus className="w-4 h-4 mr-2" />
                      Add First Example
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {examples.map((example) => (
                      <div
                        key={example.id}
                        className="bg-white rounded-xl border border-slate-200 p-5 hover:border-orange-300 transition-colors"
                        data-testid={`training-example-${example.id}`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                                Prompt
                              </span>
                              <span className="text-xs px-2 py-1 bg-slate-100 text-slate-600 rounded-full capitalize">
                                {example.category}
                              </span>
                            </div>
                            <p className="text-sm text-slate-900 mb-3 line-clamp-2">{example.prompt}</p>
                            
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                                Completion
                              </span>
                            </div>
                            <p className="text-sm text-slate-600 line-clamp-3">{example.completion}</p>
                          </div>
                          <button
                            onClick={() => handleDelete(example.id)}
                            className="p-2 hover:bg-slate-100 rounded-lg"
                            data-testid={`delete-training-${example.id}`}
                          >
                            <Trash2 className="w-4 h-4 text-slate-400" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Import from Chats Tab */}
              <TabsContent value="import">
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <History className="w-5 h-5 text-orange-500" />
                    <h3 className="font-heading font-semibold text-slate-900">Convert Chat Sessions to Training Data</h3>
                  </div>
                  <p className="text-slate-600 mb-6">
                    Select chat sessions with good Q&A exchanges to automatically convert them into training examples.
                  </p>
                  
                  {chatSessions.length === 0 ? (
                    <p className="text-slate-400 text-center py-8">No chat sessions available</p>
                  ) : (
                    <div className="space-y-2">
                      {chatSessions.slice(0, 10).map((session) => (
                        <div
                          key={session.session_id}
                          className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-orange-300"
                        >
                          <div>
                            <p className="text-sm font-medium text-slate-900">{session.title}</p>
                            <p className="text-xs text-slate-500">
                              {session.messages?.length || 0} messages • {new Date(session.updated_at).toLocaleDateString()}
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleConvertChat(session.session_id)}
                            className="border-slate-200"
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            Convert
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Guide Tab */}
              <TabsContent value="guide">
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                  <h3 className="font-heading text-xl font-bold text-slate-900 mb-4">Fine-Tuning Guide</h3>
                  
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-slate-900 mb-2">1. Collect Training Data</h4>
                      <p className="text-slate-600">
                        Add at least 50-200 high-quality question-answer pairs. Each example should represent 
                        the kind of questions users will ask and the ideal responses you want the AI to give.
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-slate-900 mb-2">2. Quality Guidelines</h4>
                      <ul className="list-disc list-inside text-slate-600 space-y-1">
                        <li>Be specific and detailed in completions</li>
                        <li>Include phr values for formulations</li>
                        <li>Cover various elastomer types and applications</li>
                        <li>Add troubleshooting scenarios</li>
                        <li>Include processing parameters</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-slate-900 mb-2">3. Export & Fine-Tune</h4>
                      <p className="text-slate-600 mb-3">
                        Export your data in JSONL format compatible with OpenAI's fine-tuning API:
                      </p>
                      <div className="bg-slate-900 rounded-lg p-4 font-mono text-sm text-slate-300 overflow-x-auto">
                        <pre>{`# Install OpenAI CLI
pip install openai

# Upload training file
openai api fine_tunes.create \\
  -t "elastoai_training_data.jsonl" \\
  -m "gpt-4o-mini-2024-07-18"

# Monitor progress
openai api fine_tunes.follow -i <fine_tune_id>`}</pre>
                      </div>
                    </div>
                    
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-semibold text-amber-800 mb-1">Note on Fine-Tuning</h4>
                          <p className="text-sm text-amber-700">
                            Fine-tuning requires an OpenAI API key with fine-tuning access and incurs additional costs. 
                            The current system uses prompt engineering with comprehensive knowledge, which works well 
                            for most use cases without the need for actual fine-tuning.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
