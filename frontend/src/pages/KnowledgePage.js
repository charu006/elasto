import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { ScrollArea } from '../components/ui/scroll-area';
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
  Beaker,
  FlaskConical,
  MessageSquare,
  FileText,
  Database,
  LogOut,
  Plus,
  Trash2,
  Search,
  Loader2,
  Tag,
  BookOpen,
  Brain
} from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function KnowledgePage() {
  const { user, logout } = useAuth();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [newEntry, setNewEntry] = useState({
    title: '',
    content: '',
    category: 'formulation',
    tags: ''
  });

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'formulation', label: 'Formulations' },
    { value: 'material', label: 'Materials' },
    { value: 'processing', label: 'Processing' },
    { value: 'testing', label: 'Testing' },
    { value: 'application', label: 'Applications' },
    { value: 'other', label: 'Other' }
  ];

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      const res = await axios.get(`${API}/knowledge`);
      setEntries(res.data);
    } catch (e) {
      console.error('Failed to fetch knowledge', e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddEntry = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const payload = {
        title: newEntry.title,
        content: newEntry.content,
        category: newEntry.category,
        tags: newEntry.tags.split(',').map(t => t.trim()).filter(t => t)
      };
      
      await axios.post(`${API}/knowledge`, payload);
      setNewEntry({ title: '', content: '', category: 'formulation', tags: '' });
      setDialogOpen(false);
      fetchEntries();
    } catch (e) {
      console.error('Failed to add entry', e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API}/knowledge/${id}`);
      setEntries(prev => prev.filter(e => e.id !== id));
    } catch (e) {
      console.error('Failed to delete entry', e);
    }
  };

  const filteredEntries = entries.filter(entry => {
    const matchesSearch = entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          entry.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || entry.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

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

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                item.path === '/knowledge'
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
            <Database className="w-5 h-5 text-orange-500 mr-3" />
            <h1 className="font-heading font-semibold text-slate-900">Knowledge Base</h1>
          </div>
          
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="add-knowledge-btn" className="bg-slate-900 hover:bg-slate-800 text-white rounded-full">
                <Plus className="w-4 h-4 mr-2" />
                Add Entry
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle className="font-heading">Add Knowledge Entry</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddEntry} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    value={newEntry.title}
                    onChange={(e) => setNewEntry(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., EPDM Sulfur Cure System"
                    className="h-11"
                    data-testid="knowledge-title-input"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={newEntry.category} onValueChange={(v) => setNewEntry(prev => ({ ...prev, category: v }))}>
                    <SelectTrigger className="h-11" data-testid="knowledge-category-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.slice(1).map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Content</Label>
                  <Textarea
                    value={newEntry.content}
                    onChange={(e) => setNewEntry(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Enter formulation details, technical notes, or any elastomer-related information..."
                    className="min-h-[150px]"
                    data-testid="knowledge-content-input"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tags (comma-separated)</Label>
                  <Input
                    value={newEntry.tags}
                    onChange={(e) => setNewEntry(prev => ({ ...prev, tags: e.target.value }))}
                    placeholder="e.g., EPDM, sulfur, automotive"
                    className="h-11"
                    data-testid="knowledge-tags-input"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full h-11 bg-orange-500 hover:bg-orange-600 text-white rounded-full"
                  data-testid="save-knowledge-btn"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Entry'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </header>

        <div className="h-[calc(100vh-64px)] overflow-y-auto p-6">
          <div className="max-w-5xl mx-auto">
            {/* Filters */}
            <div className="flex gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search knowledge base..."
                  className="pl-10 h-11 bg-white border-slate-200"
                  data-testid="knowledge-search"
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48 h-11 bg-white border-slate-200" data-testid="category-filter">
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

            {/* Entries Grid */}
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
              </div>
            ) : filteredEntries.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="font-heading font-semibold text-slate-900 mb-2">
                  {searchTerm || selectedCategory !== 'all' ? 'No matching entries' : 'No entries yet'}
                </h3>
                <p className="text-slate-500 mb-4">
                  {searchTerm || selectedCategory !== 'all' 
                    ? 'Try adjusting your search or filters'
                    : 'Start building your elastomer knowledge base'}
                </p>
                {!searchTerm && selectedCategory === 'all' && (
                  <Button onClick={() => setDialogOpen(true)} className="bg-orange-500 hover:bg-orange-600 text-white rounded-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Add First Entry
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {filteredEntries.map((entry) => (
                  <div
                    key={entry.id}
                    className="knowledge-card bg-white rounded-xl border border-slate-200 p-5 hover:border-orange-300 transition-colors"
                    data-testid={`knowledge-entry-${entry.id}`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-heading font-semibold text-slate-900">{entry.title}</h3>
                      <button
                        onClick={() => handleDelete(entry.id)}
                        className="p-1.5 hover:bg-slate-100 rounded-lg"
                        data-testid={`delete-knowledge-${entry.id}`}
                      >
                        <Trash2 className="w-4 h-4 text-slate-400" />
                      </button>
                    </div>
                    <p className="text-sm text-slate-600 line-clamp-3 mb-3">{entry.content}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs px-2 py-1 bg-slate-100 text-slate-600 rounded-full capitalize">
                        {entry.category}
                      </span>
                      {entry.tags?.length > 0 && (
                        <div className="flex items-center gap-1">
                          <Tag className="w-3 h-3 text-slate-400" />
                          <span className="text-xs text-slate-500">
                            {entry.tags.slice(0, 2).join(', ')}
                            {entry.tags.length > 2 && ` +${entry.tags.length - 2}`}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
