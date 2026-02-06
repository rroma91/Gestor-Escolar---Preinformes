
import React, { useState, useEffect, useRef } from 'react';
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
  UserCheck,
  Download,
  Upload,
  RefreshCw,
  AlertTriangle,
  Cloud,
  CloudOff,
  Database,
  Link2,
  CheckCircle2,
  HelpCircle,
  ExternalLink,
  Settings,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { View, Teacher } from './types';
import { storage, CloudConfig } from './services/storage';
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
  const [cloudConfig, setCloudConfig] = useState<CloudConfig>(storage.getCloudConfig());
  const [isSyncing, setIsSyncing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [counts, setCounts] = useState({
    teachers: 0,
    groups: 0,
    subjects: 0,
    students: 0,
    citations: 0
  });

  const updateCounts = () => {
    setCounts({
      teachers: storage.getTeachers().length,
      groups: storage.getGroups().length,
      subjects: storage.getSubjects().length,
      students: storage.getStudents().length,
      citations: storage.getCitations().length
    });
  };

  useEffect(() => {
    updateCounts();
  }, [currentView, authMode]);

  // Si no hay datos y hay configuración maestra, intentamos descargar automáticamente al inicio
  useEffect(() => {
    const checkAndAutoDownload = async () => {
      if (counts.teachers === 0 && cloudConfig.connected) {
        console.log("Sistema vacío, intentando auto-descarga...");
        await storage.downloadFromCloud();
        updateCounts();
      }
    };
    checkAndAutoDownload();
  }, []);

  const exportBackup = () => {
    const data = storage.exportAllData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `respaldo_preinformes.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const importBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (storage.importAllData(content)) {
        alert('¡Importado con éxito!');
        window.location.reload();
      }
    };
    reader.readAsText(file);
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin') {
      setAuthMode('admin');
      setPassword('');
    } else {
      alert('Contraseña incorrecta');
    }
  };

  const handleTeacherLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const teacher = storage.getTeachers().find(t => t.id === selectedTeacherId);
    if (teacher && teacher.pin === password) {
      setCurrentTeacher(teacher);
      setAuthMode('teacher');
      setPassword('');
      
      // Auto-descarga por si acaso el docente entra en un navegador nuevo
      if (storage.getStudents().length === 0 && cloudConfig.connected) {
        setIsSyncing(true);
        await storage.downloadFromCloud();
        setIsSyncing(false);
      }
    } else {
      alert('PIN incorrecto o docente no seleccionado');
    }
  };

  const handleSaveCloud = () => {
    const isReady = cloudConfig.url.includes('supabase.co') && cloudConfig.key.length > 20;
    const newConfig = { ...cloudConfig, connected: isReady };
    storage.setCloudConfig(newConfig);
    setCloudConfig(newConfig);
    alert(isReady ? 'Conexión Manual Guardada' : 'Datos no válidos');
  };

  const handleUpload = async () => {
    setIsSyncing(true);
    const result = await storage.uploadToCloud();
    setIsSyncing(false);
    alert(result.message);
    updateCounts();
  };

  const handleDownload = async () => {
    setIsSyncing(true);
    const result = await storage.downloadFromCloud();
    setIsSyncing(false);
    if (result.success) {
      alert(result.message);
      updateCounts();
    } else {
      alert(result.message);
    }
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'teachers', label: 'Docentes', icon: Users },
    { id: 'groups', label: 'Grupos', icon: Layers },
    { id: 'subjects', label: 'Materias', icon: BookOpen },
    { id: 'students', label: 'Estudiantes', icon: GraduationCap },
    { id: 'reports', label: 'Reportes', icon: ClipboardList },
    { id: 'settings', label: 'Nube / DB', icon: Database },
  ];

  if (authMode === 'none') {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Admin Login */}
          <div className="bg-white rounded-[2.5rem] shadow-2xl p-10">
            <div className="text-center mb-8">
              <div className="bg-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Lock className="text-white" size={28} />
              </div>
              <h1 className="text-2xl font-black text-slate-900 uppercase">Coordinador</h1>
            </div>
            <form onSubmit={handleAdminLogin} className="space-y-6">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-6 py-4 rounded-xl border-2 border-slate-100 focus:border-blue-500 outline-none text-center text-xl font-black tracking-[0.3em]"
                placeholder="••••"
                required
              />
              <button className="w-full bg-blue-600 text-white font-black py-4 rounded-xl shadow-lg uppercase tracking-widest text-sm">
                Entrar Admin
              </button>
            </form>
          </div>

          {/* Teacher Login */}
          <div className="bg-white rounded-[2.5rem] shadow-2xl p-10">
            <div className="text-center mb-8">
              <div className="bg-indigo-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <UserCheck className="text-white" size={28} />
              </div>
              <h1 className="text-2xl font-black text-slate-900 uppercase">Docente</h1>
            </div>
            <form onSubmit={handleTeacherLogin} className="space-y-6">
              <select 
                value={selectedTeacherId}
                onChange={(e) => setSelectedTeacherId(e.target.value)}
                className="w-full px-4 py-4 rounded-xl border-2 border-slate-100 outline-none bg-slate-50 font-bold text-slate-700"
                required
              >
                <option value="">¿QUIÉN ERES?</option>
                {storage.getTeachers().map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
              <input
                type="password"
                maxLength={4}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-6 py-4 rounded-xl border-2 border-slate-100 focus:border-indigo-500 outline-none text-center text-xl font-black tracking-[0.3em]"
                placeholder="PIN"
                required
              />
              <button className="w-full bg-indigo-600 text-white font-black py-4 rounded-xl shadow-lg uppercase tracking-widest text-sm">
                Entrar Módulo
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  if (authMode === 'teacher' && currentTeacher) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <nav className="bg-white border-b px-10 py-5 flex justify-between items-center shadow-sm">
          <div className="flex items-center gap-4">
             <div className="bg-indigo-600 p-2 rounded-xl text-white"><ClipboardList size={20}/></div>
             <div>
                <h1 className="font-black text-slate-900 text-lg uppercase tracking-tighter">Preinformes</h1>
                <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{currentTeacher.name}</p>
             </div>
          </div>
          {isSyncing && <div className="text-[10px] font-black uppercase text-indigo-400 animate-pulse">Sincronizando...</div>}
          <button onClick={() => window.location.reload()} className="text-red-500 font-black uppercase text-xs">Cerrar Sesión</button>
        </nav>
        <main className="p-10 flex-1 max-w-7xl mx-auto w-full">
          <TeacherModule teacher={currentTeacher} />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex overflow-hidden">
      <aside className={`${isSidebarOpen ? 'w-72' : 'w-24'} bg-slate-900 transition-all duration-300 flex flex-col shrink-0 h-screen`}>
        <div className="p-8 flex items-center justify-between text-white">
          {isSidebarOpen && <span className="font-black text-xl tracking-tighter">PRE-INF APP</span>}
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)}><Menu size={20}/></button>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id as View)}
              className={`w-full flex items-center p-4 rounded-xl transition-all ${currentView === item.id ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-white/5'}`}
            >
              <item.icon size={20} />
              {isSidebarOpen && <span className="ml-4 uppercase text-[10px] font-black tracking-widest">{item.label}</span>}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-white/5">
           <button onClick={() => window.location.reload()} className="w-full p-4 text-red-400 flex items-center gap-3">
             <LogOut size={20}/> {isSidebarOpen && <span className="uppercase text-[10px] font-black">Salir</span>}
           </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto h-screen p-10">
        <header className="mb-10 flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">
              {menuItems.find(i => i.id === currentView)?.label}
            </h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Gestión de Coordinación</p>
          </div>
          <div className="flex items-center gap-3">
            {cloudConfig.connected ? (
              <div className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl border border-emerald-100 flex items-center gap-2 text-[10px] font-black uppercase">
                <ShieldCheck size={14} /> Base de Datos Lista
              </div>
            ) : (
              <div className="bg-amber-50 text-amber-600 px-4 py-2 rounded-xl border border-amber-100 flex items-center gap-2 text-[10px] font-black uppercase">
                <CloudOff size={14} /> Sin Base de Datos
              </div>
            )}
          </div>
        </header>

        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl p-8 min-h-[500px]">
          {currentView === 'dashboard' && (
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
               <DashboardCard label="Docentes" count={counts.teachers} icon={Users} color="blue" />
               <DashboardCard label="Grupos" count={counts.groups} icon={Layers} color="green" />
               <DashboardCard label="Materias" count={counts.subjects} icon={BookOpen} color="purple" />
               <DashboardCard label="Alumnos" count={counts.students} icon={GraduationCap} color="orange" />
               <DashboardCard label="Reportes" count={counts.citations} icon={ClipboardList} color="red" />
            </div>
          )}

          {currentView === 'settings' && (
            <div className="max-w-3xl mx-auto space-y-10">
              {cloudConfig.isMaster ? (
                <div className="bg-blue-600 rounded-[2rem] p-10 text-white shadow-2xl relative overflow-hidden">
                  <div className="relative z-10">
                    <ShieldCheck size={48} className="mb-4 text-blue-200" />
                    <h3 className="text-2xl font-black uppercase mb-2">Configuración Maestra Activa</h3>
                    <p className="opacity-80 text-sm mb-8">Las llaves de base de datos están incrustadas en el código. No necesitas configurar nada manualmente.</p>
                    <div className="grid grid-cols-2 gap-4">
                       <button onClick={handleUpload} className="bg-white/10 hover:bg-white/20 p-6 rounded-2xl flex flex-col items-center gap-2 transition-all">
                          <Upload /> <span className="text-[10px] font-black uppercase tracking-widest">Subir Datos</span>
                       </button>
                       <button onClick={handleDownload} className="bg-white/10 hover:bg-white/20 p-6 rounded-2xl flex flex-col items-center gap-2 transition-all">
                          <Download /> <span className="text-[10px] font-black uppercase tracking-widest">Bajar Datos</span>
                       </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-900 rounded-[2rem] p-10 text-white space-y-6">
                   <h3 className="text-xl font-black uppercase">Configuración Manual</h3>
                   <div className="space-y-4">
                      <input 
                        type="text" 
                        placeholder="URL de Supabase" 
                        value={cloudConfig.url} 
                        onChange={(e) => setCloudConfig({...cloudConfig, url: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 p-4 rounded-xl outline-none focus:border-blue-500 font-bold"
                      />
                      <input 
                        type="password" 
                        placeholder="API Key de Supabase" 
                        value={cloudConfig.key} 
                        onChange={(e) => setCloudConfig({...cloudConfig, key: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 p-4 rounded-xl outline-none focus:border-blue-500 font-bold"
                      />
                      <button onClick={handleSaveCloud} className="w-full bg-blue-600 p-4 rounded-xl font-black uppercase text-xs">Guardar Llaves</button>
                   </div>
                </div>
              )}

              <div className="bg-slate-100 p-8 rounded-[2rem] flex items-center justify-between">
                <div>
                  <h4 className="font-black text-slate-800 uppercase text-sm">Respaldo Manual</h4>
                  <p className="text-xs text-slate-500">Descarga un archivo .json por seguridad.</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={exportBackup} className="bg-white px-4 py-2 rounded-lg border font-black uppercase text-[10px]">Descargar</button>
                  <button onClick={() => fileInputRef.current?.click()} className="bg-slate-900 text-white px-4 py-2 rounded-lg font-black uppercase text-[10px]">Cargar</button>
                  <input type="file" ref={fileInputRef} onChange={importBackup} className="hidden" accept=".json" />
                </div>
              </div>
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

const DashboardCard: React.FC<{ label: string; count: number; icon: any; color: string; }> = ({ label, count, icon: Icon, color }) => {
  const colors: Record<string, string> = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-emerald-500 to-emerald-600',
    purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-500 to-orange-600',
    red: 'from-rose-500 to-rose-600',
  };
  return (
    <div className="p-6 rounded-2xl border bg-white flex flex-col items-center">
      <div className={`bg-gradient-to-br ${colors[color]} w-12 h-12 rounded-xl flex items-center justify-center mb-4 shadow-lg`}>
        <Icon size={20} className="text-white" />
      </div>
      <span className="text-slate-400 text-[9px] font-black uppercase tracking-widest">{label}</span>
      <span className="text-3xl font-black text-slate-900">{count}</span>
    </div>
  );
};

export default App;
