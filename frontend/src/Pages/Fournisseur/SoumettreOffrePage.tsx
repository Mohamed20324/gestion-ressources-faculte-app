import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Loader, CheckCircle, 
  Truck, Shield, DollarSign, Package,
  Info, Cpu, HardDrive, Monitor, Zap
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { NotificationContainer } from '../../components/Notification';
import { useNotifications } from '../../hooks/useNotifications';

const SoumettreOffrePage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { notifications, showNotification, removeNotification } = useNotifications();

  const [ao, setAo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    dateLivraison: '',
    dureeGarantie: 12,
    lignes: [] as any[]
  });

  useEffect(() => {
    fetchAo();
  }, [id]);

  const fetchAo = async () => {
    try {
      const response = await api.getAppelOffreById(parseInt(id as string));
      if (response.ok) {
        const data = await response.json();
        setAo(data);
        // Initialize lines based on AO needs
        const initialLignes = data.besoins.map((b: any) => ({
          besoinId: b.id,
          typeRessourceId: b.typeRessourceId,
          quantite: b.quantite,
          marque: b.marque || '',
          prixUnitaire: 0,
          variante: b.categorie,
          cpu: b.cpu || '',
          ram: b.ram || '',
          disqueDur: b.disqueDur || '',
          ecran: b.ecran || '',
          vitesseImpression: b.vitesseImpression || 0,
          resolution: b.resolution || '',
          description: b.description || b.descriptionTechnique || ''
        }));
        setFormData(prev => ({ ...prev, lignes: initialLignes }));
      }
    } catch (error) {
      showNotification('error', 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleLineChange = (index: number, field: string, value: any) => {
    const newLignes = [...formData.lignes];
    newLignes[index] = { ...newLignes[index], [field]: value };
    setFormData({ ...formData, lignes: newLignes });
  };

  const calculateTotal = () => {
    return formData.lignes.reduce((sum, line) => sum + (line.prixUnitaire * line.quantite), 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);

    try {
      const payload = {
        appelOffreId: parseInt(id as string),
        fournisseurId: user.id,
        dateLivraison: formData.dateLivraison,
        dureeGarantie: formData.dureeGarantie,
        prixTotal: calculateTotal(),
        statut: 'SOUMISE',
        lignes: formData.lignes
      };

      const response = await api.soumettreOffre(payload);
      if (response.ok) {
        showNotification('success', 'Votre offre a été soumise avec succès !');
        setTimeout(() => navigate('/fournisseur/dashboard'), 2000);
      } else {
        const err = await response.json();
        showNotification('error', err.message || 'Erreur lors de la soumission');
      }
    } catch (error) {
      showNotification('error', 'Erreur technique');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-32">
      <Loader className="animate-spin text-purple-600 mb-4" size={48} />
      <p className="text-gray-500 font-bold">Chargement des détails de l'AO...</p>
    </div>
  );

  return (
    <div className="p-8 bg-gray-50/30 min-h-screen">
      <NotificationContainer notifications={notifications} removeNotification={removeNotification} />
      
      <div className="max-w-5xl mx-auto">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-500 hover:text-purple-600 font-bold mb-8 transition-colors"
        >
          <ArrowLeft size={20} />
          Retour aux appels d'offres
        </button>

        <div className="bg-white rounded-[2.5rem] p-10 shadow-xl border border-gray-100 mb-8">
          <div className="flex justify-between items-start mb-10">
            <div>
              <h1 className="text-3xl font-black text-gray-900 mb-2">Soumettre une Proposition</h1>
              <p className="text-gray-500 font-medium">Référence AO : <span className="text-purple-600 font-bold">{ao?.reference}</span></p>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Total Estimé</p>
              <p className="text-4xl font-black text-purple-600">{calculateTotal().toLocaleString()} MAD</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-12">
            {/* General Info */}
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-xs font-bold text-gray-400 uppercase ml-1 flex items-center gap-2">
                  <Truck size={14} className="text-purple-500" /> Date de Livraison Prévue
                </label>
                <div className="relative group">
                  <Truck size={18} className="absolute right-6 top-1/2 -translate-y-1/2 text-purple-400 group-hover:text-purple-600 transition-colors pointer-events-none" />
                  <input 
                    required
                    type="date"
                    value={formData.dateLivraison}
                    onClick={(e) => (e.target as HTMLInputElement).showPicker()}
                    onChange={e => setFormData({...formData, dateLivraison: e.target.value})}
                    className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-purple-100 outline-none font-bold transition-all cursor-pointer appearance-none"
                  />
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-xs font-bold text-gray-400 uppercase ml-1 flex items-center gap-2">
                  <Shield size={14} className="text-purple-500" /> Garantie (en mois)
                </label>
                <input 
                  required
                  type="number"
                  min="1"
                  value={formData.dureeGarantie}
                  onChange={e => setFormData({...formData, dureeGarantie: parseInt(e.target.value)})}
                  className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-purple-100 outline-none font-bold transition-all"
                />
              </div>
            </div>

            {/* Lines */}
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Package className="text-purple-600" size={24} />
                Détails du Matériel
              </h2>
              
              <div className="space-y-6">
                {formData.lignes.map((line, index) => (
                  <div key={index} className="bg-gray-50/50 rounded-3xl p-8 border border-gray-100 space-y-6 transition-all hover:bg-white hover:shadow-lg hover:border-purple-100">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-[10px] font-black uppercase tracking-wider mb-2 inline-block">
                          {line.variante}
                        </span>
                        <h4 className="text-lg font-bold text-gray-900">Quantité demandée : {line.quantite} unités</h4>
                        {line.description && (
                          <p className="text-sm text-gray-500 mt-1 italic">"{line.description}"</p>
                        )}
                      </div>
                      <div className="w-48 space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Prix Unitaire (MAD)</label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                          <input 
                            required
                            type="number"
                            min="0"
                            step="0.01"
                            value={line.prixUnitaire}
                            onChange={e => handleLineChange(index, 'prixUnitaire', parseFloat(e.target.value))}
                            className="w-full pl-9 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none font-bold"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6 pt-4 border-t border-gray-100/50">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase">Marque</label>
                        <input 
                          required
                          placeholder="Ex: Dell, HP, Epson..."
                          value={line.marque}
                          onChange={e => handleLineChange(index, 'marque', e.target.value)}
                          className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 font-medium"
                        />
                      </div>

                      {line.variante === 'ORDINATEUR' && (
                        <>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase flex items-center gap-1">
                              <Cpu size={12} /> CPU / RAM (Requis)
                            </label>
                            <div className="flex gap-2">
                              <input 
                                readOnly
                                value={line.cpu} 
                                className="w-1/2 px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-xl outline-none text-gray-500 font-bold text-sm cursor-not-allowed" 
                              />
                              <input 
                                readOnly
                                value={line.ram} 
                                className="w-1/2 px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-xl outline-none text-gray-500 font-bold text-sm cursor-not-allowed" 
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase flex items-center gap-1">
                              <HardDrive size={12} /> Disque / Écran (Requis)
                            </label>
                            <div className="flex gap-2">
                              <input 
                                readOnly
                                value={line.disqueDur} 
                                className="w-1/2 px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-xl outline-none text-gray-500 font-bold text-sm cursor-not-allowed" 
                              />
                              <input 
                                readOnly
                                value={line.ecran} 
                                className="w-1/2 px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-xl outline-none text-gray-500 font-bold text-sm cursor-not-allowed" 
                              />
                            </div>
                          </div>
                        </>
                      )}

                      {line.variante === 'IMPRIMANTE' && (
                        <>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase flex items-center gap-1">
                              <Zap size={12} /> Vitesse (Requis)
                            </label>
                            <input 
                              readOnly
                              value={line.vitesseImpression + " ppm"} 
                              className="w-full px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-xl outline-none text-gray-500 font-bold cursor-not-allowed" 
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase flex items-center gap-1">
                              <Monitor size={12} /> Résolution (Requis)
                            </label>
                            <input 
                              readOnly
                              value={line.resolution} 
                              className="w-full px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-xl outline-none text-gray-500 font-bold cursor-not-allowed" 
                            />
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button 
              type="submit"
              disabled={submitting}
              className="w-full py-6 bg-purple-600 text-white rounded-[2rem] font-black text-xl hover:bg-purple-700 transition-all shadow-2xl shadow-purple-200 flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {submitting ? <Loader className="animate-spin" size={24} /> : (
                <>
                  <CheckCircle size={24} />
                  Confirmer la Soumission de l'Offre
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SoumettreOffrePage;
