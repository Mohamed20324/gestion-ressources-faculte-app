import { useState, useEffect } from 'react';
import {
  Video,
  Search,
  Plus,
  Calendar as CalendarIcon,
  Clock,
  Edit,
  CheckCircle2,
  Clock3,
  X,
  Loader,
  Info,
  Package,
  ChevronRight,
  Trash2
} from 'lucide-react';
import { NotificationContainer } from '../../../components/Notification';
import { useNotifications } from '../../../hooks/useNotifications';
import { api } from '../../../services/api';
import { useAuth } from '../../../hooks/useAuth';

interface Reunion {
  id: number;
  date: any;
  heure: string;
  statut: string;
  departementId?: number;
  chefId?: number;
}

interface Besoin {
  id: number;
  reunionId: number;
  typeRessourceId: number;
  quantite: number;
  statut: string;
  enseignantId?: number;
}

const MeetingsPage = () => {
  const { user } = useAuth();
  const { notifications, showNotification, removeNotification } = useNotifications();
  const [meetings, setMeetings] = useState<Reunion[]>([]);
  const [besoins, setBesoins] = useState<Besoin[]>([]);
  const [typesRessources, setTypesRessources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<Reunion | null>(null);
  const [editingMeeting, setEditingMeeting] = useState<Reunion | null>(null);
  const [saving, setSaving] = useState(false);

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
      // 1. Get user details
      const userRes = await fetch(`http://localhost:8081/api/utilisateurs/${user.id}`, {
        headers: {
          'Authorization': `Bearer ${user.accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (userRes.ok) {
        const data = await userRes.json();
        setUserData(data);
        
        if (data.departementId) {
          const [meetingsRes, besoinsRes, typesRes] = await Promise.all([
            api.getReunionsByDepartement(data.departementId),
            api.getBesoinsByDepartement(data.departementId),
            api.getAllTypesRessources()
          ]);
          
          if (meetingsRes.ok) setMeetings(await meetingsRes.json());
          if (besoinsRes.ok) setBesoins(await besoinsRes.json());
          if (typesRes.ok) setTypesRessources(await typesRes.json());
        }
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
    setEditingMeeting(null);
    setFormData({ date: today, heure: '08:00', statut: 'PLANIFIEE' });
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

  const handleShowDetails = (meeting: Reunion) => {
    setSelectedMeeting(meeting);
    setIsDetailsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userData?.departementId) return;

    setSaving(true);
    try {
      const payload = {
        ...formData,
        departementId: userData.departementId,
        chefId: user.id
      };

      let response;
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
        showNotification('error', 'Erreur lors de l\'enregistrement');
      }
    } catch (error) {
      showNotification('error', 'Erreur technique');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelMeeting = async (id: number) => {
    if (!window.confirm('Voulez-vous vraiment annuler cette réunion ?')) return;
    try {
      const response = await api.updateReunion(id, { statut: 'ANNULEE' });
      if (response.ok) {
        showNotification('success', 'Réunion annulée');
        fetchData();
      }
    } catch (error) {
      showNotification('error', 'Erreur technique');
    }
  };

  const handleDeleteBesoin = async (id: number) => {
    if (!window.confirm('Voulez-vous vraiment supprimer ce besoin ?')) return;
    try {
      const response = await api.deleteBesoin(id);
      if (response.ok) {
        showNotification('success', 'Besoin supprimé');
        fetchData();
      } else {
        showNotification('error', 'Erreur lors de la suppression');
      }
    } catch (error) {
      showNotification('error', 'Erreur technique');
    }
  };

  const filteredMeetings = meetings.filter(m => {
    const matchesSearch = m.id.toString().includes(searchTerm) ||
      (m.date && JSON.stringify(m.date).includes(searchTerm));
    const matchesStatus = statusFilter === 'Tous' || m.statut === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const currentMeetings = filteredMeetings.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getMeetingRealStatus = (meeting: Reunion) => {
    if (meeting.statut === 'ANNULEE' || meeting.statut === 'VALIDEE') return meeting.statut;

    const now = new Date();
    let mDate: Date;
    
    if (Array.isArray(meeting.date)) {
      mDate = new Date(meeting.date[0], meeting.date[1] - 1, meeting.date[2]);
    } else {
      mDate = new Date(meeting.date);
    }

    // Parse meeting time (e.g., "08:30")
    const [hours, minutes] = meeting.heure.split(':').map(Number);
    mDate.setHours(hours, minutes, 0, 0);

    // End of meeting (assume 2 hours duration)
    const mEndDate = new Date(mDate);
    mEndDate.setHours(mEndDate.getHours() + 2);

    if (now > mEndDate) return 'TERMINÉE';
    if (now >= mDate && now <= mEndDate) return 'EN_COURS';
    return meeting.statut;
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'PLANIFIEE': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'EN_COURS': return 'bg-green-50 text-green-600 border-green-100 animate-pulse';
      case 'VALIDEE': return 'bg-purple-50 text-purple-600 border-purple-100';
      case 'TERMINÉE': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'ANNULEE': return 'bg-red-50 text-red-600 border-red-100';
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
      if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
      return new Date(date).toLocaleDateString('fr-FR');
    } catch (e) { return date; }
  };

  return (
    <div className="p-8 bg-gray-50/30 min-h-screen">
      <NotificationContainer notifications={notifications} removeNotification={removeNotification} />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <Video className="text-purple-600" size={32} />
            Mes Réunions de Département
          </h1>
          <p className="text-gray-500 mt-1">Suivi des séances et des besoins associés.</p>
        </div>

        {user?.role === 'CHEF_DEPARTEMENT' && (
          <button
            onClick={handleOpenCreate}
            className="px-6 py-3 bg-purple-600 text-white rounded-2xl font-bold hover:bg-purple-700 transition-all shadow-lg shadow-purple-100 flex items-center gap-2"
          >
            <Plus size={20} />
            Programmer Réunion
          </button>
        )}
      </div>

      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm mb-6 flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Rechercher une réunion..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all text-sm font-medium"
        >
          <option value="Tous">Tous les statuts</option>
          <option value="PLANIFIEE">Planifiée</option>
          <option value="EN_COURS">En cours</option>
          <option value="VALIDEE">Validée</option>
          <option value="ANNULEE">Annulée</option>
        </select>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-purple-600 gap-4">
          <Loader className="animate-spin" size={48} />
          <p className="text-gray-500 font-medium">Chargement des séances...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
          {currentMeetings.map((meeting) => {
            const meetingBesoins = besoins.filter(b => b.reunionId === meeting.id);
            const realStatus = getMeetingRealStatus(meeting);
            return (
              <div key={meeting.id} className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all group relative overflow-hidden flex flex-col h-full">
                <div className="flex items-center justify-between mb-4">
                  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${getStatusStyle(realStatus)} flex items-center gap-1.5`}>
                    {realStatus === 'EN_COURS' ? <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /> : <Clock3 size={14} />}
                    {realStatus}
                  </span>
                  <span className="text-[10px] font-bold text-gray-400">ID: #{meeting.id}</span>
                </div>

                <h3 className="text-lg font-bold text-gray-900 mb-6 group-hover:text-purple-600 transition-colors">
                  Réunion de Concertation
                </h3>

                <div className="space-y-4 mb-8 flex-1">
                  <div className="flex items-center gap-3 text-gray-600">
                    <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600 font-bold text-xs">
                      <CalendarIcon size={16} />
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase">Date</p>
                      <p className="text-xs font-bold">{formatDate(meeting.date)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-gray-600">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-xs">
                      <Clock size={16} />
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase">Heure</p>
                      <p className="text-xs font-bold">{meeting.heure}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-gray-600 border-t border-gray-50 pt-4">
                    <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
                      <Package size={16} />
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase">Besoins associés</p>
                      <p className="text-xs font-bold">{meetingBesoins.length} ressource(s) demandée(s)</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-gray-50 gap-2">
                  <button
                    onClick={() => handleShowDetails(meeting)}
                    className="flex-1 py-2 px-4 bg-gray-50 hover:bg-purple-50 text-gray-600 hover:text-purple-600 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2"
                  >
                    Voir Besoins <ChevronRight size={14} />
                  </button>
                  
                  {user?.role === 'CHEF_DEPARTEMENT' && (
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleOpenEdit(meeting)}
                        className="p-2 text-purple-600 hover:bg-purple-50 rounded-xl transition-colors"
                      >
                        <Edit size={16} />
                      </button>
                      {meeting.statut !== 'ANNULEE' && (
                        <button
                          onClick={() => handleCancelMeeting(meeting.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          {currentMeetings.length === 0 && (
             <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-dashed border-gray-200">
               <Video className="mx-auto text-gray-200 mb-4" size={48} />
               <p className="text-gray-500 font-medium">Aucune réunion trouvée.</p>
             </div>
          )}
        </div>
      )}

      {/* Details Modal (Associated Needs) */}
      {isDetailsModalOpen && selectedMeeting && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-purple-600 text-white">
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-3">
                  <Package size={24} />
                  Besoins - Réunion #{selectedMeeting.id}
                </h2>
                <p className="text-purple-100 text-sm mt-1">{formatDate(selectedMeeting.date)} à {selectedMeeting.heure}</p>
              </div>
              <button onClick={() => setIsDetailsModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <X size={28} />
              </button>
            </div>

            <div className="p-8 max-h-[60vh] overflow-y-auto">
              {besoins.filter(b => b.reunionId === selectedMeeting.id).length > 0 ? (
                <div className="space-y-4">
                  {besoins.filter(b => b.reunionId === selectedMeeting.id).map((b) => (
                    <div key={b.id} className="bg-gray-50 rounded-2xl p-4 border border-gray-100 flex items-center justify-between group hover:bg-white hover:shadow-md transition-all">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-purple-600 shadow-sm">
                          <Package size={20} />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">
                            {typesRessources.find(t => t.id === b.typeRessourceId)?.libelle || 'Type Inconnu'}
                          </p>
                          <p className="text-xs text-gray-400">Quantité: {b.quantite}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${b.statut === 'VALIDE' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                          {b.statut}
                        </span>
                        {b.enseignantId === user.id && b.statut === 'EN_ATTENTE' && (
                          <button 
                            onClick={() => handleDeleteBesoin(b.id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                            title="Supprimer mon besoin"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-20 text-center text-gray-400">
                  <Package className="mx-auto mb-4 opacity-20" size={48} />
                  <p className="italic">Aucun besoin n'a encore été associé à cette réunion.</p>
                </div>
              )}
            </div>
            
            <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end">
              <button onClick={() => setIsDetailsModalOpen(false)} className="px-8 py-3 bg-white border border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition-colors shadow-sm">
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Creation/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">
                {editingMeeting ? 'Modifier la Réunion' : 'Programmer une Réunion'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5 relative">
                  <label className="text-sm font-bold text-gray-700">Date de Réunion</label>
                  <div 
                    className="relative cursor-pointer group/date"
                    onClick={(e) => {
                      const input = e.currentTarget.querySelector('input');
                      if (input && 'showPicker' in input) {
                        (input as any).showPicker();
                      }
                    }}
                  >
                    <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-400 group-hover/date:text-purple-600 transition-colors pointer-events-none" size={18} />
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full pl-11 pr-4 py-2.5 bg-purple-50/30 border border-purple-100 rounded-xl focus:ring-2 focus:ring-purple-500 focus:bg-white outline-none font-bold text-purple-900 transition-all cursor-pointer"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-gray-700">Heure de la Séance</label>
                  <select
                    value={formData.heure}
                    onChange={(e) => setFormData({ ...formData, heure: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none font-medium"
                    required
                  >
                    <option value="">Choisir un créneau...</option>
                    <option value="08:30">08:30 - 10:30</option>
                    <option value="10:30">10:30 - 12:30</option>
                    <option value="14:30">14:30 - 16:30</option>
                    <option value="16:30">16:30 - 18:30</option>
                  </select>
                </div>
              </div>

              {editingMeeting && (
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-gray-700">Statut</label>
                  <select
                    value={formData.statut}
                    onChange={(e) => setFormData({ ...formData, statut: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                  >
                    <option value="PLANIFIEE">Planifiée</option>
                    <option value="EN_COURS">En cours</option>
                    <option value="VALIDEE">Validée</option>
                    <option value="ANNULEE">Annulée</option>
                  </select>
                </div>
              )}

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 px-4 border border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-50 transition-colors">
                  Annuler
                </button>
                <button type="submit" disabled={saving} className="flex-1 py-3 px-4 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-all flex items-center justify-center gap-2">
                  {saving ? <Loader className="animate-spin" size={18} /> : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MeetingsPage;
