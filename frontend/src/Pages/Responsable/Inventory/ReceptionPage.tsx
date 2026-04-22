import { useState, useEffect } from 'react';
import { 
  PackageCheck, Loader, Truck, 
  MapPin, Globe, User, Building2, 
  CheckCircle, Plus, Info, Search, AlertTriangle,
  ArrowLeft, Calendar, FileText
} from 'lucide-react';
import { api } from '../../../services/api';
import { useNotifications } from '../../../hooks/useNotifications';
import { NotificationContainer } from '../../../components/Notification';

const ReceptionPage = () => {
  const { notifications, showNotification, removeNotification } = useNotifications();
  const [offresAcceptees, setOffresAcceptees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [selectedOffre, setSelectedOffre] = useState<any>(null);
  const [fournisseurInfo, setFournisseurInfo] = useState({
    lieu: '',
    adresse: '',
    siteInternet: '',
    gerant: ''
  });
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    loadOffres();
  }, []);

  const loadOffres = async () => {
    try {
      const res = await fetch('http://localhost:8081/api/offres', { 
        headers: { 'Authorization': `Bearer ${JSON.parse(localStorage.getItem('user')!).accessToken}` } 
      });
      if (res.ok) {
        const allOffres = await res.json();
        setOffresAcceptees(allOffres.filter((o: any) => o.statut === 'ACCEPTEE'));
      }
    } catch (error) {
      showNotification('error', 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOffre = async (offre: any) => {
    setSelectedOffre(offre);
    setLoading(true);
    try {
      const fRes = await api.getFournisseurById(offre.fournisseurId);
      if (fRes.ok) {
        const fData = await fRes.json();
        setFournisseurInfo({
          lieu: fData.lieu || '',
          adresse: fData.adresse || '',
          siteInternet: fData.siteInternet || '',
          gerant: fData.gerant || ''
        });
      }
      
      const deliveryItems: any[] = [];
      offre.lignes.forEach((line: any) => {
        for (let i = 0; i < line.quantite; i++) {
          deliveryItems.push({
            besoinId: line.besoinId,
            typeRessourceId: line.typeRessourceId,
            marque: line.marque,
            variante: line.variante,
            numeroInventaire: '',
            cpu: line.cpu,
            ram: line.ram,
            disqueDur: line.disqueDur,
            ecran: line.ecran,
            vitesseImpression: line.vitesseImpression,
            resolution: line.resolution
          });
        }
      });
      setItems(deliveryItems);
    } catch (error) {
      showNotification('error', 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (items.some(it => !it.numeroInventaire)) {
      showNotification('error', 'Veuillez saisir tous les numéros d\'inventaire');
      return;
    }
    setSaving(true);
    try {
      await Promise.all(items.map(async (it) => {
        // 1. Fetch Besoin to get department
        const bRes = await fetch(`http://localhost:8081/api/besoins/${it.besoinId}`, {
          headers: { 'Authorization': `Bearer ${JSON.parse(localStorage.getItem('user')!).accessToken}` }
        });
        const bData = await bRes.json();

        // 2. Create Ressource with departement and warranty
        const dateReception = new Date();
        const dateFinGarantie = new Date(dateReception);
        dateFinGarantie.setFullYear(dateFinGarantie.getFullYear() + 1); // Default 1 year

        const res = await api.createRessource({
          numeroInventaire: it.numeroInventaire,
          marque: it.marque,
          statut: 'FONCTIONNELLE',
          typeRessourceId: it.typeRessourceId,
          departementId: bData.departementId,
          dateFinGarantie: dateFinGarantie.toISOString().split('T')[0],
          descriptionTechnique: `${it.variante}: ${it.cpu || ''} ${it.ram || ''}`
        });

        // 3. Update Besoin status
        if (res.ok) {
          await api.updateBesoin(it.besoinId, { ...bData, statut: 'VALIDE' }); // Mark as fully fulfilled
        }
      }));

      showNotification('success', 'Livraison réceptionnée avec succès');
      setSelectedOffre(null);
      loadOffres();
    } catch (error) {
      showNotification('error', 'Erreur de sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateArr: any) => {
    if (!dateArr || !Array.isArray(dateArr)) return 'N/A';
    return `${dateArr[2].toString().padStart(2, '0')}/${dateArr[1].toString().padStart(2, '0')}/${dateArr[0]}`;
  };

  if (!selectedOffre) return (
    <div className="p-8 bg-gray-50/30 min-h-full pb-8">
      <NotificationContainer notifications={notifications} removeNotification={removeNotification} />
      <div className="max-w-5xl mx-auto">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Réception & Livraison</h1>
          <p className="text-gray-500 mt-1 font-medium">Validez les ressources livrées et enregistrez-les dans l'inventaire.</p>
        </div>

        <div className="grid gap-4">
          {offresAcceptees.map(o => {
            const today = new Date();
            const deliveryDate = Array.isArray(o.dateLivraison) 
              ? new Date(o.dateLivraison[0], o.dateLivraison[1] - 1, o.dateLivraison[2])
              : new Date(o.dateLivraison);
            const isLate = o.dateLivraison && deliveryDate < today;

            return (
              <div key={o.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:border-blue-200 transition-all group">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div className="flex items-center gap-5">
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center border ${isLate ? 'bg-red-50 text-red-600 border-red-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                      <Truck size={28} />
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-bold text-gray-900">{o.fournisseurNom}</h3>
                        {isLate ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-red-50 text-red-600 border border-red-100 animate-pulse">Retard</span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-50 text-blue-600 border border-blue-100">En cours</span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs font-medium text-gray-500">
                        <span className="flex items-center gap-1"><FileText size={14} className="text-gray-400" /> Offre #{o.id}</span>
                        <span className="flex items-center gap-1"><Calendar size={14} className="text-gray-400" /> Prévue le {formatDate(o.dateLivraison)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Montant Total</p>
                      <p className="text-lg font-bold text-gray-900">{o.prixTotal?.toLocaleString()} MAD</p>
                    </div>
                    <button 
                      onClick={() => handleSelectOffre(o)}
                      className="px-6 py-2.5 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-all shadow-md text-sm flex items-center gap-2"
                    >
                      <PackageCheck size={18} />
                      Réceptionner
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
          
          {offresAcceptees.length === 0 && !loading && (
            <div className="py-24 text-center bg-white rounded-3xl border border-dashed border-gray-200">
              <PackageCheck className="mx-auto text-gray-200 mb-4" size={48} />
              <p className="text-gray-500 font-bold">Aucune livraison en attente de réception.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-8 bg-gray-50/30 min-h-full pb-8">
      <NotificationContainer notifications={notifications} removeNotification={removeNotification} />
      <div className="max-w-6xl mx-auto">
        <button 
          onClick={() => setSelectedOffre(null)} 
          className="text-gray-500 font-bold mb-8 flex items-center gap-2 hover:text-blue-600 transition-colors text-sm"
        >
          <ArrowLeft size={18} /> Retour à la liste des livraisons
        </button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Supplier Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm sticky top-8">
              <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Building2 className="text-blue-600" size={20} />
                Informations Société
              </h2>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Ville / Localisation</label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input 
                      value={fournisseurInfo.lieu} 
                      onChange={e => setFournisseurInfo({...fournisseurInfo, lieu: e.target.value})} 
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-sm" 
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Adresse Complète</label>
                  <input 
                    value={fournisseurInfo.adresse} 
                    onChange={e => setFournisseurInfo({...fournisseurInfo, adresse: e.target.value})} 
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-sm" 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Responsable / Gérant</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input 
                      value={fournisseurInfo.gerant} 
                      onChange={e => setFournisseurInfo({...fournisseurInfo, gerant: e.target.value})} 
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-sm" 
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Items Main Area */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold text-gray-900">Inventaire de Réception</h2>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{items.length} unités à marquer</span>
              </div>
              
              <div className="space-y-3">
                {items.map((item, idx) => (
                  <div key={idx} className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex flex-col md:flex-row md:items-center gap-4 group transition-colors hover:bg-white">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center font-bold text-xs">
                        {idx + 1}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-sm">{item.marque}</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{item.variante}</p>
                      </div>
                    </div>
                    <div className="w-full md:w-64 relative">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      <input 
                        placeholder="N° d'inventaire"
                        value={item.numeroInventaire}
                        onChange={e => {
                          const newItems = [...items];
                          newItems[idx].numeroInventaire = e.target.value;
                          setItems(newItems);
                        }}
                        className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-bold text-sm"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-10 pt-6 border-t border-gray-100">
                <button 
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {saving ? <Loader className="animate-spin" /> : (
                    <>
                      <CheckCircle size={22} />
                      Valider la Réception Global
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReceptionPage;


