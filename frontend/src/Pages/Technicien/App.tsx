import { Routes, Route } from 'react-router-dom';
import Header from '../../components/G/Header';
import Sidebar from '../../components/G/Sidebar';
import Dashboard from './Dashboard';
import InterventionsPage from './InterventionsPage';
import MyInterventionsPage from './MyInterventionsPage';
import ProfilePage from '../Common/ProfilePage';

const AppContent = () => {
  return (
    <div className='flex flex-col h-screen'>
      <Header title="Espace Technicien" />
      <div className="flex flex-1 bg-white text-sm text-gray-700 font-sans overflow-hidden">
        <Sidebar role="Technicien" />
        <div className="flex-1 overflow-y-auto pb-20">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/interventions" element={<InterventionsPage />} />
            <Route path="/mes-interventions" element={<MyInterventionsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

const TechnicienApp = () => {
  return <AppContent />;
};

export default TechnicienApp;
