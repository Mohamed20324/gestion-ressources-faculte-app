import { useState, useEffect } from 'react';
import { Users, Mail, GraduationCap } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';

const EnseignantsPage = () => {
  const { user } = useAuth();
  const [enseignants, setEnseignants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEnseignants = async () => {
      try {
        if (!user) return;

        // 1. Obtenir les détails du Chef de Département (pour son departementId)
        const userRes = await fetch(`http://localhost:8081/api/utilisateurs/${user.id}`, {
          headers: {
            'Authorization': `Bearer ${user.accessToken}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!userRes.ok) throw new Error("Erreur de récupération du département");
        const userData = await userRes.json();
        
        if (!userData.departementId) {
          setLoading(false);
          return;
        }

        // 2. Récupérer tous les enseignants
        const enseignantsRes = await api.getUsersByRole('ENSEIGNANT');
        if (!enseignantsRes.ok) throw new Error("Erreur lors de la récupération des enseignants");
        
        const allEnseignants = await enseignantsRes.json();

        // 3. Filtrer pour ne garder que ceux du même département
        const myEnseignants = allEnseignants.filter(
          (e: any) => e.departementId === userData.departementId
        );

        setEnseignants(myEnseignants);
      } catch (error) {
        console.error("Erreur:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEnseignants();
  }, [user]);

  if (loading) {
    return (
      <div className="p-6 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50/30 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="text-blue-600" />
            Enseignants de mon département
          </h1>
          <p className="text-gray-500 mt-1">Gérez et consultez la liste des enseignants affectés à votre département.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Enseignant</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Matricule</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Spécialité</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {enseignants.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                    Aucun enseignant trouvé dans ce département.
                  </td>
                </tr>
              ) : (
                enseignants.map((ens) => (
                  <tr key={ens.id} className="group hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-700 font-bold border border-blue-100 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                          {ens.nom?.charAt(0)}{ens.prenom?.charAt(0)}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-gray-900">{ens.nom} {ens.prenom}</div>
                          <div className="text-[10px] text-gray-500 flex items-center gap-1 mt-0.5">
                            <Mail size={10} />
                            {ens.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-600 font-mono text-[10px] bg-gray-100 px-2 py-1 rounded">
                        {ens.matricule || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-gray-600 text-xs font-medium">
                        <GraduationCap size={14} className="text-gray-400" />
                        {ens.specialite || 'Non définie'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        ens.actif 
                          ? 'bg-green-100 text-green-800 border border-green-200' 
                          : 'bg-red-100 text-red-800 border border-red-200'
                      }`}>
                        {ens.actif ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EnseignantsPage;
