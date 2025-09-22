import { useState } from 'react';
import { AuthLayout } from '@/components/AuthLayout';
import { RoleSelector } from '@/components/RoleSelector';
import { Button } from '@/components/ui/button';
import { User, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { Link } from 'react-router-dom';

const API_BASE_URL = "https://notenest-backend-epgq.onrender.com";

export default function SignUp() {
  const [step, setStep] = useState<'role' | 'details'>('role');
  const [role, setRole] = useState<'child' | 'parent' | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [familyCode, setFamilyCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRoleSelect = (selectedRole: 'child' | 'parent') => {
    setRole(selectedRole);
    setStep('details');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload: any = { name, email, password, role };
      if (role === 'parent') payload.family_code = familyCode;

      const res = await fetch(`${API_BASE_URL}/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Signup failed');

      // Store the complete user data
      localStorage.setItem(`${role}_user`, JSON.stringify(data));

      // Show family code to child after signup
      if (role === 'child' && data.family_code) {
        alert(`Signup successful! Share this family code with your parent: ${data.family_code}`);
      }

      // Redirect to appropriate dashboard
      window.location.href = role === 'child' ? '/child' : '/parent';
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Join NoteNest!" subtitle="Create your account">
      {step === 'role' && (
        <RoleSelector selectedRole={role} onRoleSelect={handleRoleSelect} />
      )}
      {step === 'details' && (
        <div className="space-y-6">
          <div className="text-center">
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              role === 'child' 
                ? 'bg-primary-lighter text-primary' 
                : 'bg-accent-lighter text-accent'
            }`}>
              {role === 'child' ? '👧' : '👨‍👩‍👧‍👦'} {role === 'child' ? 'Child' : 'Parent'} Account
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <User className="absolute left-3 top-3.5 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-nest pl-12"
                required
              />
            </div>

            <div className="relative">
              <Mail className="absolute left-3 top-3.5 w-5 h-5 text-muted-foreground" />
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-nest pl-12"
                required
              />
            </div>
            
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 w-5 h-5 text-muted-foreground" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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

            {role === 'parent' && (
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Enter family code from your child"
                  value={familyCode}
                  onChange={(e) => setFamilyCode(e.target.value)}
                  className="input-nest pl-12"
                  required
                />
              </div>
            )}

            {error && <div className="text-red-500">{error}</div>}

            <div className="flex space-x-3">
              <Button 
                type="button"
                onClick={() => setStep('role')}
                className="btn-ghost-nest flex-1"
              >
                Back
              </Button>
              <Button 
                type="submit" 
                className={role === 'child' ? 'btn-primary flex-1' : 'btn-accent flex-1'}
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create Account'}
              </Button>
            </div>
          </form>

          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link 
                to="/signin" 
                className="text-primary hover:text-primary-light font-medium transition-colors"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      )}
    </AuthLayout>
  );
}