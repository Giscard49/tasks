import { useState, useEffect } from 'react';
import { MultiUserApp } from './components/MultiUserApp';
import { LoginScreen } from './components/LoginScreen';
import type { AuthSession } from './api';

export default function App() {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is already authenticated on app start
  useEffect(() => {
    const savedSession = localStorage.getItem('todoapp_session');
    if (savedSession) {
      try {
        setSession(JSON.parse(savedSession));
      } catch {
        localStorage.removeItem('todoapp_session');
      }
    }
    setIsLoading(false);
  }, []);

  const handleLogin = (newSession: AuthSession) => {
    localStorage.setItem('todoapp_session', JSON.stringify(newSession));
    setSession(newSession);
  };

  const handleLogout = () => {
    localStorage.removeItem('todoapp_session');
    setSession(null);
  };

  // Show loading state briefly on app start
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Show login screen if not authenticated
  if (!session) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  // Show main app if authenticated
  return <MultiUserApp session={session} onLogout={handleLogout} />;
}