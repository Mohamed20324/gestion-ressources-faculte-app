import { useState, useEffect } from 'react';
import { 
  Loader, CheckCircle, XCircle, 
  DollarSign, User, Calendar, 
  Package, ShieldAlert, Award,
  Search, Filter, ChevronRight,
  FileText, ArrowRight, X, Info,
  ExternalLink, BarChart3
} from 'lucide-react';
import { api } from '../../../services/api';
import { NotificationContainer } from '../../../components/Notification';
import { useNotifications } from '../../../hooks/useNotifications';

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
      showNotification('error', 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (offreId: number) => {
    if (!window.confirm("Accepter cette offre ? Les autres offres du même marché seront rejetées.")) return;
    setActionLoading(true);
    try {
      const res = await api.accepterOffre(offreId);
      if (res.ok) {
        showNotification('success', 'Offre acceptée avec succès');
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
        showNotification('success', 'Action validée');
        setShowMotifModal({ show: false, offreId: null, action: '' });
        setMotif('');
        fetchOffres();
      }
    } catch (error) {
      showNotification('error', 'Erreur technique');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredOffres = offres.filter(o => {
    if (o.statut === 'ANNULEE') return false; // Ne pas afficher les annulées ici
    const matchesSearch = o.fournisseurNom.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          o.appelOffreReference.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || o.statut === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'SOUMISE': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'ACCEPTEE': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'REJETEE': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'ELIMINEE': return 'bg-slate-900 text-white border-slate-900';
      case 'ANNULEE': return 'bg-red-50 text-red-600 border-red-100 italic';
      default: return 'bg-gray-50 text-gray-600 border-gray-100';
    }
  };

  return (
    <div className="p-8 bg-gray-50/30 min-h-full pb-8">
      <NotificationContainer notifications={notifications} removeNotification={removeNotification} />
      
      <div className="max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Soumissions Reçues</h1>
            <p className="text-gray-500 mt-1 font-medium">Analyse comparative et décisionnelle des propositions techniques et financières.</p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <div className="relative flex-1 min-w-[250px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Filtrer les soumissions..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none transition-all shadow-sm font-medium"
              />
            </div>
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 bg-white border border-gray-200 rounded-xl font-bold text-gray-700 outline-none focus:ring-2 focus:ring-blue-600 shadow-sm"
            >
              <option value="ALL">Tous les statuts</option>
              <option value="SOUMISE">En attente</option>
              <option value="ACCEPTEE">Acceptées</option>
              <option value="REJETEE">Rejetées</option>
              <option value="ELIMINEE">Éliminées</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <Loader className="animate-spin text-blue-600 mb-4" size={40} />
            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Traitement des données...</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredOffres.map((offre) => (
              <div key={offre.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden hover:border-blue-200 transition-all group">
                {/* Status Bar */}
                <div className={`h-1 w-full ${offre.statut === 'ACCEPTEE' ? 'bg-emerald-500' : (offre.statut === 'SOUMISE' ? 'bg-blue-500' : 'bg-slate-200')}`}></div>
                
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row justify-between gap-8">
                    {/* Info Section */}
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-600 group-hover:border-blue-100 transition-colors">
                          <User size={24} />
                        </div>
                        <div>
                          <div className="flex items-center gap-3">
                            <h3 className="text-xl font-bold text-gray-900">{offre.fournisseurNom}</h3>
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${getStatusStyle(offre.statut)}`}>
                              {offre.statut}
                            </span>
                          </div>
                          <p className="text-sm font-medium text-blue-600 flex items-center gap-1.5 mt-0.5">
                            <FileText size={14} /> {offre.appelOffreReference}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 px-2">
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Offre Financière</p>
                          <p className="text-lg font-bold text-gray-900">{offre.prixTotal?.toLocaleString()} MAD</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Délai Livraison</p>
                          <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-700">
                            <Calendar size={14} className="text-gray-400" />
                            {Array.isArray(offre.dateLivraison) ? `${offre.dateLivraison[2]}/${offre.dateLivraison[1]}/${offre.dateLivraison[0]}` : offre.dateLivraison}
                          </div>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Garantie</p>
                          <p className="text-sm font-semibold text-gray-700">{offre.dureeGarantie} Mois</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">ID Offre</p>
                          <p className="text-sm font-semibold text-gray-500">#OFR-{offre.id}</p>
                        </div>
                      </div>
                    </div>

                    {/* Actions Section */}
                    <div className="flex flex-col justify-center gap-2 lg:w-56">
                      {offre.statut === 'SOUMISE' && (
                        <>
                          <button 
                            onClick={() => handleAccept(offre.id)}
                            disabled={actionLoading}
                            className="w-full py-2.5 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all text-sm flex items-center justify-center gap-2"
                          >
                            <CheckCircle size={16} /> Accepter
                          </button>
                          <button 
                            onClick={() => setShowMotifModal({ show: true, offreId: offre.id, action: 'REJETER' })}
                            className="w-full py-2.5 bg-white border border-amber-200 text-amber-700 rounded-xl font-bold hover:bg-amber-50 transition-all text-sm flex items-center justify-center gap-2"
                          >
                            <XCircle size={16} /> Rejeter
                          </button>
                          <button 
                            onClick={() => setShowMotifModal({ show: true, offreId: offre.id, action: 'ELIMINER' })}
                            className="w-full py-2.5 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-all text-sm flex items-center justify-center gap-2"
                          >
                            <ShieldAlert size={16} /> Éliminer
                          </button>
                        </>
                      )}
                      {(offre.statut === 'REJETEE' || offre.statut === 'ELIMINEE') && (
                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                          <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Motif</p>
                          <p className="text-xs font-semibold text-gray-600 italic">"{offre.motifRejet || 'Non spécifié'}"</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Technical Details */}
                  <div className="mt-8 pt-6 border-t border-gray-100 bg-gray-50/50 -mx-6 -mb-6 px-6 pb-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                        <BarChart3 size={14} className="text-blue-500" /> Spécifications Techniques
                      </h4>
                      <button className="text-[10px] font-bold text-blue-600 hover:underline">Comparer les variantes</button>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {offre.lignes?.map((line: any, idx: number) => (
                        <div key={idx} className="p-3 bg-white border border-gray-200 rounded-xl flex flex-col gap-2 shadow-sm">
                          <div className="flex justify-between items-start">
                            <span className="text-[9px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100 uppercase truncate max-w-[120px]">
                              {line.variante}
                            </span>
                            <span className="text-xs font-bold text-gray-900">{line.prixUnitaire?.toLocaleString()} MAD</span>
                          </div>
                          <p className="text-sm font-bold text-gray-800">{line.marque || 'Modèle standard'}</p>
                          <div className="flex flex-wrap gap-2 text-[10px] font-semibold text-gray-400">
                            <span className="bg-gray-100 px-1.5 py-0.5 rounded">QTÉ: {line.quantite}</span>
                            {line.cpu && <span className="bg-gray-100 px-1.5 py-0.5 rounded truncate">{line.cpu}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action Modal */}
      {showMotifModal.show && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-sm rounded-2xl p-8 shadow-2xl animate-in zoom-in duration-200">
            <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              {showMotifModal.action === 'ELIMINER' ? <ShieldAlert className="text-red-600" /> : <XCircle className="text-amber-600" />}
              {showMotifModal.action === 'ELIMINER' ? 'Élimination' : 'Rejet de l\'offre'}
            </h3>
            <p className="text-xs font-medium text-gray-500 mb-6">Précisez les raisons motivant cette décision administrative.</p>
            
            <textarea 
              value={motif}
              onChange={(e) => setMotif(e.target.value)}
              placeholder="Saisissez ici le motif..."
              className="w-full h-28 p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium transition-all mb-6 text-sm resize-none"
            />

            <div className="flex gap-3">
              <button 
                onClick={() => setShowMotifModal({ show: false, offreId: null, action: '' })}
                className="flex-1 py-3 bg-white border border-gray-200 text-gray-500 rounded-xl font-bold hover:bg-gray-50 transition-all text-sm"
              >
                Annuler
              </button>
              <button 
                onClick={handleActionWithMotif}
                disabled={!motif || actionLoading}
                className="flex-1 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-all shadow-md disabled:opacity-50 text-sm"
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

