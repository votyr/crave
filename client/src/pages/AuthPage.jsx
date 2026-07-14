import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, User, ArrowRight } from 'lucide-react';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

function AuthPage({ mode = 'login', onAuth }) {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);

  const isSignup = mode === 'signup';

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus({ type: '', message: '' });
    setLoading(true);

    const result = await onAuth({ fullName, email, password, mode });
    setLoading(false);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setStatus({ type: 'error', message: result.message || 'Something went wrong.' });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-crave-bone px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border-2 border-crave-ink bg-crave-poppy text-crave-bone shadow-hard">
            <span className="font-display text-2xl font-extrabold">C</span>
          </div>
          <h1 className="font-display text-3xl font-extrabold text-crave-ink">
            {isSignup ? 'Create your tab' : 'Welcome back'}
          </h1>
          <p className="mt-2 text-sm text-crave-ink/70">
            {isSignup ? 'Start your personalized plan today.' : 'Sign in to view your daily special.'}
          </p>
        </div>

        <div className="relative">
          <div className="ticket-edge rounded-2xl border-2 border-crave-ink bg-crave-bone px-6 py-8 shadow-hard">
            {status.message && (
              <div
                className={`mb-4 rounded-xl border-2 px-4 py-3 text-sm font-medium ${
                  status.type === 'error'
                    ? 'border-crave-poppy bg-crave-poppy/10 text-crave-poppy'
                    : 'border-crave-jade bg-crave-jade/10 text-crave-jadeDeep'
                }`}
              >
                {status.message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignup && (
                <Input
                  label="Full name"
                  name="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your name"
                />
              )}
              <Input
                label="Email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
              <Input
                label="Password"
                name="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />

              <div className="pt-2">
                <Button variant="solid" type="submit" className="w-full">
                  {loading ? 'One moment...' : isSignup ? 'Start my plan' : 'Sign in'}
                  {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
                </Button>
              </div>
            </form>

            <div className="mt-5 text-center text-sm text-crave-ink/70">
              {isSignup ? 'Already have a tab? ' : 'New here? '}
              <a href={isSignup ? '/login' : '/signup'} className="font-bold text-crave-poppy underline">
                {isSignup ? 'Log in' : 'Sign up'}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthPage;
