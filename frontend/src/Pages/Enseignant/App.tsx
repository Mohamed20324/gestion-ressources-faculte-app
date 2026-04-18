import { Routes, Route } from 'react-router-dom';
import Header from '../../components/G/Header';
import Sidebar from '../../components/G/Sidebar';
import Dashboard from './Dashboard';

const AppContent = () => {
  return (
    <div className='flex flex-col h-screen'>
      <Header title="Espace Enseignant" />
      <div className="flex flex-1 bg-white text-sm text-gray-700 font-sans overflow-hidden">
        <Sidebar role="Enseignant" />
        <div className="flex-1 flex flex-col h-screen overflow-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

const EnseignantApp = () => {
  return <AppContent />;
};

export default EnseignantApp;
