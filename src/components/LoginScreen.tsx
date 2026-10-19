import { useEffect, useState } from 'react';
import { Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { getAuthStatus, login, register } from '../api';
import type { AuthSession } from '../api';

interface LoginScreenProps {
  onLogin: (session: AuthSession) => void;
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  // Sign-up stays hidden until the server says there is still room for an account.
  const [registrationOpen, setRegistrationOpen] = useState(false);

  useEffect(() => {
    getAuthStatus()
      .then((status) => setRegistrationOpen(status.registrationOpen))
      .catch(() => setRegistrationOpen(false));
  }, []);

  // If the second account gets created while this screen is in sign-up mode, fall back.
  useEffect(() => {
    if (isRegistering && !registrationOpen) {
      setIsRegistering(false);
      setError('');
    }
  }, [isRegistering, registrationOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const session = await (isRegistering ? register(username, password) : login(username, password));
      onLogin(session);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to sign in');
      // Registration may have just closed — refresh the flag so the link disappears.
      if (isRegistering) {
        getAuthStatus()
          .then((status) => setRegistrationOpen(status.registrationOpen))
          .catch(() => {});
      }
    }

    setIsLoading(false);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl mb-4">
            <CheckCircle2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
            {isRegistering ? 'Create your account' : 'Welcome Back'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {isRegistering
              ? 'This app only allows two accounts'
              : 'Sign in to access your tasks'}
          </p>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl">{isRegistering ? 'Create account' : 'Sign in'}</CardTitle>
            <CardDescription>
              {isRegistering
                ? 'Pick a username and password for this device'
                : 'Enter your credentials to continue'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  autoComplete="username"
                  className="w-full text-base"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder={isRegistering ? 'At least 8 characters' : 'Enter your password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={isRegistering ? 8 : undefined}
                    autoComplete={isRegistering ? 'new-password' : 'current-password'}
                    className="w-full pr-10 text-base"
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading
                  ? (isRegistering ? 'Creating account...' : 'Signing in...')
                  : (isRegistering ? 'Create account' : 'Sign in')}
              </Button>

              {registrationOpen && (
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={() => {
                    setIsRegistering(value => !value);
                    setError('');
                  }}
                >
                  {isRegistering ? 'Already have an account? Sign in' : 'Need an account? Sign up'}
                </Button>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
