import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { Dashboard } from './components/Dashboard';
import { Inventory } from './components/Inventory';
import { HealthLog } from './components/HealthLog';
import { Settings } from './components/Settings';
import { Icons } from './components/Icons';
import { Medicine, User, DoseLog, SymptomLog } from './types';

// Mock Initial Data
const INITIAL_USERS: User[] = [
  { id: '1', name: 'Me', avatarColor: 'bg-blue-500' },
];

const BottomNav = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const navItems = [
    { path: '/', icon: Icons.Home, label: 'Home' },
    { path: '/inventory', icon: Icons.Pill, label: 'Meds' },
    { path: '/health', icon: Icons.Activity, label: 'Health' },
    { path: '/settings', icon: Icons.Users, label: 'Family' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-safe pt-2 px-6 flex justify-between items-center h-20 z-50">
      {navItems.map(item => {
        const isActive = currentPath === item.path;
        return (
          <Link 
            key={item.path} 
            to={item.path} 
            className={`flex flex-col items-center justify-center w-16 transition-all duration-200 ${isActive ? 'text-blue-600 -translate-y-1' : 'text-gray-400'}`}
          >
            <item.icon className={`w-6 h-6 ${isActive ? 'fill-current' : ''}`} strokeWidth={isActive ? 2.5 : 2} />
            <span className="text-[10px] font-medium mt-1">{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
};

const App = () => {
  // -- State Management --
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('medikeep_users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });
  
  const [medicines, setMedicines] = useState<Medicine[]>(() => {
    const saved = localStorage.getItem('medikeep_medicines');
    return saved ? JSON.parse(saved) : [];
  });

  const [doseLogs, setDoseLogs] = useState<DoseLog[]>(() => {
    const saved = localStorage.getItem('medikeep_doselogs');
    return saved ? JSON.parse(saved) : [];
  });

  const [symptomLogs, setSymptomLogs] = useState<SymptomLog[]>(() => {
    const saved = localStorage.getItem('medikeep_symptoms');
    return saved ? JSON.parse(saved) : [];
  });

  // -- Persistence --
  useEffect(() => {
    localStorage.setItem('medikeep_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('medikeep_medicines', JSON.stringify(medicines));
  }, [medicines]);
  
  useEffect(() => {
    localStorage.setItem('medikeep_doselogs', JSON.stringify(doseLogs));
  }, [doseLogs]);

  useEffect(() => {
    localStorage.setItem('medikeep_symptoms', JSON.stringify(symptomLogs));
  }, [symptomLogs]);

  // -- Handlers --
  const addUser = (name: string, color: string) => {
    const newUser: User = {
      id: Date.now().toString(),
      name,
      avatarColor: color
    };
    setUsers(prev => [...prev, newUser]);
  };

  const deleteUser = (id: string) => {
    if (users.length <= 1) {
      alert("You must keep at least one profile.");
      return;
    }
    if (window.confirm("Delete this profile and all associated data?")) {
      setUsers(prev => prev.filter(u => u.id !== id));
      // Optional: Cleanup medicines for this user
      setMedicines(prev => prev.filter(m => m.userId !== id));
    }
  };

  const addMedicine = (med: Medicine) => {
    setMedicines(prev => [...prev, med]);
  };

  const deleteMedicine = (id: string) => {
    setMedicines(prev => prev.filter(m => m.id !== id));
  };

  const logDose = (medId: string, status: 'taken' | 'skipped') => {
    const log: DoseLog = {
      id: Date.now().toString(),
      medicineId: medId,
      timestamp: new Date().toISOString(),
      status
    };
    setDoseLogs(prev => [...prev, log]);

    // Update Stock if taken
    if (status === 'taken') {
      setMedicines(prev => prev.map(m => {
        if (m.id === medId) {
          return { ...m, currentStock: Math.max(0, m.currentStock - 1) };
        }
        return m;
      }));
    }
  };

  const addSymptomLog = (log: SymptomLog) => {
    setSymptomLogs(prev => [...prev, log]);
  };

  return (
    <HashRouter>
      <div className="min-h-screen bg-gray-50 text-gray-900 font-sans max-w-md mx-auto border-x border-gray-200 shadow-2xl relative">
        <Routes>
          <Route path="/" element={
            <Dashboard 
              medicines={medicines} 
              users={users} 
              onLogDose={logDose} 
              doseLogs={doseLogs} 
            />
          } />
          <Route path="/inventory" element={
            <Inventory 
              medicines={medicines} 
              users={users} 
              onAddMedicine={addMedicine} 
              onDeleteMedicine={deleteMedicine} 
            />
          } />
          <Route path="/health" element={
            <HealthLog 
              logs={symptomLogs} 
              doseLogs={doseLogs}
              medicines={medicines}
              users={users}
              onAddLog={addSymptomLog} 
            />
          } />
          <Route path="/settings" element={
            <Settings 
              users={users}
              onAddUser={addUser}
              onDeleteUser={deleteUser}
            />
          } />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
        <BottomNav />
      </div>
    </HashRouter>
  );
};

export default App;