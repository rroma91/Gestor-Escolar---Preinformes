
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
  ExternalLink
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
      alert('¡Configuración válida guardada! Ahora puedes sincronizar.');
    } else {
      alert('Por favor, ingresa una URL y Key válidas de Supabase.');
    }
  };

  const handleUpload = async () => {
    if (!window.confirm("¿Subir datos? Esto guardará tu información actual en la nube.")) return;
    setIsSyncing(true);
    const result = await storage.uploadToCloud();
    setIsSyncing(false);
    alert(result.message);
  };

  const handleDownload = async () => {
    if (!window.confirm("¿Bajar datos de la nube? Esto borrará lo que tienes en este navegador.")) return;
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

  const exportBackup = () => {
    const data = storage.exportAllData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `respaldo_escuela_${new Date().toISOString().split('T')[0]}.json`;
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
        alert('¡Datos importados con éxito! La página se recargará.');
        window.location.reload();
      } else {
        alert('Error: El archivo no es válido.');
      }
    };
    reader.readAsText(file);
  };

  if (authMode === 'none') {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-10 left-10 w-64 h-64 bg-blue-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-indigo-500 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
          <div className="bg-white/95 backdrop-blur-md rounded-[2.5rem] shadow-2xl p-10 border border-white/20 transition-all hover:translate-y-[-5px]">
            <div className="text-center mb-8">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-blue-500/20">
                <Lock className="text-white" size={36} />
              </div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">COORDINADOR</h1>
              <p className="text-slate-500 font-bold text-sm uppercase tracking-widest mt-2">Acceso Administrativo</p>
            </div>
            <form onSubmit={handleAdminLogin} className="space-y-6">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-6 py-5 rounded-2xl border-2 border-slate-100 focus:border-blue-500 outline-none text-center text-2xl font-black tracking-[0.5em] transition-all bg-slate-50"
                placeholder="••••"
                required
              />
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-5 rounded-2xl transition-all shadow-lg shadow-blue-600/30 uppercase tracking-widest">
                Entrar al Sistema
              </button>
            </form>
          </div>

          <div className="bg-white/95 backdrop-blur-md rounded-[2.5rem] shadow-2xl p-10 border border-white/20 transition-all hover:translate-y-[-5px]">
            <div className="text-center mb-8">
              <div className="bg-gradient-to-br from-indigo-600 to-purple-700 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-indigo-500/20">
                <UserCheck className="text-white" size={36} />
              </div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">DOCENTE</h1>
              <p className="text-slate-500 font-bold text-sm uppercase tracking-widest mt-2">Registro de Preinformes</p>
            </div>
            <form onSubmit={handleTeacherLogin} className="space-y-6">
              <select 
                value={selectedTeacherId}
                onChange={(e) => setSelectedTeacherId(e.target.value)}
                className="w-full px-6 py-5 rounded-2xl border-2 border-slate-100 outline-none bg-slate-50 font-black text-slate-700 text-lg appearance-none cursor-pointer focus:border-indigo-500"
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
                className="w-full px-6 py-5 rounded-2xl border-2 border-slate-100 focus:border-indigo-500 outline-none text-center text-2xl font-black tracking-[0.5em] transition-all bg-slate-50"
                placeholder="PIN"
                required
              />
              <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-5 rounded-2xl transition-all shadow-lg shadow-indigo-600/30 uppercase tracking-widest">
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
            className="flex items-center gap-2 text-red-500 font-black hover:bg-red-50 px-6 py-3 rounded-2xl transition-all border border-transparent hover:border-red-100 uppercase text-xs tracking-widest"
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

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'teachers', label: 'Docentes', icon: Users },
    { id: 'groups', label: 'Grupos', icon: Layers },
    { id: 'subjects', label: 'Materias', icon: BookOpen },
    { id: 'students', label: 'Estudiantes', icon: GraduationCap },
    { id: 'reports', label: 'Reportes', icon: ClipboardList },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <aside className={`${isSidebarOpen ? 'w-72' : 'w-24'} bg-slate-900 transition-all duration-300 flex flex-col no-print overflow-hidden shadow-2xl z-20`}>
        <div className="p-8 flex items-center justify-between">
          {isSidebarOpen && <span className="font-black text-2xl text-white tracking-tighter">PRE-INF <span className="text-blue-400">APP</span></span>}
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-all">
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="flex-1 px-6 space-y-3 mt-4">
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
              {isSidebarOpen && <span className="ml-4 uppercase text-xs font-black tracking-widest">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-white/5">
          <button 
            onClick={() => { setAuthMode('none'); setPassword(''); }}
            className="w-full flex items-center p-4 text-red-400 hover:bg-red-400/10 rounded-2xl transition-all font-black uppercase text-xs tracking-widest"
          >
            <LogOut size={22} />
            {isSidebarOpen && <span className="ml-4">Finalizar</span>}
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto h-screen p-10 bg-slate-50 relative">
        <header className="mb-10 flex justify-between items-center no-print">
          <div>
            <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">
              {menuItems.find(i => i.id === currentView)?.label}
            </h2>
            <p className="text-slate-400 font-bold text-sm tracking-widest mt-1">SISTEMA GESTIÓN ESCOLAR v2.5</p>
          </div>
          
          <div className="flex items-center gap-4">
             {cloudConfig.connected ? (
               <div className="bg-green-50 text-green-600 px-4 py-2 rounded-xl border border-green-100 flex items-center gap-2 text-xs font-black uppercase tracking-tighter shadow-sm animate-pulse">
                 <CheckCircle2 size={16} /> Conexión Activa
               </div>
             ) : (
               <div className="bg-slate-100 text-slate-400 px-4 py-2 rounded-xl border border-slate-200 flex items-center gap-2 text-xs font-black uppercase tracking-tighter">
                 <CloudOff size={16} /> Offline
               </div>
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

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div className="bg-gradient-to-br from-indigo-700 to-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden">
                  <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
                  
                  <div className="flex justify-between items-start mb-8">
                    <div className="flex items-center gap-4">
                      <div className="bg-indigo-500 p-3 rounded-2xl shadow-lg">
                        <Database size={28} />
                      </div>
                      <div>
                        <h3 className="text-2xl font-black uppercase tracking-tight">Sincronización Nube</h3>
                        <p className="text-indigo-300 text-xs font-bold tracking-widest uppercase">Motor: Supabase</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setShowHelp(!showHelp)}
                      className="text-white/40 hover:text-white transition-colors"
                    >
                      <HelpCircle size={24} />
                    </button>
                  </div>
                  
                  {showHelp && (
                    <div className="mb-6 bg-white/10 p-5 rounded-2xl border border-white/10 text-xs leading-relaxed animate-in fade-in slide-in-from-top-4 duration-300">
                      <p className="font-bold mb-2 uppercase tracking-wider text-indigo-300">¿Dónde están mis llaves?</p>
                      <ol className="list-decimal list-inside space-y-1 opacity-80">
                        <li>Ve a tu proyecto en <span className="font-black">Supabase</span>.</li>
                        <li>Clic en el icono de <span className="font-black">Settings</span> (abajo izq).</li>
                        <li>Clic en <span className="font-black">API</span>.</li>
                        <li>Copia <span className="font-black">Project URL</span> y <span className="font-black">anon public Key</span>.</li>
                      </ol>
                    </div>
                  )}
                  
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <div className="relative group">
                        <Link2 className="absolute left-4 top-4 text-white/30 group-focus-within:text-indigo-400 transition-colors" size={18} />
                        <input 
                          type="text" 
                          placeholder="Pega la URL aquí" 
                          value={cloudConfig.url}
                          onChange={(e) => setCloudConfig({...cloudConfig, url: e.target.value})}
                          className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:bg-white/15 focus:border-indigo-400 transition-all font-bold placeholder:text-white/20 text-sm"
                        />
                      </div>
                      <div className="relative group">
                        <RefreshCw className="absolute left-4 top-4 text-white/30 group-focus-within:text-indigo-400 transition-colors" size={18} />
                        <input 
                          type="password" 
                          placeholder="Pega la KEY aquí" 
                          value={cloudConfig.key}
                          onChange={(e) => setCloudConfig({...cloudConfig, key: e.target.value})}
                          className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:bg-white/15 focus:border-indigo-400 transition-all font-bold placeholder:text-white/20 text-sm"
                        />
                      </div>
                      <button 
                        onClick={handleSaveCloud}
                        className="w-full bg-indigo-500 hover:bg-indigo-400 text-white font-black py-4 rounded-2xl transition-all shadow-lg uppercase text-xs tracking-widest flex items-center justify-center gap-2"
                      >
                        <CheckCircle2 size={16} /> Verificar & Guardar
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-8 pt-8 border-t border-white/10">
                       <button 
                         disabled={!cloudConfig.connected || isSyncing}
                         onClick={handleUpload}
                         className="flex flex-col items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white font-black py-6 rounded-[2rem] border border-white/10 transition-all disabled:opacity-20"
                       >
                         {isSyncing ? <RefreshCw className="animate-spin text-indigo-400" size={24} /> : <Upload className="text-indigo-400" size={24} />}
                         <span className="text-[10px] uppercase tracking-widest mt-1">Subir a Nube</span>
                       </button>
                       <button 
                         disabled={!cloudConfig.connected || isSyncing}
                         onClick={handleDownload}
                         className="flex flex-col items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white font-black py-6 rounded-[2rem] border border-white/10 transition-all disabled:opacity-20"
                       >
                         {isSyncing ? <RefreshCw className="animate-spin text-emerald-400" size={24} /> : <Download className="text-emerald-400" size={24} />}
                         <span className="text-[10px] uppercase tracking-widest mt-1">Bajar de Nube</span>
                       </button>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2.5rem] p-10 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-4 mb-8">
                      <div className="bg-slate-200 p-3 rounded-2xl">
                        <RefreshCw className="text-slate-600" size={28} />
                      </div>
                      <div>
                        <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Copia Manual</h3>
                        <p className="text-slate-400 text-xs font-bold tracking-widest uppercase">Respaldo en Archivo</p>
                      </div>
                    </div>
                    <p className="text-sm text-slate-500 font-medium leading-relaxed mb-8">
                      Si quieres guardar una copia en tu memoria USB o disco duro, usa estas opciones. No requieren internet.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <button 
                      onClick={exportBackup}
                      className="w-full flex items-center justify-between px-8 py-5 bg-white border border-slate-200 rounded-2xl hover:bg-slate-100 transition-all group shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <Download size={20} className="text-slate-400 group-hover:text-slate-900 transition-colors" />
                        <span className="text-xs font-black uppercase tracking-widest text-slate-700">Guardar Archivo .json</span>
                      </div>
                      <ExternalLink size={16} className="text-slate-300" />
                    </button>
                    
                    <input type="file" ref={fileInputRef} onChange={importBackup} className="hidden" accept=".json" />
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full flex items-center justify-between px-8 py-5 bg-slate-900 border border-slate-900 rounded-2xl hover:bg-black transition-all group shadow-xl"
                    >
                      <div className="flex items-center gap-3 text-white">
                        <Upload size={20} className="text-white group-hover:scale-110 transition-transform" />
                        <span className="text-xs font-black uppercase tracking-widest">Cargar Archivo .json</span>
                      </div>
                    </button>
                  </div>
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

interface DashboardCardProps {
  label: string;
  count: number;
  icon: any;
  color: string;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ label, count, icon: Icon, color }) => {
  const colors: Record<string, string> = {
    blue: 'from-blue-500 to-blue-600 shadow-blue-500/20',
    green: 'from-emerald-500 to-emerald-600 shadow-emerald-500/20',
    purple: 'from-purple-500 to-purple-600 shadow-purple-500/20',
    orange: 'from-orange-500 to-orange-600 shadow-orange-500/20',
    red: 'from-rose-500 to-rose-600 shadow-rose-500/20',
  };

  return (
    <div className="p-8 rounded-[2rem] border border-slate-100 bg-white group hover:shadow-2xl hover:shadow-slate-200 transition-all duration-300">
      <div className={`bg-gradient-to-br ${colors[color]} w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-all shadow-lg`}>
        <Icon size={24} className="text-white" />
      </div>
      <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2">{label}</h3>
      <p className="text-4xl font-black text-slate-900 tabular-nums">{count}</p>
    </div>
  );
};

export default App;
