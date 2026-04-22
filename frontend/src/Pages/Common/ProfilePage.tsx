import { useState, useEffect } from 'react';
import { 
  User, Mail, Shield, Calendar, 
  Settings, Camera, Lock, Bell, 
  LogOut, Save, Loader, Briefcase,
  MapPin, Phone, Award, ChevronRight,
  Globe, Fingerprint, Activity, X,
  Eye, EyeOff, CheckCircle
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../services/api';
import { NotificationContainer } from '../../components/Notification';
import { useNotifications } from '../../hooks/useNotifications';

const PasswordModal = ({ isOpen, onClose, userId, showNotification }: any) => {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      showNotification('error', 'Les nouveaux mots de passe ne correspondent pas');
      return;
    }

    setLoading(true);
    try {
      const response = await api.changePassword(userId, {
        oldPassword: passwords.currentPassword,
        newPassword: passwords.newPassword
      });

      if (response.ok) {
        showNotification('success', 'Mot de passe mis à jour avec succès');
        setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
        onClose();
      } else {
        const err = await response.text();
        showNotification('error', err || 'Échec de la mise à jour du mot de passe');
      }
    } catch (error) {
      showNotification('error', 'Erreur lors du changement de mot de passe');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/20 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-300">
        <div className="p-8 bg-white border-b border-gray-50 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Changer le mot de passe</h3>
            <p className="text-gray-400 text-xs mt-0.5">Sécurisez votre accès à la plateforme.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-50 rounded-full transition-colors text-gray-400">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Ancien mot de passe</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                type={showPassword ? "text" : "password"}
                required
                value={passwords.currentPassword}
                onChange={e => setPasswords({...passwords, currentPassword: e.target.value})}
                className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium text-sm"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Nouveau mot de passe</label>
            <div className="relative">
              <Shield className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                type={showPassword ? "text" : "password"}
                required
                value={passwords.newPassword}
                onChange={e => setPasswords({...passwords, newPassword: e.target.value})}
                className="w-full pl-11 pr-11 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium text-sm"
                placeholder="••••••••"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Confirmer</label>
            <div className="relative">
              <CheckCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                type={showPassword ? "text" : "password"}
                required
                value={passwords.confirmPassword}
                onChange={e => setPasswords({...passwords, confirmPassword: e.target.value})}
                className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium text-sm"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3.5 bg-gray-900 text-white rounded-xl font-bold text-sm hover:bg-black transition-all shadow-md disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
          >
            {loading ? <Loader className="animate-spin" size={18} /> : <Save size={16} />}
            Mettre à jour le mot de passe
          </button>
        </form>
      </div>
    </div>
  );
};

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const { notifications, showNotification, removeNotification } = useNotifications();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('infos');
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    prenom: '',
    nom: ''
  });

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const response = await fetch(`http://localhost:8081/api/utilisateurs/${user.id}`, {
        headers: {
          'Authorization': `Bearer ${user.accessToken}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setProfileData(data);
        setFormData({
          prenom: data.prenom || '',
          nom: data.nom || ''
        });
      }
    } catch (error) {
      showNotification('error', 'Erreur lors du chargement du profil');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const response = await api.updateUser(user.id, {
        ...profileData,
        prenom: formData.prenom,
        nom: formData.nom
      });

      if (response.ok) {
        showNotification('success', 'Profil mis à jour avec succès');
        fetchProfile();
      } else {
        showNotification('error', 'Échec de la sauvegarde');
      }
    } catch (error) {
      showNotification('error', 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px]">
        <Loader className="animate-spin text-blue-600 mb-4" size={32} />
        <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Chargement du profil...</p>
      </div>
    );
  }

  return (
    <div className="p-8 bg-white min-h-full">
      <NotificationContainer notifications={notifications} removeNotification={removeNotification} />
      <PasswordModal 
        isOpen={isPasswordModalOpen} 
        onClose={() => setIsPasswordModalOpen(false)} 
        userId={user.id}
        showNotification={showNotification}
      />

      <div className="max-w-[1100px] mx-auto">
        {/* Simple Header */}
        <div className="flex flex-col md:flex-row items-center gap-8 mb-12 pb-12 border-b border-gray-100">
          <div className="relative group">
            <div className="w-32 h-32 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-300 overflow-hidden shadow-sm">
              {profileData?.photo ? (
                <img src={profileData.photo} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User size={48} />
              )}
            </div>
            <button className="absolute -bottom-2 -right-2 p-2 bg-white border border-gray-200 text-gray-600 rounded-xl shadow-md hover:bg-gray-50 transition-all">
              <Camera size={16} />
            </button>
          </div>

          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-2">
              <h2 className="text-3xl font-bold text-gray-900 tracking-tight">{profileData?.prenom} {profileData?.nom}</h2>
              <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                {profileData?.role}
              </span>
            </div>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-5 text-gray-500 font-medium">
              <div className="flex items-center gap-2 text-sm">
                <Mail size={14} className="text-gray-400" />
                {profileData?.email}
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Briefcase size={14} className="text-gray-400" />
                {profileData?.departementNom || 'Administration Centrale'}
              </div>
            </div>
          </div>

          <button 
            onClick={logout}
            className="px-6 py-2.5 bg-white border border-gray-200 text-gray-600 rounded-xl font-bold text-sm hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all flex items-center gap-2 shadow-sm"
          >
            <LogOut size={16} />
            Déconnexion
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Navigation Side */}
          <div className="lg:col-span-3">
            <div className="space-y-1">
              {[
                { id: 'infos', label: 'Compte', icon: User },
                { id: 'security', label: 'Sécurité', icon: Shield },
                { id: 'notifications', label: 'Notifications', icon: Bell }
              ].map((item) => (
                <button 
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === item.id ? 'bg-gray-900 text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                  <item.icon size={18} />
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content Side */}
          <div className="lg:col-span-9">
            {activeTab === 'infos' && (
              <form onSubmit={handleSave} className="space-y-8 animate-in fade-in duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Prénom</label>
                    <input 
                      type="text" 
                      value={formData.prenom}
                      onChange={e => setFormData({...formData, prenom: e.target.value})}
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 outline-none transition-all font-semibold text-gray-900 shadow-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Nom de famille</label>
                    <input 
                      type="text" 
                      value={formData.nom}
                      onChange={e => setFormData({...formData, nom: e.target.value})}
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 outline-none transition-all font-semibold text-gray-900 shadow-sm"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Identifiant Email</label>
                  <input 
                    type="email" 
                    readOnly
                    value={profileData?.email}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-gray-400 cursor-not-allowed font-semibold shadow-sm"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                  <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Rattachement</p>
                    <p className="font-bold text-gray-900">{profileData?.departementNom || 'Administration'}</p>
                  </div>
                  <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Niveau d'accès</p>
                    <p className="font-bold text-gray-900">{profileData?.role}</p>
                  </div>
                </div>

                <div className="flex justify-end pt-6 border-t border-gray-50">
                  <button 
                    type="submit" 
                    disabled={saving}
                    className="px-10 py-3.5 bg-gray-900 text-white rounded-xl font-bold text-sm hover:bg-blue-600 transition-all shadow-lg shadow-gray-200 disabled:opacity-50 flex items-center gap-2"
                  >
                    {saving ? <Loader className="animate-spin" size={18} /> : <Save size={18} />}
                    Mettre à jour le profil
                  </button>
                </div>
              </form>
            )}

            {activeTab === 'security' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="p-6 bg-white border border-gray-100 rounded-2xl flex items-center justify-between shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-gray-50 rounded-xl text-gray-600 border border-gray-100">
                      <Lock size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">Mot de passe</p>
                      <p className="text-xs text-gray-400 font-medium">Modifié pour la dernière fois il y a 3 mois</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setIsPasswordModalOpen(true)}
                    className="px-6 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg font-bold text-xs hover:bg-gray-50 transition-all"
                  >
                    Modifier
                  </button>
                </div>

                <div className="p-6 bg-white border border-gray-100 rounded-2xl flex items-center justify-between shadow-sm opacity-50 grayscale">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-gray-50 rounded-xl text-gray-600 border border-gray-100">
                      <Shield size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">Authentification à deux facteurs</p>
                      <p className="text-xs text-gray-400 font-medium">Non configuré</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Bientôt</span>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-4 animate-in fade-in duration-300">
                {[
                  { t: 'Emails d\'activité', d: 'Rapports hebdomadaires et résumés' },
                  { t: 'Alertes système', d: 'Informations critiques sur le matériel' },
                  { t: 'Nouveaux messages', d: 'Communications de l\'administration' }
                ].map((pref, i) => (
                  <div key={i} className="flex items-center justify-between p-5 bg-white border border-gray-100 rounded-2xl shadow-sm">
                    <div>
                      <p className="font-bold text-gray-800 text-sm">{pref.t}</p>
                      <p className="text-xs text-gray-400 font-medium">{pref.d}</p>
                    </div>
                    <div className={`w-12 h-6 ${i < 2 ? 'bg-emerald-500' : 'bg-gray-200'} rounded-full relative cursor-pointer`}>
                      <div className={`absolute top-1 ${i < 2 ? 'right-1' : 'left-1'} w-4 h-4 bg-white rounded-full shadow-sm`}></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
