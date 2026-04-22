import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import {
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    AreaChart, Area, BarChart, Bar
} from 'recharts';
import {
    Users, Calendar, Loader, Video, TrendingUp, TrendingDown,
    Activity, Clock, ChevronRight, FileText, CheckCircle,
    LayoutDashboard, ArrowUpRight
} from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, trend, color, bgColor }: any) => (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-all group">
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
                <p className="text-2xl font-bold text-gray-900 group-hover:text-purple-600 transition-colors">{value}</p>
                {trend && (
                    <div className="flex items-center gap-1 mt-2">
                        {trend > 0 ? (
                            <TrendingUp size={14} className="text-green-500" />
                        ) : (
                            <TrendingDown size={14} className="text-red-500" />
                        )}
                        <span className={`text-xs font-medium ${trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {Math.abs(trend)}% ce mois
                        </span>
                    </div>
                )}
            </div>
            <div className={`p-3 rounded-lg ${bgColor} ${color}`}>
                <Icon size={24} />
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
        nextMeeting: null as any,
        meetingsPerMonth: [] as any[]
    });

    useEffect(() => {
        const fetchDashboardData = async () => {
            if (!user) return;
            try {
                // 1. Obtenir les détails du Chef
                const userRes = await fetch(`http://localhost:8081/api/utilisateurs/${user.id}`, {
                    headers: {
                        'Authorization': `Bearer ${user.accessToken}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (!userRes.ok) return;
                const userData = await userRes.json();
                const deptId = userData.departementId;

                if (!deptId) {
                    setLoading(false);
                    return;
                }

                // 2. Récupérer enseignants, réunions et besoins en parallèle
                const [teachersRes, meetingsRes, besoinsRes] = await Promise.all([
                    api.getUsersByRole('ENSEIGNANT'),
                    api.getReunionsByDepartement(deptId),
                    api.getBesoinsByDepartement(deptId)
                ]);

                let teacherCount = 0;
                let meetings: any[] = [];
                let besoins: any[] = [];

                if (teachersRes.ok) {
                    const allTeachers = await teachersRes.json();
                    teacherCount = allTeachers.filter((t: any) => t.departementId === deptId).length;
                }

                if (meetingsRes.ok) {
                    meetings = await meetingsRes.json();
                }

                if (besoinsRes.ok) {
                    besoins = await besoinsRes.json();
                }

                // 3. Traitement des données pour le graphique
                const months = ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun"];
                const grouped: any = {};
                meetings.forEach((m: any) => {
                    let date = Array.isArray(m.date) ? new Date(m.date[0], m.date[1] - 1, m.date[2]) : new Date(m.date);
                    const month = months[date.getMonth()];
                    if (month) grouped[month] = (grouped[month] || 0) + 1;
                });

                const meetingsPerMonth = months.map(m => ({
                    name: m,
                    réunions: grouped[m] || 0
                }));

                // 4. Prochaine réunion
                const next = meetings
                    .filter((m: any) => m.statut === 'PLANIFIEE')
                    .sort((a: any, b: any) => {
                        const dateA = Array.isArray(a.date) ? new Date(a.date[0], a.date[1] - 1, a.date[2]) : new Date(a.date);
                        const dateB = Array.isArray(b.date) ? new Date(b.date[0], b.date[1] - 1, b.date[2]) : new Date(b.date);
                        return dateA.getTime() - dateB.getTime();
                    })[0];

                setStats({
                    teacherCount,
                    meetingCount: meetings.length,
                    needsCount: besoins.length,
                    validatedNeeds: besoins.filter((b: any) => b.statut === 'VALIDE' || b.statut === 'ENVOYE').length,
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

    return (
        <div className="p-8 bg-gray-50/30 min-h-screen">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Tableau de Bord Départemental</h1>
                    <p className="text-gray-500 mt-1">Gérez efficacement les ressources et les réunions de votre département.</p>
                </div>
                <div className="flex items-center gap-3 bg-white p-2 px-4 rounded-2xl shadow-sm border border-gray-100">
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
                    trend={4}
                />
                <StatCard 
                    title="Total Réunions" 
                    value={stats.meetingCount} 
                    icon={Video} 
                    color="text-purple-600" 
                    bgColor="bg-purple-50" 
                    trend={12}
                />
                <StatCard 
                    title="Besoins Soumis" 
                    value={stats.needsCount} 
                    icon={FileText} 
                    color="text-orange-600" 
                    bgColor="bg-orange-50" 
                />
                <StatCard 
                    title="Validation" 
                    value={stats.needsCount > 0 ? `${Math.round((stats.validatedNeeds / stats.needsCount) * 100)}%` : '0%'} 
                    icon={CheckCircle} 
                    color="text-green-600" 
                    bgColor="bg-green-50" 
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Activité des Réunions</h3>
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
                                    <Tooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} />
                                    <Area type="monotone" dataKey="réunions" stroke="#8B5CF6" strokeWidth={4} fillOpacity={1} fill="url(#colorMeetings)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="font-bold text-gray-900">Besoins en Attente de Validation</h3>
                            <button className="text-sm text-purple-600 font-bold hover:underline">Gérer tout</button>
                        </div>
                        <div className="divide-y divide-gray-50">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="p-4 px-6 hover:bg-gray-50 transition-colors flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center">
                                            <FileText size={20} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-900">Demande de matériel informatique</p>
                                            <p className="text-xs text-gray-500">Soumis par un enseignant • Priorité Haute</p>
                                        </div>
                                    </div>
                                    <button className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all">
                                        <ChevronRight size={20} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-8 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden group">
                        <div className="relative z-10">
                            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md mb-6">
                                <Calendar size={24} />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Prochaine Réunion</h3>
                            {stats.nextMeeting ? (
                                <div className="space-y-6 mt-6">
                                    <div>
                                        <p className="text-white/60 text-xs font-bold uppercase tracking-widest mb-1">Date et Heure</p>
                                        <p className="text-lg font-bold">
                                            {Array.isArray(stats.nextMeeting.date) 
                                                ? `${stats.nextMeeting.date[2]}/${stats.nextMeeting.date[1]}/${stats.nextMeeting.date[0]}`
                                                : stats.nextMeeting.date}
                                            <span className="mx-2 text-white/30">|</span>
                                            {stats.nextMeeting.heure}
                                        </p>
                                    </div>
                                    <button className="w-full py-4 bg-white text-indigo-700 rounded-2xl font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2 group-hover:scale-[1.02]">
                                        Détails de la session
                                        <ArrowUpRight size={18} />
                                    </button>
                                </div>
                            ) : (
                                <div className="py-8 text-center bg-white/5 rounded-2xl border border-white/10 mt-4">
                                    <p className="text-white/60 font-medium italic">Aucun planning actuel</p>
                                </div>
                            )}
                        </div>
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
                    </div>

                    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                        <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <Activity size={18} className="text-green-500" />
                            Performances
                        </h3>
                        <div className="space-y-6">
                            <div>
                                <div className="flex justify-between mb-2">
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Réalisations</span>
                                    <span className="text-sm font-bold text-gray-900">82%</span>
                                </div>
                                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                                    <div className="bg-green-500 h-full w-[82%] rounded-full" />
                                </div>
                            </div>
                            <div className="p-4 bg-purple-50 rounded-2xl border border-purple-100">
                                <p className="text-xs font-bold text-purple-700 uppercase mb-1">Note globale</p>
                                <p className="text-sm text-purple-600 leading-relaxed">
                                    Votre département affiche une excellente réactivité sur les besoins.
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
