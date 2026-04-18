import { useState, useEffect } from 'react';
import { 
  Video,  
  Plus, 
  Calendar as CalendarIcon, 
  Clock, 
  Edit, 
  Trash2,
  Clock3,
  X,
  Loader,
  AlertTriangle
} from 'lucide-react';
import { NotificationContainer } from '../../components/Notification';
import { useNotifications } from '../../hooks/useNotifications';
import { api } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';

interface Reunion {
  id: number;
  date: any;
  heure: string;
  statut: string;
  departementId?: number;
  chefId?: number;
}

const MeetingsPage = () => {
  const { user } = useAuth();
  const { notifications, showNotification, removeNotification } = useNotifications();
  const [meetings, setMeetings] = useState<Reunion[]>([]);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState<Reunion | null>(null);
  const [meetingToDelete, setMeetingToDelete] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    date: '',
    heure: '',
    statut: 'PLANIFIEE'
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Tous');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // 1. Obtenir les détails du Chef (pour son departementId)
      let currentDeptId = userData?.departementId;
      if (!currentDeptId) {
          const userRes = await fetch(`http://localhost:8081/api/utilisateurs/${user.id}`, {
            headers: {
              'Authorization': `Bearer ${user.accessToken}`,
              'Content-Type': 'application/json'
            }
          });
          if (userRes.ok) {
              const data = await userRes.json();
              setUserData(data);
              currentDeptId = data.departementId;
          }
      }

      if (currentDeptId) {
          const meetingsRes = await api.getReunionsByDepartement(currentDeptId);
          if (meetingsRes.ok) setMeetings(await meetingsRes.json());
      }

    } catch (error) {
      showNotification('error', 'Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleOpenCreate = () => {
    const today = new Date().toISOString().split('T')[0];
    const now = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }).replace('h', ':');
    setEditingMeeting(null);
    setFormData({ date: today, heure: now, statut: 'PLANIFIEE' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (meeting: Reunion) => {
    setEditingMeeting(meeting);
    let dateStr = meeting.date;
    if (Array.isArray(meeting.date)) {
      const [y, m, d] = meeting.date;
      dateStr = `${y}-${m.toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`;
    }
    setFormData({
      date: dateStr,
      heure: meeting.heure,
      statut: meeting.statut
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.date || !formData.heure || !userData?.departementId) {
      showNotification('error', 'Veuillez remplir tous les champs obligatoires');
      return;
    }

    setSaving(true);
    try {
      let response;
      const payload = {
        ...formData,
        departementId: userData.departementId,
        chefId: user.id
      };

      if (editingMeeting) {
        response = await api.updateReunion(editingMeeting.id, payload);
      } else {
        response = await api.createReunion(payload);
      }

      if (response.ok) {
        showNotification('success', editingMeeting ? 'Réunion modifiée' : 'Réunion programmée');
        setIsModalOpen(false);
        fetchData();
      } else {
        const error = await response.json();
        showNotification('error', error.message || 'Erreur lors de l\'enregistrement');
      }
    } catch (error) {
      showNotification('error', 'Erreur de connexion');
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!meetingToDelete) return;
    setDeleting(true);
    try {
      const response = await api.deleteReunion(meetingToDelete);
      if (response.ok) {
        showNotification('success', 'Réunion supprimée avec succès');
        setIsDeleteModalOpen(false);
        fetchData();
      } else {
        showNotification('error', 'Erreur lors de la suppression');
      }
    } catch (error) {
      showNotification('error', 'Erreur de connexion');
    } finally {
      setDeleting(false);
      setMeetingToDelete(null);
    }
  };

  const filteredMeetings = meetings.filter(m => {
    const matchesSearch = m.id.toString().includes(searchTerm) || 
                         (m.date && JSON.stringify(m.date).includes(searchTerm));
    const matchesStatus = statusFilter === 'Tous' || m.statut === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredMeetings.length / itemsPerPage);
  const currentMeetings = filteredMeetings.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'PLANIFIEE': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'EN_COURS': return 'bg-green-50 text-green-600 border-green-100';
      case 'VALIDEE': return 'bg-gray-50 text-gray-600 border-gray-100';
      default: return 'bg-gray-50 text-gray-600';
    }
  };

  const formatDate = (date: any) => {
    if (!date) return 'N/A';
    if (Array.isArray(date)) {
      return `${date[2].toString().padStart(2, '0')}/${date[1].toString().padStart(2, '0')}/${date[0]}`;
    }
    try {
      const parts = date.split('-');
      if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
      }
      const d = new Date(date);
      return d.toLocaleDateString('fr-FR');
    } catch (e) {
      return date;
    }
  };

  return (
    <div className="p-8 bg-gray-50/30 min-h-screen">
      <NotificationContainer notifications={notifications} removeNotification={removeNotification} />

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <Video className="text-purple-600" size={32} />
            Mes Réunions de Département
          </h1>
          <p className="text-gray-500 mt-1">Planifiez et gérez les réunions pour valider les besoins de votre département.</p>
        </div>

        <button 
          onClick={handleOpenCreate}
          className="fixed bottom-8 right-8 w-12 h-12 bg-purple-600 text-white rounded-full shadow-2xl hover:bg-purple-700 hover:scale-110 transition-all flex items-center justify-center z-[50] group"
          title="Programmer une réunion"
        >
          <Plus size={24} />
          <span className="absolute right-full mr-3 px-3 py-1 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            Programmer Réunion
          </span>
        </button>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center py-20 text-purple-600">
          <Loader className="animate-spin" size={40} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
          {currentMeetings.map((meeting) => (
            <div key={meeting.id} className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${getStatusStyle(meeting.statut)} flex items-center gap-1.5`}>
                  {meeting.statut === 'EN_COURS' ? <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /> : <Clock3 size={14} />}
                  {meeting.statut}
                </span>
                <span className="text-[10px] font-bold text-gray-400">ID: #{meeting.id}</span>
              </div>

              <h3 className="text-lg font-bold text-gray-900 mb-6 group-hover:text-purple-600 transition-colors">
                Session de Validation
              </h3>

              <div className="space-y-4 mb-6">
                <div className="flex items-center gap-3 text-gray-600">
                  <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600">
                    <CalendarIcon size={16} />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase">Date</p>
                    <p className="text-xs font-bold">{formatDate(meeting.date)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-gray-600">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                    <Clock size={16} />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase">Heure</p>
                    <p className="text-xs font-bold">{meeting.heure}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end pt-6 border-t border-gray-50 gap-2">
                <button 
                  onClick={() => handleOpenEdit(meeting)}
                  className="p-2 text-purple-600 hover:bg-purple-50 rounded-xl transition-colors"
                >
                  <Edit size={16} />
                </button>
                <button 
                  className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors" 
                  onClick={() => { setMeetingToDelete(meeting.id); setIsDeleteModalOpen(true); }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
          {!loading && currentMeetings.length === 0 && (
             <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-dashed border-gray-200">
                <Video className="mx-auto text-gray-200 mb-4" size={48} />
                <p className="text-gray-500 font-medium">Aucune réunion programmée pour votre département.</p>
             </div>
          )}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                {editingMeeting ? 'Modifier la Réunion' : 'Programmer une Réunion'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-gray-700 ml-1">Date</label>
                  <div className="relative">
                    <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                    <input 
                      type="date" 
                      value={formData.date}
                      onChange={(e) => setFormData({...formData, date: e.target.value})}
                      onClick={(e) => (e.target as any).showPicker?.()}
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all cursor-pointer"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-gray-700 ml-1">Heure</label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                    <input 
                      type="time" 
                      value={formData.heure}
                      onChange={(e) => setFormData({...formData, heure: e.target.value})}
                      onClick={(e) => (e.target as any).showPicker?.()}
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all cursor-pointer"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-gray-700 ml-1">Statut</label>
                <select 
                  value={formData.statut}
                  onChange={(e) => setFormData({...formData, statut: e.target.value})}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                >
                  <option value="PLANIFIEE">Planifiée</option>
                  <option value="EN_COURS">En cours</option>
                  <option value="VALIDEE">Validée</option>
                </select>
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 px-4 border border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-50 transition-colors">
                  Annuler
                </button>
                <button type="submit" disabled={saving} className="flex-1 py-3 px-4 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                  {saving ? <Loader className="animate-spin" size={18} /> : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl p-8 text-center">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 text-red-600">
              <AlertTriangle size={32} />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Supprimer la réunion ?</h2>
            <p className="text-gray-500 mb-8 text-sm">Cette action supprimera définitivement la réunion programmée.</p>
            <div className="flex gap-3">
              <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 py-3 px-4 bg-gray-100 rounded-xl font-bold text-gray-600 hover:bg-gray-200 transition-colors">Annuler</button>
              <button onClick={handleConfirmDelete} disabled={deleting} className="flex-1 py-3 px-4 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all">Supprimer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MeetingsPage;
