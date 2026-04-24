import { useState, useEffect } from 'react';
import { 
  PackageCheck, Loader, Truck, 
  MapPin, Globe, User, Building2, 
  CheckCircle, Plus, Info, Search, AlertTriangle,
  ArrowLeft, Calendar, FileText, Archive, RotateCcw
} from 'lucide-react';
import { api } from '../../../services/api';
import { useNotifications } from '../../../hooks/useNotifications';
import { NotificationContainer } from '../../../components/Notification';

const ReceptionPage = () => {
  const { notifications, showNotification, removeNotification } = useNotifications();
  const [offresAcceptees, setOffresAcceptees] = useState<any[]>([]);
  const [echanges, setEchanges] = useState<any[]>([]);
  const [filterStatut, setFilterStatut] = useState('ATTENTE');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [showViewModal, setShowViewModal] = useState({ show: false, offre: null as any, items: [] as any[] });
  const [selectedOffre, setSelectedOffre] = useState<any>(null);
  const [fournisseurInfo, setFournisseurInfo] = useState({
    lieu: '',
    adresse: '',
    siteInternet: '',
    gerant: ''
  });
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const oRes = await fetch('http://localhost:8081/api/offres', { 
        headers: { 'Authorization': `Bearer ${JSON.parse(localStorage.getItem('user')!).accessToken}` } 
      });
      if (oRes.ok) {
        const allOffres = await oRes.json();
        setOffresAcceptees(allOffres.filter((o: any) => o.statut === 'ACCEPTEE' || o.statut === 'LIVREE' || o.statut === 'LIVREE_RETARD'));
      }

      const sRes = await api.getAllSignalements();
      if (sRes.ok) {
        const allS = await sRes.json();
        // Get exchanges with a delivery date
        setEchanges(allS.filter((s: any) => s.statut === 'ECHANGE' || s.statutEchange === 'RECUE'));
      }
    } catch (error) {
      showNotification('error', 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleReceptionnerEchange = async (sigId: number) => {
    if (!window.confirm("Confirmer la réception de cet échange ?")) return;
    setLoading(true);
    try {
      const res = await api.receptionnerEchange(sigId);
      if (res.ok) {
        showNotification('success', 'Échange réceptionné ! Les notifications ont été envoyées.');
        loadData();
      }
    } catch (error) {
      showNotification('error', 'Erreur lors de la réception');
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
      // 1. Update Supplier Info
      await api.updateFournisseurInfo(selectedOffre.fournisseurId, fournisseurInfo);

      // 2. Process Items
      await Promise.all(items.map(async (it) => {
        // Fetch Besoin to get original department if needed (but we'll keep it available for any dept)
        const bRes = await fetch(`http://localhost:8081/api/besoins/${it.besoinId}`, {
          headers: { 'Authorization': `Bearer ${JSON.parse(localStorage.getItem('user')!).accessToken}` }
        });
        const bData = await bRes.json();

        const dateReception = new Date();
        const dateFinGarantie = new Date(dateReception);
        dateFinGarantie.setFullYear(dateFinGarantie.getFullYear() + (selectedOffre.dureeGarantie / 12 || 1));

        const res = await api.createRessource({
          numeroInventaire: it.numeroInventaire,
          marque: it.marque,
          statut: 'DISPONIBLE',
          typeRessourceId: it.typeRessourceId,
          fournisseurId: selectedOffre.fournisseurId,
          offreOrigineId: selectedOffre.id,
          departementId: bData.departementId,
          dateFinGarantie: dateFinGarantie.toISOString().split('T')[0],
          dateReception: dateReception.toISOString().split('T')[0],
          // Technical specs
          cpu: it.cpu,
          ram: it.ram,
          disqueDur: it.disqueDur,
          ecran: it.ecran,
          vitesseImpression: it.vitesseImpression,
          resolution: it.resolution,
          categorie: bData.cpu || bData.ram ? 'ORDINATEUR' : (bData.vitesseImpression ? 'IMPRIMANTE' : 'STANDARD')
        });

        if (res.ok) {
          // Delete the need as it is now satisfied and converted to a resource
          await fetch(`http://localhost:8081/api/besoins/${it.besoinId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${JSON.parse(localStorage.getItem('user')!).accessToken}` }
          });
        }
      }));

      // Mark Offre as LIVREE or LIVREE_RETARD
      const isActuallyLate = new Date() > new Date(selectedOffre.dateLivraison);
      const newStatut = isActuallyLate ? 'LIVREE_RETARD' : 'LIVREE';
      await api.updateOffreStatus(selectedOffre.id, newStatut);

      showNotification('success', isActuallyLate ? 'Réception enregistrée avec retard.' : 'Livraison réceptionnée et inventaire mis à jour.');
      setSelectedOffre(null);
      loadData();
    } catch (error) {
      showNotification('error', 'Erreur lors de la validation technique');
    } finally {
      setSaving(false);
    }
  };

  const handleSendLateWarning = async (fournisseurId: number, referenceAO: string) => {
    try {
      const res = await api.sendLateWarning(fournisseurId, referenceAO);
      if (res.ok) {
        showNotification('success', 'Avertissement de retard envoyé au fournisseur');
      } else {
        showNotification('error', 'Erreur lors de l\'envoi');
      }
    } catch (error) {
      showNotification('error', 'Erreur technique');
    }
  };

  const handleAnnulerAcceptation = async (offre: any) => {
    if (!window.confirm("Voulez-vous vraiment annuler l'acceptation de cette offre ? Elle repassera en attente de traitement.")) return;
    
    setLoading(true);
    try {
      const res = await api.annulerAcceptation(offre.id);
      if (res.ok) {
        showNotification('success', 'Acceptation annulée. L\'appel d\'offres a été réouvert.');
        loadData();
      } else {
        const err = await res.json();
        showNotification('error', err.message || "Erreur lors de l'annulation");
      }
    } catch (error) {
      showNotification('error', 'Erreur technique');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelReception = async (offre: any) => {
    if (!window.confirm("Voulez-vous vraiment annuler la réception de cette offre ? Les ressources seront supprimées, l'appel d'offres sera ré-ouvert et les besoins redeviendront modifiables (non envoyés).")) return;
    
    setLoading(true);
    try {
      const res = await api.annulerReception(offre.id);
      if (res.ok) {
        showNotification('success', 'Réception annulée. L\'appel d\'offres est ré-ouvert et les besoins sont réinitialisés.');
        loadData();
      } else {
        const err = await res.json();
        showNotification('error', err.message || "Erreur lors de l'annulation");
      }
    } catch (error) {
      showNotification('error', 'Erreur technique lors de l\'annulation');
    } finally {
      setLoading(false);
    }
  };

  const handleViewItems = async (offre: any) => {
    try {
      const res = await api.getRessourcesByOffre(offre.id);
      if (res.ok) {
        const data = await res.json();
        setShowViewModal({ show: true, offre, items: data });
      }
    } catch (error) {
      showNotification('error', 'Erreur de chargement des ressources');
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

        <div className="flex bg-white p-1 rounded-2xl border border-gray-100 shadow-sm mb-8 w-fit">
          {[
            { id: 'ALL', label: 'Toutes', count: offresAcceptees.length },
            { id: 'ATTENTE', label: 'En attente', count: offresAcceptees.filter(o => o.statut === 'ACCEPTEE').length },
            { id: 'RECUE', label: 'Réceptionnées', count: offresAcceptees.filter(o => o.statut === 'LIVREE' || o.statut === 'LIVREE_RETARD').length },
            { id: 'ECHANGES', label: 'Échanges', count: echanges.filter(e => e.statutEchange !== 'RECUE').length }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilterStatut(tab.id)}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
                filterStatut === tab.id 
                ? 'bg-gray-900 text-white shadow-lg' 
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              {tab.label}
              <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${filterStatut === tab.id ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <div className="grid gap-4">
          {offresAcceptees.filter(o => {
            if (filterStatut === 'ALL') return true;
            if (filterStatut === 'ATTENTE') return o.statut === 'ACCEPTEE';
            if (filterStatut === 'RECUE') return o.statut === 'LIVREE' || o.statut === 'LIVREE_RETARD';
            return true;
          }).map(o => {
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
                        {o.statut === 'LIVREE' ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-50 text-emerald-600 border border-emerald-100">Réceptionnée</span>
                        ) : o.statut === 'LIVREE_RETARD' ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-50 text-amber-600 border border-amber-100">Reçu avec retard</span>
                        ) : isLate ? (
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
                  
                    <div className="flex flex-col sm:flex-row items-center gap-3">
                      {o.statut.startsWith('LIVREE') ? (
                        <div className="flex items-center gap-2">
                            <button 
                              onClick={() => handleViewItems(o)}
                              className="flex items-center gap-2 text-emerald-600 font-bold text-sm bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100 hover:bg-emerald-100 transition-all"
                            >
                              <Info size={18} />
                              Voir les ressources
                            </button>
                            <button 
                              onClick={() => handleCancelReception(o)}
                              className="flex items-center gap-2 text-red-600 font-bold text-sm bg-red-50 px-4 py-2 rounded-xl border border-red-100 hover:bg-red-100 transition-all"
                              title="Annuler la réception (matériel non reçu ou erreur)"
                            >
                              <RotateCcw size={18} />
                              Annuler
                            </button>
                        </div>
                      ) : (
                        <>
                          {isLate && (
                            <button 
                              onClick={() => handleSendLateWarning(o.fournisseurId, o.appelOffreReference)}
                              className="px-4 py-2.5 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-100 transition-all text-xs flex items-center gap-2 border border-red-100"
                              title="Envoyer un avertissement de retard"
                            >
                              <AlertTriangle size={16} />
                              Signaler Retard
                            </button>
                          )}
                            <button 
                              onClick={() => handleSelectOffre(o)}
                              className="px-6 py-2.5 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-all shadow-md text-sm flex items-center gap-2"
                            >
                              <PackageCheck size={18} />
                              Réceptionner
                            </button>
                            <button 
                              onClick={() => handleAnnulerAcceptation(o)}
                              className="px-4 py-2.5 bg-white text-red-600 rounded-xl font-bold hover:bg-red-50 transition-all text-xs flex items-center gap-2 border border-red-100"
                              title="Annuler l'acceptation de cette offre"
                            >
                              <RotateCcw size={16} />
                              Annuler
                            </button>
                        </>
                      )}
                    </div>
                </div>
              </div>
            );
          })}
          
          {filterStatut === 'ECHANGES' && echanges.map(e => (
            <div key={e.id} className="bg-white p-6 rounded-2xl border border-purple-100 shadow-sm hover:border-purple-300 transition-all group">
               <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-purple-50 text-purple-600 border border-purple-100">
                      <RotateCcw size={28} />
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-bold text-gray-900">Échange Demande N°{e.id}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${e.statutEchange === 'RECUE' ? 'bg-emerald-50 text-emerald-600' : 'bg-purple-50 text-purple-600'}`}>
                          {e.statutEchange === 'RECUE' ? 'Réceptionné' : 'En attente'}
                        </span>
                      </div>
                      <p className="text-xs font-medium text-gray-500 mt-1 italic">"{e.description}"</p>
                      <div className="flex items-center gap-4 mt-2">
                        {e.dateLivraisonEchange && (
                          <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded-lg flex items-center gap-1">
                            <Calendar size={14}/> Livraison prévue: {Array.isArray(e.dateLivraisonEchange) ? `${e.dateLivraisonEchange[2]}/${e.dateLivraisonEchange[1]}/${e.dateLivraisonEchange[0]}` : e.dateLivraisonEchange}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  {e.statutEchange !== 'RECUE' && e.dateLivraisonEchange && (
                    <button 
                      onClick={() => handleReceptionnerEchange(e.id)}
                      className="px-6 py-2.5 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-all shadow-md text-sm flex items-center gap-2"
                    >
                      <PackageCheck size={18} />
                      Réceptionner l'échange
                    </button>
                  )}
               </div>
            </div>
          ))}

          {offresAcceptees.length === 0 && echanges.length === 0 && !loading && (
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
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Site Internet</label>
                  <div className="relative">
                    <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input 
                      value={fournisseurInfo.siteInternet} 
                      onChange={e => setFournisseurInfo({...fournisseurInfo, siteInternet: e.target.value})} 
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-sm" 
                      placeholder="www.exemple.com"
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
      {/* Modal de visualisation des ressources */}
      {showViewModal.show && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] w-full max-w-4xl max-h-[85vh] overflow-hidden shadow-2xl flex flex-col border border-gray-100">
            <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div>
                <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                  <PackageCheck className="text-emerald-600" size={28} />
                  Détail de la réception
                </h2>
                <p className="text-gray-500 font-medium text-sm mt-1">
                  Offre #{showViewModal.offre.id} - Fournisseur: {showViewModal.offre.fournisseurNom}
                </p>
              </div>
              <button 
                onClick={() => setShowViewModal({ ...showViewModal, show: false })}
                className="w-12 h-12 rounded-2xl bg-white border border-gray-200 text-gray-400 hover:text-gray-900 hover:border-gray-900 transition-all flex items-center justify-center shadow-sm"
              >
                ✕
              </button>
            </div>
            
            <div className="p-8 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {showViewModal.items.map((res: any) => (
                  <div key={res.id} className="p-4 rounded-2xl border border-gray-100 bg-gray-50/50 hover:border-emerald-200 transition-all group">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-emerald-600 shadow-sm">
                        <Archive size={20} />
                      </div>
                      <div className="font-bold text-gray-900 text-sm truncate">{res.marque}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-[10px] font-black text-gray-400 uppercase tracking-wider">N° Inventaire</div>
                      <div className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md w-fit">
                        {res.numeroInventaire}
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-200/50 text-[10px] font-medium text-gray-500 line-clamp-2">
                      {res.descriptionTechnique}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end">
              <button 
                onClick={() => setShowViewModal({ ...showViewModal, show: false })}
                className="px-8 py-3 bg-gray-900 text-white rounded-2xl font-black text-sm hover:bg-black transition-all shadow-lg"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReceptionPage;


