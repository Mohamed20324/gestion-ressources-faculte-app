import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './Pages/Princibale/Home';
import ResponsableApp from './Pages/Responsable/App';
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
        {/* Fallback for other roles or generic dashboard */}
        <Route path="/dashboard" element={<div>Redirection vers le tableau de bord approprié...</div>} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
