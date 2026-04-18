import { useState, useEffect } from 'react';
import { 
  Plus, Search, Loader, ClipboardList, 
  ChevronLeft, ChevronRight, CheckCircle,
  ShoppingCart, Filter, Calendar, X, FileText
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { NotificationContainer } from '../../components/Notification';
import { useNotifications } from '../../hooks/useNotifications';

interface Besoin {
  id: number;
  typeRessourceId: number;
  quantite: number;
  statut: string;
  departementId: number;
  reunionId: number;
  description?: string;
  appelOffreId?: number;
}

const BesoinsGlobalPage = () => {
  const { user } = useAuth();
  const { notifications, showNotification, removeNotification } = useNotifications();
  
  const [besoins, setBesoins] = useState<Besoin[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [selectedNeeds, setSelectedNeeds] = useState<number[]>([]);
  const [typesRessources, setTypesRessources] = useState<any[]>([]);
  
  const [isAOModalOpen, setIsAOModalOpen] = useState(false);
  const [openAOs, setOpenAOs] = useState<any[]>([]);
  const [aoMode, setAoMode] = useState<'new' | 'existing'>('new');
  const [aoData, setAoData] = useState({
    reference: '',
    dateDebut: new Date().toISOString().split('T')[0],
    dateFin: '',
    existingAoId: ''
  });
  const [submittingAO, setSubmittingAO] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [besoinsRes, typesRes] = await Promise.all([
        api.getAllBesoins(),
        api.getAllTypesRessources()
      ]);
      
      if (besoinsRes.ok) {
        setBesoins(await besoinsRes.json());
      }
      if (typesRes.ok) {
        setTypesRessources(await typesRes.json());
      }
    } catch (error) {
      showNotification('error', 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAOModal = async () => {
    if (selectedNeeds.length === 0) {
      showNotification('error', 'Sélectionnez au moins un besoin');
      return;
    }
    setIsAOModalOpen(true);
    try {
      const response = await api.getAllAppelsOffresOuverts();
      if (response.ok) setOpenAOs(await response.json());
    } catch (error) {
      console.error(error);
    }
  };

  const handleCreateAO = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingAO(true);
    try {
      if (aoMode === 'new') {
        const payload = {
          reference: aoData.reference,
          dateDebut: aoData.dateDebut,
          dateFin: aoData.dateFin,
          statut: 'OUVERT',
          responsableId: user?.id,
          besoinIds: selectedNeeds
        };
        const response = await api.createAppelOffre(payload);
        if (response.ok) {
          showNotification('success', 'Appel d\'offre créé');
          setIsAOModalOpen(false);
          setSelectedNeeds([]);
          loadData();
        }
      } else {
        const response = await api.addBesoinsToAppelOffre(parseInt(aoData.existingAoId), selectedNeeds);
        if (response.ok) {
          showNotification('success', 'Besoins ajoutés à l\'AO');
          setIsAOModalOpen(false);
          setSelectedNeeds([]);
          loadData();
        }
      }
    } catch (error) {
      showNotification('error', 'Erreur technique');
    } finally {
      setSubmittingAO(false);
    }
  };

  const toggleSelection = (id: number) => {
    setSelectedNeeds(prev => 
      prev.includes(id) ? prev.filter(nid => nid !== id) : [...prev, id]
    );
  };

  const filteredBesoins = besoins.filter(b => {
    const typeName = typesRessources.find(t => t.id === b.typeRessourceId)?.libelle || '';
    return typeName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const totalPages = Math.ceil(filteredBesoins.length / itemsPerPage);
  const currentItems = filteredBesoins.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="p-8 bg-gray-50/30 min-h-screen pb-24">
      <NotificationContainer notifications={notifications} removeNotification={removeNotification} />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
            <ClipboardList className="text-purple-600" size={36} />
            Besoins des Départements
          </h1>
          <p className="text-gray-500 mt-1 font-medium">Gérez et regroupez les demandes pour les appels d'offres.</p>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Rechercher par type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500 outline-none transition-all shadow-sm"
            />
          </div>
          
          {selectedNeeds.length > 0 && (
            <button 
              onClick={handleOpenAOModal}
              className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-2xl font-bold hover:bg-purple-700 transition-all shadow-xl shadow-purple-100"
            >
              <ShoppingCart size={20} />
              Générer AO ({selectedNeeds.length})
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24">
          <Loader className="animate-spin text-purple-600 mb-4" size={48} />
          <p className="text-gray-500 font-bold">Chargement des besoins...</p>
        </div>
      ) : (
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-8 py-6 w-10"></th>
                <th className="px-8 py-6 text-xs font-bold text-gray-400 uppercase tracking-widest">Type</th>
                <th className="px-8 py-6 text-xs font-bold text-gray-400 uppercase tracking-widest">Département</th>
                <th className="px-8 py-6 text-xs font-bold text-gray-400 uppercase tracking-widest">Quantité</th>
                <th className="px-8 py-6 text-xs font-bold text-gray-400 uppercase tracking-widest">Statut</th>
                <th className="px-8 py-6 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">AO</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {currentItems.map((besoin) => {
                const typeName = typesRessources.find(t => t.id === besoin.typeRessourceId)?.libelle || 'Inconnu';
                return (
                  <tr key={besoin.id} className={`group hover:bg-gray-50/50 transition-all ${selectedNeeds.includes(besoin.id) ? 'bg-purple-50/30' : ''}`}>
                    <td className="px-8 py-6">
                      {!besoin.appelOffreId && (
                        <input 
                          type="checkbox" 
                          checked={selectedNeeds.includes(besoin.id)}
                          onChange={() => toggleSelection(besoin.id)}
                          className="w-5 h-5 rounded-lg border-gray-300 text-purple-600 focus:ring-purple-500 cursor-pointer"
                        />
                      )}
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600 border border-purple-100">
                          <FileText size={18} />
                        </div>
                        <span className="font-bold text-gray-900">{typeName}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-sm font-medium text-gray-600">DEPT #{besoin.departementId}</td>
                    <td className="px-8 py-6 font-bold text-gray-700">{besoin.quantite}</td>
                    <td className="px-8 py-6">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${besoin.statut === 'VALIDE' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-amber-50 text-amber-700 border-amber-100'}`}>
                        {besoin.statut}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      {besoin.appelOffreId ? (
                        <span className="text-xs font-bold text-green-600 flex items-center justify-end gap-1">
                          <CheckCircle size={14} /> AO #{besoin.appelOffreId}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400 italic">Libre</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          
          {filteredBesoins.length === 0 && (
            <div className="py-24 text-center">
              <ClipboardList className="mx-auto text-gray-200 mb-4" size={64} />
              <p className="text-gray-500 font-bold">Aucun besoin trouvé</p>
            </div>
          )}
        </div>
      )}

      {/* AO Modal Copy-pasted from my previous work but focused only on needs */}
      {isAOModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-[3rem] w-full max-w-2xl p-10 shadow-3xl border border-white/20">
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-3xl font-black text-gray-900">Générer l'Appel d'Offre</h2>
              <button onClick={() => setIsAOModalOpen(false)} className="p-3 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-full transition-all">
                <X size={28} />
              </button>
            </div>

            <div className="flex p-1 bg-gray-100 rounded-2xl mb-8">
              <button onClick={() => setAoMode('new')} className={`flex-1 py-3 rounded-xl font-bold transition-all ${aoMode === 'new' ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-500'}`}>Nouveau</button>
              <button onClick={() => setAoMode('existing')} className={`flex-1 py-3 rounded-xl font-bold transition-all ${aoMode === 'existing' ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-500'}`}>Existant</button>
            </div>

            <form onSubmit={handleCreateAO} className="space-y-6">
              {aoMode === 'new' ? (
                <>
                  <input 
                    required 
                    placeholder="Référence AO..." 
                    value={aoData.reference} 
                    onChange={(e) => setAoData({...aoData, reference: e.target.value.toUpperCase()})}
                    className="w-full px-6 py-5 bg-gray-50 border border-gray-100 rounded-3xl focus:ring-4 focus:ring-purple-100 outline-none font-bold" 
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <input required type="date" value={aoData.dateDebut} onChange={(e) => setAoData({...aoData, dateDebut: e.target.value})} className="px-6 py-5 bg-gray-50 border border-gray-100 rounded-3xl font-bold" />
                    <input required type="date" value={aoData.dateFin} onChange={(e) => setAoData({...aoData, dateFin: e.target.value})} className="px-6 py-5 bg-gray-50 border border-gray-100 rounded-3xl font-bold" />
                  </div>
                </>
              ) : (
                <select required value={aoData.existingAoId} onChange={(e) => setAoData({...aoData, existingAoId: e.target.value})} className="w-full px-6 py-5 bg-gray-50 border border-gray-100 rounded-3xl font-bold">
                  <option value="">Choisir un AO ouvert...</option>
                  {openAOs.map(ao => <option key={ao.id} value={ao.id}>{ao.reference}</option>)}
                </select>
              )}
              <button type="submit" disabled={submittingAO} className="w-full py-5 bg-purple-600 text-white rounded-3xl font-black hover:bg-purple-700 transition-all shadow-xl">
                {submittingAO ? 'Traitement...' : 'Confirmer'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BesoinsGlobalPage;
