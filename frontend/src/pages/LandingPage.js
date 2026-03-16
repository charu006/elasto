import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { 
  FlaskConical, 
  MessageSquare, 
  FileText, 
  Database, 
  ArrowRight, 
  Sparkles,
  Beaker,
  Globe
} from 'lucide-react';

export default function LandingPage() {
  const { user } = useAuth();

  const features = [
    {
      icon: FlaskConical,
      title: 'Formulation Prediction',
      description: 'Input your target properties like hardness, tensile strength, and elongation to get precise formulation recommendations in phr.'
    },
    {
      icon: MessageSquare,
      title: 'Expert Q&A',
      description: 'Ask any question about elastomer chemistry, processing, applications, or troubleshooting. Get detailed, expert-level answers.'
    },
    {
      icon: FileText,
      title: 'Document Analysis',
      description: 'Upload research papers, technical datasheets, or formulation guides. Extract insights and query the content.'
    },
    {
      icon: Database,
      title: 'Knowledge Base',
      description: 'Build your custom elastomer knowledge repository. Add formulations, notes, and technical data for AI-enhanced retrieval.'
    }
  ];

  const elastomerTypes = [
    'Natural Rubber (NR)',
    'Nitrile (NBR)',
    'EPDM',
    'Silicone',
    'Neoprene (CR)',
    'Fluoroelastomers',
    'Butyl (IIR)',
    'Polyurethane'
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center">
              <Beaker className="w-5 h-5 text-white" />
            </div>
            <span className="font-heading font-bold text-xl text-slate-900">ElastoAI</span>
          </Link>
          
          <div className="flex items-center gap-4">
            {user ? (
              <Link to="/dashboard">
                <Button 
                  data-testid="dashboard-nav-btn"
                  className="bg-slate-900 hover:bg-slate-800 text-white rounded-full px-6"
                >
                  Dashboard
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" data-testid="login-nav-btn" className="text-slate-600 hover:text-slate-900">
                    Sign In
                  </Button>
                </Link>
                <Link to="/register">
                  <Button 
                    data-testid="register-nav-btn"
                    className="bg-slate-900 hover:bg-slate-800 text-white rounded-full px-6"
                  >
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-gradient py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Sparkles className="w-4 h-4" />
                AI-Powered Elastomer Intelligence
              </div>
              
              <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 tracking-tight leading-tight mb-6">
                Predict Elastomer Formulations with{' '}
                <span className="text-orange-500">Precision</span>
              </h1>
              
              <p className="text-lg text-slate-600 mb-8 max-w-xl">
                Train your custom AI model on elastomer science. Get accurate formulation predictions, 
                expert answers, and document analysis—all powered by advanced machine learning.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link to={user ? '/dashboard' : '/register'}>
                  <Button 
                    data-testid="hero-cta-btn"
                    className="bg-slate-900 hover:bg-slate-800 text-white rounded-full px-8 h-12 text-base"
                  >
                    Start Predicting
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Link to={user ? '/chat' : '/login'}>
                  <Button 
                    variant="outline"
                    data-testid="hero-chat-btn"
                    className="border-slate-300 text-slate-700 hover:bg-slate-100 rounded-full px-8 h-12 text-base"
                  >
                    <MessageSquare className="w-5 h-5 mr-2" />
                    Try Chat
                  </Button>
                </Link>
              </div>
            </div>

            <div className="relative hidden lg:block">
              <img
                src="https://images.unsplash.com/photo-1707944746508-f2dd7b88ac1b?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Njd8MHwxfHNlYXJjaHw0fHxsYWJvcmF0b3J5JTIwc2NpZW50aXN0JTIwbWljcm9zY29wZXxlbnwwfHx8fDE3Njc4NjAyMjV8MA&ixlib=rb-4.1.0&q=85"
                alt="Laboratory scientist"
                className="rounded-2xl shadow-2xl"
              />
              <div className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-lg p-4 border border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                    <FlaskConical className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="font-mono text-sm text-slate-600">Hardness</p>
                    <p className="font-heading font-bold text-slate-900">65 Shore A</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Elastomer Types */}
      <section className="py-12 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-4 overflow-x-auto pb-2">
            <span className="text-sm font-medium text-slate-500 whitespace-nowrap">Supported:</span>
            {elastomerTypes.map((type) => (
              <span
                key={type}
                className="px-4 py-2 bg-slate-100 rounded-full text-sm text-slate-700 whitespace-nowrap"
              >
                {type}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-heading text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
              Everything You Need for Elastomer Development
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              From formulation prediction to document analysis, get comprehensive AI assistance for your rubber compounding work.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="feature-card bg-white border border-slate-200 rounded-2xl p-8 hover:border-orange-300"
              >
                <div className="w-14 h-14 rounded-xl bg-slate-900 flex items-center justify-center mb-6">
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-heading text-xl font-bold text-slate-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Multi-language Section */}
      <section className="py-20 bg-slate-900">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-orange-500/20 text-orange-400 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Globe className="w-4 h-4" />
            Multi-Language Support
          </div>
          <h2 className="font-heading text-3xl lg:text-4xl font-bold text-white mb-4">
            Speak Your Language
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-8">
            ElastoAI understands and responds in multiple languages. Ask questions in English, German, Chinese, Japanese, Spanish, or any other language.
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            {['English', 'Deutsch', '中文', '日本語', 'Español', 'Français'].map((lang) => (
              <span key={lang} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg text-sm">
                {lang}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-32">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="font-heading text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
            Ready to Transform Your Formulation Process?
          </h2>
          <p className="text-lg text-slate-600 mb-8">
            Join engineers and chemists using AI to accelerate elastomer development.
          </p>
          <Link to={user ? '/dashboard' : '/register'}>
            <Button 
              data-testid="cta-btn"
              className="bg-orange-500 hover:bg-orange-600 text-white rounded-full px-10 h-14 text-lg"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center">
              <Beaker className="w-4 h-4 text-white" />
            </div>
            <span className="font-heading font-bold text-slate-900">ElastoAI</span>
          </div>
          <p className="text-sm text-slate-500">
            © 2024 ElastoAI. Precision Formulation Intelligence.
          </p>
        </div>
      </footer>
    </div>
  );
}
