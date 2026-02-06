
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
  Settings
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
  const [showHelp, setShowHelp] = useState(false);
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

  // Added exportBackup to handle local file export
  const exportBackup = () => {
    const data = storage.exportAllData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `preinformes_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Added importBackup to handle local file import
  const importBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (storage.importAllData(content)) {
        alert('¡Datos importados con éxito!');
        window.location.reload();
      } else {
        alert('Error al importar el archivo. Formato no válido.');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
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

  const handleTeacherLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const teacher = storage.getTeachers().find(t => t.id === selectedTeacherId);
    if (teacher && teacher.pin === password) {
      setCurrentTeacher(teacher);
      setAuthMode('teacher');
      setPassword('');
    } else {
      alert('PIN incorrecto o docente no seleccionado');
    }
  };

  const handleSaveCloud = () => {
    const isReady = cloudConfig.url.includes('supabase.co') && cloudConfig.key.length > 20;
    const newConfig = { ...cloudConfig, connected: isReady };
    storage.setCloudConfig(newConfig);
    setCloudConfig(newConfig);
    if (isReady) {
      alert('¡Configuración guardada! Ahora puedes subir tus datos.');
    } else {
      alert('Error: URL o Key no válidas. Revisa los datos de Supabase.');
    }
  };

  const handleUpload = async () => {
    setIsSyncing(true);
    const result = await storage.uploadToCloud();
    setIsSyncing(false);
    alert(result.message);
  };

  const handleDownload = async () => {
    if (!window.confirm("¿Bajar datos? Esto borrará lo que tienes en este navegador actualmente.")) return;
    setIsSyncing(true);
    const result = await storage.downloadFromCloud();
    setIsSyncing(false);
    if (result.success) {
      alert(result.message);
      window.location.reload();
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
        <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
          <div className="bg-white rounded-[2.5rem] shadow-2xl p-10">
            <div className="text-center mb-8">
              <div className="bg-blue-600 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                <Lock className="text-white" size={36} />
              </div>
              <h1 className="text-3xl font-black text-slate-900">COORDINADOR</h1>
              <p className="text-slate-500 font-bold text-sm uppercase mt-2 tracking-widest">Admin</p>
            </div>
            <form onSubmit={handleAdminLogin} className="space-y-6">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-6 py-5 rounded-2xl border-2 border-slate-100 focus:border-blue-500 outline-none text-center text-2xl font-black tracking-[0.5em] bg-slate-50"
                placeholder="••••"
                required
              />
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-5 rounded-2xl transition-all shadow-lg uppercase tracking-widest">
                Entrar
              </button>
            </form>
          </div>

          <div className="bg-white rounded-[2.5rem] shadow-2xl p-10">
            <div className="text-center mb-8">
              <div className="bg-indigo-600 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                <UserCheck className="text-white" size={36} />
              </div>
              <h1 className="text-3xl font-black text-slate-900">DOCENTE</h1>
              <p className="text-slate-500 font-bold text-sm uppercase mt-2 tracking-widest">Preinformes</p>
            </div>
            <form onSubmit={handleTeacherLogin} className="space-y-6">
              <select 
                value={selectedTeacherId}
                onChange={(e) => setSelectedTeacherId(e.target.value)}
                className="w-full px-6 py-5 rounded-2xl border-2 border-slate-100 outline-none bg-slate-50 font-black text-slate-700"
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
                className="w-full px-6 py-5 rounded-2xl border-2 border-slate-100 focus:border-indigo-500 outline-none text-center text-2xl font-black tracking-[0.5em] bg-slate-50"
                placeholder="PIN"
                required
              />
              <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-5 rounded-2xl shadow-lg uppercase tracking-widest">
                Iniciar Sesión
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  if (authMode === 'teacher' && currentTeacher) {
    return (
      <div className="min-h-screen bg-slate-50">
        <nav className="bg-white border-b border-slate-200 px-10 py-5 flex justify-between items-center shadow-sm">
          <div className="flex items-center gap-4">
            <div className="bg-indigo-600 p-3 rounded-2xl shadow-md">
              <ClipboardList className="text-white" size={24} />
            </div>
            <div>
              <h1 className="font-black text-slate-900 text-xl tracking-tight uppercase">Módulo de Docente</h1>
              <p className="text-xs text-indigo-600 font-black uppercase tracking-widest">{currentTeacher.name}</p>
            </div>
          </div>
          <button 
            onClick={() => { setAuthMode('none'); setPassword(''); }}
            className="flex items-center gap-2 text-red-500 font-black hover:bg-red-50 px-6 py-3 rounded-2xl border border-transparent hover:border-red-100 uppercase text-xs tracking-widest"
          >
            <LogOut size={18} /> Salir
          </button>
        </nav>
        <main className="p-10 max-w-7xl mx-auto">
          <TeacherModule teacher={currentTeacher} />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex overflow-hidden">
      {/* Sidebar Fija */}
      <aside className={`${isSidebarOpen ? 'w-72' : 'w-24'} bg-slate-900 transition-all duration-300 flex flex-col no-print h-screen shrink-0`}>
        <div className="p-8 flex items-center justify-between">
          {isSidebarOpen && <span className="font-black text-2xl text-white tracking-tighter">PRE-INF <span className="text-blue-400">APP</span></span>}
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-all">
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="flex-1 px-6 space-y-2 overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id as View)}
              className={`w-full flex items-center p-4 rounded-2xl transition-all group ${
                currentView === item.id 
                  ? 'bg-blue-600 text-white font-black shadow-xl shadow-blue-600/20' 
                  : 'text-slate-400 hover:bg-white/5 hover:text-slate-100'
              }`}
            >
              <item.icon size={22} className={currentView === item.id ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'} />
              {isSidebarOpen && <span className="ml-4 uppercase text-[10px] font-black tracking-[0.2em]">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-white/5">
          <button 
            onClick={() => { setAuthMode('none'); setPassword(''); }}
            className="w-full flex items-center p-4 text-red-400 hover:bg-red-400/10 rounded-2xl transition-all font-black uppercase text-xs tracking-widest"
          >
            <LogOut size={22} />
            {isSidebarOpen && <span className="ml-4">Salir</span>}
          </button>
        </div>
      </aside>

      {/* Área Principal con Scroll Independiente */}
      <main className="flex-1 overflow-y-auto h-screen p-10 bg-slate-50 custom-scrollbar">
        <header className="mb-10 flex justify-between items-center no-print">
          <div>
            <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">
              {menuItems.find(i => i.id === currentView)?.label}
            </h2>
            <p className="text-slate-400 font-bold text-sm tracking-widest mt-1 uppercase">Coordinación Académica</p>
          </div>
          
          <div className="flex items-center gap-4">
             {cloudConfig.connected ? (
               <div className="bg-green-50 text-green-600 px-4 py-2 rounded-xl border border-green-100 flex items-center gap-2 text-[10px] font-black uppercase tracking-tighter shadow-sm">
                 <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div> Nube Conectada
               </div>
             ) : (
               <button 
                 onClick={() => setCurrentView('settings')}
                 className="bg-amber-50 text-amber-600 px-4 py-2 rounded-xl border border-amber-100 flex items-center gap-2 text-[10px] font-black uppercase tracking-tighter hover:bg-amber-100 transition-all"
               >
                 <AlertTriangle size={14} /> Conectar Base de Datos
               </button>
             )}
          </div>
        </header>

        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 p-10 min-h-[calc(100vh-200px)]">
          {currentView === 'dashboard' && (
            <div className="space-y-12">
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
                <DashboardCard label="Docentes" count={counts.teachers} icon={Users} color="blue" />
                <DashboardCard label="Grupos" count={counts.groups} icon={Layers} color="green" />
                <DashboardCard label="Materias" count={counts.subjects} icon={BookOpen} color="purple" />
                <DashboardCard label="Alumnos" count={counts.students} icon={GraduationCap} color="orange" />
                <DashboardCard label="Reportes" count={counts.citations} icon={ClipboardList} color="red" />
              </div>

              {!cloudConfig.connected && (
                <div className="bg-slate-900 rounded-[2.5rem] p-12 text-center text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
                  <Database className="mx-auto mb-6 text-blue-400" size={64} />
                  <h3 className="text-3xl font-black mb-4 tracking-tight uppercase">Tus datos están en modo local</h3>
                  <p className="text-slate-400 max-w-lg mx-auto mb-8 font-medium">
                    Para que los profesores puedan ver los grupos desde sus casas, debes conectar la base de datos de Supabase.
                  </p>
                  <button 
                    onClick={() => setCurrentView('settings')}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-black px-10 py-5 rounded-2xl transition-all shadow-xl shadow-blue-600/20 uppercase text-xs tracking-[0.2em]"
                  >
                    Configurar Nube Ahora
                  </button>
                </div>
              )}
            </div>
          )}

          {currentView === 'settings' && (
            <div className="max-w-4xl mx-auto space-y-10">
              <div className="bg-gradient-to-br from-indigo-800 to-slate-900 rounded-[3rem] p-12 text-white shadow-2xl relative">
                <div className="flex items-center gap-6 mb-10">
                  <div className="bg-white/10 p-4 rounded-3xl backdrop-blur-md border border-white/20">
                    <Database size={40} className="text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-black uppercase tracking-tight">Configuración de Nube</h3>
                    <p className="text-indigo-300 font-bold uppercase text-[10px] tracking-widest">Conexión con Supabase</p>
                  </div>
                </div>

                <div className="space-y-8">
                   <div className="grid grid-cols-1 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-indigo-300 ml-2 tracking-[0.2em]">Paso 1: Pegar Project URL</label>
                        <div className="relative group">
                          <Link2 className="absolute left-5 top-5 text-white/30" size={20} />
                          <input 
                            type="text" 
                            placeholder="https://tu-proyecto.supabase.co" 
                            value={cloudConfig.url}
                            onChange={(e) => setCloudConfig({...cloudConfig, url: e.target.value})}
                            className="w-full bg-white/5 border border-white/10 rounded-[1.5rem] py-5 pl-14 pr-6 outline-none focus:bg-white/10 focus:border-blue-400 transition-all font-bold"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-indigo-300 ml-2 tracking-[0.2em]">Paso 2: Pegar API Key (anon public)</label>
                        <div className="relative group">
                          <RefreshCw className="absolute left-5 top-5 text-white/30" size={20} />
                          <input 
                            type="password" 
                            placeholder="Tu API Key de Supabase..." 
                            value={cloudConfig.key}
                            onChange={(e) => setCloudConfig({...cloudConfig, key: e.target.value})}
                            className="w-full bg-white/5 border border-white/10 rounded-[1.5rem] py-5 pl-14 pr-6 outline-none focus:bg-white/10 focus:border-blue-400 transition-all font-bold"
                          />
                        </div>
                      </div>
                   </div>

                   <button 
                    onClick={handleSaveCloud}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-6 rounded-3xl transition-all shadow-2xl shadow-blue-600/30 uppercase text-sm tracking-widest flex items-center justify-center gap-3"
                  >
                    <CheckCircle2 size={24} /> Guardar Conexión
                  </button>

                  <div className="grid grid-cols-2 gap-6 pt-10 border-t border-white/10">
                     <button 
                       disabled={!cloudConfig.connected || isSyncing}
                       onClick={handleUpload}
                       className="flex flex-col items-center gap-3 bg-white/5 hover:bg-white/10 p-8 rounded-[2rem] border border-white/10 transition-all disabled:opacity-20"
                     >
                       <Upload className="text-blue-400" size={32} />
                       <span className="text-[10px] font-black uppercase tracking-widest">Subir a Nube</span>
                     </button>
                     <button 
                       disabled={!cloudConfig.connected || isSyncing}
                       onClick={handleDownload}
                       className="flex flex-col items-center gap-3 bg-white/5 hover:bg-white/10 p-8 rounded-[2rem] border border-white/10 transition-all disabled:opacity-20"
                     >
                       <Download className="text-emerald-400" size={32} />
                       <span className="text-[10px] font-black uppercase tracking-widest">Bajar de Nube</span>
                     </button>
                  </div>
                </div>

                <div className="mt-10 bg-white/5 p-6 rounded-2xl border border-white/5 text-[10px] leading-relaxed opacity-60">
                  <p className="font-black uppercase mb-2 tracking-widest flex items-center gap-2">
                    <HelpCircle size={14} /> ¿Dónde encuentro esto?
                  </p>
                  En Supabase: Ajustes (Rueda dentada) &gt; API &gt; Copia 'Project URL' y 'anon public Key'.
                </div>
              </div>

              {/* Backup Local - Siempre disponible */}
              <div className="bg-slate-100 rounded-[3rem] p-12 flex items-center justify-between gap-10">
                <div className="flex-1">
                  <h4 className="text-xl font-black text-slate-800 uppercase tracking-tight mb-2">Respaldo Manual (Archivo)</h4>
                  <p className="text-sm text-slate-500 font-medium">Si no quieres usar la nube, descarga un archivo .json como copia de seguridad.</p>
                </div>
                <div className="flex gap-4">
                  <button onClick={exportBackup} className="bg-white px-8 py-4 rounded-2xl border border-slate-200 font-black text-slate-700 uppercase text-[10px] tracking-widest hover:bg-slate-50 transition-all shadow-sm">
                    Descargar .json
                  </button>
                  <button onClick={() => fileInputRef.current?.click()} className="bg-slate-900 px-8 py-4 rounded-2xl font-black text-white uppercase text-[10px] tracking-widest hover:bg-black transition-all shadow-xl shadow-slate-900/20">
                    Cargar .json
                  </button>
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
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
      `}</style>
    </div>
  );
};

const DashboardCard: React.FC<{ label: string; count: number; icon: any; color: string; }> = ({ label, count, icon: Icon, color }) => {
  const colors: Record<string, string> = {
    blue: 'from-blue-500 to-blue-600 shadow-blue-500/20',
    green: 'from-emerald-500 to-emerald-600 shadow-emerald-500/20',
    purple: 'from-purple-500 to-purple-600 shadow-purple-500/20',
    orange: 'from-orange-500 to-orange-600 shadow-orange-500/20',
    red: 'from-rose-500 to-rose-600 shadow-rose-500/20',
  };
  return (
    <div className="p-8 rounded-[2.5rem] border border-slate-100 bg-white group hover:shadow-2xl hover:translate-y-[-5px] transition-all duration-300">
      <div className={`bg-gradient-to-br ${colors[color]} w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-lg`}>
        <Icon size={24} className="text-white" />
      </div>
      <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2">{label}</h3>
      <p className="text-4xl font-black text-slate-900 tabular-nums">{count}</p>
    </div>
  );
};

export default App;
