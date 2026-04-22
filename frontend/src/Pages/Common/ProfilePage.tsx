import { useState, useEffect } from 'react';
import { 
  User, Mail, Shield, Calendar, 
  Settings, Camera, Lock, Bell, 
  LogOut, Save, Loader, Briefcase,
  MapPin, Phone, Award
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../services/api';
import { NotificationContainer } from '../../components/Notification';
import { useNotifications } from '../../hooks/useNotifications';

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const { notifications, showNotification, removeNotification } = useNotifications();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('infos');

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
        setProfileData(await response.json());
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
      // Simulation d'update
      await new Promise(resolve => setTimeout(resolve, 1000));
      showNotification('success', 'Profil mis à jour avec succès');
    } catch (error) {
      showNotification('error', 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] gap-4">
        <Loader className="animate-spin text-blue-600" size={48} />
        <p className="text-gray-500 font-medium">Chargement de votre profil...</p>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50/30 min-h-screen pb-20">
      <NotificationContainer notifications={notifications} removeNotification={removeNotification} />

      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Mon Profil</h1>
          <p className="text-gray-500 mt-2">Gérez vos informations personnelles et vos préférences de compte.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Profile Card */}
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/50 p-8 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-blue-600 to-indigo-700 z-0"></div>
              
              <div className="relative z-10">
                <div className="relative inline-block mt-8">
                  <div className="w-32 h-32 rounded-[2rem] bg-white p-1 shadow-2xl">
                    <div className="w-full h-full rounded-[1.8rem] bg-gray-100 flex items-center justify-center text-blue-600 border-2 border-white overflow-hidden">
                      {profileData?.photo ? (
                        <img src={profileData.photo} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <User size={64} />
                      )}
                    </div>
                  </div>
                  <button className="absolute bottom-0 right-0 p-2.5 bg-blue-600 text-white rounded-xl shadow-lg border-2 border-white hover:bg-blue-700 transition-all">
                    <Camera size={18} />
                  </button>
                </div>

                <div className="mt-6">
                  <h2 className="text-2xl font-bold text-gray-900">{profileData?.prenom} {profileData?.nom}</h2>
                  <p className="text-blue-600 font-bold text-sm uppercase tracking-widest mt-1">{profileData?.role}</p>
                </div>

                <div className="mt-8 pt-8 border-t border-gray-50 flex justify-center gap-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">12</p>
                    <p className="text-xs text-gray-400 font-bold uppercase mt-1">Actions</p>
                  </div>
                  <div className="text-center border-x border-gray-100 px-6">
                    <p className="text-2xl font-bold text-gray-900">85%</p>
                    <p className="text-xs text-gray-400 font-bold uppercase mt-1">Score</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">2</p>
                    <p className="text-xs text-gray-400 font-bold uppercase mt-1">Badges</p>
                  </div>
                </div>

                <button 
                  onClick={logout}
                  className="mt-8 w-full py-4 px-6 bg-red-50 text-red-600 rounded-2xl font-bold hover:bg-red-100 transition-all flex items-center justify-center gap-2"
                >
                  <LogOut size={18} />
                  Déconnexion
                </button>
              </div>
            </div>

            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-lg p-6 space-y-4">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest ml-2">Navigation</h3>
              <div className="space-y-1">
                <button 
                  onClick={() => setActiveTab('infos')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'infos' ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                  <User size={18} />
                  Informations
                </button>
                <button 
                  onClick={() => setActiveTab('security')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'security' ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                  <Lock size={18} />
                  Sécurité
                </button>
                <button 
                  onClick={() => setActiveTab('notifications')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'notifications' ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                  <Bell size={18} />
                  Notifications
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Details */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/50 p-10 h-full">
              {activeTab === 'infos' && (
                <form onSubmit={handleSave} className="space-y-8">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                      <Award className="text-blue-600" size={24} />
                      Détails du compte
                    </h3>
                    <button 
                      type="submit" 
                      disabled={saving}
                      className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 flex items-center gap-2 disabled:opacity-50"
                    >
                      {saving ? <Loader className="animate-spin" size={18} /> : <Save size={18} />}
                      Enregistrer
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Prénom</label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                          type="text" 
                          defaultValue={profileData?.prenom}
                          className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-[1.5rem] focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-gray-700"
                        />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Nom</label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                          type="text" 
                          defaultValue={profileData?.nom}
                          className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-[1.5rem] focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-gray-700"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Email professionnel</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input 
                        type="email" 
                        readOnly
                        value={profileData?.email}
                        className="w-full pl-12 pr-4 py-4 bg-gray-100 border border-gray-200 rounded-[1.5rem] text-gray-500 cursor-not-allowed font-medium"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Département</label>
                      <div className="relative">
                        <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                          type="text" 
                          readOnly
                          value={profileData?.departementNom || 'N/A'}
                          className="w-full pl-12 pr-4 py-4 bg-gray-100 border border-gray-200 rounded-[1.5rem] text-gray-500 cursor-not-allowed font-medium"
                        />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Rôle Système</label>
                      <div className="relative">
                        <Shield className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                          type="text" 
                          readOnly
                          value={profileData?.role}
                          className="w-full pl-12 pr-4 py-4 bg-gray-100 border border-gray-200 rounded-[1.5rem] text-gray-500 cursor-not-allowed font-medium"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100 flex items-start gap-4">
                    <div className="p-2 bg-white rounded-xl text-blue-600 shadow-sm">
                      <Calendar size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-blue-900">Membre depuis</p>
                      <p className="text-xs text-blue-600 mt-0.5">
                        {profileData?.dateCreation ? new Date(profileData.dateCreation).toLocaleDateString() : 'Non définie'}
                      </p>
                    </div>
                  </div>
                </form>
              )}

              {activeTab === 'security' && (
                <div className="space-y-8">
                  <h3 className="text-xl font-bold text-gray-900">Paramètres de Sécurité</h3>
                  <div className="space-y-6">
                    <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-sm">
                          <Lock size={20} />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">Changer le mot de passe</p>
                          <p className="text-xs text-gray-400 mt-0.5">Dernière modification il y a 3 mois</p>
                        </div>
                      </div>
                      <button className="px-6 py-2 bg-white border border-gray-200 rounded-xl font-bold text-gray-700 hover:bg-gray-100 transition-all shadow-sm">Modifier</button>
                    </div>
                    <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100 flex items-center justify-between opacity-50 cursor-not-allowed">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-sm">
                          <Shield size={20} />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">Double authentification</p>
                          <p className="text-xs text-gray-400 mt-0.5">Bientôt disponible</p>
                        </div>
                      </div>
                      <div className="w-12 h-6 bg-gray-300 rounded-full"></div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="space-y-8">
                  <h3 className="text-xl font-bold text-gray-900">Préférences de Notification</h3>
                  <div className="space-y-4">
                    {['Emails d\'activité', 'Alertes système', 'Nouveaux messages', 'Mises à jour de ressources'].map((pref, i) => (
                      <div key={i} className="flex items-center justify-between py-4 border-b border-gray-50 last:border-0">
                        <span className="font-bold text-gray-700">{pref}</span>
                        <div className={`w-12 h-6 ${i < 2 ? 'bg-blue-600' : 'bg-gray-200'} rounded-full relative transition-colors`}>
                          <div className={`absolute top-1 ${i < 2 ? 'right-1' : 'left-1'} w-4 h-4 bg-white rounded-full`}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
