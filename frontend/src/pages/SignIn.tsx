import { useState } from 'react';
import { AuthLayout } from '@/components/AuthLayout';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { User, Users, Eye, EyeOff } from 'lucide-react';

const API_BASE_URL = "http://127.0.0.1:8000";

export default function SignIn() {
  const navigate = useNavigate();
  const [role, setRole] = useState<'child' | 'parent' | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!role) {
        setError('Please select your role.');
        setLoading(false);
        return;
      }

      const res = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Login failed');

      // Ensure the backend user role matches the selected role
      if (data.user.role !== role) {
        throw new Error(`This account is not a ${role}.`);
      }

      // Store tokens under role-specific keys
      localStorage.setItem(`${role}_user`, JSON.stringify(data.user));

      // Use React Router navigation
      navigate(role === 'child' ? '/child' : '/parent');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Welcome Back!" subtitle="Sign in to your NoteNest">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Role selection */}
        <div className="flex space-x-4 justify-center mb-4">
          <button
            type="button"
            onClick={() => setRole('child')}
            className={`p-4 rounded-xl border-2 flex items-center space-x-2 ${
              role === 'child'
                ? 'border-primary bg-primary-lighter/50'
                : 'border-border hover:border-primary/50'
            }`}
          >
            <User className="w-5 h-5" />
            <span>Child</span>
          </button>
          <button
            type="button"
            onClick={() => setRole('parent')}
            className={`p-4 rounded-xl border-2 flex items-center space-x-2 ${
              role === 'parent'
                ? 'border-accent bg-accent-lighter/50'
                : 'border-border hover:border-accent/50'
            }`}
          >
            <Users className="w-5 h-5" />
            <span>Parent</span>
          </button>
        </div>

        {/* Email and password */}
        <div className="relative">
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="input-nest pl-12"
            required
          />
        </div>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter your password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="input-nest pl-12 pr-12"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-3.5 text-muted-foreground hover:text-foreground"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>

        {error && <div className="text-red-500">{error}</div>}

        <Button type="submit" className="btn-primary w-full" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign In'}
        </Button>

        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link to="/signup" className="text-primary hover:text-primary-light font-medium transition-colors">
              Sign up here
            </Link>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
}