import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Loader, CheckCircle, 
  XCircle, AlertTriangle, DollarSign, 
  User, Calendar, Info, Package,
  Trash2, ShieldAlert, Award
} from 'lucide-react';
import { api } from '../../services/api';
import { NotificationContainer } from '../../components/Notification';
import { useNotifications } from '../../hooks/useNotifications';

const OffresGestionPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { notifications, showNotification, removeNotification } = useNotifications();

  const [ao, setAo] = useState<any>(null);
  const [offres, setOffres] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showMotifModal, setShowMotifModal] = useState({ show: false, offreId: null, action: '' });
  const [motif, setMotif] = useState('');

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [aoRes, offresRes] = await Promise.all([
        api.getAppelOffreById(parseInt(id as string)),
        api.getOffresByAppelOffre(parseInt(id as string))
      ]);

      if (aoRes.ok) setAo(await aoRes.json());
      if (offresRes.ok) setOffres(await offresRes.json());
    } catch (error) {
      showNotification('error', 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (offreId: number) => {
    if (!window.confirm("Êtes-vous sûr de vouloir accepter cette offre ? Cela rejettera automatiquement les autres.")) return;
    setActionLoading(true);
    try {
      const res = await api.accepterOffre(offreId);
      if (res.ok) {
        showNotification('success', 'Offre acceptée avec succès !');
        fetchData();
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
        fetchData();
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

  const findMoinsDisant = () => {
    if (offres.length === 0) return;
    const sorted = [...offres].sort((a, b) => a.prixTotal - b.prixTotal);
    showNotification('info', `Le moins disant est ${sorted[0].fournisseurNom} avec ${sorted[0].prixTotal} MAD`);
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-32">
      <Loader className="animate-spin text-purple-600 mb-4" size={48} />
      <p className="text-gray-500 font-bold">Analyse des offres en cours...</p>
    </div>
  );

  return (
    <div className="p-8 bg-gray-50/30 min-h-screen">
      <NotificationContainer notifications={notifications} removeNotification={removeNotification} />
      
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-500 hover:text-purple-600 font-bold transition-colors"
          >
            <ArrowLeft size={20} />
            Retour à l'Appel d'Offre
          </button>
          
          <button 
            onClick={findMoinsDisant}
            className="flex items-center gap-2 px-6 py-3 bg-amber-100 text-amber-700 rounded-2xl font-black hover:bg-amber-200 transition-all shadow-lg shadow-amber-100"
          >
            <Award size={20} />
            Identifier le moins disant
          </button>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-black text-gray-900 mb-2">Gestion des Offres</h1>
          <p className="text-gray-500 font-medium">Référence AO : <span className="text-purple-600 font-bold">{ao?.reference}</span></p>
        </div>

        <div className="grid gap-6">
          {offres.map((offre) => (
            <div key={offre.id} className={`bg-white rounded-[2.5rem] p-8 border ${offre.statut === 'ACCEPTEE' ? 'border-green-200 shadow-green-50' : 'border-gray-100'} shadow-xl group transition-all`}>
              <div className="flex flex-col lg:flex-row justify-between gap-8">
                {/* Left: Supplier & Main Info */}
                <div className="flex-1 space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-purple-50 rounded-[1.5rem] flex items-center justify-center text-purple-600 border border-purple-100">
                      <User size={32} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-gray-900">{offre.fournisseurNom}</h3>
                      <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                        offre.statut === 'ACCEPTEE' ? 'bg-green-100 text-green-700' : 
                        offre.statut === 'REJETEE' ? 'bg-red-100 text-red-700' : 
                        offre.statut === 'ELIMINEE' ? 'bg-gray-800 text-white' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {offre.statut}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Offre</p>
                      <p className="text-xl font-black text-purple-600">{offre.prixTotal.toLocaleString()} MAD</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Livraison</p>
                      <div className="flex items-center gap-2 text-gray-700 font-bold">
                        <Calendar size={16} className="text-gray-400" />
                        {Array.isArray(offre.dateLivraison) ? `${offre.dateLivraison[2]}/${offre.dateLivraison[1]}/${offre.dateLivraison[0]}` : offre.dateLivraison}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Garantie</p>
                      <p className="text-gray-700 font-bold">{offre.dureeGarantie} mois</p>
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
                        Accepter l'offre
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
                        Éliminer (Liste Noire)
                      </button>
                    </>
                  )}
                  {offre.statut === 'ELIMINEE' && (
                    <div className="p-4 bg-gray-100 rounded-2xl text-center">
                      <p className="text-xs font-bold text-gray-500 italic">" {offre.motifRejet} "</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Details Expandable or shown directly */}
              <div className="mt-8 pt-8 border-t border-gray-100 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {offre.lignes.map((line: any, idx: number) => (
                  <div key={idx} className="p-4 bg-gray-50/50 rounded-2xl border border-gray-100 space-y-2">
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-black text-purple-600 uppercase tracking-widest">{line.variante}</span>
                      <span className="text-xs font-bold text-gray-900">{line.prixUnitaire} MAD / u</span>
                    </div>
                    <p className="font-bold text-gray-900">{line.marque || 'Marque non spécifiée'}</p>
                    <div className="flex gap-4 text-[10px] text-gray-500 font-medium">
                      <span>Qté: {line.quantite}</span>
                      {line.cpu && <span>CPU: {line.cpu}</span>}
                      {line.ram && <span>RAM: {line.ram}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {offres.length === 0 && (
            <div className="py-32 text-center bg-white rounded-[3rem] border border-dashed border-gray-200">
              <Package className="mx-auto text-gray-200 mb-4" size={64} />
              <p className="text-gray-500 font-bold text-xl">Aucune offre soumise pour le moment.</p>
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
              placeholder="Expliquez la raison..."
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
                className="flex-1 py-4 bg-gray-900 text-white rounded-2xl font-black hover:bg-gray-800 transition-all disabled:opacity-50"
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

export default OffresGestionPage;
