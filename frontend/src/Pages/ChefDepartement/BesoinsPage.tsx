import { useState, useEffect } from 'react';
import { 
  Plus, Search, Loader, FileText, XCircle, 
  CheckCircle, Clock, ChevronLeft, ChevronRight, 
  Edit2, Send, Package, Info, Monitor, Cpu, Database, HardDrive, Printer, Layers, Box, Trash2, AlertCircle, Truck, LinkIcon as Link
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { NotificationContainer } from '../../components/Notification';
import { useNotifications } from '../../hooks/useNotifications';

interface Besoin {
  id: number;
  typeRessourceId: number;
  quantite: number;
  statut: 'EN_ATTENTE' | 'VALIDE' | 'REJETE' | 'ENVOYE' | 'EN_LIVRAISON';
  departementId: number;
  reunionId?: number;
  enseignantId?: number;
  description?: string;
  categorie: 'STANDARD' | 'ORDINATEUR' | 'IMPRIMANTE';
  cpu?: string;
  ram?: string;
  disqueDur?: string;
  ecran?: string;
  vitesseImpression?: number;
  resolution?: string;
  marque?: string;
  descriptionTechnique?: string;
}

const BesoinsPage = () => {
  const { user } = useAuth();
  const { notifications, showNotification, removeNotification } = useNotifications();
  const [besoins, setBesoins] = useState<Besoin[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'ORDINATEUR' | 'IMPRIMANTE' | 'LIVRAISON' | 'AUTRES'>('ALL');
  const [viewFilter, setViewFilter] = useState<'ALL' | 'MINE'>('ALL');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [linkData, setLinkData] = useState<{besoinId: number | null, reunionId: string}>({besoinId: null, reunionId: ''});
  
  const [formData, setFormData] = useState({
    typeRessourceId: '',
    quantite: 1,
    reunionId: '',
    description: '',
    marque: '',
    cpu: '',
    ram: '',
    disqueDur: '',
    ecran: '',
    vitesseImpression: 0,
    resolution: '',
    descriptionTechnique: ''
  });

  const [typesRessources, setTypesRessources] = useState<any[]>([]);
  const [reunions, setReunions] = useState<any[]>([]);
  const [userData, setUserData] = useState<any>(null);
  const [professors, setProfessors] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      fetchInitialData();
    }
  }, [user]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const userRes = await fetch(`http://localhost:8081/api/utilisateurs/${user.id}`, {
        headers: {
          'Authorization': `Bearer ${user.accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      let deptId = null;
      if (userRes.ok) {
        const data = await userRes.json();
        setUserData(data);
        deptId = data.departementId;
      }

      const typesRes = await api.getAllTypesRessources();
      if (typesRes.ok) {
        setTypesRessources(await typesRes.json());
      }

      if (deptId) {
        const [profRes] = await Promise.all([
          api.getUsersByRole('ENSEIGNANT'),
          loadBesoins(deptId),
          loadReunions(deptId)
        ]);
        if (profRes.ok) {
          setProfessors(await profRes.json());
        }
      }
    } catch (error) {
      showNotification('error', 'Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const loadBesoins = async (id: number) => {
    try {
      const response = user.role === 'ENSEIGNANT' 
        ? await api.getBesoinsByEnseignant(user.id)
        : await api.getBesoinsByDepartement(id);

      if (response.ok) {
        let data = await response.json();
        // Filter out rejected needs from the list
        data = data.filter((b: Besoin) => b.statut !== 'REJETE');
        
        // Final safety filter for teachers
        if (user.role === 'ENSEIGNANT') {
          data = data.filter((b: Besoin) => b.enseignantId === user.id);
        } else if (user.role === 'CHEF_DEPARTEMENT') {
          // We keep all needs so the chef can see them even if not linked to a meeting
          // data = data.filter((b: Besoin) => !(b.enseignantId && !b.reunionId));
          
          // Sort: Needs WITH reunion first, then Teacher needs
          data.sort((a: Besoin, b: Besoin) => {
            if (a.reunionId && !b.reunionId) return -1;
            if (!a.reunionId && b.reunionId) return 1;
            if (a.enseignantId && !b.enseignantId) return -1;
            if (!a.enseignantId && b.enseignantId) return 1;
            return 0;
          });
        }
        setBesoins(data);
      }
    } catch (error) {
      console.error('Error loading besoins:', error);
    }
  };

  const loadReunions = async (deptId: number) => {
    try {
      const response = await api.getReunionsByDepartement(deptId);
      if (response.ok) {
        const data = await response.json();
        const activeReunions = data.filter((r: any) => r.statut === 'PLANIFIEE' || r.statut === 'EN_COURS');
        setReunions(activeReunions);
        if (activeReunions.length > 0 && !formData.reunionId) {
          setFormData(prev => ({ ...prev, reunionId: activeReunions[0].id.toString() }));
        }
      }
    } catch (error) {
      console.error('Error loading reunions:', error);
    }
  };

  const handleOpenModal = () => {
    setFormData({ 
      typeRessourceId: typesRessources[0]?.id?.toString() || '', 
      quantite: 1,
      reunionId: reunions[0]?.id?.toString() || '',
      description: '',
      marque: '',
      cpu: '',
      ram: '',
      disqueDur: '',
      ecran: '',
      vitesseImpression: 0,
      resolution: '',
      descriptionTechnique: ''
    });
    setIsEditMode(false);
    setEditingId(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (besoin: Besoin) => {
    setFormData({
      typeRessourceId: besoin.typeRessourceId.toString(),
      quantite: besoin.quantite,
      reunionId: besoin.reunionId?.toString() || '',
      description: besoin.description || '',
      marque: besoin.marque || '',
      cpu: besoin.cpu || '',
      ram: besoin.ram || '',
      disqueDur: besoin.disqueDur || '',
      ecran: besoin.ecran || '',
      vitesseImpression: besoin.vitesseImpression || 0,
      resolution: besoin.resolution || '',
      descriptionTechnique: besoin.descriptionTechnique || ''
    });
    setIsEditMode(true);
    setEditingId(besoin.id);
    setIsModalOpen(true);
  };

  const handleQuickLinkSubmit = async () => {
    if (!linkData.besoinId || !linkData.reunionId) return;
    const besoin = besoins.find(b => b.id === linkData.besoinId);
    if (!besoin) return;

    try {
      setSaving(true);
      const res = await api.updateBesoin(besoin.id, {
        ...besoin,
        reunionId: parseInt(linkData.reunionId)
      });
      if (res.ok) {
        showNotification('success', 'Besoin rattaché à la réunion avec succès');
        setLinkModalOpen(false);
        setLinkData({besoinId: null, reunionId: ''});
        const deptId = userData?.departementId;
        if (deptId) loadBesoins(deptId);
      } else {
        showNotification('error', 'Erreur lors du rattachement');
      }
    } catch (e) {
      showNotification('error', 'Erreur réseau');
    } finally {
      setSaving(false);
    }
  };

  const handleRejectBesoin = async (besoin: Besoin) => {
    if (!window.confirm('Voulez-vous rejeter ce besoin ? Il sera supprimé de la liste.')) return;
    try {
      console.log("Rejecting besoin:", besoin.id);
      const response = await api.updateBesoin(besoin.id, {
        ...besoin,
        statut: 'REJETE'
      });
      
      if (response.ok) {
        showNotification('success', 'Besoin rejeté et retiré de la liste');
        
        if (besoin.enseignantId) {
          api.createNotification({
            utilisateurId: besoin.enseignantId,
            titre: 'Besoin Rejeté',
            message: `Votre demande de ressource (#${besoin.id}) a été rejetée.`,
            type: 'ERROR'
          }).catch(e => console.error("Notif error:", e));
        }

        const deptId = userData?.departementId || besoins.find(b => b.id === besoin.id)?.departementId;
        if (deptId) loadBesoins(deptId);
      } else {
        const errorData = await response.text();
        console.error("Reject failed:", errorData);
        showNotification('error', 'Le serveur a refusé le rejet');
      }
    } catch (error) {
      console.error("Error in handleRejectBesoin:", error);
      showNotification('error', 'Erreur lors du rejet');
    }
  };

   const handleValidateBesoin = async (besoin: Besoin) => {
    // Vérification avant envoi
    if (!besoin.reunionId) {
      showNotification('error', 'Impossible de valider : Ce besoin n\'est rattaché à aucune réunion.');
      return;
    }

    // On peut aussi vérifier le statut de la réunion si on a les données
    const meeting = reunions.find(m => m.id === besoin.reunionId);
    if (meeting && meeting.statut !== 'VALIDEE') {
      showNotification('error', 'Impossible de valider : La réunion rattachée n\'est pas encore terminée.');
      return;
    }

    try {
      console.log("Validating besoin:", besoin.id);
      const response = await api.updateBesoin(besoin.id, {
        ...besoin,
        statut: 'VALIDE'
      });
      
      if (response.ok) {
        showNotification('success', 'Besoin validé');
        const deptId = userData?.departementId || besoins.find(b => b.id === besoin.id)?.departementId;
        if (deptId) loadBesoins(deptId);
      } else {
        const errorData = await response.text();
        console.error("Validation failed:", errorData);
        showNotification('error', 'Le serveur a refusé la validation');
      }
    } catch (error) {
      console.error("Error in handleValidateBesoin:", error);
      showNotification('error', 'Erreur de validation');
    }
  };

  const handleDeleteBesoin = (id: number) => {
    setItemToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    setSaving(true);
    try {
      const response = await api.deleteBesoin(itemToDelete);
      if (response.ok) {
        showNotification('success', 'Besoin supprimé définitivement');
        const deptId = userData?.departementId || besoins.find(b => b.id === itemToDelete)?.departementId;
        if (deptId) loadBesoins(deptId);
        setIsDeleteModalOpen(false);
        setItemToDelete(null);
      } else {
        showNotification('error', 'Erreur lors de la suppression');
      }
    } catch (error) {
      showNotification('error', 'Erreur technique');
    } finally {
      setSaving(false);
    }
  };

  const handleSendToResponsible = async () => {
    if (!userData?.departementId) return;
    setSaving(true);
    try {
      const needsToSend = besoins.filter(b => b.statut === 'VALIDE');
      if (needsToSend.length === 0) {
        showNotification('info', 'Aucun besoin validé à envoyer.');
        setSaving(false);
        return;
      }

      await Promise.all(needsToSend.map(b => 
        api.updateBesoin(b.id, { ...b, statut: 'ENVOYE' })
      ));

      showNotification('success', 'Besoins envoyés au responsable !');
      loadBesoins(userData.departementId);
    } catch (error) {
      showNotification('error', 'Erreur lors de l\'envoi');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const deptId = userData?.departementId || (isEditMode ? besoins.find(b => b.id === editingId)?.departementId : null);
    if (!deptId) {
      showNotification('error', 'Erreur: Département non identifié');
      return;
    }
    
    setSaving(true);
    try {
      const selectedType = typesRessources.find(t => t.id === parseInt(formData.typeRessourceId));
      const reunionId = formData.reunionId ? parseInt(formData.reunionId) : null;
      const payload = {
        typeRessourceId: parseInt(formData.typeRessourceId),
        quantite: formData.quantite,
        reunionId: reunionId,
        departementId: deptId,
        description: formData.description,
        statut: isEditMode ? (besoins.find(b => b.id === editingId)?.statut || 'EN_ATTENTE') : 'EN_ATTENTE',
        categorie: selectedType?.code === 'ORDINATEUR' ? 'ORDINATEUR' : (selectedType?.code === 'IMPRIMANTE' ? 'IMPRIMANTE' : 'STANDARD'),
        enseignantId: user.role === 'CHEF_DEPARTEMENT' ? (isEditMode ? besoins.find(b => b.id === editingId)?.enseignantId : null) : user.id,
        marque: formData.marque,
        cpu: formData.cpu,
        ram: formData.ram,
        disqueDur: formData.disqueDur,
        ecran: formData.ecran,
        vitesseImpression: formData.vitesseImpression,
        resolution: formData.resolution,
        descriptionTechnique: formData.descriptionTechnique
      };

      console.log("Submitting payload:", payload);

      const response = isEditMode && editingId
        ? await api.updateBesoin(editingId, { ...payload, id: editingId })
        : await api.createBesoin(payload);

      if (response.ok) {
        showNotification('success', isEditMode ? 'Besoin modifié' : 'Besoin soumis');
        setIsModalOpen(false);
        loadBesoins(deptId);
      } else {
        const errorMsg = await response.text();
        console.error("Submission failed:", errorMsg);
        showNotification('error', 'Erreur lors de la soumission');
      }
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      showNotification('error', 'Erreur technique');
    } finally {
      setSaving(false);
    }
  };

  const filteredBesoins = besoins.filter(b => {
    // Role based view filter for Chef
    if (user.role === 'CHEF_DEPARTEMENT') {
      if (viewFilter === 'MINE' && b.enseignantId) return false;
      if (viewFilter === 'ALL' && !b.enseignantId && besoins.some(other => other.enseignantId)) {
        // Optionnel: On peut choisir de cacher les besoins du chef dans la vue "Tous" 
        // s'il veut vraiment séparer les deux, mais généralement "Tous" veut dire tout.
        // Ici je vais laisser "Tous" afficher tout, et "MINE" filtrer.
      }
    }

    const type = typesRessources.find(t => t.id === b.typeRessourceId);
    const typeName = type?.libelle || '';
    const matchesSearch = typeName.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (categoryFilter === 'ORDINATEUR') return matchesSearch && b.categorie === 'ORDINATEUR';
    if (categoryFilter === 'IMPRIMANTE') return matchesSearch && b.categorie === 'IMPRIMANTE';
    if (categoryFilter === 'LIVRAISON') return matchesSearch && b.statut === 'EN_LIVRAISON';
    return matchesSearch;
  });

  const totalPages = Math.ceil(filteredBesoins.length / itemsPerPage);
  const currentItems = filteredBesoins.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'VALIDE': return 'bg-green-100 text-green-700 border-green-200';
      case 'ENVOYE': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'EN_LIVRAISON': return 'bg-purple-100 text-purple-700 border-purple-200 animate-pulse';
      case 'REJETE': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-amber-100 text-amber-700 border-amber-200';
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] gap-4">
        <Loader className="animate-spin text-purple-600" size={48} />
        <p className="text-gray-500 font-medium">Chargement...</p>
      </div>
    );
  }

  const selectedTypeCode = typesRessources.find(t => t.id === parseInt(formData.typeRessourceId))?.code;

  return (
    <div className="p-8 bg-gray-50/30 min-h-screen pb-20">
      <NotificationContainer notifications={notifications} removeNotification={removeNotification} />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <div className="p-2 bg-purple-600 rounded-xl text-white shadow-lg">
              <FileText size={28} />
            </div>
            Gestion des Besoins
          </h1>
          <p className="text-gray-500 mt-2">Suivi et validation des demandes de ressources.</p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Rechercher..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500 outline-none transition-all shadow-sm"
            />
          </div>
      {/* Floating Action Button */}
      <button 
        onClick={handleOpenModal}
        className="fixed bottom-10 right-10 z-[100] group flex items-center justify-center"
      >
        <div className="absolute right-full mr-4 px-4 py-2 bg-gray-900 text-white text-sm font-bold rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap shadow-xl">
          Exprimer un besoin
        </div>
        <div className="w-16 h-16 bg-purple-600 text-white rounded-full flex items-center justify-center shadow-2xl shadow-purple-200 hover:bg-purple-700 hover:scale-110 active:scale-95 transition-all duration-300 animate-in zoom-in slide-in-from-bottom-10">
          <Plus size={32} />
        </div>
        <div className="absolute inset-0 w-16 h-16 bg-purple-600 rounded-full animate-ping opacity-20 -z-10 group-hover:hidden" />
      </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6 justify-between items-center">
        <div className="flex gap-4 items-center">
          {user.role === 'CHEF_DEPARTEMENT' && (
            <div className="flex p-1 bg-white border border-gray-100 rounded-2xl shadow-sm">
              <button
                onClick={() => setViewFilter('ALL')}
                className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${viewFilter === 'ALL' ? 'bg-purple-600 text-white shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
              >
                Tous les Besoins
              </button>
              <button
                onClick={() => setViewFilter('MINE')}
                className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${viewFilter === 'MINE' ? 'bg-purple-600 text-white shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
              >
                Mes Besoins
              </button>
            </div>
          )}

          <div className="flex p-1 bg-gray-100/50 rounded-2xl w-fit border border-gray-100">
            {[
              { id: 'ALL', label: 'Tous', icon: <Box size={14} /> },
              { id: 'ORDINATEUR', label: 'Ordinateurs', icon: <Monitor size={14} /> },
              { id: 'IMPRIMANTE', label: 'Imprimantes', icon: <Printer size={14} /> },
              { id: 'LIVRAISON', label: 'En Livraison', icon: <Truck size={14} /> },
              { id: 'AUTRES', label: 'Autres', icon: <Layers size={14} /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setCategoryFilter(tab.id as any);
                  setCurrentPage(1);
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  categoryFilter === tab.id 
                    ? 'bg-white text-purple-600 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden mb-8">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/30 border-b border-gray-100">
              <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Article & Détails</th>
              {user.role !== 'ENSEIGNANT' && <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Demandeur</th>}
              <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] text-center">Quantité</th>
              <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Statut</th>
              <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {currentItems.map((besoin) => {
              const type = typesRessources.find(t => t.id === besoin.typeRessourceId);
              const prof = professors.find(p => p.id === besoin.enseignantId);
              return (
                <tr key={besoin.id} className={`transition-all duration-300 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 ${besoin.reunionId ? 'border-l-[6px] border-l-amber-400' : 'border-l-[6px] border-l-red-400'}`}>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${besoin.reunionId ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'}`}>
                        {besoin.reunionId ? <Package size={22} /> : <AlertCircle size={22} />}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <p className="font-extrabold text-gray-900 text-base">{type?.libelle || 'Article'}</p>
                          {!besoin.reunionId && (
                            <div className="flex flex-col gap-1">
                              <span className="flex items-center gap-1.5 px-2 py-0.5 bg-red-100 text-red-600 text-[9px] font-black uppercase rounded-md tracking-tighter">
                                <AlertCircle size={10} /> Urgent / Hors Réunion
                              </span>
                              {user.role === 'CHEF_DEPARTEMENT' && (
                                <button 
                                  onClick={() => {
                                    setLinkData({besoinId: besoin.id, reunionId: reunions[0]?.id?.toString() || ''});
                                    setLinkModalOpen(true);
                                  }}
                                  className="flex items-center gap-1.5 px-2 py-0.5 bg-amber-100 text-amber-600 hover:bg-amber-200 text-[9px] font-black uppercase rounded-md tracking-tighter animate-pulse transition-all"
                                >
                                  <Link size={10} /> Affecter à une réunion
                                </button>
                              )}
                              {user.role !== 'CHEF_DEPARTEMENT' && (
                                <span className="flex items-center gap-1.5 px-2 py-0.5 bg-amber-100 text-amber-600 text-[9px] font-black uppercase rounded-md tracking-tighter">
                                  <Link size={10} /> Réunion manquante
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50 px-2 py-0.5 rounded-md">{besoin.categorie}</span>
                          {besoin.marque && <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md italic">{besoin.marque}</span>}
                        </div>
                      </div>
                    </div>
                  </td>
                  {user.role !== 'ENSEIGNANT' && (
                    <td className="px-8 py-5">
                      <p className="font-bold text-gray-800 text-sm">{prof ? `${prof.nom} ${prof.prenom}` : 'Département'}</p>
                      <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-widest ${prof ? 'bg-indigo-50 text-indigo-600' : 'bg-purple-50 text-purple-600'}`}>
                        {prof ? 'Enseignant' : 'Chef / Dept'}
                      </span>
                    </td>
                  )}
                  <td className="px-8 py-6 text-center">
                    <div className="inline-flex items-center justify-center w-10 h-10 bg-white border border-gray-100 rounded-xl shadow-sm">
                      <span className="font-black text-gray-900 text-sm">{besoin.quantite}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border shadow-sm ${getStatusStyle(besoin.statut)}`}>
                      {besoin.statut}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {besoin.cpu && (
                        <div className="group/detail relative mr-2">
                          <div className="p-2 text-gray-400 hover:bg-gray-50 rounded-xl cursor-help">
                            <Info size={18} />
                          </div>
                          <div className="absolute bottom-full right-0 mb-2 w-48 p-3 bg-gray-900 text-white text-[10px] rounded-xl opacity-0 invisible group-hover/detail:opacity-100 group-hover/detail:visible transition-all z-50 shadow-xl">
                            <p className="font-bold border-b border-white/20 pb-1 mb-1">Spécifications</p>
                            {besoin.cpu && <p>CPU: {besoin.cpu}</p>}
                            {besoin.ram && <p>RAM: {besoin.ram}</p>}
                            {besoin.disqueDur && <p>Disque: {besoin.disqueDur}</p>}
                          </div>
                        </div>
                      )}
                      {user.role === 'CHEF_DEPARTEMENT' && besoin.statut === 'EN_ATTENTE' && (
                        <>
                          <button 
                            onClick={() => handleValidateBesoin(besoin)} 
                            disabled={!besoin.reunionId}
                            className={`p-2.5 rounded-xl transition-all ${besoin.reunionId ? 'text-green-600 hover:bg-green-50' : 'text-gray-300 cursor-not-allowed'}`} 
                            title={besoin.reunionId ? "Valider le besoin" : "Impossible de valider : Réunion manquante"}
                          >
                            <CheckCircle size={18} />
                          </button>
                          <button onClick={() => handleRejectBesoin(besoin)} className="p-2.5 text-red-600 hover:bg-red-50 rounded-xl transition-all" title="Rejeter">
                            <XCircle size={18} />
                          </button>
                        </>
                      )}
                      {besoin.statut === 'EN_ATTENTE' && (user.role === 'CHEF_DEPARTEMENT' || besoin.enseignantId === user.id) && (
                        <>
                          <button onClick={() => handleEditClick(besoin)} className="p-2.5 text-blue-600 hover:bg-blue-50 rounded-xl transition-all" title="Modifier">
                            <Edit2 size={18} />
                          </button>
                          {(besoin.enseignantId === user.id || (!besoin.enseignantId && user.role === 'CHEF_DEPARTEMENT')) && (
                            <button onClick={() => handleDeleteBesoin(besoin.id)} className="p-2.5 text-gray-500 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all" title="Supprimer">
                              <Trash2 size={18} />
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filteredBesoins.length === 0 && (
          <div className="py-20 text-center text-gray-400 italic">Aucun besoin trouvé.</div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4">
          <button 
            onClick={() => setCurrentPage(p => Math.max(1, p-1))}
            disabled={currentPage === 1}
            className="p-2 bg-white border border-gray-100 rounded-xl disabled:opacity-30 hover:bg-gray-50 transition-all shadow-sm"
          >
            <ChevronLeft size={20} />
          </button>
          <span className="text-sm font-bold text-gray-600">Page {currentPage} / {totalPages}</span>
          <button 
            onClick={() => setCurrentPage(p => Math.min(totalPages, p+1))}
            disabled={currentPage === totalPages}
            className="p-2 bg-white border border-gray-100 rounded-xl disabled:opacity-30 hover:bg-gray-50 transition-all shadow-sm"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}

      {linkModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] w-full max-w-md p-8 shadow-2xl relative animate-in zoom-in duration-200">
            <button onClick={() => setLinkModalOpen(false)} className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors">
              <XCircle size={24} />
            </button>
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <Link size={20} className="text-amber-500" />
              Affecter à une réunion
            </h3>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Choisir la réunion</label>
                {reunions.length > 0 ? (
                  <select 
                    value={linkData.reunionId} 
                    onChange={e => setLinkData({...linkData, reunionId: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none text-sm font-medium"
                  >
                    {reunions.map((r: any) => (
                      <option key={r.id} value={r.id}>
                        Réunion #{r.id} - {Array.isArray(r.date) ? `${r.date[2]}/${r.date[1]}/${r.date[0]}` : r.date}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="p-4 bg-amber-50 rounded-xl text-amber-700 text-sm font-medium border border-amber-100">
                    Aucune réunion planifiée ou en cours n'est disponible.
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  onClick={() => setLinkModalOpen(false)}
                  className="flex-1 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all"
                >
                  Annuler
                </button>
                <button 
                  onClick={handleQuickLinkSubmit}
                  disabled={saving || !linkData.reunionId || reunions.length === 0}
                  className="flex-1 py-3 bg-amber-500 text-white rounded-xl font-bold hover:bg-amber-600 transition-all shadow-md shadow-amber-200 disabled:opacity-50"
                >
                  {saving ? 'Affectation...' : 'Confirmer'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-5xl p-10 shadow-2xl relative">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-8 right-8 text-gray-400 hover:text-gray-600 transition-colors">
              <XCircle size={28} />
            </button>
            
            <div className="mb-8">
              <h2 className="text-2xl font-black text-gray-900 tracking-tight">{isEditMode ? 'Modifier le Besoin' : 'Nouveau Besoin'}</h2>
              <p className="text-gray-400 text-sm">Remplissez les informations techniques et administratives.</p>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {/* Colonne Gauche: Informations Générales */}
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Type de Ressource</label>
                    <select required value={formData.typeRessourceId} onChange={(e) => setFormData({...formData, typeRessourceId: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-sm transition-all">
                      <option value="">Choisir...</option>
                      {typesRessources.map((t: any) => <option key={t.id} value={t.id}>{t.libelle}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Quantité</label>
                    <input required type="number" min="1" value={formData.quantite} onChange={(e) => setFormData({...formData, quantite: parseInt(e.target.value)})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-sm transition-all" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Réunion (Optionnel)</label>
                  <select value={formData.reunionId} onChange={(e) => setFormData({...formData, reunionId: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-sm transition-all">
                    <option value="">Aucune réunion associée</option>
                    {reunions.map((r: any) => <option key={r.id} value={r.id}>Réunion #{r.id} - {Array.isArray(r.date) ? `${r.date[2]}/${r.date[1]}/${r.date[0]}` : r.date}</option>)}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Description / Justification</label>
                  <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none min-h-[120px] text-sm transition-all" placeholder="Précisez l'usage ou le besoin spécifique..." />
                </div>
              </div>

              {/* Colonne Droite: Spécifications Techniques */}
              <div className="flex flex-col h-full">
                <div className="flex-1">
                  {!selectedTypeCode && (
                    <div className="h-full border-2 border-dashed border-gray-100 rounded-[2rem] flex flex-col items-center justify-center text-gray-300 p-8">
                      <Box size={48} className="mb-4 opacity-20" />
                      <p className="text-sm font-medium">Sélectionnez un type pour voir les spécifications</p>
                    </div>
                  )}

                  {selectedTypeCode === 'ORDINATEUR' && (
                    <div className="p-8 bg-purple-50/50 rounded-[2rem] space-y-5 border border-purple-100/50">
                      <p className="text-xs font-bold text-purple-600 uppercase tracking-widest flex items-center gap-2 mb-2">
                        <Monitor size={16} /> Caractéristiques Techniques
                      </p>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-gray-500">Marque</label>
                          <input value={formData.marque} onChange={e => setFormData({...formData, marque: e.target.value})} className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm" placeholder="Dell, HP..." />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-gray-500">Processeur</label>
                          <input value={formData.cpu} onChange={e => setFormData({...formData, cpu: e.target.value})} className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm" placeholder="i7, Ryzen 7..." />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-gray-500">RAM</label>
                          <input value={formData.ram} onChange={e => setFormData({...formData, ram: e.target.value})} className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm" placeholder="16 Go..." />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-gray-500">Disque Dur</label>
                          <input value={formData.disqueDur} onChange={e => setFormData({...formData, disqueDur: e.target.value})} className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm" placeholder="512 Go SSD..." />
                        </div>
                        <div className="col-span-2 space-y-1">
                          <label className="text-[10px] font-bold text-gray-500">Écran / Moniteur</label>
                          <input value={formData.ecran} onChange={e => setFormData({...formData, ecran: e.target.value})} className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm" placeholder="24 pouces Full HD..." />
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedTypeCode === 'IMPRIMANTE' && (
                    <div className="p-8 bg-blue-50/50 rounded-[2rem] space-y-5 border border-blue-100/50">
                      <p className="text-xs font-bold text-blue-600 uppercase tracking-widest flex items-center gap-2 mb-2">
                        <Printer size={16} /> Caractéristiques Techniques
                      </p>
                      <div className="space-y-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-gray-500">Modèle / Marque</label>
                          <input value={formData.marque} onChange={e => setFormData({...formData, marque: e.target.value})} className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm" placeholder="HP LaserJet..." />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-500">Vitesse (ppm)</label>
                            <input type="number" value={formData.vitesseImpression} onChange={e => setFormData({...formData, vitesseImpression: parseInt(e.target.value)})} className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm" placeholder="30" />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-500">Résolution</label>
                            <input value={formData.resolution} onChange={e => setFormData({...formData, resolution: e.target.value})} className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm" placeholder="1200 dpi..." />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedTypeCode !== 'ORDINATEUR' && selectedTypeCode !== 'IMPRIMANTE' && selectedTypeCode && (
                    <div className="p-8 bg-gray-50 rounded-[2rem] space-y-3 border border-gray-200">
                      <p className="text-xs font-bold text-gray-600 uppercase tracking-widest flex items-center gap-2">
                        <Layers size={16} /> Spécifications Libres
                      </p>
                      <textarea 
                        value={formData.descriptionTechnique} 
                        onChange={e => setFormData({...formData, descriptionTechnique: e.target.value})} 
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none min-h-[180px] text-sm" 
                        placeholder="Détaillez les caractéristiques techniques nécessaires..." 
                      />
                    </div>
                  )}
                </div>

                <div className="flex gap-4 pt-6 mt-auto">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 px-6 border border-gray-200 rounded-2xl font-bold text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-all">Annuler</button>
                  <button type="submit" disabled={saving} className="flex-[2] py-4 px-6 bg-purple-600 text-white rounded-2xl font-bold hover:bg-purple-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-100">
                    {saving ? <Loader className="animate-spin" size={20} /> : (isEditMode ? 'Enregistrer les modifications' : 'Soumettre le besoin')}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[70] p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md p-10 shadow-2xl transform animate-in zoom-in-95 duration-300">
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center text-red-500 shadow-inner">
                <Trash2 size={40} />
              </div>
              
              <div className="space-y-2">
                <h2 className="text-2xl font-black text-gray-900 tracking-tight">Confirmer la suppression</h2>
                <p className="text-gray-500 text-sm leading-relaxed px-4">
                  Êtes-vous sûr de vouloir supprimer ce besoin ? <br/>
                  <span className="font-bold text-red-500/80">Cette action est irréversible.</span>
                </p>
              </div>

              <div className="flex flex-col w-full gap-3 pt-4">
                <button 
                  onClick={confirmDelete}
                  disabled={saving}
                  className="w-full py-4 bg-red-600 text-white rounded-2xl font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-200 flex items-center justify-center gap-2 active:scale-[0.98]"
                >
                  {saving ? <Loader className="animate-spin" size={20} /> : 'Supprimer définitivement'}
                </button>
                <button 
                  onClick={() => setIsDeleteModalOpen(false)}
                  disabled={saving}
                  className="w-full py-4 bg-gray-50 text-gray-500 rounded-2xl font-bold hover:bg-gray-100 transition-all active:scale-[0.98]"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BesoinsPage;
