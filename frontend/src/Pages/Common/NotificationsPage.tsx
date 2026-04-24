import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { 
  Bell, 
  CheckCircle2, 
  Clock, 
  MessageSquare, 
  Send, 
  X,
  AlertTriangle,
  Package,
  Info,
  ChevronRight,
  MoreVertical,
  Loader,
  RefreshCw
} from 'lucide-react';

interface Notification {
  id: number;
  message: string;
  dateEnvoi: string;
  type: string;
  lu: boolean;
  expediteurId: number;
  expediteurNom?: string;
}

const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  
  // Reply Modal
  const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);
  const [selectedNotif, setSelectedNotif] = useState<Notification | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleNotificationClick = (notif: Notification) => {
    if (!notif.lu) handleMarkAsRead(notif.id);

    // Deep linking based on type
    const role = user?.role;
    switch (notif.type) {
      case 'AFFECTATION':
        if (role === 'CHEF_DEPARTEMENT') navigate('/chef-departement/inventory');
        else if (role === 'ENSEIGNANT') navigate('/enseignant/affectations');
        else if (role === 'RESPONSABLE') navigate('/responsable/inventory');
        else if (role === 'TECHNICIEN') navigate('/technicien/inventory');
        break;
      case 'ACCEPTATION':
      case 'REJET':
        if (role === 'CHEF_DEPARTEMENT') navigate('/chef-departement/besoins');
        else if (role === 'ENSEIGNANT') navigate('/enseignant/besoins');
        break;
      case 'AVERTISSEMENT':
        if (role === 'RESPONSABLE') navigate('/responsable/reception');
        break;
      case 'REPONSE_FOURNISSEUR':
        if (role === 'RESPONSABLE') navigate('/responsable/notifications');
        break;
      case 'INFO':
        if (notif.message.includes('réunion')) {
            if (role === 'CHEF_DEPARTEMENT') navigate('/chef-departement/meetings');
            else if (role === 'RESPONSABLE') navigate('/responsable/meetings');
        }
        break;
      default:
        // No specific navigation
        break;
    }
  };

  const fetchNotifications = useCallback(async () => {
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    if (!storedUser.id) return;
    setUser(storedUser);

    try {
      const res = await api.getNotifications(storedUser.id);
      if (res.ok) {
        setNotifications(await res.json());
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Auto refresh every 30s
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const handleMarkAsRead = async (id: number) => {
    try {
      const res = await api.markNotificationRead(id);
      if (res.ok) {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, lu: true } : n));
      }
    } catch (error) {
      console.error("Error marking read:", error);
    }
  };

  const handleOpenReply = (notif: Notification) => {
    setSelectedNotif(notif);
    setIsReplyModalOpen(true);
  };

  const handleSendReply = async () => {
    if (!selectedNotif || !replyMessage.trim() || !user) return;
    setSubmitting(true);
    try {
      const res = await api.sendLateReply(selectedNotif.expediteurId, user.id, replyMessage);
      if (res.ok) {
        handleMarkAsRead(selectedNotif.id);
        setIsReplyModalOpen(false);
        setReplyMessage('');
        fetchNotifications();
      }
    } catch (error) {
      console.error("Error sending reply:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const getTypeStyles = (type: string) => {
    switch (type) {
      case 'AVERTISSEMENT': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'ACCEPTATION': return 'bg-green-50 text-green-600 border-green-100';
      case 'REJET': return 'bg-red-50 text-red-600 border-red-100';
      case 'AFFECTATION': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'REPONSE_FOURNISSEUR': return 'bg-purple-50 text-purple-600 border-purple-100';
      default: return 'bg-gray-50 text-gray-600 border-gray-100';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'AVERTISSEMENT': return <AlertTriangle size={18} />;
      case 'ACCEPTATION': return <CheckCircle2 size={18} />;
      case 'REJET': return <X size={18} />;
      case 'AFFECTATION': return <Package size={18} />;
      case 'REPONSE_FOURNISSEUR': return <MessageSquare size={18} />;
      default: return <Bell size={18} />;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader className="animate-spin text-purple-600 mb-4" size={40} />
        <p className="text-gray-500 font-medium animate-pulse">Chargement de vos notifications...</p>
      </div>
    );
  }

  const unreadCount = notifications.filter(n => !n.lu).length;

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-600 rounded-2xl shadow-lg shadow-purple-200">
              <Bell className="text-white" size={24} />
            </div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Notifications</h1>
          </div>
          <p className="text-gray-500 font-medium ml-1">Restez informé des activités du système</p>
        </div>

        <button 
          onClick={fetchNotifications}
          className="p-3 bg-white border border-gray-200 rounded-2xl hover:bg-gray-50 transition-all text-gray-600"
        >
          <RefreshCw size={20} />
        </button>
      </div>

      {unreadCount > 0 && (
        <div className="bg-purple-50 border border-purple-100 p-4 rounded-2xl flex items-center gap-3 text-purple-700">
          <Info size={20} />
          <span className="font-bold text-sm">Vous avez {unreadCount} notification{unreadCount > 1 ? 's' : ''} non lue{unreadCount > 1 ? 's' : ''}.</span>
        </div>
      )}

      {/* Notifications List */}
      <div className="space-y-4">
        {notifications.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[2.5rem] border-2 border-dashed border-gray-100">
            <Bell className="mx-auto text-gray-200 mb-4" size={64} />
            <p className="text-gray-400 font-bold">Aucune notification pour le moment.</p>
          </div>
        ) : (
          notifications.map((notif) => (
            <div 
              key={notif.id}
              onClick={() => handleNotificationClick(notif)}
              className={`group relative bg-white p-6 rounded-3xl border transition-all duration-300 cursor-pointer hover:shadow-xl hover:-translate-y-1 ${
                notif.lu ? 'border-gray-100 opacity-75' : 'border-purple-200 shadow-md ring-2 ring-purple-500/5'
              }`}
            >
              <div className="flex gap-5">
                <div className={`p-4 rounded-2xl shrink-0 ${getTypeStyles(notif.type)}`}>
                  {getTypeIcon(notif.type)}
                </div>

                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-black tracking-widest uppercase px-2 py-0.5 rounded-full ${getTypeStyles(notif.type)}`}>
                        {notif.type}
                      </span>
                      {!notif.lu && (
                        <span className="w-2 h-2 bg-purple-500 rounded-full animate-ping"></span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-gray-400 font-bold text-[10px]">
                      <Clock size={12} />
                      {new Date(notif.dateEnvoi).toLocaleDateString()}
                    </div>
                  </div>

                  <p className={`text-sm leading-relaxed ${notif.lu ? 'text-gray-500 font-medium' : 'text-gray-900 font-bold'}`}>
                    {notif.message}
                  </p>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs text-gray-400 font-medium italic">
                      De : {notif.expediteurNom || 'Système'}
                    </span>
                    
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {notif.type === 'AVERTISSEMENT' && user?.role === 'FOURNISSEUR' ? (
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleOpenReply(notif); }}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 text-white text-xs font-bold rounded-xl hover:bg-amber-700 transition-colors"
                        >
                          <MessageSquare size={14} />
                          Répondre
                        </button>
                      ) : (
                        <span className="flex items-center gap-1 text-purple-600 text-xs font-bold hover:underline">
                          Consulter <ChevronRight size={14} />
                        </span>
                      )}
                      <button className="p-2 text-gray-300 hover:text-gray-600">
                        <MoreVertical size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Reply Modal */}
      {isReplyModalOpen && selectedNotif && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md flex items-center justify-center z-[200] p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg p-10 shadow-2xl animate-in zoom-in duration-300">
            <div className="flex justify-between items-start mb-8">
              <div className="space-y-1">
                <h2 className="text-3xl font-black text-gray-900 tracking-tight">Répondre</h2>
                <p className="text-gray-500 font-medium">Concernant le retard de livraison</p>
              </div>
              <button onClick={() => setIsReplyModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-6">
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 text-sm text-gray-500 italic">
                "{selectedNotif.message}"
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Votre message</label>
                <textarea 
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder="Expliquez la raison du retard et donnez une nouvelle date..."
                  className="w-full p-5 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-purple-500 font-semibold min-h-[150px] resize-none"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  onClick={() => setIsReplyModalOpen(false)}
                  className="flex-1 py-5 border border-gray-200 rounded-2xl font-bold text-gray-500 hover:bg-gray-50 transition-all"
                >
                  Annuler
                </button>
                <button 
                  onClick={handleSendReply}
                  disabled={submitting || !replyMessage.trim()}
                  className="flex-1 py-5 bg-purple-600 text-white rounded-2xl font-bold hover:bg-purple-700 shadow-xl shadow-purple-200 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {submitting ? <Loader className="animate-spin" size={20} /> : <><Send size={20} /> Envoyer</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
