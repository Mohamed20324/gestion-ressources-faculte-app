import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './Pages/Princibale/Home';
import ResponsableApp from './Pages/Responsable/App';
import InactiveAccount from './Pages/Princibale/InactiveAccount';
import EnseignantApp from './Pages/Enseignant/App';
import ChefDepartementApp from './Pages/ChefDepartement/App';
import TechnicienApp from './Pages/Technicien/App';
import FournisseurApp from './Pages/Fournisseur/App';
import { useAuth } from './hooks/useAuth';

const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: string[] }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center text-white">Chargement...</div>;
  if (!user) return <Navigate to="/" />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" />;
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route 
          path="/responsable/*" 
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'RESPONSABLE']}>
              <ResponsableApp />
            </ProtectedRoute>
          } 
        />
        <Route path="/enseignant/*" element={<ProtectedRoute allowedRoles={['ENSEIGNANT']}><EnseignantApp /></ProtectedRoute>} />
        <Route path="/chef-departement/*" element={<ProtectedRoute allowedRoles={['CHEF_DEPARTEMENT']}><ChefDepartementApp /></ProtectedRoute>} />
        <Route path="/technicien/*" element={<ProtectedRoute allowedRoles={['TECHNICIEN']}><TechnicienApp /></ProtectedRoute>} />
        <Route path="/fournisseur/*" element={<ProtectedRoute allowedRoles={['FOURNISSEUR']}><FournisseurApp /></ProtectedRoute>} />
        <Route path="/inactive-account" element={<InactiveAccount />} />
        {/* Fallback for other roles or generic dashboard */}
        <Route path="/dashboard" element={<div>Redirection vers le tableau de bord approprié...</div>} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
