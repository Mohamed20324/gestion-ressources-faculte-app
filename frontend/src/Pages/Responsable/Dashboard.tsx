import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import {
    BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    AreaChart, Area
} from 'recharts';
import {
    TrendingUp, TrendingDown, Users, CheckSquare, Clock,
    Calendar, Download, RefreshCw, MoreVertical, Star,
    Activity, Briefcase, Award, FileText, Loader
} from 'lucide-react';

// Données pour les graphiques
const weeklyData = [
    { name: 'Lun', tâches: 12, complétées: 8, enCours: 4 },
    { name: 'Mar', tâches: 15, complétées: 10, enCours: 5 },
    { name: 'Mer', tâches: 18, complétées: 14, enCours: 4 },
    { name: 'Jeu', tâches: 14, complétées: 11, enCours: 3 },
    { name: 'Ven', tâches: 20, complétées: 16, enCours: 4 },
    { name: 'Sam', tâches: 8, complétées: 6, enCours: 2 },
    { name: 'Dim', tâches: 5, complétées: 4, enCours: 1 },
];

const monthlyData = [
    { name: 'Sem 1', tâches: 45, complétées: 38 },
    { name: 'Sem 2', tâches: 52, complétées: 42 },
    { name: 'Sem 3', tâches: 48, complétées: 44 },
    { name: 'Sem 4', tâches: 60, complétées: 51 },
];

const projectData = [
    { name: 'Projet Alpha', value: 75, color: '#10B981' },
    { name: 'Projet Beta', value: 45, color: '#3B82F6' },
    { name: 'Sprint 24', value: 90, color: '#8B5CF6' },
    { name: 'Design System', value: 60, color: '#F59E0B' },
];

const teamPerformance = [
    { name: 'Jean', tâches: 24, complétées: 22, efficacité: 92 },
    { name: 'Marie', tâches: 28, complétées: 26, efficacité: 93 },
    { name: 'Pierre', tâches: 20, complétées: 18, efficacité: 90 },
    { name: 'Sophie', tâches: 32, complétées: 30, efficacité: 94 },
    { name: 'Lucas', tâches: 26, complétées: 24, efficacité: 92 },
];


// Composant Carte statistique
const StatCard = ({ title, value, icon: Icon, trend, color, bgColor }: any) => (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm text-gray-500 mb-1">{title}</p>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
                {trend && (
                    <div className="flex items-center gap-1 mt-2">
                        {trend > 0 ? (
                            <TrendingUp size={14} className="text-green-500" />
                        ) : (
                            <TrendingDown size={14} className="text-red-500" />
                        )}
                        <span className={`text-xs ${trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {Math.abs(trend)}% vs semaine dernière
                        </span>
                    </div>
                )}
            </div>
            <div className={`p-3 rounded-lg ${bgColor}`}>
                <Icon size={24} className={color} />
            </div>
        </div>
    </div>
);

// Composant Graphique à barres
const BarChartComponent = () => (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Activité hebdomadaire</h3>
            <button className="text-gray-400 hover:text-gray-600">
                <MoreVertical size={18} />
            </button>
        </div>
        <ResponsiveContainer width="100%" height={300}>
            <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="name" stroke="#6B7280" fontSize={12} />
                <YAxis stroke="#6B7280" fontSize={12} />
                <Tooltip
                    contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #E5E7EB',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
                    }}
                />
                <Legend />
                <Bar dataKey="tâches" fill="#8B5CF6" name="Tâches totales" radius={[4, 4, 0, 0]} />
                <Bar dataKey="complétées" fill="#10B981" name="Tâches complétées" radius={[4, 4, 0, 0]} />
            </BarChart>
        </ResponsiveContainer>
    </div>
);

// Composant Graphique linéaire
const LineChartComponent = () => (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Progression mensuelle</h3>
            <button className="text-gray-400 hover:text-gray-600">
                <RefreshCw size={16} />
            </button>
        </div>
        <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="name" stroke="#6B7280" fontSize={12} />
                <YAxis stroke="#6B7280" fontSize={12} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="tâches" stroke="#8B5CF6" name="Tâches totales" strokeWidth={2} />
                <Line type="monotone" dataKey="complétées" stroke="#10B981" name="Tâches complétées" strokeWidth={2} />
            </LineChart>
        </ResponsiveContainer>
    </div>
);

// Composant Graphique circulaire pour la répartition du personnel
const PersonnelPieChart = ({ stats }: { stats: any }) => {
    const data = [
        { name: 'Enseignants', value: stats.totalTeachers, color: '#8B5CF6' }, // Violet
        { name: 'Chefs Dépt.', value: stats.totalChefs, color: '#3B82F6' },    // Bleu
        { name: 'Techniciens', value: stats.totalTechnicians, color: '#10B981' }, // Vert
        { name: 'Départements', value: stats.totalDepartements, color: '#F59E0B' }, // Orange
    ];

    return (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Répartition des Effectifs</h3>
                <button className="text-gray-400 hover:text-gray-600">
                    <Download size={16} />
                </button>
            </div>
            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, value }) => `${name} (${value})`}
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Pie>
                    <Tooltip />
                </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap justify-center gap-4 mt-4">
                {data.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-xs font-medium text-gray-700">{item.name}:</span>
                        <span className="text-xs font-bold text-gray-900">{item.value}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

// Composant Graphique en aires
const AreaChartComponent = () => (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Performance équipe</h3>
            <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Efficacité moyenne: 92%</span>
                <Award size={16} className="text-yellow-500" />
            </div>
        </div>
        <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={teamPerformance}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="name" stroke="#6B7280" fontSize={12} />
                <YAxis stroke="#6B7280" fontSize={12} />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="tâches" stackId="1" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.3} name="Tâches assignées" />
                <Area type="monotone" dataKey="complétées" stackId="2" stroke="#10B981" fill="#10B981" fillOpacity={0.3} name="Tâches complétées" />
            </AreaChart>
        </ResponsiveContainer>
    </div>
);

// Composant Liste des tâches récentes
const RecentTasks = () => {
    const [tasks, setTasks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadRecentBesoins = async () => {
            try {
                const response = await api.getAllBesoins();
                if (response.ok) {
                    const data = await response.json();
                    if (Array.isArray(data)) {
                        setTasks(data.slice(-5).reverse());
                    }
                }
            } catch (error) {
                console.error('Erreur besoins récents:', error);
            } finally {
                setLoading(false);
            }
        };
        loadRecentBesoins();
    }, []);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'VALIDE': return 'bg-green-100 text-green-700';
            case 'EN_ATTENTE': return 'bg-yellow-100 text-yellow-700';
            case 'REJETE': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Besoins récents</h3>
                <button className="text-sm text-blue-600 hover:text-blue-700">Voir tout</button>
            </div>
            <div className="space-y-3">
                {loading ? (
                    <div className="flex justify-center py-4"><Loader className="animate-spin text-gray-300" size={24} /></div>
                ) : tasks.map((task) => (
                    <div key={task.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                        <div className="flex items-center gap-3">
                            <FileText size={16} className="text-gray-400" />
                            <div>
                                <p className="text-sm font-medium text-gray-900">Besoin #{task.id} - {task.typeRessource || 'Ressource'}</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(task.statut)}`}>
                                        {task.statut}
                                    </span>
                                    <span className="text-xs text-gray-500">Quantité: {task.quantite}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock size={12} className="text-gray-400" />
                            <span className="text-xs text-gray-500">Dpt: {task.departementNom || 'N/A'}</span>
                        </div>
                    </div>
                ))}
                {!loading && tasks.length === 0 && <p className="text-center text-gray-400 text-sm py-4">Aucun besoin récent.</p>}
            </div>
        </div>
    );
};

// Dashboard principal
const Dashboard = () => {
    const [stats, setStats] = useState({
        totalBesoins: 0,
        completedBesoins: 0,
        totalRessources: 0,
        totalDepartements: 0,
        totalTeachers: 0,
        totalChefs: 0,
        totalTechnicians: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                // Fonction utilitaire pour fetcher en sécurité
                const safeFetch = async (apiCall: any) => {
                    try {
                        const res = await apiCall();
                        if (res.ok) return await res.json();
                        return [];
                    } catch (e) {
                        return [];
                    }
                };

                const [besoins, ressources, depts, teachers, chefs, techs] = await Promise.all([
                    safeFetch(() => api.getAllBesoins()),
                    safeFetch(() => api.getAllRessources()),
                    safeFetch(() => api.getAllDepartements()),
                    safeFetch(() => api.getUsersByRole('ENSEIGNANT')),
                    safeFetch(() => api.getUsersByRole('CHEF_DEPARTEMENT')),
                    safeFetch(() => api.getUsersByRole('TECHNICIEN'))
                ]);

                setStats({
                    totalBesoins: besoins.length,
                    completedBesoins: besoins.filter((b: any) => b.valider).length,
                    totalRessources: ressources.length,
                    totalDepartements: depts.length,
                    totalTeachers: teachers.length,
                    totalChefs: chefs.length,
                    totalTechnicians: techs.length,
                });
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
                    <Loader className="animate-spin text-blue-600 mx-auto mb-4" size={48} />
                    <p className="text-gray-500 font-medium">Préparation de votre tableau de bord...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 bg-white min-h-screen">
            {/* En-tête */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
                <p className="text-gray-500 mt-1">Bienvenue ! Voici un aperçu de l'état des ressources</p>
            </div>

            {/* Cartes statistiques */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <StatCard
                    title="Besoins Totaux"
                    value={stats.totalBesoins}
                    icon={FileText}
                    trend={12}
                    color="text-purple-600"
                    bgColor="bg-purple-50"
                />
                <StatCard
                    title="Besoins Satisfaits"
                    value={stats.completedBesoins}
                    icon={CheckSquare}
                    trend={8}
                    color="text-green-600"
                    bgColor="bg-green-50"
                />
                <StatCard
                    title="Ressources Inventaire"
                    value={stats.totalRessources}
                    icon={Briefcase}
                    trend={-2}
                    color="text-blue-600"
                    bgColor="bg-blue-50"
                />
                <StatCard
                    title="Départements"
                    value={stats.totalDepartements}
                    icon={Users}
                    trend={5}
                    color="text-orange-600"
                    bgColor="bg-orange-50"
                />
            </div>

            {/* Graphiques principaux */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <BarChartComponent />
                <LineChartComponent />
            </div>

            {/* Graphiques secondaires */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <PersonnelPieChart stats={stats} />
                <AreaChartComponent />
            </div>

            {/* Section des tâches récentes */}
            <div className="grid grid-cols-1 gap-6">
                <RecentTasks />
            </div>

            {/* Footer avec métriques supplémentaires */}
            <div className="mt-6 p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-2">
                        <Activity size={16} className="text-green-500" />
                        <span className="text-sm text-gray-600">Taux de complétion: </span>
                        <span className="text-sm font-semibold text-gray-900">
                            {stats.totalBesoins > 0 ? Math.round((stats.completedBesoins / stats.totalBesoins) * 100) : 0}%
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-blue-500" />
                        <span className="text-sm text-gray-600">Dernière mise à jour: </span>
                        <span className="text-sm font-semibold text-gray-900">
                            {new Date().toLocaleDateString()}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Star size={16} className="text-yellow-500" />
                        <span className="text-sm text-gray-600">Performance équipe: </span>
                        <span className="text-sm font-semibold text-gray-900">Excellent</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;