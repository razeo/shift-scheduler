// ===========================================
// Login Component for RestoHub
// ===========================================

import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { toast, Toaster } from 'react-hot-toast';

export function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const success = await login(username, password);
      if (success) {
        toast.success('Uspešno prijavljivanje!');
      } else {
        toast.error('Pogrešno korisničko ime ili lozinka');
      }
    } catch {
      toast.error('Došlo je do greške');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="flex h-screen w-full items-center justify-center bg-slate-100 font-sans">
      <Toaster position="top-right" />
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md mx-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800">RestoHub</h1>
          <p className="text-slate-500 mt-2">Prijavite se na sistem</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Korisničko ime
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
              placeholder="Unesite korisničko ime"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Lozinka
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
              placeholder="Unesite lozinku"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Prijavljivanje...' : 'Prijavi se'}
          </button>
        </form>
        
        <div className="mt-6 text-center text-sm text-slate-500">
          <p>Podaci za prijavljivanje:</p>
          <p className="font-mono mt-1">admin / admin123</p>
        </div>
      </div>
    </div>
  );
}
