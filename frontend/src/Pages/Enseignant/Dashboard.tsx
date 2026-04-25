import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import {
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip
} from 'recharts';
import {
    FileText, Package, Video, CheckCircle,
    Clock, Activity, Loader, Calendar,
    ChevronRight, ArrowUpRight, AlertTriangle, Monitor
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const COLORS = ['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

const StatCard = ({ title, value, icon: Icon, trend, color, bgColor, subtitle }: any) => (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow group">
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm text-gray-500 mb-1">{title}</p>
                <p className="text-2xl font-bold text-gray-900 group-hover:text-purple-600 transition-colors">{value}</p>
                {trend && (
                    <div className="flex items-center gap-1 mt-2">
                        <Activity size={14} className={trend > 0 ? "text-green-500" : "text-red-500"} />
                        <span className={`text-xs ${trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {Math.abs(trend)}% vs mois dernier
                        </span>
                    </div>
                )}
                {subtitle && <p className="text-[10px] text-gray-400 mt-1">{subtitle}</p>}
            </div>
            <div className={`p-3 rounded-lg ${bgColor}`}>
                <Icon size={24} className={color} />
            </div>
        </div>
    </div>
);

const Dashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        needsCount: 0,
        needsValidated: 0,
        needsPending: 0,
        assignmentsCount: 0,
        equipFonctionnel: 0,
        equipEnPanne: 0,
        meetingCount: 0,
        nextMeeting: null as any,
    });
    const [needsByStatus, setNeedsByStatus] = useState<any[]>([]);
    const [myBesoins, setMyBesoins] = useState<any[]>([]);
    const [myEquipments, setMyEquipments] = useState<any[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            if (!user) return;
            try {
                const safeFetch = async (apiCall: any) => {
                    try { const res = await apiCall(); if (res.ok) return await res.json(); return []; } catch { return []; }
                };

                // Get user details to find department
                const userData = await safeFetch(() => fetch(`http://localhost:8081/api/utilisateurs/${user.id}`, {
                    headers: { 'Authorization': `Bearer ${user.accessToken}`, 'Content-Type': 'application/json' }
                }));
                const deptId = userData?.departementId;

                const [besoins, affectations, reunions, signalements] = await Promise.all([
                    safeFetch(() => api.getBesoinsByEnseignant(user.id)),
                    safeFetch(() => api.getAffectationsByEnseignant(user.id)),
                    deptId ? safeFetch(() => api.getReunionsByDepartement(deptId)) : Promise.resolve([]),
                    safeFetch(() => api.getAllSignalements()),
                ]);

                const besoinsArr = Array.isArray(besoins) ? besoins : [];
                const affArr = Array.isArray(affectations) ? affectations : [];
                const reunionsArr = Array.isArray(reunions) ? reunions : [];
                const sigArr = Array.isArray(signalements) ? signalements : [];

                // My signalements (where I reported)
                const mySig = sigArr.filter((s: any) => s.signaleurId === user.id);

                // Equipment from affectations
                const fonctionnel = affArr.filter((a: any) => !mySig.some((s: any) => s.ressourceId === a.ressourceId && (s.statut === 'SIGNALE' || s.statut === 'EN_COURS')));
                const enPanne = affArr.filter((a: any) => mySig.some((s: any) => s.ressourceId === a.ressourceId && (s.statut === 'SIGNALE' || s.statut === 'EN_COURS')));

                // Next meeting
                const next = reunionsArr
                    .filter((m: any) => m.statut === 'PLANIFIEE')
                    .sort((a: any, b: any) => {
                        const dateA = Array.isArray(a.date) ? new Date(a.date[0], a.date[1] - 1, a.date[2]) : new Date(a.date);
                        const dateB = Array.isArray(b.date) ? new Date(b.date[0], b.date[1] - 1, b.date[2]) : new Date(b.date);
                        return dateA.getTime() - dateB.getTime();
                    })[0];

                // Needs by status
                const statusMap: Record<string, number> = {};
                besoinsArr.forEach((b: any) => { statusMap[b.statut] = (statusMap[b.statut] || 0) + 1; });
                const statusLabels: Record<string, string> = {
                    'EN_ATTENTE': 'En attente', 'ENVOYE': 'Envoyé', 'VALIDE': 'Validé', 'REJETE': 'Rejeté'
                };
                setNeedsByStatus(Object.entries(statusMap).map(([k, v]) => ({ name: statusLabels[k] || k, value: v })));

                setMyBesoins(besoinsArr.slice(-5).reverse());
                setMyEquipments(affArr.slice(0, 4));

                setStats({
                    needsCount: besoinsArr.length,
                    needsValidated: besoinsArr.filter((b: any) => b.statut === 'VALIDE' || b.statut === 'ENVOYE').length,
                    needsPending: besoinsArr.filter((b: any) => b.statut === 'EN_ATTENTE').length,
                    assignmentsCount: affArr.length,
                    equipFonctionnel: fonctionnel.length,
                    equipEnPanne: enPanne.length,
                    meetingCount: reunionsArr.length,
                    nextMeeting: next,
                });
            } catch (error) {
                console.error("Error fetching enseignant dashboard:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader className="animate-spin text-purple-600" size={40} />
            </div>
        );
    }

    const validationRate = stats.needsCount > 0 ? Math.round((stats.needsValidated / stats.needsCount) * 100) : 0;

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'VALIDE': case 'ENVOYE': return 'bg-emerald-50 text-emerald-700';
            case 'EN_ATTENTE': return 'bg-amber-50 text-amber-700';
            case 'REJETE': return 'bg-red-50 text-red-700';
            default: return 'bg-gray-50 text-gray-600';
        }
    };

    return (
        <div className="p-8 bg-gray-50/30 min-h-screen">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Bonjour, {user?.nom} {user?.prenom}</h1>
                <p className="text-gray-500">Voici un aperçu de vos besoins, équipements et réunions.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    title="Mes Besoins"
                    value={stats.needsCount}
                    icon={FileText}
                    subtitle={`${stats.needsValidated} validés · ${stats.needsPending} en attente`}
                    color="text-purple-600"
                    bgColor="bg-purple-50"
                />
                <StatCard
                    title="Mes Équipements"
                    value={stats.assignmentsCount}
                    icon={Package}
                    subtitle={`${stats.equipFonctionnel} OK · ${stats.equipEnPanne} en panne`}
                    color="text-blue-600"
                    bgColor="bg-blue-50"
                />
                <StatCard
                    title="Taux de Validation"
                    value={`${validationRate}%`}
                    icon={CheckCircle}
                    color="text-green-600"
                    bgColor="bg-green-50"
                />
                <StatCard
                    title="Réunions Département"
                    value={stats.meetingCount}
                    icon={Video}
                    color="text-orange-600"
                    bgColor="bg-orange-50"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {/* Besoins by status */}
                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                        <h3 className="font-bold text-gray-900 mb-6">Mes Besoins par Statut</h3>
                        {needsByStatus.length > 0 ? (
                            <>
                                <div className="h-[250px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={needsByStatus}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={80}
                                                paddingAngle={5}
                                                dataKey="value"
                                            >
                                                {needsByStatus.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                            </Pie>
                                            <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="space-y-3 w-full mt-4">
                                    {needsByStatus.map((item, i) => (
                                        <div key={i} className="flex justify-between items-center p-2.5 bg-gray-50 rounded-xl">
                                            <div className="flex items-center gap-2">
                                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                                                <span className="text-sm font-medium text-gray-600">{item.name}</span>
                                            </div>
                                            <span className="text-sm font-bold text-gray-900">{item.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <p className="text-center text-gray-400 py-12">Aucun besoin enregistré.</p>
                        )}
                    </div>

                    {/* Recent Besoins */}
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="font-bold text-gray-900">Historique des Demandes</h3>
                        </div>
                        <div className="divide-y divide-gray-50 flex-1 overflow-y-auto">
                            {myBesoins.length > 0 ? myBesoins.map((b: any) => (
                                <div key={b.id} className="p-4 px-6 hover:bg-gray-50 transition-colors flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center">
                                            <FileText size={16} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-900">Besoin #{b.id} · Qté {b.quantite}</p>
                                            <p className="text-[10px] text-gray-500">{b.description || 'Pas de description'}</p>
                                        </div>
                                    </div>
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${getStatusStyle(b.statut)}`}>{b.statut}</span>
                                </div>
                            )) : (
                                <p className="p-6 text-center text-gray-400 text-sm">Aucune demande.</p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    {/* Next Meeting */}
                    <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-8 rounded-xl text-white shadow-xl relative overflow-hidden group">
                        <div className="relative z-10 flex flex-col h-full justify-between">
                            <div>
                                <div className="flex items-center justify-between mb-6">
                                    <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                                        <Calendar size={24} />
                                    </div>
                                    <span className="text-[10px] font-bold text-indigo-100 bg-white/10 px-3 py-1 rounded-full uppercase tracking-wider">Prochaine Réunion</span>
                                </div>
                                <h3 className="text-xl font-bold mb-2">Session de Département</h3>
                                {stats.nextMeeting ? (
                                    <div className="space-y-4 mt-4">
                                        <div className="flex items-center gap-4 text-indigo-100 text-sm">
                                            <span className="flex items-center gap-1.5"><Calendar size={14} /> {Array.isArray(stats.nextMeeting.date) ? `${stats.nextMeeting.date[2]}/${stats.nextMeeting.date[1]}/${stats.nextMeeting.date[0]}` : stats.nextMeeting.date}</span>
                                            <span className="flex items-center gap-1.5"><Clock size={14} /> {stats.nextMeeting.heure}</span>
                                        </div>
                                        <button
                                            onClick={() => navigate('/enseignant/meetings')}
                                            className="w-full mt-6 py-3.5 bg-white text-indigo-700 rounded-lg font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2 group-hover:scale-[1.02] text-sm"
                                        >
                                            Voir les détails
                                            <ArrowUpRight size={16} />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="py-10 text-center bg-white/5 rounded-xl border border-white/10 mt-4">
                                        <p className="text-white/60 font-medium italic">Aucune réunion prévue</p>
                                    </div>
                                )}
                            </div>
                        </div>
                        <Video className="absolute -bottom-10 -right-10 text-white opacity-[0.05] group-hover:scale-110 transition-transform duration-700" size={150} />
                    </div>

                    {/* Equipment Status */}
                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                        <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <Monitor size={18} className="text-blue-500" />
                            Mes Équipements
                        </h3>
                        {myEquipments.length > 0 ? (
                            <div className="space-y-3">
                                {myEquipments.map((eq: any, i: number) => (
                                    <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                        <span className="text-sm font-semibold text-gray-700 truncate max-w-[140px]">{eq.ressourceMarque || `Ressource #${eq.ressourceId}`}</span>
                                        <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-lg">Actif</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-center text-gray-400 text-sm py-6">Aucun équipement affecté.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
