import { useState, useEffect, type ReactNode } from 'react';
import {
  FileText, Loader, CheckCircle,
  XCircle, Clock, Search, X, ChevronRight,
  Calendar, DollarSign, Shield, Tag
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: ReactNode }> = {
  SOUMISE:  { label: 'En attente',  color: 'text-blue-700',  bg: 'bg-blue-50 border-blue-200',  icon: <Clock size={12} /> },
  ACCEPTEE: { label: 'Acceptée',    color: 'text-green-700', bg: 'bg-green-50 border-green-200', icon: <CheckCircle size={12} /> },
  REJETEE:  { label: 'Refusée',     color: 'text-red-700',   bg: 'bg-red-50 border-red-200',     icon: <XCircle size={12} /> },
  ELIMINEE: { label: 'Éliminée',    color: 'text-gray-600',  bg: 'bg-gray-100 border-gray-200',  icon: <XCircle size={12} /> },
};

const StatusBadge = ({ statut }: { statut: string }) => {
  const cfg = STATUS_CONFIG[statut] ?? { label: statut, color: 'text-gray-600', bg: 'bg-gray-100 border-gray-200', icon: null };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${cfg.bg} ${cfg.color}`}>
      {cfg.icon}
      {cfg.label}
    </span>
  );
};

const formatDate = (d: any) => {
  if (!d) return '—';
  if (Array.isArray(d)) return `${String(d[2]).padStart(2,'0')}/${String(d[1]).padStart(2,'0')}/${d[0]}`;
  return new Date(d).toLocaleDateString('fr-FR');
};

const MesSoumissionsPage = () => {
  const { user } = useAuth();
  const [soumissions, setSoumissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selected, setSelected] = useState<any>(null);

  useEffect(() => {
    if (!user?.id) return;
    fetchSoumissions();
  }, [user?.id]);

  const fetchSoumissions = async () => {
    setLoading(true);
    try {
      const res = await api.getMyOffres(user!.id);
      if (res.ok) setSoumissions(await res.json());
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  const filtered = soumissions.filter(s => {
    const matchSearch = (s.appelOffreReference ?? '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || s.statut === statusFilter;
    return matchSearch && matchStatus;
  });

  const counts = {
    ALL: soumissions.length,
    SOUMISE: soumissions.filter(s => s.statut === 'SOUMISE').length,
    ACCEPTEE: soumissions.filter(s => s.statut === 'ACCEPTEE').length,
    REJETEE: soumissions.filter(s => s.statut === 'REJETEE').length,
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="text-purple-600" size={26} />
            Mes Soumissions
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">Historique de vos propositions commerciales</p>
        </div>

        {/* Filters bar */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4 flex flex-col sm:flex-row gap-3 shadow-sm">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Rechercher par référence AO..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-200 transition-all"
            />
          </div>
          {/* Status tabs */}
          <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
            {(['ALL', 'SOUMISE', 'ACCEPTEE', 'REJETEE'] as const).map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  statusFilter === s
                    ? 'bg-white text-purple-700 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {s === 'ALL' ? 'Tous' : s === 'SOUMISE' ? 'En attente' : s === 'ACCEPTEE' ? 'Acceptées' : 'Refusées'}
                <span className={`ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                  statusFilter === s ? 'bg-purple-100 text-purple-700' : 'bg-gray-200 text-gray-500'
                }`}>
                  {s === 'REJETEE' ? counts.REJETEE : counts[s]}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="py-24 flex flex-col items-center gap-3 text-gray-400">
              <Loader className="animate-spin" size={32} />
              <p className="text-sm font-medium">Chargement…</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-24 flex flex-col items-center gap-3 text-gray-400">
              <FileText size={40} className="text-gray-200" />
              <p className="text-sm font-medium">Aucune soumission trouvée</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-5 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Référence AO</th>
                  <th className="text-left px-5 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Statut</th>
                  <th className="text-left px-5 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Date soumission</th>
                  <th className="text-left px-5 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Montant total</th>
                  <th className="text-left px-5 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Garantie</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(s => (
                  <tr
                    key={s.id}
                    onClick={() => setSelected(s)}
                    className="hover:bg-purple-50/40 cursor-pointer transition-colors group"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-1 h-8 rounded-full ${
                          s.statut === 'ACCEPTEE' ? 'bg-green-400' :
                          s.statut === 'REJETEE' || s.statut === 'ELIMINEE' ? 'bg-red-400' :
                          'bg-blue-400'
                        }`} />
                        <div>
                          <p className="font-semibold text-gray-900">{s.appelOffreReference ?? `AO-${s.appelOffreId}`}</p>
                          <p className="text-[11px] text-gray-400">ID #{s.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge statut={s.statut} />
                      {(s.statut === 'REJETEE' || s.statut === 'ELIMINEE') && s.motifRejet && (
                        <p className="text-[10px] text-red-500 mt-1 italic max-w-[160px] truncate">"{s.motifRejet}"</p>
                      )}
                    </td>
                    <td className="px-5 py-4 text-gray-600">{formatDate(s.dateSoumission)}</td>
                    <td className="px-5 py-4 font-semibold text-gray-900">
                      {s.prixTotal != null ? `${s.prixTotal.toLocaleString()} MAD` : '—'}
                    </td>
                    <td className="px-5 py-4 text-gray-600">{s.dureeGarantie} mois</td>
                    <td className="px-5 py-4 text-right">
                      <ChevronRight size={16} className="text-gray-300 group-hover:text-purple-500 transition-colors inline" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <p className="text-xs text-gray-400 text-right">{filtered.length} résultat{filtered.length > 1 ? 's' : ''}</p>
      </div>

      {/* Detail Modal */}
      {selected && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Détails de la soumission</h2>
                <p className="text-sm text-gray-400 mt-0.5">
                  AO : <span className="text-purple-600 font-semibold">{selected.appelOffreReference}</span>
                  {' · '}ID #{selected.id}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge statut={selected.statut} />
                <button
                  onClick={() => setSelected(null)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Modal body */}
            <div className="overflow-y-auto p-6 space-y-6">

              {/* Rejection reason banner */}
              {(selected.statut === 'REJETEE' || selected.statut === 'ELIMINEE') && selected.motifRejet && (
                <div className="flex gap-3 p-4 bg-red-50 border border-red-100 rounded-xl">
                  <XCircle className="text-red-500 shrink-0 mt-0.5" size={18} />
                  <div>
                    <p className="text-sm font-bold text-red-700">Motif du refus</p>
                    <p className="text-sm text-red-600 mt-0.5">"{selected.motifRejet}"</p>
                  </div>
                </div>
              )}

              {/* Acceptance banner */}
              {selected.statut === 'ACCEPTEE' && (
                <div className="flex gap-3 p-4 bg-green-50 border border-green-100 rounded-xl">
                  <CheckCircle className="text-green-500 shrink-0 mt-0.5" size={18} />
                  <div>
                    <p className="text-sm font-bold text-green-700">Offre retenue</p>
                    <p className="text-sm text-green-600 mt-0.5">Félicitations ! Votre offre a été sélectionnée. Préparez la livraison.</p>
                  </div>
                </div>
              )}

              {/* Key figures */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { icon: <DollarSign size={15} />, label: 'Total', value: selected.prixTotal != null ? `${selected.prixTotal.toLocaleString()} MAD` : '—', color: 'text-green-600' },
                  { icon: <Calendar size={15} />, label: 'Soumis le', value: formatDate(selected.dateSoumission), color: 'text-purple-600' },
                  { icon: <Calendar size={15} />, label: 'Livraison', value: formatDate(selected.dateLivraison), color: 'text-blue-600' },
                  { icon: <Shield size={15} />, label: 'Garantie', value: `${selected.dureeGarantie} mois`, color: 'text-amber-600' },
                ].map((item, i) => (
                  <div key={i} className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                    <div className={`flex items-center gap-1 ${item.color} mb-1`}>{item.icon}<span className="text-[10px] font-bold uppercase tracking-wider">{item.label}</span></div>
                    <p className="font-bold text-gray-900 text-sm">{item.value}</p>
                  </div>
                ))}
              </div>

              {/* Lines */}
              {selected.lignes?.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                    <Tag size={15} className="text-purple-500" />
                    Articles proposés ({selected.lignes.length})
                  </h3>
                  <div className="space-y-2">
                    {selected.lignes.map((ligne: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600 text-xs font-bold shrink-0">
                            {idx + 1}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold text-purple-600 bg-purple-50 border border-purple-100 px-2 py-0.5 rounded">
                                {ligne.variante}
                              </span>
                              <span className="font-semibold text-gray-900 text-sm">{ligne.marque}</span>
                            </div>
                            {/* Technical specs */}
                            <div className="flex flex-wrap gap-2 mt-1">
                              {ligne.variante === 'ORDINATEUR' && (
                                <>
                                  {ligne.cpu && <span className="text-[10px] text-gray-500">{ligne.cpu}</span>}
                                  {ligne.ram && <span className="text-[10px] text-gray-500">• {ligne.ram}</span>}
                                  {ligne.disqueDur && <span className="text-[10px] text-gray-500">• {ligne.disqueDur}</span>}
                                  {ligne.ecran && <span className="text-[10px] text-gray-500">• {ligne.ecran}</span>}
                                </>
                              )}
                              {ligne.variante === 'IMPRIMANTE' && (
                                <>
                                  {ligne.vitesseImpression && <span className="text-[10px] text-gray-500">{ligne.vitesseImpression} ppm</span>}
                                  {ligne.resolution && <span className="text-[10px] text-gray-500">• {ligne.resolution}</span>}
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-right shrink-0 ml-4">
                          <p className="font-bold text-gray-900 text-sm">{ligne.prixUnitaire?.toLocaleString()} MAD</p>
                          <p className="text-[11px] text-gray-400">× {ligne.quantite} unité{ligne.quantite > 1 ? 's' : ''}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MesSoumissionsPage;
