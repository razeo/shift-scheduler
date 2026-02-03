// ===========================================
// Auth Context for RestoHub
// ===========================================

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { User, UserRole } from '../types/users';
import { authService } from '../services/auth';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  hasRole: (roles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  
  useEffect(() => {
    // Inicijaliziraj default admina
    authService.createDefaultAdmin();
    
    // Provjeri da li je korisnik već prijavljen
    const savedUser = authService.getCurrentUser();
    if (savedUser) {
      setUser(savedUser);
    }
  }, []);
  
  const login = async (username: string, password: string): Promise<boolean> => {
    const foundUser = authService.validateUser(username, password);
    if (foundUser) {
      authService.login(foundUser);
      setUser(foundUser);
      return true;
    }
    return false;
  };
  
  const logout = () => {
    authService.logout();
    setUser(null);
  };
  
  const hasRole = (roles: UserRole[]): boolean => {
    return authService.hasRole(user, roles);
  };
  
  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
    hasRole,
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth mora biti korišten unutar AuthProvider');
  }
  return context;
}
