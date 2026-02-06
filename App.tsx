
import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Layers, 
  BookOpen, 
  GraduationCap, 
  LayoutDashboard, 
  LogOut, 
  Lock,
  Menu,
  X,
  ClipboardList,
  UserCheck
} from 'lucide-react';
import { View, Teacher } from './types';
import { storage } from './services/storage';
import TeacherManager from './components/TeacherManager';
import GroupManager from './components/GroupManager';
import SubjectManager from './components/SubjectManager';
import StudentManager from './components/StudentManager';
import TeacherModule from './components/TeacherModule';
import ReportManager from './components/ReportManager';

const App: React.FC = () => {
  const [authMode, setAuthMode] = useState<'none' | 'admin' | 'teacher'>('none');
  const [password, setPassword] = useState('');
  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  const [currentTeacher, setCurrentTeacher] = useState<Teacher | null>(null);
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Estados para los contadores del dashboard
  const [counts, setCounts] = useState({
    teachers: 0,
    groups: 0,
    subjects: 0,
    students: 0,
    citations: 0
  });

  // Actualizar contadores cada vez que cambia la vista o el modo de autenticación
  useEffect(() => {
    if (authMode === 'admin' || authMode === 'none') {
      setCounts({
        teachers: storage.getTeachers().length,
        groups: storage.getGroups().length,
        subjects: storage.getSubjects().length,
        students: storage.getStudents().length,
        citations: storage.getCitations().length
      });
    }
  }, [currentView, authMode]);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin') {
      setAuthMode('admin');
    } else {
      alert('Contraseña incorrecta');
    }
  };

  const handleTeacherLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const teacher = storage.getTeachers().find(t => t.id === selectedTeacherId);
    if (teacher && teacher.pin === password) {
      setCurrentTeacher(teacher);
      setAuthMode('teacher');
    } else {
      alert('PIN incorrecto o docente no seleccionado');
    }
  };

  if (authMode === 'none') {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Admin Login */}
          <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100 transition-transform hover:scale-[1.02]">
            <div className="text-center mb-8">
              <div className="bg-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-200">
                <Lock className="text-white" size={32} />
              </div>
              <h1 className="text-2xl font-extrabold text-gray-900">Coordinador</h1>
              <p className="text-gray-500">Gestión Administrativa</p>
            </div>
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none text-center text-xl tracking-widest"
                placeholder="Contraseña Admin"
                required
              />
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg">
                Entrar como Admin
              </button>
            </form>
          </div>

          {/* Teacher Login */}
          <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100 transition-transform hover:scale-[1.02]">
            <div className="text-center mb-8">
              <div className="bg-indigo-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-200">
                <UserCheck className="text-white" size={32} />
              </div>
              <h1 className="text-2xl font-extrabold text-gray-900">Docente</h1>
              <p className="text-gray-500">Registro de Preinformes</p>
            </div>
            <form onSubmit={handleTeacherLogin} className="space-y-4">
              <select 
                value={selectedTeacherId}
                onChange={(e) => setSelectedTeacherId(e.target.value)}
                className="w-full px-4 py-4 rounded-xl border border-gray-200 outline-none bg-white font-semibold text-gray-700"
                required
              >
                <option value="">Seleccione su nombre</option>
                {storage.getTeachers().map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
              <input
                type="password"
                maxLength={4}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none text-center text-xl tracking-[1rem]"
                placeholder="PIN"
                required
              />
              <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg">
                Entrar como Docente
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Teacher View
  if (authMode === 'teacher' && currentTeacher) {
    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center shadow-sm">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <ClipboardList className="text-white" size={24} />
            </div>
            <div>
              <h1 className="font-bold text-gray-900">Preinformes Escolar</h1>
              <p className="text-xs text-indigo-600 font-bold uppercase tracking-wider">Docente: {currentTeacher.name}</p>
            </div>
          </div>
          <button 
            onClick={() => { setAuthMode('none'); setPassword(''); }}
            className="flex items-center gap-2 text-red-500 font-bold hover:bg-red-50 px-4 py-2 rounded-lg transition-colors"
          >
            <LogOut size={20} /> Salir
          </button>
        </nav>
        <main className="p-8">
          <TeacherModule teacher={currentTeacher} />
        </main>
      </div>
    );
  }

  // Admin View
  const menuItems = [
    { id: 'dashboard', label: 'Inicio', icon: LayoutDashboard },
    { id: 'teachers', label: 'Docentes', icon: Users },
    { id: 'groups', label: 'Grupos', icon: Layers },
    { id: 'subjects', label: 'Asignaturas', icon: BookOpen },
    { id: 'students', label: 'Estudiantes', icon: GraduationCap },
    { id: 'reports', label: 'Informes', icon: ClipboardList },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-white border-r border-gray-200 transition-all duration-300 flex flex-col`}>
        <div className="p-6 flex items-center justify-between">
          {isSidebarOpen && <span className="font-bold text-xl text-blue-600">Admin Escuela</span>}
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-gray-100 rounded-lg">
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id as View)}
              className={`w-full flex items-center p-3 rounded-xl transition-all ${
                currentView === item.id 
                  ? 'bg-blue-50 text-blue-600 font-bold shadow-sm' 
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
              }`}
            >
              <item.icon size={22} className={currentView === item.id ? 'text-blue-600' : 'text-gray-400'} />
              {isSidebarOpen && <span className="ml-3">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <button 
            onClick={() => { setAuthMode('none'); setPassword(''); }}
            className="w-full flex items-center p-3 text-red-500 hover:bg-red-50 rounded-xl transition-all font-bold"
          >
            <LogOut size={22} />
            {isSidebarOpen && <span className="ml-3">Cerrar Sesión</span>}
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-8">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tight">
              {menuItems.find(i => i.id === currentView)?.label}
            </h2>
          </div>
          <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span className="text-sm font-bold text-gray-700">Coordinador Principal</span>
          </div>
        </header>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-8 min-h-[700px]">
          {currentView === 'dashboard' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <DashboardCard label="Docentes" count={counts.teachers} icon={Users} color="blue" />
              <DashboardCard label="Grupos" count={counts.groups} icon={Layers} color="green" />
              <DashboardCard label="Asignaturas" count={counts.subjects} icon={BookOpen} color="purple" />
              <DashboardCard label="Estudiantes" count={counts.students} icon={GraduationCap} color="orange" />
              <DashboardCard label="Citaciones" count={counts.citations} icon={ClipboardList} color="red" />
            </div>
          )}
          {currentView === 'teachers' && <TeacherManager />}
          {currentView === 'groups' && <GroupManager />}
          {currentView === 'subjects' && <SubjectManager />}
          {currentView === 'students' && <StudentManager />}
          {currentView === 'reports' && <ReportManager />}
        </div>
      </main>
    </div>
  );
};

interface DashboardCardProps {
  label: string;
  count: number;
  icon: any;
  color: string;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ label, count, icon: Icon, color }) => {
  const colors: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
    red: 'bg-red-50 text-red-600',
  };

  return (
    <div className="p-8 rounded-3xl border border-gray-100 hover:shadow-xl hover:scale-[1.02] transition-all bg-white group">
      <div className={`${colors[color]} w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-sm`}>
        <Icon size={28} />
      </div>
      <h3 className="text-gray-400 text-sm font-bold uppercase tracking-widest mb-1">{label}</h3>
      <p className="text-4xl font-black text-gray-900">{count}</p>
    </div>
  );
};

export default App;
