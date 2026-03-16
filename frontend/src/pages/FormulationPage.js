import { useState } from 'react';
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
  ArrowLeft,
  Loader2,
  Copy,
  Check,
  Sparkles,
  Brain
} from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function FormulationPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);
  
  const [formData, setFormData] = useState({
    hardness_shore_a: '',
    tensile_strength_mpa: '',
    elongation_percent: '',
    compression_set_percent: '',
    tear_strength_kn_m: '',
    abrasion_resistance: '',
    oil_resistance: '',
    heat_resistance_c: '',
    ozone_resistance: '',
    elastomer_type: '',
    application: '',
    additional_requirements: ''
  });

  const elastomerTypes = [
    { value: 'any', label: 'Any (AI Recommended)' },
    { value: 'NR', label: 'Natural Rubber (NR)' },
    { value: 'SBR', label: 'Styrene-Butadiene (SBR)' },
    { value: 'NBR', label: 'Nitrile Rubber (NBR)' },
    { value: 'EPDM', label: 'EPDM' },
    { value: 'CR', label: 'Neoprene (CR)' },
    { value: 'Silicone', label: 'Silicone Rubber' },
    { value: 'FKM', label: 'Fluoroelastomer (FKM)' },
    { value: 'IIR', label: 'Butyl Rubber (IIR)' },
    { value: 'PU', label: 'Polyurethane (PU)' }
  ];

  const resistanceLevels = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'excellent', label: 'Excellent' }
  ];

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const payload = {};
      Object.entries(formData).forEach(([key, value]) => {
        if (value && value !== '') {
          if (['hardness_shore_a', 'tensile_strength_mpa', 'elongation_percent', 'compression_set_percent', 'tear_strength_kn_m', 'heat_resistance_c'].includes(key)) {
            payload[key] = parseFloat(value);
          } else {
            payload[key] = value;
          }
        }
      });

      const res = await axios.post(`${API}/predict-formulation`, payload);
      setResult(res.data.formulation);
    } catch (e) {
      setResult('Error generating formulation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
                item.path === '/formulation'
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
        <header className="h-16 bg-white border-b border-slate-200 flex items-center px-6">
          <FlaskConical className="w-5 h-5 text-orange-500 mr-3" />
          <h1 className="font-heading font-semibold text-slate-900">Formulation Predictor</h1>
        </header>

        <div className="h-[calc(100vh-64px)] overflow-y-auto p-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Input Form */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-slate-900 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="font-heading font-bold text-slate-900">Target Properties</h2>
                    <p className="text-sm text-slate-500">Enter your desired elastomer specifications</p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Mechanical Properties */}
                  <div>
                    <h3 className="text-sm font-medium text-slate-700 mb-3 uppercase tracking-wider">
                      Mechanical Properties
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-slate-600">Hardness (Shore A)</Label>
                        <Input
                          type="number"
                          value={formData.hardness_shore_a}
                          onChange={(e) => handleChange('hardness_shore_a', e.target.value)}
                          placeholder="e.g., 65"
                          className="h-11 bg-slate-50 border-slate-200"
                          data-testid="input-hardness"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-slate-600">Tensile Strength (MPa)</Label>
                        <Input
                          type="number"
                          step="0.1"
                          value={formData.tensile_strength_mpa}
                          onChange={(e) => handleChange('tensile_strength_mpa', e.target.value)}
                          placeholder="e.g., 15"
                          className="h-11 bg-slate-50 border-slate-200"
                          data-testid="input-tensile"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-slate-600">Elongation (%)</Label>
                        <Input
                          type="number"
                          value={formData.elongation_percent}
                          onChange={(e) => handleChange('elongation_percent', e.target.value)}
                          placeholder="e.g., 400"
                          className="h-11 bg-slate-50 border-slate-200"
                          data-testid="input-elongation"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-slate-600">Compression Set (%)</Label>
                        <Input
                          type="number"
                          value={formData.compression_set_percent}
                          onChange={(e) => handleChange('compression_set_percent', e.target.value)}
                          placeholder="e.g., 25"
                          className="h-11 bg-slate-50 border-slate-200"
                          data-testid="input-compression"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-slate-600">Tear Strength (kN/m)</Label>
                        <Input
                          type="number"
                          step="0.1"
                          value={formData.tear_strength_kn_m}
                          onChange={(e) => handleChange('tear_strength_kn_m', e.target.value)}
                          placeholder="e.g., 30"
                          className="h-11 bg-slate-50 border-slate-200"
                          data-testid="input-tear"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-slate-600">Heat Resistance (°C)</Label>
                        <Input
                          type="number"
                          value={formData.heat_resistance_c}
                          onChange={(e) => handleChange('heat_resistance_c', e.target.value)}
                          placeholder="e.g., 120"
                          className="h-11 bg-slate-50 border-slate-200"
                          data-testid="input-heat"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Resistance Properties */}
                  <div>
                    <h3 className="text-sm font-medium text-slate-700 mb-3 uppercase tracking-wider">
                      Resistance Properties
                    </h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label className="text-slate-600">Abrasion</Label>
                        <Select value={formData.abrasion_resistance} onValueChange={(v) => handleChange('abrasion_resistance', v)}>
                          <SelectTrigger className="h-11 bg-slate-50 border-slate-200" data-testid="select-abrasion">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            {resistanceLevels.map((level) => (
                              <SelectItem key={level.value} value={level.value}>
                                {level.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-slate-600">Oil</Label>
                        <Select value={formData.oil_resistance} onValueChange={(v) => handleChange('oil_resistance', v)}>
                          <SelectTrigger className="h-11 bg-slate-50 border-slate-200" data-testid="select-oil">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            {resistanceLevels.map((level) => (
                              <SelectItem key={level.value} value={level.value}>
                                {level.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-slate-600">Ozone</Label>
                        <Select value={formData.ozone_resistance} onValueChange={(v) => handleChange('ozone_resistance', v)}>
                          <SelectTrigger className="h-11 bg-slate-50 border-slate-200" data-testid="select-ozone">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            {resistanceLevels.map((level) => (
                              <SelectItem key={level.value} value={level.value}>
                                {level.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Material & Application */}
                  <div>
                    <h3 className="text-sm font-medium text-slate-700 mb-3 uppercase tracking-wider">
                      Material & Application
                    </h3>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-slate-600">Preferred Elastomer Type</Label>
                        <Select value={formData.elastomer_type} onValueChange={(v) => handleChange('elastomer_type', v)}>
                          <SelectTrigger className="h-11 bg-slate-50 border-slate-200" data-testid="select-elastomer">
                            <SelectValue placeholder="Select type or let AI decide" />
                          </SelectTrigger>
                          <SelectContent>
                            {elastomerTypes.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-slate-600">Application</Label>
                        <Input
                          value={formData.application}
                          onChange={(e) => handleChange('application', e.target.value)}
                          placeholder="e.g., Automotive seals, conveyor belts, gaskets..."
                          className="h-11 bg-slate-50 border-slate-200"
                          data-testid="input-application"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-slate-600">Additional Requirements</Label>
                        <Textarea
                          value={formData.additional_requirements}
                          onChange={(e) => handleChange('additional_requirements', e.target.value)}
                          placeholder="Any other specifications, constraints, or preferences..."
                          className="min-h-[80px] bg-slate-50 border-slate-200"
                          data-testid="input-additional"
                        />
                      </div>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    data-testid="predict-btn"
                    className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-white rounded-full font-medium"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                        Generating Formulation...
                      </>
                    ) : (
                      <>
                        <FlaskConical className="w-5 h-5 mr-2" />
                        Predict Formulation
                      </>
                    )}
                  </Button>
                </form>
              </div>

              {/* Results Panel */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-heading font-bold text-slate-900">Formulation Result</h2>
                  {result && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopy}
                      className="border-slate-200"
                    >
                      {copied ? (
                        <>
                          <Check className="w-4 h-4 mr-2 text-green-500" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 mr-2" />
                          Copy
                        </>
                      )}
                    </Button>
                  )}
                </div>

                <ScrollArea className="h-[calc(100vh-280px)]">
                  {loading ? (
                    <div className="flex flex-col items-center justify-center h-64">
                      <Loader2 className="w-8 h-8 animate-spin text-orange-500 mb-4" />
                      <p className="text-slate-500">Analyzing requirements and generating formulation...</p>
                    </div>
                  ) : result ? (
                    <div className="prose prose-sm max-w-none" data-testid="formulation-result">
                      <div className="markdown-body">
 <ReactMarkdown remarkPlugins={[remarkGfm]}>
   {result}
 </ReactMarkdown>
</div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-64 text-center">
                      <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                        <FlaskConical className="w-8 h-8 text-slate-400" />
                      </div>
                      <h3 className="font-heading font-semibold text-slate-900 mb-2">
                        No formulation yet
                      </h3>
                      <p className="text-slate-500 max-w-xs">
                        Enter your target properties and click "Predict Formulation" to get AI-generated recommendations.
                      </p>
                    </div>
                  )}
                </ScrollArea>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
