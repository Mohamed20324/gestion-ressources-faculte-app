import { useState, useEffect } from 'react';
import { api } from '../../../services/api';
import {
    BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    AreaChart, Area, Legend
} from 'recharts';
import {
    TrendingUp, TrendingDown, Users, CheckSquare,
    Calendar, RefreshCw, Loader, Clock, ChevronRight,
    Activity, Briefcase, FileText, Package,
    Truck, AlertTriangle, ShieldCheck, Video
} from 'lucide-react';

const COLORS = ['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#06B6D4'];

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
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalBesoins: 0,
        besoinsEnAttente: 0,
        besoinsValides: 0,
        totalRessources: 0,
        ressourcesDisponibles: 0,
        ressourcesAffectees: 0,
        totalDepartements: 0,
        totalTeachers: 0,
        totalChefs: 0,
        totalTechnicians: 0,
        totalFournisseurs: 0,
        aoOuverts: 0,
        offresAcceptees: 0,
        signalements: 0,
        signalementsPending: 0,
    });
    const [besoinsByStatus, setBesoinsByStatus] = useState<any[]>([]);
    const [resourcesByDept, setResourcesByDept] = useState<any[]>([]);
    const [recentBesoins, setRecentBesoins] = useState<any[]>([]);
    const [recentSignalements, setRecentSignalements] = useState<any[]>([]);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const safeFetch = async (apiCall: any) => {
                    try {
                        const res = await apiCall();
                        if (res.ok) return await res.json();
                        return [];
                    } catch (e) { return []; }
                };

                const [besoins, ressources, depts, teachers, chefs, techs, fournisseurs, aos, offres, signalements, reunions] = await Promise.all([
                    safeFetch(() => api.getAllBesoins()),
                    safeFetch(() => api.getAllRessources()),
                    safeFetch(() => api.getAllDepartements()),
                    safeFetch(() => api.getUsersByRole('ENSEIGNANT')),
                    safeFetch(() => api.getUsersByRole('CHEF_DEPARTEMENT')),
                    safeFetch(() => api.getUsersByRole('TECHNICIEN')),
                    safeFetch(() => api.getUsersByRole('FOURNISSEUR')),
                    safeFetch(() => api.getAllAppelsOffres()),
                    safeFetch(() => api.getAllOffres()),
                    safeFetch(() => api.getAllSignalements()),
                    safeFetch(() => api.getAllReunions()),
                ]);

                // Stats
                const besoinsArr = Array.isArray(besoins) ? besoins : [];
                const ressArr = Array.isArray(ressources) ? ressources : [];
                const deptsArr = Array.isArray(depts) ? depts : [];
                const sigArr = Array.isArray(signalements) ? signalements : [];
                const aosArr = Array.isArray(aos) ? aos : [];
                const offresArr = Array.isArray(offres) ? offres : [];

                setStats({
                    totalBesoins: besoinsArr.length,
                    besoinsEnAttente: besoinsArr.filter((b: any) => b.statut === 'EN_ATTENTE').length,
                    besoinsValides: besoinsArr.filter((b: any) => b.statut === 'VALIDE' || b.statut === 'ENVOYE').length,
                    totalRessources: ressArr.length,
                    ressourcesDisponibles: ressArr.filter((r: any) => r.statut === 'DISPONIBLE').length,
                    ressourcesAffectees: ressArr.filter((r: any) => r.statut === 'AFFECTEE' || r.statut === 'FONCTIONNELLE').length,
                    totalDepartements: deptsArr.length,
                    totalTeachers: Array.isArray(teachers) ? teachers.length : 0,
                    totalChefs: Array.isArray(chefs) ? chefs.length : 0,
                    totalTechnicians: Array.isArray(techs) ? techs.length : 0,
                    totalFournisseurs: Array.isArray(fournisseurs) ? fournisseurs.length : 0,
                    aoOuverts: aosArr.filter((a: any) => a.statut === 'OUVERT').length,
                    offresAcceptees: offresArr.filter((o: any) => o.statut === 'ACCEPTEE' || o.statut === 'LIVREE' || o.statut === 'LIVREE_RETARD').length,
                    signalements: sigArr.length,
                    signalementsPending: sigArr.filter((s: any) => s.statut === 'SIGNALE' || s.statut === 'CONSTAT').length,
                });

                // Besoins by status (for Donut)
                const statusMap: Record<string, number> = {};
                besoinsArr.forEach((b: any) => { statusMap[b.statut] = (statusMap[b.statut] || 0) + 1; });
                const statusLabels: Record<string, string> = {
                    'EN_ATTENTE': 'En attente', 'ENVOYE': 'Envoyé', 'VALIDE': 'Validé',
                    'REJETE': 'Rejeté', 'BROUILLON': 'Brouillon'
                };
                setBesoinsByStatus(Object.entries(statusMap).map(([key, val]) => ({
                    name: statusLabels[key] || key, value: val
                })));

                // Resources by department (for Bar chart)
                const deptMap: Record<string, number> = {};
                const deptNames: Record<number, string> = {};
                deptsArr.forEach((d: any) => { deptNames[d.id] = d.nom; });
                ressArr.forEach((r: any) => {
                    const name = r.departementId ? (deptNames[r.departementId] || `Dept ${r.departementId}`) : 'Non affecté';
                    deptMap[name] = (deptMap[name] || 0) + 1;
                });
                setResourcesByDept(Object.entries(deptMap).map(([name, count]) => ({ name: name.length > 15 ? name.substring(0, 15) + '...' : name, ressources: count })));

                // Recent besoins
                setRecentBesoins(besoinsArr.slice(-5).reverse());

                // Recent signalements
                setRecentSignalements(sigArr.filter((s: any) => s.statut === 'SIGNALE' || s.statut === 'CONSTAT').slice(-4).reverse());

            } catch (error) {
                console.error('Erreur stats:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);


    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <Loader className="animate-spin text-purple-600 mx-auto mb-4" size={48} />
                    <p className="text-gray-500 font-medium">Préparation de votre tableau de bord...</p>
                </div>
            </div>
        );
    }

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'VALIDE': case 'ENVOYE': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
            case 'EN_ATTENTE': return 'bg-amber-50 text-amber-700 border-amber-100';
            case 'REJETE': return 'bg-red-50 text-red-700 border-red-100';
            default: return 'bg-gray-50 text-gray-600 border-gray-100';
        }
    };

    const personnelData = [
        { name: 'Enseignants', value: stats.totalTeachers, color: '#8B5CF6' },
        { name: 'Chefs Dépt.', value: stats.totalChefs, color: '#3B82F6' },
        { name: 'Techniciens', value: stats.totalTechnicians, color: '#10B981' },
        { name: 'Fournisseurs', value: stats.totalFournisseurs, color: '#F59E0B' },
    ];

    return (
        <div className="p-8 bg-gray-50/30 min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Tableau de Bord Général</h1>
                    <p className="text-gray-500 mt-1">Vue d'ensemble en temps réel des ressources de la faculté.</p>
                </div>
                <div className="flex items-center gap-3 bg-white p-2 px-4 rounded-xl shadow-sm border border-gray-100">
                    <Calendar size={16} className="text-gray-400" />
                    <span className="text-sm font-bold text-gray-700">{new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    title="Besoins Totaux"
                    value={stats.totalBesoins}
                    icon={FileText}
                    subtitle={`${stats.besoinsValides} validés · ${stats.besoinsEnAttente} en attente`}
                    color="text-purple-600"
                    bgColor="bg-purple-50"
                />
                <StatCard
                    title="Inventaire Global"
                    value={stats.totalRessources}
                    icon={Package}
                    subtitle={`${stats.ressourcesDisponibles} disponibles · ${stats.ressourcesAffectees} affectées`}
                    color="text-blue-600"
                    bgColor="bg-blue-50"
                />
                <StatCard
                    title="Appels d'Offres"
                    value={stats.aoOuverts}
                    icon={Briefcase}
                    subtitle={`${stats.offresAcceptees} offres acceptées au total`}
                    color="text-orange-600"
                    bgColor="bg-orange-50"
                />
                <StatCard
                    title="Signalements"
                    value={stats.signalements}
                    icon={AlertTriangle}
                    subtitle={`${stats.signalementsPending} en attente de traitement`}
                    color="text-red-600"
                    bgColor="bg-red-50"
                />
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Besoins by Status - Donut */}
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="font-bold text-gray-900">Répartition des Besoins</h3>
                            <p className="text-sm text-gray-500">Par statut de traitement</p>
                        </div>
                    </div>
                    <div className="h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={besoinsByStatus}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {besoinsByStatus.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="space-y-3 w-full mt-4">
                        {besoinsByStatus.map((item, index) => (
                            <div key={index} className="flex justify-between items-center p-2.5 bg-gray-50 rounded-xl">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                                    <span className="text-sm font-medium text-gray-600">{item.name}</span>
                                </div>
                                <span className="text-sm font-bold text-gray-900">{item.value}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Resources by Department - Bar */}
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="font-bold text-gray-900">Ressources par Département</h3>
                            <p className="text-sm text-gray-500">Distribution de l'inventaire</p>
                        </div>
                    </div>
                    <div className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={resourcesByDept} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F3F4F6" />
                                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                                <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 11 }} width={120} />
                                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                <Bar dataKey="ressources" fill="#3B82F6" radius={[0, 6, 6, 0]} name="Ressources" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Personnel Distribution */}
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center">
                    <h3 className="font-bold text-gray-900 mb-6 w-full text-left">Effectifs de la Faculté</h3>
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={personnelData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                    {personnelData.map((entry, index) => (
                                        <Cell key={`cell-p-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="space-y-3 w-full mt-4">
                        {personnelData.map((item, index) => (
                            <div key={index} className="flex justify-between items-center p-2.5 bg-gray-50 rounded-xl">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                                    <span className="text-sm font-medium text-gray-600">{item.name}</span>
                                </div>
                                <span className="text-sm font-bold text-gray-900">{item.value}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Besoins */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                        <h3 className="font-bold text-gray-900">Besoins Récents</h3>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{recentBesoins.length} derniers</span>
                    </div>
                    <div className="divide-y divide-gray-50 flex-1 overflow-y-auto">
                        {recentBesoins.length > 0 ? recentBesoins.map((b: any) => (
                            <div key={b.id} className="p-4 px-6 hover:bg-gray-50 transition-colors flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center">
                                        <FileText size={16} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-900">Besoin #{b.id}</p>
                                        <p className="text-[10px] text-gray-500 font-medium">Qté: {b.quantite}</p>
                                    </div>
                                </div>
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusStyle(b.statut)}`}>
                                    {b.statut}
                                </span>
                            </div>
                        )) : (
                            <p className="p-6 text-center text-gray-400 text-sm">Aucun besoin enregistré.</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Recent Signalements */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                        <h3 className="font-bold text-gray-900">Pannes Non Traitées</h3>
                        <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest">{stats.signalementsPending} en attente</span>
                    </div>
                    <div className="divide-y divide-gray-50">
                        {recentSignalements.length > 0 ? recentSignalements.map((s: any) => (
                            <div key={s.id} className="p-4 px-6 hover:bg-gray-50 transition-colors flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 bg-red-50 text-red-600 rounded-lg flex items-center justify-center">
                                        <AlertTriangle size={16} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-900 truncate max-w-[200px]">{s.description || `Signal. #${s.id}`}</p>
                                        <p className="text-[10px] text-gray-500 font-medium">{s.statut}</p>
                                    </div>
                                </div>
                                <button className="p-2 text-gray-400 hover:text-gray-600">
                                    <ChevronRight size={18} />
                                </button>
                            </div>
                        )) : (
                            <p className="p-6 text-center text-gray-400 text-sm">Aucune panne en attente. 🎉</p>
                        )}
                    </div>
                </div>

                {/* Quick Actions / Stats Footer Info */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between">
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Taux Validation</p>
                            <p className="text-3xl font-black text-gray-900">{stats.totalBesoins > 0 ? Math.round((stats.besoinsValides / stats.totalBesoins) * 100) : 0}%</p>
                        </div>
                        <div className="w-full bg-gray-100 h-1.5 rounded-full mt-4 overflow-hidden">
                            <div 
                                className="bg-green-500 h-full transition-all duration-1000" 
                                style={{ width: `${stats.totalBesoins > 0 ? (stats.besoinsValides / stats.totalBesoins) * 100 : 0}%` }}
                            />
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between">
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Taux Affectation</p>
                            <p className="text-3xl font-black text-gray-900">{stats.totalRessources > 0 ? Math.round((stats.ressourcesAffectees / stats.totalRessources) * 100) : 0}%</p>
                        </div>
                        <div className="w-full bg-gray-100 h-1.5 rounded-full mt-4 overflow-hidden">
                            <div 
                                className="bg-blue-500 h-full transition-all duration-1000" 
                                style={{ width: `${stats.totalRessources > 0 ? (stats.ressourcesAffectees / stats.totalRessources) * 100 : 0}%` }}
                            />
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm col-span-2 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center">
                                <RefreshCw size={20} className="animate-spin-slow" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Dernière mise à jour</p>
                                <p className="text-sm font-bold text-gray-900">{new Date().toLocaleTimeString('fr-FR')}</p>
                            </div>
                        </div>
                        <button className="px-4 py-2 bg-gray-900 text-white text-xs font-bold rounded-lg hover:bg-gray-800 transition-colors">
                            Actualiser
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;