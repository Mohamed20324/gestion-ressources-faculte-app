import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import {
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    AreaChart, Area, PieChart, Pie, Cell
} from 'recharts';
import {
    Users, Calendar, Loader, Video, TrendingUp, TrendingDown,
    Activity, Clock, ChevronRight, FileText, CheckCircle,
    ArrowUpRight, Package, AlertTriangle
} from 'lucide-react';

const COLORS = ['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

const StatCard = ({ title, value, icon: Icon, trend, color, bgColor, subtitle }: any) => (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow group">
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm text-gray-500 mb-1">{title}</p>
                <p className="text-2xl font-bold text-gray-900 group-hover:text-purple-600 transition-colors">{value}</p>
                {trend && (
                    <div className="flex items-center gap-1 mt-2">
                        {trend > 0 ? (
                            <TrendingUp size={14} className="text-green-500" />
                        ) : (
                            <TrendingDown size={14} className="text-red-500" />
                        )}
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
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        teacherCount: 0,
        meetingCount: 0,
        needsCount: 0,
        validatedNeeds: 0,
        pendingNeeds: 0,
        rejectedNeeds: 0,
        resourceCount: 0,
        resourcesEnPanne: 0,
        nextMeeting: null as any,
        meetingsPerMonth: [] as any[]
    });
    const [needsByStatus, setNeedsByStatus] = useState<any[]>([]);
    const [recentBesoins, setRecentBesoins] = useState<any[]>([]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            if (!user) return;
            try {
                // 1. Get Chef's department ID
                const userRes = await fetch(`http://localhost:8081/api/utilisateurs/${user.id}`, {
                    headers: {
                        'Authorization': `Bearer ${user.accessToken}`,
                        'Content-Type': 'application/json'
                    }
                });
                if (!userRes.ok) return;
                const userData = await userRes.json();
                const deptId = userData.departementId;
                if (!deptId) { setLoading(false); return; }

                const safeFetch = async (apiCall: any) => {
                    try { const res = await apiCall(); if (res.ok) return await res.json(); return []; } catch { return []; }
                };

                // 2. Fetch all data in parallel
                const [teachers, meetings, besoins, ressources] = await Promise.all([
                    safeFetch(() => api.getEnseignantsByDepartement(deptId)),
                    safeFetch(() => api.getReunionsByDepartement(deptId)),
                    safeFetch(() => api.getBesoinsByDepartement(deptId)),
                    safeFetch(() => api.getRessourcesByDepartement(deptId)),
                ]);

                const teachersArr = Array.isArray(teachers) ? teachers : [];
                const meetingsArr = Array.isArray(meetings) ? meetings : [];
                const besoinsArr = Array.isArray(besoins) ? besoins : [];
                const resArr = Array.isArray(ressources) ? ressources : [];

                // 3. Meetings per month chart
                const months = ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun", "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc"];
                const grouped: any = {};
                meetingsArr.forEach((m: any) => {
                    let date = Array.isArray(m.date) ? new Date(m.date[0], m.date[1] - 1, m.date[2]) : new Date(m.date);
                    const month = months[date.getMonth()];
                    if (month) grouped[month] = (grouped[month] || 0) + 1;
                });
                // Only show months that have data or are current/past
                const currentMonth = new Date().getMonth();
                const meetingsPerMonth = months.slice(0, currentMonth + 1).map(m => ({
                    name: m,
                    réunions: grouped[m] || 0
                }));

                // 4. Next meeting
                const next = meetingsArr
                    .filter((m: any) => m.statut === 'PLANIFIEE')
                    .sort((a: any, b: any) => {
                        const dateA = Array.isArray(a.date) ? new Date(a.date[0], a.date[1] - 1, a.date[2]) : new Date(a.date);
                        const dateB = Array.isArray(b.date) ? new Date(b.date[0], b.date[1] - 1, b.date[2]) : new Date(b.date);
                        return dateA.getTime() - dateB.getTime();
                    })[0];

                // 5. Needs by status
                const validated = besoinsArr.filter((b: any) => b.statut === 'VALIDE' || b.statut === 'ENVOYE').length;
                const pending = besoinsArr.filter((b: any) => b.statut === 'EN_ATTENTE').length;
                const rejected = besoinsArr.filter((b: any) => b.statut === 'REJETE').length;

                const statusData = [
                    { name: 'Validés', value: validated },
                    { name: 'En attente', value: pending },
                    { name: 'Rejetés', value: rejected },
                ].filter(d => d.value > 0);
                setNeedsByStatus(statusData);

                // 6. Recent pending besoins
                setRecentBesoins(besoinsArr.filter((b: any) => b.statut === 'EN_ATTENTE').slice(-5).reverse());

                const enPanne = resArr.filter((r: any) => r.statut === 'EN_PANNE' || r.statut === 'EN_MAINTENANCE').length;

                setStats({
                    teacherCount: teachersArr.length,
                    meetingCount: meetingsArr.length,
                    needsCount: besoinsArr.length,
                    validatedNeeds: validated,
                    pendingNeeds: pending,
                    rejectedNeeds: rejected,
                    resourceCount: resArr.length,
                    resourcesEnPanne: enPanne,
                    nextMeeting: next,
                    meetingsPerMonth
                });

            } catch (error) {
                console.error("Erreur chargement dashboard:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [user]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[500px]">
                <Loader className="animate-spin text-purple-600" size={48} />
            </div>
        );
    }

    const validationRate = stats.needsCount > 0 ? Math.round((stats.validatedNeeds / stats.needsCount) * 100) : 0;

    return (
        <div className="p-8 bg-gray-50/30 min-h-screen">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Tableau de Bord Départemental</h1>
                    <p className="text-gray-500 mt-1">Gérez efficacement les ressources et les réunions de votre département.</p>
                </div>
                <div className="flex items-center gap-3 bg-white p-2 px-4 rounded-xl shadow-sm border border-gray-100">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-sm font-bold text-gray-700">Département Actif</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    title="Enseignants"
                    value={stats.teacherCount}
                    icon={Users}
                    color="text-blue-600"
                    bgColor="bg-blue-50"
                />
                <StatCard
                    title="Réunions"
                    value={stats.meetingCount}
                    icon={Video}
                    color="text-purple-600"
                    bgColor="bg-purple-50"
                />
                <StatCard
                    title="Besoins Soumis"
                    value={stats.needsCount}
                    icon={FileText}
                    subtitle={`${stats.validatedNeeds} validés · ${stats.pendingNeeds} en attente`}
                    color="text-orange-600"
                    bgColor="bg-orange-50"
                />
                <StatCard
                    title="Validation"
                    value={`${validationRate}%`}
                    icon={CheckCircle}
                    subtitle={`${stats.resourceCount} ressources · ${stats.resourcesEnPanne} en panne`}
                    color="text-green-600"
                    bgColor="bg-green-50"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {/* Meetings chart */}
                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="font-bold text-gray-900">Activité des Réunions</h3>
                                <p className="text-sm text-gray-500">Volume de sessions par mois</p>
                            </div>
                        </div>
                        <div className="h-[350px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={stats.meetingsPerMonth}>
                                    <defs>
                                        <linearGradient id="colorMeetings" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} />
                                    <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                                    <Area type="monotone" dataKey="réunions" stroke="#8B5CF6" strokeWidth={4} fillOpacity={1} fill="url(#colorMeetings)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Pending Besoins - REAL DATA */}
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="font-bold text-gray-900">Besoins en Attente de Validation</h3>
                            <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">{stats.pendingNeeds} en attente</span>
                        </div>
                        <div className="divide-y divide-gray-50">
                            {recentBesoins.length > 0 ? recentBesoins.map((b: any) => (
                                <div key={b.id} className="p-4 px-6 hover:bg-gray-50 transition-colors flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-9 h-9 bg-orange-50 text-orange-600 rounded-lg flex items-center justify-center">
                                            <FileText size={18} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-900">Besoin #{b.id} · Qté {b.quantite}</p>
                                            <p className="text-xs text-gray-500 truncate max-w-[200px]">{b.description || 'Pas de description'} {b.enseignantId ? `· Enseignant #${b.enseignantId}` : '· Collectif'}</p>
                                        </div>
                                    </div>
                                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-100">En attente</span>
                                </div>
                            )) : (
                                <p className="p-6 text-center text-gray-400 text-sm">Aucun besoin en attente. Tout est validé ! ✅</p>
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
                                        <button className="w-full mt-6 py-3.5 bg-white text-indigo-700 rounded-lg font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2 group-hover:scale-[1.02] text-sm">
                                            Détails de la session
                                            <ArrowUpRight size={16} />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="py-8 text-center bg-white/5 rounded-lg border border-white/10 mt-4">
                                        <p className="text-white/60 font-medium italic">Aucun planning actuel</p>
                                    </div>
                                )}
                            </div>
                        </div>
                        <Video className="absolute -bottom-10 -right-10 text-white opacity-[0.05] group-hover:scale-110 transition-transform duration-700" size={150} />
                    </div>

                    {/* Performance - REAL DATA */}
                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                        <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <Activity size={18} className="text-blue-500" />
                            Performances
                        </h3>
                        <div className="space-y-6">
                            <div>
                                <div className="flex justify-between mb-2">
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Taux de validation</span>
                                    <span className="text-sm font-bold text-gray-900">{validationRate}%</span>
                                </div>
                                <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                                    <div className={`h-full rounded-full ${validationRate > 70 ? 'bg-green-500' : validationRate > 40 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${validationRate}%` }} />
                                </div>
                            </div>

                            {/* Needs by status mini chart */}
                            {needsByStatus.length > 0 && (
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Répartition besoins</p>
                                    <ResponsiveContainer width="100%" height={120}>
                                        <PieChart>
                                            <Pie data={needsByStatus} cx="50%" cy="50%" outerRadius={50} dataKey="value">
                                                {needsByStatus.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div className="flex flex-wrap gap-3 mt-2">
                                        {needsByStatus.map((item, i) => (
                                            <div key={i} className="flex items-center gap-1.5">
                                                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                                                <span className="text-[10px] font-bold text-gray-600">{item.name}: {item.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="p-4 bg-purple-50 rounded-2xl border border-purple-100">
                                <p className="text-xs font-bold text-purple-700 uppercase mb-1">Note globale</p>
                                <p className="text-sm text-purple-600 leading-relaxed">
                                    {validationRate >= 80 ? 'Excellente réactivité ! La majorité des besoins sont validés.' :
                                        validationRate >= 50 ? 'Bonne progression. Pensez à valider les besoins restants.' :
                                            'Plusieurs besoins sont en attente de validation.'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
