import { useState, useEffect } from 'react';
import {
  Plus, Search, Loader, ClipboardList,
  CheckCircle, Calendar, X, FileText, ShoppingCart, Users, Filter
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
      const response = await api.getAllAppelsOffres();
      if (response.ok) {
        const data = await response.json();
        // Only show BROUILLON AOs as they are the only ones editable
        setOpenAOs(data.filter((ao: any) => ao.statut === 'BROUILLON'));
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleCreateAO = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aoData.existingAoId) {
      showNotification('error', 'Sélectionnez un appel d\'offre');
      return;
    }
    setSubmittingAO(true);
    try {
      const response = await api.addBesoinsToAppelOffre(parseInt(aoData.existingAoId), selectedNeeds);
      if (response.ok) {
        showNotification('success', 'Besoins ajoutés avec succès !');
        setIsAOModalOpen(false);
        setSelectedNeeds([]);
        loadData();
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
            Affectation des Besoins
          </h1>
          <p className="text-gray-500 mt-1 font-medium">Sélectionnez les besoins à rattacher à un marché existant.</p>
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
              className="flex items-center gap-2 px-6 py-4 bg-purple-600 text-white rounded-2xl font-bold hover:bg-purple-700 transition-all shadow-xl shadow-purple-100"
            >
              <ShoppingCart size={20} />
              Rattacher à un AO ({selectedNeeds.length})
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
                <th className="px-8 py-6 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Rattaché à</th>
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
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${besoin.statut === 'ENVOYE' ? 'bg-blue-50 text-blue-700 border-blue-100' : (besoin.statut === 'VALIDE' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-amber-50 text-amber-700 border-amber-100')}`}>
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

      {/* AO Selection Modal */}
      {isAOModalOpen && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-[3rem] w-full max-w-lg p-10 shadow-3xl border border-white/20">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-black text-gray-900">Rattachement</h2>
                <p className="text-gray-400 font-bold mt-1">{selectedNeeds.length} besoin(s) sélectionnés</p>
              </div>
              <button onClick={() => setIsAOModalOpen(false)} className="p-3 bg-gray-100 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-full transition-all">
                <X size={28} />
              </button>
            </div>

            <form onSubmit={handleCreateAO} className="space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Sélectionner un Appel d'Offre (Brouillon)</label>
                <div className="relative group">
                  <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-400" size={20} />
                  <select 
                    required 
                    value={aoData.existingAoId} 
                    onChange={(e) => setAoData({ ...aoData, existingAoId: e.target.value })} 
                    className="w-full pl-12 pr-6 py-5 bg-gray-50 border border-gray-100 rounded-3xl font-bold outline-none focus:ring-4 focus:ring-purple-100 transition-all appearance-none"
                  >
                    <option value="">-- Choisir un dossier --</option>
                    {openAOs.map(ao => (
                      <option key={ao.id} value={ao.id}>
                        {ao.reference} (Créé le {new Date(ao.dateDebut).toLocaleDateString()})
                      </option>
                    ))}
                  </select>
                </div>
                {openAOs.length === 0 && (
                  <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex items-center gap-3">
                    <ShoppingCart className="text-amber-500" size={20} />
                    <p className="text-xs font-bold text-amber-700">Aucun brouillon d'AO disponible. Créez-en un dans la page "Marchés".</p>
                  </div>
                )}
              </div>
              
              <button 
                type="submit" 
                disabled={submittingAO || openAOs.length === 0} 
                className="w-full py-5 bg-purple-600 text-white rounded-3xl font-black hover:bg-purple-700 transition-all shadow-xl disabled:opacity-50"
              >
                {submittingAO ? <Loader className="animate-spin mx-auto" /> : 'Confirmer le rattachement'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BesoinsGlobalPage;
