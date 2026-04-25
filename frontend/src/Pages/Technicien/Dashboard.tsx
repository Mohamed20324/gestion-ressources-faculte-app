import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import {
    BarChart, Bar, PieChart, Pie, Cell,
    ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip
} from 'recharts';
import {
    Wrench, Package, AlertCircle, CheckCircle,
    Activity, Loader, ChevronRight, Settings,
    Clock, RotateCcw, Shield
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const COLORS = ['#EF4444', '#F59E0B', '#3B82F6', '#10B981', '#8B5CF6', '#EC4899'];

const StatCard = ({ title, value, icon: Icon, trend, color, bgColor, subtitle }: any) => (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow group">
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm text-gray-500 mb-1">{title}</p>
                <p className="text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{value}</p>
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
        totalSignalements: 0,
        signale: 0,
        constat: 0,
        enCours: 0,
        resolu: 0,
        echange: 0,
        totalResources: 0,
        enPanne: 0,
    });
    const [sigByStatus, setSigByStatus] = useState<any[]>([]);
    const [recentSignalements, setRecentSignalements] = useState<any[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const safeFetch = async (apiCall: any) => {
                    try { const res = await apiCall(); if (res.ok) return await res.json(); return []; } catch { return []; }
                };

                const [signalements, ressources] = await Promise.all([
                    safeFetch(() => api.getAllSignalements()),
                    safeFetch(() => api.getAllRessources()),
                ]);

                const sigArr = Array.isArray(signalements) ? signalements : [];
                const resArr = Array.isArray(ressources) ? ressources : [];

                const signale = sigArr.filter((s: any) => s.statut === 'SIGNALE').length;
                const constat = sigArr.filter((s: any) => s.statut === 'CONSTAT').length;
                const enCours = sigArr.filter((s: any) => s.statut === 'EN_COURS').length;
                const resolu = sigArr.filter((s: any) => s.statut === 'RESOLU').length;
                const echange = sigArr.filter((s: any) => s.statut === 'ECHANGE').length;
                const enPanne = resArr.filter((r: any) => r.statut === 'EN_PANNE' || r.statut === 'EN_MAINTENANCE').length;

                setStats({
                    totalSignalements: sigArr.length,
                    signale, constat, enCours, resolu, echange,
                    totalResources: resArr.length,
                    enPanne,
                });

                // Signalements by status for pie chart
                const statusData = [
                    { name: 'Signalé', value: signale, color: '#EF4444' },
                    { name: 'Constat', value: constat, color: '#F59E0B' },
                    { name: 'En cours', value: enCours, color: '#3B82F6' },
                    { name: 'Résolu', value: resolu, color: '#10B981' },
                    { name: 'Échange', value: echange, color: '#8B5CF6' },
                ].filter(d => d.value > 0);
                setSigByStatus(statusData);

                // Recent non-resolved signalements
                setRecentSignalements(
                    sigArr.filter((s: any) => s.statut !== 'RESOLU')
                        .slice(-6).reverse()
                );

            } catch (error) {
                console.error("Error fetching technicien dashboard:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader className="animate-spin text-blue-600" size={40} />
            </div>
        );
    }

    const tauxResolution = stats.totalSignalements > 0 ? Math.round((stats.resolu / stats.totalSignalements) * 100) : 0;
    const tauxDisponibilite = stats.totalResources > 0 ? Math.round(((stats.totalResources - stats.enPanne) / stats.totalResources) * 100) : 100;

    const getStatusStyle = (statut: string) => {
        switch (statut) {
            case 'SIGNALE': return { label: 'Signalé', bg: 'bg-red-50', text: 'text-red-700', icon: AlertCircle };
            case 'CONSTAT': return { label: 'Constat', bg: 'bg-amber-50', text: 'text-amber-700', icon: Clock };
            case 'EN_COURS': return { label: 'En cours', bg: 'bg-blue-50', text: 'text-blue-700', icon: Wrench };
            case 'ECHANGE': return { label: 'Échange', bg: 'bg-purple-50', text: 'text-purple-700', icon: RotateCcw };
            default: return { label: statut, bg: 'bg-gray-50', text: 'text-gray-600', icon: Settings };
        }
    };

    return (
        <div className="p-8 bg-gray-50/30 min-h-screen">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Espace Technique</h1>
                    <p className="text-gray-500">Suivi des pannes, interventions et maintenance du parc.</p>
                </div>
                <div className="flex items-center gap-3 bg-white p-2 px-4 rounded-xl shadow-sm border border-gray-100">
                    <div className={`w-2 h-2 rounded-full ${stats.signale + stats.constat > 0 ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`} />
                    <span className="text-sm font-bold text-gray-700">{stats.signale + stats.constat > 0 ? `${stats.signale + stats.constat} alertes en attente` : 'Tout est sous contrôle'}</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    title="Total Signalements"
                    value={stats.totalSignalements}
                    icon={AlertCircle}
                    subtitle={`${stats.signale} nouveaux · ${stats.constat} en attente`}
                    color="text-red-600"
                    bgColor="bg-red-50"
                />
                <StatCard
                    title="Interventions En Cours"
                    value={stats.enCours}
                    icon={Wrench}
                    color="text-blue-600"
                    bgColor="bg-blue-50"
                />
                <StatCard
                    title="Résolus"
                    value={stats.resolu}
                    icon={CheckCircle}
                    subtitle={`Taux: ${tauxResolution}%`}
                    color="text-green-600"
                    bgColor="bg-green-50"
                />
                <StatCard
                    title="Disponibilité Parc"
                    value={`${tauxDisponibilite}%`}
                    icon={Shield}
                    subtitle={`${stats.enPanne} en panne sur ${stats.totalResources}`}
                    color="text-purple-600"
                    bgColor="bg-purple-50"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {/* Signalements by Status Pie */}
                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="font-bold text-gray-900">Répartition des Signalements</h3>
                                <p className="text-sm text-gray-500">Par état d'avancement</p>
                            </div>
                        </div>
                        {sigByStatus.length > 0 ? (
                            <>
                                <div className="h-[250px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={sigByStatus}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={80}
                                                paddingAngle={5}
                                                dataKey="value"
                                            >
                                                {sigByStatus.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                                            </Pie>
                                            <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="space-y-3 w-full mt-4">
                                    {sigByStatus.map((item, i) => (
                                        <div key={i} className="flex justify-between items-center p-2.5 bg-gray-50 rounded-xl">
                                            <div className="flex items-center gap-2">
                                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                                                <span className="text-sm font-medium text-gray-600">{item.name}</span>
                                            </div>
                                            <span className="text-sm font-bold text-gray-900">{item.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <p className="text-center text-gray-400 py-12">Aucun signalement enregistré.</p>
                        )}
                    </div>

                    {/* Recent Signalements List */}
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="font-bold text-gray-900">Alertes Actives</h3>
                            <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest">{recentSignalements.length} en cours</span>
                        </div>
                        <div className="divide-y divide-gray-50 flex-1 overflow-y-auto">
                            {recentSignalements.length > 0 ? recentSignalements.map((s: any) => {
                                const style = getStatusStyle(s.statut);
                                const StatusIcon = style.icon;
                                return (
                                    <div key={s.id} className="p-4 px-6 hover:bg-gray-50 transition-colors flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${style.bg} ${style.text}`}>
                                                <StatusIcon size={16} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-900 truncate max-w-[200px]">{s.description || `Signalement #${s.id}`}</p>
                                                <div className="flex items-center gap-2">
                                                    <p className="text-[10px] text-gray-500">Ressource #{s.ressourceId}</p>
                                                    {s.technicienId && (
                                                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${s.technicienId === user.id ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
                                                            {s.technicienId === user.id ? 'Moi' : 'Autre Tech'}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${style.bg} ${style.text}`}>
                                            {style.label}
                                        </span>
                                    </div>
                                );
                            }) : (
                                <p className="p-6 text-center text-gray-400 text-sm">Aucune alerte active. Tout est résolu ! 🎉</p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    {/* System Health */}
                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                        <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <Activity size={18} className="text-blue-500" />
                            Santé du Parc
                        </h3>
                        <div className="space-y-6">
                            <div>
                                <div className="flex justify-between mb-2">
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Disponibilité</span>
                                    <span className="text-sm font-bold text-gray-900">{tauxDisponibilite}%</span>
                                </div>
                                <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                                    <div className={`h-full rounded-full transition-all ${tauxDisponibilite > 80 ? 'bg-green-500' : tauxDisponibilite > 50 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${tauxDisponibilite}%` }} />
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between mb-2">
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Taux de Résolution</span>
                                    <span className="text-sm font-bold text-gray-900">{tauxResolution}%</span>
                                </div>
                                <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                                    <div className={`h-full rounded-full transition-all ${tauxResolution > 70 ? 'bg-blue-500' : tauxResolution > 40 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${tauxResolution}%` }} />
                                </div>
                            </div>
                            <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                                <p className="text-xs font-bold text-blue-700 uppercase mb-1">Résumé</p>
                                <p className="text-sm text-blue-600 leading-relaxed">
                                    {stats.enPanne === 0 ? 'Excellent ! Aucun équipement en panne.' :
                                        `${stats.enPanne} équipement(s) nécessitent une attention.`}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-gray-900 p-8 rounded-xl text-white shadow-xl relative overflow-hidden">
                        <div className="relative z-10">
                            <h3 className="text-xl font-bold mb-4">Interventions</h3>
                            <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                                {stats.signale + stats.constat > 0
                                    ? `${stats.signale + stats.constat} signalement(s) en attente de traitement.`
                                    : 'Toutes les interventions sont à jour.'}
                            </p>
                            <button
                                onClick={() => navigate('/technicien/interventions')}
                                className="w-full py-4 bg-blue-600 hover:bg-blue-700 rounded-lg font-bold transition-all flex items-center justify-center gap-2"
                            >
                                Gérer les interventions
                                <ChevronRight size={18} />
                            </button>
                        </div>
                        <div className="absolute top-0 right-0 p-4 opacity-5">
                            <Wrench size={100} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
