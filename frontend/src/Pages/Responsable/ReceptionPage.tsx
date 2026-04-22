import { useState, useEffect } from 'react';
import { 
  PackageCheck, Loader, Truck, 
  MapPin, Globe, User, Building2, 
  CheckCircle, Plus, Info, Search
} from 'lucide-react';
import { api } from '../../services/api';
import { useNotifications } from '../../hooks/useNotifications';
import { NotificationContainer } from '../../components/Notification';

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
      // Fetch all offers with status ACCEPTEE
      const response = await api.getBesoinsByStatut('ACCEPTEE'); // Simplified for now, should ideally be an AO/Offre filter
      // Actually, let's fetch all offers and filter manually for demonstration
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
      // Fetch supplier info
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
      
      // Initialize items to deliver (one for each quantity unit)
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
      showNotification('error', 'Erreur de chargement des détails');
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
      // 1. Update supplier info
      await api.updateFournisseurInfo(selectedOffre.fournisseurId, fournisseurInfo);

      // 2. Create resources in batch
      // For each item, call createRessource
      await Promise.all(items.map(it => 
        api.createRessource({
          numeroInventaire: it.numeroInventaire,
          marque: it.marque,
          statut: 'FONCTIONNELLE',
          typeRessourceId: it.typeRessourceId,
          descriptionTechnique: `${it.variante}: ${it.cpu || ''} ${it.ram || ''} ${it.vitesseImpression || ''}`
        })
      ));

      showNotification('success', 'Livraison réceptionnée et inventoriée !');
      setSelectedOffre(null);
      loadOffres();
    } catch (error) {
      showNotification('error', 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  if (!selectedOffre) return (
    <div className="p-8 bg-gray-50/30 min-h-screen">
      <NotificationContainer notifications={notifications} removeNotification={removeNotification} />
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-black text-gray-900 mb-8 flex items-center gap-3">
          <Truck className="text-purple-600" size={36} />
          Réception de Livraison
        </h1>

        <div className="grid gap-6">
          {offresAcceptees.map(o => (
            <div key={o.id} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl flex justify-between items-center group hover:border-purple-200 transition-all">
              <div>
                <h3 className="text-xl font-black text-gray-900">{o.fournisseurNom}</h3>
                <p className="text-gray-500 font-medium">Offre #OFR-{o.id} • Total: {o.prixTotal.toLocaleString()} MAD</p>
              </div>
              <button 
                onClick={() => handleSelectOffre(o)}
                className="px-6 py-3 bg-purple-600 text-white rounded-2xl font-black hover:bg-purple-700 transition-all shadow-lg shadow-purple-100"
              >
                Réceptionner
              </button>
            </div>
          ))}
          {offresAcceptees.length === 0 && !loading && (
            <div className="py-20 text-center bg-white rounded-[3rem] border border-dashed border-gray-200">
              <PackageCheck className="mx-auto text-gray-200 mb-4" size={64} />
              <p className="text-gray-500 font-bold">Aucune livraison en attente.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-8 bg-gray-50/30 min-h-screen pb-20">
      <NotificationContainer notifications={notifications} removeNotification={removeNotification} />
      <div className="max-w-5xl mx-auto">
        <button onClick={() => setSelectedOffre(null)} className="text-gray-500 font-bold mb-6 flex items-center gap-2 hover:text-purple-600 transition-colors">
          <Info size={18} /> Retour à la liste
        </button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Supplier Form */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl sticky top-8">
              <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
                <Building2 className="text-purple-600" size={24} />
                Infos Société
              </h2>
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Lieu / Ville</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input value={fournisseurInfo.lieu} onChange={e => setFournisseurInfo({...fournisseurInfo, lieu: e.target.value})} className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 font-medium" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Adresse</label>
                  <input value={fournisseurInfo.adresse} onChange={e => setFournisseurInfo({...fournisseurInfo, adresse: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 font-medium" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Site Internet</label>
                  <div className="relative">
                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input value={fournisseurInfo.siteInternet} onChange={e => setFournisseurInfo({...fournisseurInfo, siteInternet: e.target.value})} className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 font-medium" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Gérant</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input value={fournisseurInfo.gerant} onChange={e => setFournisseurInfo({...fournisseurInfo, gerant: e.target.value})} className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 font-medium" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Items List */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl">
              <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
                <Plus className="text-purple-600" size={24} />
                Affectation des Numéros d'Inventaire
              </h2>
              <div className="space-y-4">
                {items.map((item, idx) => (
                  <div key={idx} className="p-6 bg-gray-50/50 rounded-2xl border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600 font-black text-xs">
                        {idx + 1}
                      </div>
                      <div>
                        <p className="font-black text-gray-900 uppercase text-xs tracking-widest">{item.variante}</p>
                        <p className="text-sm font-bold text-gray-600">{item.marque}</p>
                      </div>
                    </div>
                    <div className="w-full md:w-64 relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      <input 
                        placeholder="N° d'inventaire (Code Barre)"
                        value={item.numeroInventaire}
                        onChange={e => {
                          const newItems = [...items];
                          newItems[idx].numeroInventaire = e.target.value;
                          setItems(newItems);
                        }}
                        className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 font-black text-sm"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <button 
                onClick={handleSave}
                disabled={saving}
                className="w-full mt-10 py-5 bg-purple-600 text-white rounded-3xl font-black text-xl hover:bg-purple-700 transition-all shadow-2xl shadow-purple-100 flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {saving ? <Loader className="animate-spin" /> : (
                  <>
                    <CheckCircle size={24} />
                    Valider la Réception
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReceptionPage;
