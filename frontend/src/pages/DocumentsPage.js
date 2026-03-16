import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
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
  Upload,
  Trash2,
  Search,
  Loader2,
  FileUp,
  Eye,
  Brain
} from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function DocumentsPage() {
  const { user, logout } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [analysisQuery, setAnalysisQuery] = useState('');
  const [analysisResult, setAnalysisResult] = useState('');
  const [uploadDialog, setUploadDialog] = useState(false);
  const [analyzeDialog, setAnalyzeDialog] = useState(false);
  const [category, setCategory] = useState('general');

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const res = await axios.get(`${API}/documents`);
      setDocuments(res.data);
    } catch (e) {
      console.error('Failed to fetch documents', e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', category);

    try {
      await axios.post(`${API}/upload-document`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setUploadDialog(false);
      fetchDocuments();
    } catch (e) {
      console.error('Failed to upload', e);
      alert(e.response?.data?.detail || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedDoc || !analysisQuery.trim()) return;
    
    setAnalyzing(true);
    setAnalysisResult('');
    
    try {
      const formData = new FormData();
      formData.append('query', analysisQuery);
      
      const res = await axios.post(`${API}/analyze-document/${selectedDoc.id}`, formData);
      setAnalysisResult(res.data.analysis);
    } catch (e) {
      setAnalysisResult('Error analyzing document. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const deleteDocument = async (id) => {
  try {
    const token = localStorage.getItem("token");

    await axios.delete(`${API}/documents/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    setDocuments(prev => prev.filter(doc => doc.id !== id));

  } catch (error) {
    console.error("Delete failed:", error);
  }
};



  const navItems = [
    { icon: MessageSquare, label: 'Chat', path: '/chat' },
    { icon: FlaskConical, label: 'Formulation', path: '/formulation' },
    { icon: FileText, label: 'Documents', path: '/documents' },
    { icon: Database, label: 'Knowledge', path: '/knowledge' },
    { icon: Brain, label: 'Training', path: '/training' },
  ];

  const categories = [
    { value: 'general', label: 'General' },
    { value: 'research', label: 'Research Papers' },
    { value: 'datasheet', label: 'Technical Datasheets' },
    { value: 'formulation', label: 'Formulation Guides' },
    { value: 'testing', label: 'Testing Reports' }
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
                item.path === '/documents'
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
            <FileText className="w-5 h-5 text-orange-500 mr-3" />
            <h1 className="font-heading font-semibold text-slate-900">Document Analysis</h1>
          </div>
          
          <Dialog open={uploadDialog} onOpenChange={setUploadDialog}>
            <DialogTrigger asChild>
              <Button data-testid="upload-doc-btn" className="bg-slate-900 hover:bg-slate-800 text-white rounded-full">
                <Upload className="w-4 h-4 mr-2" />
                Upload PDF
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="font-heading">Upload Document</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="h-11" data-testid="doc-category-select">
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
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleUpload}
                    className="hidden"
                    id="file-upload"
                    data-testid="file-input"
                    disabled={uploading}
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    {uploading ? (
                      <div className="flex flex-col items-center">
                        <Loader2 className="w-10 h-10 text-orange-500 animate-spin mb-3" />
                        <p className="text-slate-600">Uploading and processing...</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <FileUp className="w-10 h-10 text-slate-400 mb-3" />
                        <p className="text-slate-600 mb-1">Click to upload PDF</p>
                        <p className="text-sm text-slate-400">Max 10MB</p>
                      </div>
                    )}
                  </label>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </header>

        <div className="h-[calc(100vh-64px)] overflow-y-auto p-6">
          <div className="max-w-5xl mx-auto">
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
              </div>
            ) : documents.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="font-heading font-semibold text-slate-900 mb-2">
                  No documents yet
                </h3>
                <p className="text-slate-500 mb-4">
                  Upload PDF documents to analyze elastomer research and technical data
                </p>
                <Button onClick={() => setUploadDialog(true)} className="bg-orange-500 hover:bg-orange-600 text-white rounded-full">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload First Document
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="bg-white rounded-xl border border-slate-200 p-5 flex items-center justify-between hover:border-orange-300 transition-colors"
                    data-testid={`document-${doc.id}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-red-50 flex items-center justify-center">
                        <FileText className="w-6 h-6 text-red-500" />
                      </div>
                      <div>
                        <h3 className="font-medium text-slate-900">{doc.filename}</h3>
                        <p className="text-sm text-slate-500">
                          {doc.category} • Uploaded {new Date(doc.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Dialog open={analyzeDialog && selectedDoc?.id === doc.id} onOpenChange={(open) => {
                        setAnalyzeDialog(open);
                        if (open) {
                          setSelectedDoc(doc);
                          setAnalysisResult('');
                          setAnalysisQuery('');
                        }
                      }}>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            className="border-slate-200"
                            data-testid={`analyze-${doc.id}`}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Analyze
                          </Button>

                          
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-2xl max-h-[80vh]">
                          <DialogHeader>
                            <DialogTitle className="font-heading">Analyze: {doc.filename}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 mt-4">
                            <div className="flex gap-3">
                              <Textarea
                                value={analysisQuery}
                                onChange={(e) => setAnalysisQuery(e.target.value)}
                                placeholder="Ask a question about this document..."
                                className="flex-1 min-h-[80px]"
                                data-testid="analysis-query"
                              />
                              <Button
                                onClick={handleAnalyze}
                                disabled={analyzing || !analysisQuery.trim()}
                                className="bg-orange-500 hover:bg-orange-600 text-white"
                                data-testid="run-analysis-btn"
                              >
                                {analyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                              </Button>
                              

                              
                            </div>
                            
                            {(analyzing || analysisResult) && (
                              <ScrollArea className="h-[300px] border border-slate-200 rounded-lg p-4">
                                {analyzing ? (
                                  <div className="flex items-center justify-center h-full">
                                    <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
                                  </div>
                                ) : (
                                  <div className="prose prose-sm max-w-none" data-testid="analysis-result">
                                    <div className="markdown-body">
 <ReactMarkdown remarkPlugins={[remarkGfm]}>
   {analysisResult}
 </ReactMarkdown>
</div>
                                  </div>
                                )}
                              </ScrollArea>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
                      {/* DELETE BUTTON */}
  <Button
    variant="destructive"
    onClick={() => {
      if (window.confirm("Delete this document?")) {
        deleteDocument(doc.id);
      }
    }}
  >
    <Trash2 className="w-4 h-4 mr-2" />
    Delete
  </Button>

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
