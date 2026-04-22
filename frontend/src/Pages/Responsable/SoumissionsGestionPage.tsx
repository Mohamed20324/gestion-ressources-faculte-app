import { useState, useEffect } from 'react';
import { 
  Loader, CheckCircle, XCircle, 
  DollarSign, User, Calendar, 
  Package, ShieldAlert, Award,
  Search, Filter, ChevronRight,
  FileText, ArrowRight
} from 'lucide-react';
import { api } from '../../services/api';
import { NotificationContainer } from '../../components/Notification';
import { useNotifications } from '../../hooks/useNotifications';

const SoumissionsGestionPage = () => {
  const { notifications, showNotification, removeNotification } = useNotifications();
  const [offres, setOffres] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('SOUMISE');
  
  const [showMotifModal, setShowMotifModal] = useState({ show: false, offreId: null, action: '' });
  const [motif, setMotif] = useState('');

  useEffect(() => {
    fetchOffres();
  }, []);

  const fetchOffres = async () => {
    setLoading(true);
    try {
      const res = await api.getAllOffres();
      if (res.ok) {
        setOffres(await res.json());
      }
    } catch (error) {
      showNotification('error', 'Erreur de chargement des offres');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (offreId: number) => {
    if (!window.confirm("Êtes-vous sûr de vouloir accepter cette offre ? Cela rejettera automatiquement les autres offres du même appel d'offre.")) return;
    setActionLoading(true);
    try {
      const res = await api.accepterOffre(offreId);
      if (res.ok) {
        showNotification('success', 'Offre acceptée avec succès !');
        fetchOffres();
      } else {
        const err = await res.json();
        showNotification('error', err.message);
      }
    } catch (error) {
      showNotification('error', 'Erreur technique');
    } finally {
      setActionLoading(false);
    }
  };

  const handleActionWithMotif = async () => {
    if (!motif) return;
    setActionLoading(true);
    try {
      const res = showMotifModal.action === 'REJETER' 
        ? await api.rejeterOffre(showMotifModal.offreId!, motif)
        : await api.eliminerOffre(showMotifModal.offreId!, motif);
      
      if (res.ok) {
        showNotification('success', `Action ${showMotifModal.action.toLowerCase()} effectuée`);
        setShowMotifModal({ show: false, offreId: null, action: '' });
        setMotif('');
        fetchOffres();
      } else {
        const err = await res.json();
        showNotification('error', err.message);
      }
    } catch (error) {
      showNotification('error', 'Erreur technique');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredOffres = offres.filter(o => {
    const matchesSearch = o.fournisseurNom.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          o.appelOffreReference.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || o.statut === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-32 h-screen">
      <Loader className="animate-spin text-purple-600 mb-4" size={48} />
      <p className="text-gray-500 font-bold">Chargement des soumissions...</p>
    </div>
  );

  return (
    <div className="p-8 bg-gray-50/30 min-h-screen">
      <NotificationContainer notifications={notifications} removeNotification={removeNotification} />
      
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
              <Award className="text-purple-600" size={36} />
              Gestion des Soumissions
            </h1>
            <p className="text-gray-500 font-medium mt-1">Validez ou rejetez les propositions des fournisseurs.</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Fournisseur ou AO..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-4 py-3 bg-white border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-purple-50 font-bold shadow-sm min-w-[250px]"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-12 pr-8 py-3 bg-white border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-purple-50 font-bold shadow-sm appearance-none cursor-pointer"
              >
                <option value="ALL">Tous les statuts</option>
                <option value="SOUMISE">En attente (Soumise)</option>
                <option value="ACCEPTEE">Acceptée</option>
                <option value="REJETEE">Rejetée</option>
                <option value="ELIMINEE">Éliminée</option>
              </select>
            </div>
          </div>
        </div>

        <div className="grid gap-6">
          {filteredOffres.map((offre) => (
            <div key={offre.id} className={`bg-white rounded-[2.5rem] p-8 border ${offre.statut === 'ACCEPTEE' ? 'border-green-200 shadow-green-50' : 'border-gray-100'} shadow-xl group transition-all`}>
              <div className="flex flex-col lg:flex-row justify-between gap-8">
                {/* Left: Supplier & Main Info */}
                <div className="flex-1 space-y-6">
                  <div className="flex items-center justify-between lg:justify-start gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 border border-purple-100">
                        <User size={28} />
                      </div>
                      <div>
                        <h3 className="text-xl font-black text-gray-900">{offre.fournisseurNom}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider ${
                            offre.statut === 'ACCEPTEE' ? 'bg-green-100 text-green-700' : 
                            offre.statut === 'REJETEE' ? 'bg-red-100 text-red-700' : 
                            offre.statut === 'ELIMINEE' ? 'bg-gray-800 text-white' : 'bg-blue-100 text-blue-700'
                          }`}>
                            {offre.statut}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="hidden lg:flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-xl border border-gray-100 ml-4">
                       <FileText size={16} className="text-purple-400" />
                       <div className="text-xs">
                          <p className="text-gray-400 font-bold uppercase tracking-tighter text-[8px]">Appel d'Offre</p>
                          <p className="font-bold text-gray-700">{offre.appelOffreReference}</p>
                       </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Offre</p>
                      <p className="text-xl font-black text-purple-600">{offre.prixTotal?.toLocaleString()} MAD</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Livraison</p>
                      <div className="flex items-center gap-2 text-gray-700 font-bold">
                        <Calendar size={16} className="text-gray-400" />
                        <span className="text-sm">
                          {Array.isArray(offre.dateLivraison) ? `${offre.dateLivraison[2]}/${offre.dateLivraison[1]}/${offre.dateLivraison[0]}` : offre.dateLivraison}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Garantie</p>
                      <p className="text-sm font-bold text-gray-700">{offre.dureeGarantie} mois</p>
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex flex-col justify-center gap-3 lg:w-64">
                  {offre.statut === 'SOUMISE' && (
                    <>
                      <button 
                        onClick={() => handleAccept(offre.id)}
                        disabled={actionLoading}
                        className="w-full py-3 bg-green-600 text-white rounded-xl font-black hover:bg-green-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-100"
                      >
                        <CheckCircle size={18} />
                        Accepter
                      </button>
                      <button 
                        onClick={() => setShowMotifModal({ show: true, offreId: offre.id, action: 'REJETER' })}
                        className="w-full py-3 bg-amber-50 text-amber-700 rounded-xl font-black hover:bg-amber-100 transition-all flex items-center justify-center gap-2 border border-amber-100"
                      >
                        <XCircle size={18} />
                        Rejeter
                      </button>
                      <button 
                        onClick={() => setShowMotifModal({ show: true, offreId: offre.id, action: 'ELIMINER' })}
                        className="w-full py-3 bg-gray-900 text-white rounded-xl font-black hover:bg-gray-800 transition-all flex items-center justify-center gap-2"
                      >
                        <ShieldAlert size={18} />
                        Éliminer
                      </button>
                    </>
                  )}
                  {offre.statut === 'ELIMINEE' && (
                    <div className="p-4 bg-gray-100 rounded-2xl text-center">
                      <p className="text-xs font-bold text-gray-500 italic">" {offre.motifRejet || 'Motif non spécifié'} "</p>
                    </div>
                  )}
                  {offre.statut === 'REJETEE' && (
                    <div className="p-4 bg-red-50/50 border border-red-100 rounded-2xl text-center">
                      <p className="text-xs font-bold text-red-400 italic">" {offre.motifRejet || 'Aucun motif spécifié'} "</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Details Lignes */}
              <div className="mt-8 pt-8 border-t border-gray-100">
                <div className="flex items-center justify-between mb-4">
                   <h4 className="text-sm font-black text-gray-900 flex items-center gap-2">
                      <Package size={16} className="text-purple-400" />
                      Détails de l'offre technique
                   </h4>
                   <button className="text-[10px] font-black text-purple-600 uppercase tracking-widest hover:underline">
                      Voir tout l'AO
                   </button>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {offre.lignes?.map((line: any, idx: number) => (
                    <div key={idx} className="p-4 bg-gray-50/50 rounded-2xl border border-gray-100 space-y-2 group/line hover:bg-white hover:shadow-md transition-all">
                      <div className="flex justify-between items-start">
                        <span className="text-[9px] font-black text-purple-600 uppercase tracking-widest px-2 py-0.5 bg-purple-50 rounded-lg">{line.variante}</span>
                        <span className="text-xs font-black text-gray-900">{line.prixUnitaire?.toLocaleString()} MAD</span>
                      </div>
                      <p className="font-bold text-gray-800 text-sm">{line.marque || 'Standard'}</p>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-gray-400 font-bold uppercase tracking-tight">
                        <span className="flex items-center gap-1"><ArrowRight size={10} /> Qté: {line.quantite}</span>
                        {line.cpu && <span className="flex items-center gap-1"><ArrowRight size={10} /> {line.cpu}</span>}
                        {line.ram && <span className="flex items-center gap-1"><ArrowRight size={10} /> {line.ram}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}

          {filteredOffres.length === 0 && (
            <div className="py-32 text-center bg-white rounded-[3rem] border border-dashed border-gray-200">
              <Award className="mx-auto text-gray-200 mb-4" size={64} />
              <p className="text-gray-500 font-bold text-xl">Aucune soumission trouvée avec ces critères.</p>
            </div>
          )}
        </div>
      </div>

      {/* Motif Modal */}
      {showMotifModal.show && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-gray-900/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-3">
              {showMotifModal.action === 'ELIMINER' ? <ShieldAlert className="text-red-600" /> : <XCircle className="text-amber-600" />}
              {showMotifModal.action === 'ELIMINER' ? 'Motif d\'élimination' : 'Motif de rejet'}
            </h3>
            
            <textarea 
              value={motif}
              onChange={(e) => setMotif(e.target.value)}
              placeholder="Expliquez la raison technique ou administrative..."
              className="w-full h-32 p-6 bg-gray-50 border border-gray-100 rounded-3xl outline-none focus:ring-4 focus:ring-purple-100 font-medium transition-all mb-8 resize-none"
            />

            <div className="flex gap-4">
              <button 
                onClick={() => setShowMotifModal({ show: false, offreId: null, action: '' })}
                className="flex-1 py-4 bg-gray-100 text-gray-600 rounded-2xl font-black hover:bg-gray-200 transition-all"
              >
                Annuler
              </button>
              <button 
                onClick={handleActionWithMotif}
                disabled={!motif || actionLoading}
                className="flex-1 py-4 bg-gray-900 text-white rounded-2xl font-black hover:bg-gray-800 transition-all disabled:opacity-50 shadow-xl shadow-gray-200"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SoumissionsGestionPage;
