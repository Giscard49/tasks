'use client';

import { useState, useEffect } from 'react';
import { MultiUserApp } from './MultiUserApp';
import { LoginScreen } from './LoginScreen';
import { logout as requestLogout } from '../api';
import type { AuthSession } from '../api';

const SESSION_STORAGE_KEY = 'todoapp_session';

export function AppShell() {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is already authenticated on app start
  useEffect(() => {
    const savedSession = localStorage.getItem(SESSION_STORAGE_KEY);
    if (savedSession) {
      try {
        setSession(JSON.parse(savedSession));
      } catch {
        localStorage.removeItem(SESSION_STORAGE_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  const handleLogin = (newSession: AuthSession) => {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(newSession));
    setSession(newSession);
  };

  const handleLogout = () => {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    setSession(null);
    // Clears the httpOnly session cookie on the server; ignore failures.
    requestLogout().catch(() => {});
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
