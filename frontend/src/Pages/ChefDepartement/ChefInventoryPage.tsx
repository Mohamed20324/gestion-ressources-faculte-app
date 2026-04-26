import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { NotificationContainer } from '../../components/Notification';
import { 
  Package, 
  User, 
  Building2, 
  Search, 
  Filter,
  CheckCircle2,
  AlertCircle,
  Clock,
  ExternalLink,
  ChevronRight,
  MoreVertical,
  Info,
  Loader,
  Edit,
  Trash2,
  AlertTriangle,
  X
} from 'lucide-react';

interface Ressource {
  id: number;
  numeroInventaire: string;
  marque: string;
  statut: string;
  categorie: string;
  typeRessourceId: number;
  departementId?: number;
  dateReception: string;
  enseignantDemandeurNom?: string;
}

interface Affectation {
  id: number;
  ressourceId: number;
  departementId: number;
  enseignantId: number | null;
  enseignantNom?: string;
  affectationCollective: boolean;
  dateAffectation: string;
}

const ChefInventoryPage: React.FC = () => {
  const [resources, setResources] = useState<Ressource[]>([]);
  const [affectations, setAffectations] = useState<Record<number, Affectation>>({});
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deptId, setDeptId] = useState<number | null>(null);
  const [user, setUser] = useState<any>(null);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [inventoryFilter, setInventoryFilter] = useState<'ALL' | 'PENDING'>('ALL');

  // Affectation Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRes, setSelectedRes] = useState<Ressource | null>(null);
  const [affectData, setAffectData] = useState({
    enseignantId: null as number | null,
    isCollective: true
  });
  
  // Toast notifications
  const [notifications, setNotifications] = useState<any[]>([]);
  const addNotification = (type: 'success' | 'error' | 'warning' | 'info', message: string) => {
    const id = Date.now().toString();
    setNotifications(prev => [...prev, { id, type, message }]);
  };
  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };
  const [submitting, setSubmitting] = useState(false);

  // Panne Modal State
  const [signalementModal, setSignalementModal] = useState<{show: boolean, resId: number | null}>({ show: false, resId: null });
  const [panneDescription, setPanneDescription] = useState('');

  useEffect(() => {
    const init = async () => {
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      setUser(storedUser);
      
      // Fetch user details to get departmentId
      try {
        const response = await api.getFournisseurById(storedUser.id); // Reusing the generic user fetch
        if (response.ok) {
          const userData = await response.json();
          const did = userData.departementId;
          setDeptId(did);
          if (did) loadData(did);
          else console.warn("Le chef n'a pas de département associé");
        }
      } catch (error) {
        console.error("Init error:", error);
      }
    };
    init();
  }, []);

  const loadData = async (did: number) => {
    setLoading(true);
    try {
      const [resRes, affRes, teachRes] = await Promise.all([
        api.getRessourcesByDepartement(did),
        api.getAffectationsByDepartement(did),
        api.getEnseignantsByDepartement(did)
      ]);

      if (resRes.ok) setResources(await resRes.json());
      if (teachRes.ok) setTeachers(await teachRes.json());
      if (affRes.ok) {
        const affs = await affRes.json();
        const affMap: Record<number, Affectation> = {};
        affs.forEach((a: any) => {
          affMap[a.ressourceId] = a;
        });
        setAffectations(affMap);
      }
    } catch (error) {
      console.error("Load data error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (res: Ressource) => {
    setSelectedRes(res);
    const existing = affectations[res.id];
    if (existing) {
      setAffectData({
        enseignantId: existing.enseignantId,
        isCollective: existing.affectationCollective
      });
    } else {
      setAffectData({ enseignantId: null, isCollective: true });
    }
    setIsModalOpen(true);
  };

  const handleAffectation = async () => {
    if (!selectedRes || !deptId) return;
    setSubmitting(true);
    try {
      const dto = {
        ressourceId: selectedRes.id,
        departementId: deptId,
        enseignantId: affectData.isCollective ? null : Number(affectData.enseignantId),
        affectationCollective: affectData.isCollective,
        dateAffectation: new Date().toISOString().split('T')[0],
        expediteurId: user.id
      };

      const res = await api.createAffectation(dto);
      if (res.ok) {
        addNotification('success', `Affectation de ${selectedRes.marque} mise à jour avec succès.`);
        setIsModalOpen(false);
        if (deptId) loadData(deptId);
      } else {
        const errorData = await res.json();
        addNotification('error', errorData.message || "Erreur lors de l'affectation.");
      }
    } catch (error) {
      console.error("Submit error:", error);
      addNotification('error', "Une erreur est survenue lors de l'affectation.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignalement = async () => {
    if (!panneDescription || !signalementModal.resId) return;
    setSubmitting(true);
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const res = await api.createSignalement({
        ressourceId: signalementModal.resId,
        enseignantId: user.id,
        description: panneDescription,
        dateSignalement: new Date().toISOString().split('T')[0]
      });
      if (res.ok) {
        addNotification('success', 'Panne signalée avec succès');
        setSignalementModal({ show: false, resId: null });
        setPanneDescription('');
        if (deptId) loadData(deptId);
      } else {
        addNotification('error', 'Erreur lors du signalement');
      }
    } catch (error) {
      addNotification('error', 'Erreur réseau');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredResources = resources.filter(res => {
    const matchesSearch = res.numeroInventaire.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         res.marque.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'ALL' || res.categorie === categoryFilter;
    
    const aff = affectations[res.id];
    const isPending = !aff || aff.affectationCollective;

    if (inventoryFilter === 'PENDING') {
      return matchesSearch && matchesCategory && isPending;
    }
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader className="animate-spin text-purple-600 mb-4" size={40} />
        <p className="text-gray-500 font-medium italic">Chargement de l'inventaire du département...</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 ">
      <NotificationContainer notifications={notifications} removeNotification={removeNotification} />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600 rounded-xl shadow-md">
              <Package className="text-white" size={20} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Gestion de l'Inventaire</h1>
          </div>
          <p className="text-sm text-gray-500">Gérez et affectez les ressources de votre département</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-xl font-bold text-xs border border-blue-100">
            <Building2 size={14} />
            {resources.length} Ressources
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-xl font-bold text-xs border border-green-100">
            <CheckCircle2 size={14} />
            {Object.keys(affectations).length} Affectées
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-2 rounded-xl flex flex-wrap items-center gap-4 border border-gray-100 shadow-sm">
        <div className="flex-1 min-w-[300px] relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text"
            placeholder="Rechercher par N° Inventaire ou Marque..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex p-1 bg-gray-100 rounded-lg">
            <button 
              onClick={() => setInventoryFilter('ALL')}
              className={`px-3 py-1.5 rounded-md text-[10px] font-bold transition-all ${inventoryFilter === 'ALL' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              TOUT ({resources.length})
            </button>
            <button 
              onClick={() => setInventoryFilter('PENDING')}
              className={`px-3 py-1.5 rounded-md text-[10px] font-bold transition-all ${inventoryFilter === 'PENDING' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              EN ATTENTE ({resources.filter(r => !affectations[r.id] || affectations[r.id].affectationCollective).length})
            </button>
          </div>
          
          <div className="h-6 w-px bg-gray-200" />

          <div className="flex p-1 bg-gray-100 rounded-lg">
            <button 
              onClick={() => setCategoryFilter('ALL')}
              className={`px-3 py-1.5 rounded-md text-[10px] font-bold transition-all ${categoryFilter === 'ALL' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              TOUT
            </button>
            <button 
              onClick={() => setCategoryFilter('ORDINATEUR')}
              className={`px-3 py-1.5 rounded-md text-[10px] font-bold transition-all ${categoryFilter === 'ORDINATEUR' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              PC
            </button>
            <button 
              onClick={() => setCategoryFilter('IMPRIMANTE')}
              className={`px-3 py-1.5 rounded-md text-[10px] font-bold transition-all ${categoryFilter === 'IMPRIMANTE' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              IMP
            </button>
          </div>
        </div>
      </div>

      {/* Resource Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {filteredResources.length === 0 ? (
          <div className="py-20 text-center">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="text-blue-200" size={40} />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Inventaire vide</h3>
            <p className="text-gray-500 text-sm mt-1 max-w-sm mx-auto">
              {deptId 
                ? "Aucune ressource n'est actuellement affectée à votre département." 
                : "Erreur : Aucun département n'est associé à votre compte."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Ressource</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Catégorie</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Demandé par</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Affectation</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Statut</th>
                  <th className="px-6 py-4 text-right text-[10px] font-bold text-gray-500 uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredResources.map((res) => {
                  const aff = affectations[res.id];
                  return (
                    <tr key={res.id} className="group hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-gray-50 text-gray-400 rounded-lg group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                            <Package size={18} />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900 leading-tight">{res.marque}</p>
                            <p className="text-[10px] text-gray-400 font-medium mt-0.5">N° {res.numeroInventaire}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-[10px] font-bold uppercase tracking-wider">
                          {res.categorie}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {res.enseignantDemandeurNom ? (
                          <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                            <span className="text-xs font-bold text-gray-700">{res.enseignantDemandeurNom}</span>
                          </div>
                        ) : (
                          <span className="text-[10px] text-gray-300 italic">Aucune demande</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {aff ? (
                          <div className="flex flex-col">
                            <span className={`text-[11px] font-bold flex items-center gap-1.5 ${aff.affectationCollective ? 'text-blue-600' : 'text-indigo-600'}`}>
                              {aff.affectationCollective ? <Building2 size={12} /> : <User size={12} />}
                              {aff.affectationCollective ? 'Stock Département' : aff.enseignantNom || 'Enseignant'}
                            </span>
                            {!aff.affectationCollective && (
                              <span className="text-[9px] text-gray-400 font-medium">Assigné individuellement</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-amber-500 text-[10px] font-bold italic flex items-center gap-1.5">
                            <Clock size={12} /> En attente
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          res.statut === 'AFFECTEE' || res.statut === 'FONCTIONNELLE' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'
                        }`}>
                          {res.statut}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end items-center gap-2">
                          <button 
                            onClick={() => handleOpenModal(res)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title={aff ? 'Modifier l\'affectation' : 'Affecter'}
                          >
                            <Edit size={16} />
                          </button>
                          {res.statut === 'EN_PANNE' ? (
                            <div className="flex items-center gap-1.5 px-2 py-1.5 bg-red-50 text-red-600 rounded-lg border border-red-100 animate-pulse" title="Panne déjà signalée">
                              <AlertTriangle size={14} />
                            </div>
                          ) : (
                            <button 
                              onClick={() => setSignalementModal({ show: true, resId: res.id })}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Signaler une panne"
                            >
                              <AlertTriangle size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Affectation Modal */}
      {isModalOpen && selectedRes && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-[110] p-4">
          <div className="bg-white rounded-xl w-full max-w-md p-8 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Affectation</h2>
                <p className="text-sm text-gray-500">Pour : {selectedRes.marque} ({selectedRes.numeroInventaire})</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-8">
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => setAffectData({...affectData, isCollective: true, enseignantId: null})}
                  className={`p-6 rounded-3xl border-2 transition-all flex flex-col items-center gap-3 ${
                    affectData.isCollective 
                    ? 'bg-purple-50 border-purple-600 text-purple-700 shadow-lg shadow-purple-100' 
                    : 'bg-white border-gray-100 text-gray-400 hover:border-gray-200'
                  }`}
                >
                  <Building2 size={32} />
                  <span className="font-bold text-sm">Collective</span>
                </button>
                <button 
                  onClick={() => setAffectData({...affectData, isCollective: false})}
                  className={`p-6 rounded-3xl border-2 transition-all flex flex-col items-center gap-3 ${
                    !affectData.isCollective 
                    ? 'bg-blue-50 border-blue-600 text-blue-700 shadow-lg shadow-blue-100' 
                    : 'bg-white border-gray-100 text-gray-400 hover:border-gray-200'
                  }`}
                >
                  <User size={32} />
                  <span className="font-bold text-sm">Individuelle</span>
                </button>
              </div>

              {!affectData.isCollective && (
                <div className="space-y-3 animate-in slide-in-from-top-4 duration-300">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Sélectionner l'enseignant</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <select 
                      value={affectData.enseignantId || ''}
                      onChange={e => setAffectData({...affectData, enseignantId: Number(e.target.value)})}
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold appearance-none cursor-pointer"
                    >
                      <option value="">-- Choisir un enseignant --</option>
                      {teachers.map(t => (
                        <option key={t.id} value={t.id}>{t.prenom} {t.nom}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-5 border border-gray-200 rounded-2xl font-bold text-gray-500 hover:bg-gray-50 transition-all"
                >
                  Annuler
                </button>
                <button 
                  onClick={handleAffectation}
                  disabled={submitting || (!affectData.isCollective && !affectData.enseignantId)}
                  className="flex-1 py-5 bg-purple-600 text-white rounded-2xl font-bold hover:bg-purple-700 shadow-xl shadow-purple-200 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {submitting ? <Loader className="animate-spin" size={20} /> : 'Valider l\'affectation'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Signalement Modal */}
      {signalementModal.show && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-gray-900/60 backdrop-blur-md">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl animate-in zoom-in duration-300">
            <h3 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-3">
              <AlertTriangle className="text-red-600" />
              Signaler une Panne
            </h3>
            
            <div className="mb-6 p-4 bg-red-50 rounded-2xl border border-red-100">
              <p className="text-xs font-bold text-red-700">Ressource : RESS-{signalementModal.resId}</p>
            </div>

            <textarea 
              value={panneDescription}
              onChange={(e) => setPanneDescription(e.target.value)}
              placeholder="Décrivez le problème rencontré..."
              className="w-full h-32 p-6 bg-gray-50 border border-gray-100 rounded-3xl outline-none focus:ring-4 focus:ring-purple-100 font-medium transition-all mb-8 resize-none"
            />

            <div className="flex gap-4">
              <button 
                onClick={() => setSignalementModal({ show: false, resId: null })}
                className="flex-1 py-4 bg-gray-100 text-gray-600 rounded-2xl font-black hover:bg-gray-200 transition-all"
              >
                Annuler
              </button>
              <button 
                onClick={handleSignalement}
                disabled={!panneDescription || submitting}
                className="flex-1 py-4 bg-red-600 text-white rounded-2xl font-black hover:bg-red-700 transition-all shadow-lg shadow-red-100 disabled:opacity-50"
              >
                Signaler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChefInventoryPage;
