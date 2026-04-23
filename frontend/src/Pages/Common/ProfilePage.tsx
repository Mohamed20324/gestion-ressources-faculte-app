import { useState, useEffect } from 'react';
import {
  User, Mail, Shield, Calendar,
  Camera, Lock, Bell,
  LogOut, Save, Loader, Briefcase, ChevronRight, Eye, EyeOff
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeContext';
import { NotificationContainer } from '../../components/Notification';
import { useNotifications } from '../../hooks/useNotifications';

const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Administrateur',
  CHEF_DEPARTEMENT: 'Chef de Département',
  RESPONSABLE: 'Responsable',
  ENSEIGNANT: 'Enseignant',
  TECHNICIEN: 'Technicien',
  FOURNISSEUR: 'Fournisseur',
};

const ROLE_COLORS: Record<string, string> = {
  ADMIN: '#6366f1',
  CHEF_DEPARTEMENT: '#0ea5e9',
  RESPONSABLE: '#10b981',
  ENSEIGNANT: '#f59e0b',
  TECHNICIEN: '#8b5cf6',
  FOURNISSEUR: '#ef4444',
};

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const { notifications, showNotification, removeNotification } = useNotifications();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPass, setChangingPass] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('infos');
  const [formData, setFormData] = useState({ prenom: '', nom: '' });
  
  const [passData, setPassData] = useState({ current: '', new: '', confirm: '' });
  const [showPass, setShowPass] = useState(false);
  const [isChangingPassMode, setIsChangingPassMode] = useState(false);

  useEffect(() => {
    if (user) fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    try {
      const response = await fetch(`http://localhost:8081/api/utilisateurs/${user.id}`, {
        headers: { 'Authorization': `Bearer ${user.accessToken}` }
      });
      if (response.ok) {
        const data = await response.json();
        setProfileData(data);
        setFormData({ prenom: data.prenom || '', nom: data.nom || '' });
      }
    } catch {
      showNotification('error', 'Erreur lors du chargement du profil');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.prenom || !formData.nom) {
      showNotification('error', 'Le prénom et le nom sont obligatoires');
      return;
    }
    setSaving(true);
    try {
      const response = await fetch(`http://localhost:8081/api/utilisateurs/${user.id}/profile`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${user.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        const updatedUser = await response.json();
        setProfileData(updatedUser);
        showNotification('success', 'Profil mis à jour avec succès');
      } else {
        const err = await response.json();
        showNotification('error', err.message || 'Erreur lors de la mise à jour');
      }
    } catch {
      showNotification('error', 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passData.new !== passData.confirm) {
      showNotification('error', 'Les mots de passe ne correspondent pas');
      return;
    }
    if (passData.new.length < 4) {
      showNotification('error', 'Le mot de passe doit faire au moins 4 caractères');
      return;
    }

    setChangingPass(true);
    try {
      const response = await fetch(`http://localhost:8081/api/utilisateurs/${user.id}/password`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${user.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ password: passData.new })
      });

      if (response.ok) {
        showNotification('success', 'Mot de passe modifié avec succès');
        setPassData({ current: '', new: '', confirm: '' });
        setIsChangingPassMode(false);
      } else {
        const err = await response.json();
        showNotification('error', err.message || 'Erreur lors du changement de mot de passe');
      }
    } catch {
      showNotification('error', 'Erreur lors de la communication avec le serveur');
    } finally {
      setChangingPass(false);
    }
  };

  const roleLabel = ROLE_LABELS[profileData?.role] || profileData?.role || '—';
  const roleColor = ROLE_COLORS[profileData?.role] || '#6366f1';
  const initials = `${profileData?.prenom?.[0] || ''}${profileData?.nom?.[0] || ''}`.toUpperCase();

  const tabs = [
    { key: 'infos', label: 'Informations', icon: User },
    { key: 'security', label: 'Sécurité', icon: Lock },
    { key: 'notifications', label: 'Notifications', icon: Bell },
  ];

  // Colors for dark mode
  const colors = {
    bg: isDark ? '#0f172a' : '#f8fafc',
    card: isDark ? '#1e293b' : '#ffffff',
    text: isDark ? '#f1f5f9' : '#0f172a',
    textMuted: isDark ? '#94a3b8' : '#64748b',
    border: isDark ? '#334155' : '#e2e8f0',
    input: isDark ? '#1e293b' : '#f8fafc',
    inputBorder: isDark ? '#334155' : '#e2e8f0',
    headerBorder: isDark ? '#334155' : '#f1f5f9',
    memberBg: isDark ? `${roleColor}15` : `${roleColor}08`,
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '12px', background: colors.bg }}>
        <Loader style={{ animation: 'spin 1s linear infinite', color: roleColor }} size={36} />
        <p style={{ color: colors.textMuted, fontSize: '14px', fontWeight: 500 }}>Chargement du profil…</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '32px', background: colors.bg, minHeight: '100vh', transition: 'background 0.3s' }}>
      <NotificationContainer notifications={notifications} removeNotification={removeNotification} />

      <div style={{ maxWidth: '960px', margin: '0 auto' }}>

        {/* Page Header */}
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: colors.text, margin: 0 }}>Mon Profil</h1>
          <p style={{ fontSize: '13px', color: colors.textMuted, marginTop: '4px' }}>Gérez vos informations personnelles et paramètres de compte.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '24px', alignItems: 'start' }}>

          {/* ── Left Column ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* Profile Card */}
            <div style={{ background: colors.card, borderRadius: '16px', border: `1px solid ${colors.border}`, overflow: 'hidden', boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.4)' : '0 1px 3px rgba(0,0,0,0.06)', transition: 'background 0.3s' }}>
              {/* Banner */}
              <div style={{ height: '72px', background: `linear-gradient(135deg, ${roleColor}22, ${roleColor}44)`, position: 'relative' }} />

              <div style={{ padding: '0 20px 20px', position: 'relative' }}>
                {/* Avatar */}
                <div style={{ position: 'relative', display: 'inline-block', marginTop: '-32px', marginBottom: '12px' }}>
                  <div style={{
                    width: '64px', height: '64px', borderRadius: '14px',
                    background: roleColor,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: `3px solid ${colors.card}`,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                    fontSize: '22px', fontWeight: 700, color: '#fff', letterSpacing: '1px'
                  }}>
                    {profileData?.photo
                      ? <img src={profileData.photo} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '11px' }} />
                      : initials || <User size={28} color="#fff" />
                    }
                  </div>
                  <button style={{
                    position: 'absolute', bottom: '-4px', right: '-4px',
                    width: '22px', height: '22px', borderRadius: '6px',
                    background: roleColor, border: `2px solid ${colors.card}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', color: '#fff'
                  }}>
                    <Camera size={11} />
                  </button>
                </div>

                <h2 style={{ fontSize: '15px', fontWeight: 700, color: colors.text, margin: '0 0 2px' }}>
                  {profileData?.prenom} {profileData?.nom}
                </h2>
                <span style={{
                  display: 'inline-block', fontSize: '11px', fontWeight: 600,
                  padding: '2px 8px', borderRadius: '20px',
                  background: `${roleColor}18`, color: roleColor
                }}>
                  {roleLabel}
                </span>

                {profileData?.email && (
                  <p style={{ fontSize: '12px', color: colors.textMuted, marginTop: '8px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Mail size={12} />
                    {profileData.email}
                  </p>
                )}

                {profileData?.departementNom && (
                  <p style={{ fontSize: '12px', color: colors.textMuted, marginTop: '4px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Briefcase size={12} />
                    {profileData.departementNom}
                  </p>
                )}

                <div style={{ height: '1px', background: colors.border, margin: '16px 0' }} />

                <button
                  onClick={logout}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    padding: '9px', borderRadius: '10px', border: `1px solid ${isDark ? '#450a0a' : '#fee2e2'}`,
                    background: isDark ? '#450a0a20' : '#fff5f5', color: '#ef4444', fontSize: '13px', fontWeight: 600,
                    cursor: 'pointer', transition: 'background 0.2s'
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = isDark ? '#450a0a40' : '#fee2e2')}
                  onMouseLeave={e => (e.currentTarget.style.background = isDark ? '#450a0a20' : '#fff5f5')}
                >
                  <LogOut size={15} />
                  Déconnexion
                </button>
              </div>
            </div>

            {/* Navigation */}
            <div style={{ background: colors.card, borderRadius: '16px', border: `1px solid ${colors.border}`, padding: '8px', boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.4)' : '0 1px 3px rgba(0,0,0,0.06)', transition: 'background 0.3s' }}>
              {tabs.map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '10px 12px', borderRadius: '10px', border: 'none',
                    background: activeTab === key ? `${roleColor}22` : 'transparent',
                    color: activeTab === key ? (isDark ? '#fff' : roleColor) : colors.textMuted,
                    fontSize: '13px', fontWeight: activeTab === key ? 700 : 500,
                    cursor: 'pointer', transition: 'all 0.15s', marginBottom: '2px'
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Icon size={15} />
                    {label}
                  </span>
                  {activeTab === key && <ChevronRight size={14} />}
                </button>
              ))}
            </div>
          </div>

          {/* ── Right Column ── */}
          <div style={{ background: colors.card, borderRadius: '16px', border: `1px solid ${colors.border}`, boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.4)' : '0 1px 3px rgba(0,0,0,0.06)', overflow: 'hidden', transition: 'background 0.3s' }}>

            {/* Tab Header */}
            <div style={{ padding: '20px 24px', borderBottom: `1px solid ${colors.headerBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: colors.text, margin: 0 }}>
                  {tabs.find(t => t.key === activeTab)?.label}
                </h3>
                <p style={{ fontSize: '12px', color: colors.textMuted, marginTop: '2px' }}>
                  {activeTab === 'infos' && 'Modifiez vos informations personnelles'}
                  {activeTab === 'security' && 'Gérez la sécurité de votre compte'}
                  {activeTab === 'notifications' && 'Configurez vos préférences de notification'}
                </p>
              </div>
              {activeTab === 'infos' && (
                <button
                  onClick={handleSave}
                  disabled={saving}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '8px 16px', borderRadius: '10px', border: 'none',
                    background: roleColor, color: '#fff',
                    fontSize: '13px', fontWeight: 600,
                    cursor: saving ? 'not-allowed' : 'pointer',
                    opacity: saving ? 0.7 : 1, transition: 'opacity 0.2s'
                  }}
                >
                  {saving ? <Loader size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={14} />}
                  Enregistrer
                </button>
              )}
            </div>

            <div style={{ padding: '24px' }}>

              {/* ── Informations Tab ── */}
              {activeTab === 'infos' && (
                <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    {/* Prénom */}
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>
                        Prénom
                      </label>
                      <div style={{ position: 'relative' }}>
                        <User style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: colors.textMuted }} size={15} />
                        <input
                          type="text"
                          value={formData.prenom}
                          onChange={e => setFormData(p => ({ ...p, prenom: e.target.value }))}
                          style={{
                            width: '100%', paddingLeft: '36px', paddingRight: '12px', paddingTop: '10px', paddingBottom: '10px',
                            borderRadius: '10px', border: `1px solid ${colors.inputBorder}`,
                            fontSize: '13px', fontWeight: 500, color: colors.text,
                            background: colors.input, outline: 'none', boxSizing: 'border-box'
                          }}
                          onFocus={e => { e.currentTarget.style.borderColor = roleColor; e.currentTarget.style.background = isDark ? '#1e293b' : '#fff'; }}
                          onBlur={e => { e.currentTarget.style.borderColor = colors.inputBorder; e.currentTarget.style.background = colors.input; }}
                        />
                      </div>
                    </div>

                    {/* Nom */}
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>
                        Nom
                      </label>
                      <div style={{ position: 'relative' }}>
                        <User style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: colors.textMuted }} size={15} />
                        <input
                          type="text"
                          value={formData.nom}
                          onChange={e => setFormData(p => ({ ...p, nom: e.target.value }))}
                          style={{
                            width: '100%', paddingLeft: '36px', paddingRight: '12px', paddingTop: '10px', paddingBottom: '10px',
                            borderRadius: '10px', border: `1px solid ${colors.inputBorder}`,
                            fontSize: '13px', fontWeight: 500, color: colors.text,
                            background: colors.input, outline: 'none', boxSizing: 'border-box'
                          }}
                          onFocus={e => { e.currentTarget.style.borderColor = roleColor; e.currentTarget.style.background = isDark ? '#1e293b' : '#fff'; }}
                          onBlur={e => { e.currentTarget.style.borderColor = colors.inputBorder; e.currentTarget.style.background = colors.input; }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>
                      Email professionnel
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Mail style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: colors.textMuted }} size={15} />
                      <input
                        type="email"
                        readOnly
                        value={profileData?.email || ''}
                        style={{
                          width: '100%', paddingLeft: '36px', paddingRight: '12px', paddingTop: '10px', paddingBottom: '10px',
                          borderRadius: '10px', border: `1px solid ${colors.inputBorder}`,
                          fontSize: '13px', color: colors.textMuted,
                          background: isDark ? '#0f172a' : '#f1f5f9', outline: 'none', cursor: 'not-allowed', boxSizing: 'border-box'
                        }}
                      />
                    </div>
                  </div>

                  {/* Read-only info grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    {/* Département */}
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>
                        Département
                      </label>
                      <div style={{ position: 'relative' }}>
                        <Briefcase style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: colors.textMuted }} size={15} />
                        <input
                          type="text"
                          readOnly
                          value={profileData?.departementNom || 'N/A'}
                          style={{
                            width: '100%', paddingLeft: '36px', paddingRight: '12px', paddingTop: '10px', paddingBottom: '10px',
                            borderRadius: '10px', border: `1px solid ${colors.inputBorder}`,
                            fontSize: '13px', color: colors.textMuted,
                            background: isDark ? '#0f172a' : '#f1f5f9', outline: 'none', cursor: 'not-allowed', boxSizing: 'border-box'
                          }}
                        />
                      </div>
                    </div>

                    {/* Rôle */}
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>
                        Rôle Système
                      </label>
                      <div style={{ position: 'relative' }}>
                        <Shield style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: colors.textMuted }} size={15} />
                        <input
                          type="text"
                          readOnly
                          value={roleLabel}
                          style={{
                            width: '100%', paddingLeft: '36px', paddingRight: '12px', paddingTop: '10px', paddingBottom: '10px',
                            borderRadius: '10px', border: `1px solid ${colors.inputBorder}`,
                            fontSize: '13px', color: colors.textMuted,
                            background: isDark ? '#0f172a' : '#f1f5f9', outline: 'none', cursor: 'not-allowed', boxSizing: 'border-box'
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Member since */}
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '14px 16px', borderRadius: '12px',
                    background: colors.memberBg, border: `1px solid ${roleColor}20`
                  }}>
                    <div style={{
                      width: '36px', height: '36px', borderRadius: '10px',
                      background: `${roleColor}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: roleColor
                    }}>
                      <Calendar size={17} />
                    </div>
                    <div>
                      <p style={{ fontSize: '12px', fontWeight: 700, color: colors.text, margin: 0 }}>Membre depuis</p>
                      <p style={{ fontSize: '12px', color: colors.textMuted, margin: '2px 0 0' }}>
                        {profileData?.dateCreation
                          ? new Date(profileData.dateCreation).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
                          : 'Non définie'}
                      </p>
                    </div>
                  </div>
                </form>
              )}

              {/* ── Security Tab ── */}
              {activeTab === 'security' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {/* Change password card */}
                  <div style={{
                    padding: '20px', borderRadius: '16px', border: `1px solid ${colors.border}`, background: colors.input
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: isChangingPassMode ? '20px' : '0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: isDark ? '#0f172a' : '#fff', border: `1px solid ${colors.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: roleColor }}>
                          <Lock size={17} />
                        </div>
                        <div>
                          <p style={{ fontSize: '13px', fontWeight: 700, color: colors.text, margin: 0 }}>Mot de passe</p>
                          <p style={{ fontSize: '12px', color: colors.textMuted, margin: '2px 0 0' }}>Sécurisez votre compte</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => setIsChangingPassMode(!isChangingPassMode)}
                        style={{
                          padding: '7px 14px', borderRadius: '8px',
                          border: `1px solid ${isChangingPassMode ? colors.border : roleColor}`, 
                          background: isChangingPassMode ? colors.card : `${roleColor}15`,
                          fontSize: '12px', fontWeight: 600, color: isChangingPassMode ? colors.textMuted : roleColor,
                          cursor: 'pointer', transition: 'all 0.2s'
                        }}
                      >
                        {isChangingPassMode ? 'Annuler' : 'Modifier'}
                      </button>
                    </div>

                    {isChangingPassMode && (
                      <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: '16px', borderTop: `1px solid ${colors.border}`, paddingTop: '20px' }}>
                        {/* New Password */}
                        <div>
                          <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: colors.textMuted, textTransform: 'uppercase', marginBottom: '6px' }}>
                            Nouveau mot de passe
                          </label>
                          <div style={{ position: 'relative' }}>
                            <Lock style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: colors.textMuted }} size={15} />
                            <input
                              type={showPass ? 'text' : 'password'}
                              value={passData.new}
                              onChange={e => setPassData(p => ({ ...p, new: e.target.value }))}
                              placeholder="••••••••"
                              style={{
                                width: '100%', padding: '10px 40px 10px 36px',
                                borderRadius: '10px', border: `1px solid ${colors.border}`,
                                fontSize: '13px', color: colors.text, background: isDark ? '#0f172a' : '#fff', outline: 'none', boxSizing: 'border-box'
                              }}
                              autoFocus
                            />
                            <button 
                              type="button"
                              onClick={() => setShowPass(!showPass)}
                              style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'none', color: colors.textMuted, cursor: 'pointer', padding: 0 }}
                            >
                              {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                            </button>
                          </div>
                        </div>

                        {/* Confirm Password */}
                        <div>
                          <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: colors.textMuted, textTransform: 'uppercase', marginBottom: '6px' }}>
                            Confirmer le mot de passe
                          </label>
                          <div style={{ position: 'relative' }}>
                            <Lock style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: colors.textMuted }} size={15} />
                            <input
                              type={showPass ? 'text' : 'password'}
                              value={passData.confirm}
                              onChange={e => setPassData(p => ({ ...p, confirm: e.target.value }))}
                              placeholder="••••••••"
                              style={{
                                width: '100%', padding: '10px 40px 10px 36px',
                                borderRadius: '10px', border: `1px solid ${colors.border}`,
                                fontSize: '13px', color: colors.text, background: isDark ? '#0f172a' : '#fff', outline: 'none', boxSizing: 'border-box'
                              }}
                            />
                          </div>
                        </div>

                        <button
                          type="submit"
                          disabled={changingPass}
                          style={{
                            width: '100%', padding: '10px', borderRadius: '10px', border: 'none',
                            background: roleColor, color: '#fff', fontSize: '13px', fontWeight: 700,
                            cursor: changingPass ? 'not-allowed' : 'pointer', opacity: changingPass ? 0.7 : 1,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '4px'
                          }}
                        >
                          {changingPass ? <Loader size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={14} />}
                          Mettre à jour le mot de passe
                        </button>
                      </form>
                    )}
                  </div>

                  {/* 2FA — disabled */}
                  <div style={{
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    padding: '16px 20px', 
                    borderRadius: '16px', 
                    border: `1px solid ${colors.border}`, 
                    background: colors.input,
                    opacity: 0.5
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: isDark ? '#0f172a' : '#fff', border: `1px solid ${colors.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.textMuted }}>
                        <Shield size={17} />
                      </div>
                      <div>
                        <p style={{ fontSize: '13px', fontWeight: 600, color: colors.text, margin: 0 }}>Double authentification</p>
                        <p style={{ fontSize: '12px', color: colors.textMuted, margin: '2px 0 0' }}>Bientôt disponible</p>
                      </div>
                    </div>
                    <div style={{ width: '40px', height: '22px', borderRadius: '11px', background: isDark ? '#334155' : '#e2e8f0', position: 'relative' }}>
                      <div style={{ position: 'absolute', top: '3px', left: '3px', width: '16px', height: '16px', borderRadius: '50%', background: isDark ? '#1e293b' : '#fff' }} />
                    </div>
                  </div>
                </div>
              )}

              {/* ── Notifications Tab ── */}
              {activeTab === 'notifications' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {[
                    { label: "Emails d'activité", enabled: true },
                    { label: "Alertes système", enabled: true },
                    { label: "Nouveaux messages", enabled: false },
                    { label: "Mises à jour de ressources", enabled: false },
                  ].map((pref, i) => (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '14px 4px', borderBottom: i < 3 ? `1px solid ${colors.border}` : 'none'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Bell size={15} style={{ color: pref.enabled ? roleColor : colors.textMuted }} />
                        <span style={{ fontSize: '13px', fontWeight: 500, color: colors.text }}>{pref.label}</span>
                      </div>
                      <div style={{
                        width: '40px', height: '22px', borderRadius: '11px',
                        background: pref.enabled ? roleColor : (isDark ? '#334155' : '#e2e8f0'),
                        position: 'relative', cursor: 'pointer', transition: 'background 0.2s'
                      }}>
                        <div style={{
                          position: 'absolute', top: '3px',
                          left: pref.enabled ? '21px' : '3px',
                          width: '16px', height: '16px',
                          borderRadius: '50%', background: '#fff',
                          transition: 'left 0.2s',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.15)'
                        }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}

            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default ProfilePage;
