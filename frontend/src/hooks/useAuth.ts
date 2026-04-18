import { useState, useEffect } from 'react';
import authService, { type LoginResponse } from '../services/authService';

export const useAuth = () => {
  const [user, setUser] = useState<LoginResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const loggedUser = await authService.login(email, password);
    setUser(loggedUser);
    return loggedUser;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const registerSupplier = async (nomSociete: string, email: string, motDePasse: string) => {
    return await authService.registerSupplier(nomSociete, email, motDePasse);
  };

  return {
    user,
    loading,
    login,
    logout,
    registerSupplier,
    isAuthenticated: !!user,
    // Unification : Le Responsable est l'Admin
    isResponsable: user?.role === 'RESPONSABLE' || user?.role === 'ADMIN',
    isAdmin: user?.role === 'RESPONSABLE' || user?.role === 'ADMIN',
  };
};
