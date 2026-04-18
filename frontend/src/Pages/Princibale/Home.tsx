import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Building2, Mail, Lock, ArrowRight, ShieldCheck, Zap, Globe } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const Home = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nomSociete, setNomSociete] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { login, registerSupplier } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      const user = await login(email, password);
      if (user.role === 'ADMIN' || user.role === 'RESPONSABLE') {
        navigate('/responsable/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Email ou mot de passe incorrect');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await registerSupplier(nomSociete, email, password);
      setIsLogin(true);
      setError('Inscription réussie ! Vous pouvez maintenant vous connecter.');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de l\'inscription');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white font-sans selection:bg-purple-500/30 overflow-x-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/20 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/20 blur-[120px] rounded-full"></div>
      </div>

      {/* Navbar */}
      <nav className="relative z-50 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-tr from-purple-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
            <Zap className="text-white fill-current" size={20} />
          </div>
          <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
            FaculteHub
          </span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
          <a href="#features" className="hover:text-white transition-colors">Fonctionnalités</a>
          <a href="#about" className="hover:text-white transition-colors">À propos</a>
          <button
            onClick={() => setIsLogin(true)}
            className="px-5 py-2 rounded-full border border-gray-800 hover:border-gray-700 hover:bg-white/5 transition-all"
          >
            Connexion
          </button>
        </div>
      </nav>

      {/* Hero Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-8 pt-20 pb-32 grid lg:grid-cols-2 gap-16 items-center">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
            </span>
            Nouvelle version 2.0 disponible
          </div>
          <h1 className="text-5xl lg:text-7xl font-extrabold leading-tight mb-6">
            Gérez vos <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400">ressources</span> avec intelligence.
          </h1>
          <p className="text-gray-400 text-lg mb-10 max-w-xl leading-relaxed">
            Une plateforme tout-en-un pour la gestion des équipements, des besoins et des fournisseurs au sein de votre faculté. Optimisez vos processus dès aujourd'hui.
          </p>

          <div className="grid grid-cols-2 gap-6 mb-10">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                <ShieldCheck className="text-blue-400" size={20} />
              </div>
              <div>
                <h4 className="font-semibold text-sm">Sécurisé</h4>
                <p className="text-xs text-gray-500">Protection des données</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                <Globe className="text-purple-400" size={20} />
              </div>
              <div>
                <h4 className="font-semibold text-sm">Centralisé</h4>
                <p className="text-xs text-gray-500">Accès partout</p>
              </div>
            </div>
          </div>
        </div>

        {/* Auth Form Container */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
          <div className="relative bg-[#121216] border border-white/10 p-8 rounded-3xl shadow-2xl">
            <div className="flex mb-8 p-1 bg-white/5 rounded-xl border border-white/5">
              <button
                onClick={() => setIsLogin(true)}
                className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${isLogin ? 'bg-white/10 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
              >
                Se connecter
              </button>
              <button
                onClick={() => setIsLogin(false)}
                className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${!isLogin ? 'bg-white/10 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
              >
                S'inscrire (Fournisseur)
              </button>
            </div>

            {error && (
              <div className={`mb-6 p-4 rounded-xl text-sm border ${error.includes('réussie') ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                {error}
              </div>
            )}

            {isLogin ? (
              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 outline-none transition-all"
                      placeholder="nom@exemple.com"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Mot de passe</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 outline-none transition-all"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-xl shadow-purple-600/20 active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  {isSubmitting ? 'Connexion...' : 'Accéder au tableau de bord'}
                  <ArrowRight size={18} />
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Nom de la Société</label>
                  <div className="relative">
                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
                    <input
                      type="text"
                      required
                      value={nomSociete}
                      onChange={(e) => setNomSociete(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 outline-none transition-all"
                      placeholder="Société SARL"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Email Professionnel</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 outline-none transition-all"
                      placeholder="contact@societe.com"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Mot de passe</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 outline-none transition-all"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-xl shadow-purple-600/20 active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  {isSubmitting ? 'Inscription...' : 'Créer mon compte fournisseur'}
                  <UserPlus size={18} />
                </button>
              </form>
            )}
          </div>
        </div>
      </main>

      <footer className="relative z-10 border-t border-white/5 py-12">
        <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 opacity-50">
            <Zap size={16} />
            <span className="text-sm font-semibold tracking-tight">FaculteHub © 2026</span>
          </div>
          <div className="flex gap-8 text-sm text-gray-500">
            <a href="#" className="hover:text-gray-300">Confidentialité</a>
            <a href="#" className="hover:text-gray-300">CGU</a>
            <a href="#" className="hover:text-gray-300">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
