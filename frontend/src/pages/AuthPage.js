import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Mail, Lock, User, ArrowRight, Loader2 } from 'lucide-react';

export default function AuthPage() {
  const location = useLocation();
  const isLogin = location.pathname === '/login';
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(name, email, password);
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-split">
      {/* Left side - Form */}
      <div className="flex items-center justify-center p-8 lg:p-12">
        <div className="w-full max-w-md space-y-8">
          <div>
            <Link to="/" className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors mb-8">
              <svg className="w-8 h-8 text-orange-500" viewBox="0 0 32 32" fill="currentColor">
                <path d="M16 2C8.268 2 2 8.268 2 16s6.268 14 14 14 14-6.268 14-14S23.732 2 16 2zm0 4a10 10 0 0 1 10 10 10 10 0 0 1-10 10A10 10 0 0 1 6 16 10 10 0 0 1 16 6zm-4 6a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm8 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm-4 4c-2.5 0-4.5 1.5-4.5 3.5h9c0-2-2-3.5-4.5-3.5z"/>
              </svg>
              <span className="font-heading font-bold text-xl text-slate-900">ElastoAI</span>
            </Link>
            
            <h1 className="font-heading text-3xl font-bold text-slate-900 tracking-tight">
              {isLogin ? 'Welcome back' : 'Create your account'}
            </h1>
            <p className="mt-2 text-slate-600">
              {isLogin 
                ? 'Enter your credentials to access your elastomer formulations'
                : 'Start predicting elastomer formulations with AI'
              }
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="name" className="text-slate-700 font-medium">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    id="name"
                    data-testid="register-name-input"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className="pl-10 h-12 bg-white border-slate-200 focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                    required
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-700 font-medium">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  id="email"
                  data-testid="auth-email-input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="pl-10 h-12 bg-white border-slate-200 focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-700 font-medium">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  id="password"
                  data-testid="auth-password-input"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-10 h-12 bg-white border-slate-200 focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm" data-testid="auth-error">
                {error}
              </div>
            )}

            <Button
              type="submit"
              data-testid="auth-submit-btn"
              disabled={loading}
              className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white rounded-full font-medium transition-all hover:-translate-y-0.5"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  {isLogin ? 'Sign In' : 'Create Account'}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
          </form>

          <p className="text-center text-slate-600">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <Link
              to={isLogin ? '/register' : '/login'}
              className="text-orange-500 hover:text-orange-600 font-medium transition-colors"
              data-testid="auth-toggle-link"
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </Link>
          </p>
        </div>
      </div>

      {/* Right side - Image */}
      <div 
        className="hidden lg:block bg-cover bg-center relative"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1746422125911-37dd7e925fa3?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1ODB8MHwxfHNlYXJjaHwyfHxtb2xlY3VsYXIlMjBzdHJ1Y3R1cmUlMjAzZCUyMGFic3RyYWN0JTIwYmx1ZXxlbnwwfHx8fDE3Njc4NjAyMjh8MA&ixlib=rb-4.1.0&q=85')`
        }}
      >
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
        <div className="relative h-full flex flex-col justify-end p-12">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
            <h2 className="font-heading text-2xl font-bold text-white mb-4">
              Precision Formulation Intelligence
            </h2>
            <p className="text-slate-200">
              Leverage AI to predict elastomer formulations, analyze research documents, and optimize your rubber compounds with scientific precision.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
