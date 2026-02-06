
import React, { useState, useEffect, useRef } from 'react';
import { storage } from '../services/storage';
import { Citation, Group } from '../types';
import { Trash2, FileText, Users, BookOpen, Calendar, Download, Loader2, AlertCircle, RefreshCw } from 'lucide-react';

const ReportManager: React.FC = () => {
  const [citations, setCitations] = useState<Citation[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [filterGroupId, setFilterGroupId] = useState('all');
  const [isExporting, setIsExporting] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const data = storage.getCitations();
    const g = storage.getGroups();
    setCitations(data);
    setGroups(g);
  };

  const filteredCitations = filterGroupId === 'all' 
    ? citations 
    : citations.filter(c => c.groupId === filterGroupId);

  // FUNCIÓN DE BORRADO SOLICITADA
  const handleClear = () => {
    // 1. Preguntar si desea iniciar el proceso
    const confirmStart = window.confirm('¿Deseas iniciar el proceso de eliminación de reportes? (SÍ/NO)');
    
    // 2. Si no confirma, mostrar alerta y detener
    if (!confirmStart) {
      alert('Acción cancelada. No se borró nada.');
      return;
    }

    // 3. Si confirma, proceder con la lógica de eliminación
    const isAll = filterGroupId === 'all';
    const finalConfirmation = isAll 
      ? "¿Estás completamente seguro de borrar TODO el sistema? (SÍ/NO)" 
      : `¿Borrar todas las citaciones del grupo ${filterGroupId}? (SÍ/NO)`;

    if (window.confirm(finalConfirmation)) {
      let newList: Citation[] = [];
      
      if (isAll) {
        newList = [];
      } else {
        newList = citations.filter(c => c.groupId !== filterGroupId);
      }

      storage.setCitations(newList);
      setCitations(newList);
      alert('¡Eliminación exitosa!');
    } else {
      alert('Acción cancelada. No se borró nada.');
    }
  };

  const deleteSingle = (id: string) => {
    if (window.confirm("¿Eliminar este registro específico? (SÍ/NO)")) {
      const updated = citations.filter(c => c.id !== id);
      storage.setCitations(updated);
      setCitations(updated);
    }
  };

  const handleDownloadPDF = () => {
    if (!reportRef.current) return;
    setIsExporting(true);
    
    const element = reportRef.current;
    const opt = {
      margin: 10,
      filename: `Reporte_${new Date().getTime()}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    // @ts-ignore
    window.html2pdf().set(opt).from(element).save().then(() => {
      setIsExporting(false);
    }).catch(() => {
      setIsExporting(false);
      alert('Error al generar PDF');
    });
  };

  const reportData: Record<string, Record<string, { studentName: string, items: Citation[] }>> = {};
  filteredCitations.forEach(c => {
    if (!reportData[c.groupName]) reportData[c.groupName] = {};
    if (!reportData[c.groupName][c.studentName]) {
      reportData[c.groupName][c.studentName] = { studentName: c.studentName, items: [] };
    }
    reportData[c.groupName][c.studentName].items.push(c);
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row gap-4 justify-between items-center bg-white p-6 rounded-3xl border border-gray-200 shadow-md">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-3 rounded-2xl shadow-lg shadow-blue-100">
            <FileText className="text-white" size={24} />
          </div>
          <div>
            <h3 className="font-black text-gray-900 text-xl uppercase tracking-tight">Consolidado de Citaciones</h3>
            <p className="text-sm text-gray-400 font-medium">Total: {citations.length} registros</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 w-full lg:w-auto justify-center">
          <button onClick={loadData} className="p-3 text-gray-400 hover:text-blue-600 transition-colors" title="Refrescar">
            <RefreshCw size={20} />
          </button>

          <select 
            value={filterGroupId}
            onChange={(e) => setFilterGroupId(e.target.value)}
            className="flex-1 md:w-56 px-4 py-3 rounded-2xl border-2 border-gray-100 font-bold text-gray-700 bg-gray-50 outline-none focus:border-blue-500 transition-all cursor-pointer"
          >
            <option value="all">TODOS LOS GRUPOS</option>
            {groups.map(g => (
              <option key={g.id} value={g.id}>GRUPO {g.name}</option>
            ))}
          </select>
          
          <button 
            onClick={handleDownloadPDF}
            disabled={isExporting || filteredCitations.length === 0}
            className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white font-black rounded-2xl hover:bg-green-700 transition-all shadow-lg shadow-green-100 disabled:opacity-50 uppercase text-xs tracking-widest"
          >
            {isExporting ? <Loader2 className="animate-spin" size={20} /> : <Download size={20} />}
            {isExporting ? 'Generando...' : 'PDF'}
          </button>

          <button 
            type="button"
            onClick={handleClear}
            className="flex items-center gap-2 px-6 py-3 bg-red-50 text-red-600 font-black border-2 border-red-100 rounded-2xl hover:bg-red-600 hover:text-white hover:border-red-600 transition-all shadow-sm uppercase text-xs tracking-widest"
          >
            <Trash2 size={20} />
            {filterGroupId === 'all' ? 'Borrar Todo' : 'Borrar Grupo'}
          </button>
        </div>
      </div>

      <div className="space-y-8" ref={reportRef}>
        {Object.keys(reportData).length === 0 ? (
          <div className="py-32 flex flex-col items-center justify-center text-gray-300 bg-gray-50/50 rounded-[40px] border-4 border-dashed border-gray-100">
            <AlertCircle size={80} className="mb-4 opacity-10" />
            <p className="text-2xl font-black uppercase tracking-tighter">Sin información</p>
            <p className="text-sm font-bold opacity-60">No hay citaciones guardadas en este momento.</p>
          </div>
        ) : (
          Object.entries(reportData).map(([groupName, studentsMap]) => (
            <div key={groupName} className="bg-white border border-gray-100 rounded-[32px] overflow-hidden shadow-xl page-break-inside-avoid mb-10">
              <div className="bg-gray-900 px-8 py-5 flex justify-between items-center">
                <h4 className="text-white font-black text-2xl tracking-tighter flex items-center gap-3 uppercase">
                  <div className="w-2 h-8 bg-blue-500 rounded-full"></div>
                  GRUPO {groupName}
                </h4>
                <div className="flex flex-col items-end">
                   <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">Total Citados</span>
                   <span className="bg-blue-600 text-white text-sm font-black px-4 py-1 rounded-full border border-blue-400">
                    {Object.keys(studentsMap).length}
                  </span>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b bg-gray-50/30 text-gray-400 text-[11px] font-black uppercase tracking-[0.25em]">
                      <th className="py-5 px-10">Estudiante</th>
                      <th className="py-5 px-10">Reportes de Asignaturas</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {Object.values(studentsMap).sort((a,b) => a.studentName.localeCompare(b.studentName)).map((studentData) => (
                      <tr key={studentData.studentName} className="hover:bg-blue-50/10 transition-colors align-top">
                        <td className="py-8 px-10">
                          <div className="font-black text-gray-900 uppercase text-lg leading-tight mb-2">{studentData.studentName}</div>
                          <div className="inline-flex items-center gap-2 bg-red-50 text-red-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider">
                            <AlertCircle size={12} />
                            {studentData.items.length} Reportes pendientes
                          </div>
                        </td>
                        <td className="py-8 px-10">
                          <div className="grid grid-cols-1 gap-4">
                            {studentData.items.map((item) => (
                              <div key={item.id} className="flex items-center justify-between group/item bg-gray-50/50 p-5 rounded-3xl border-2 border-transparent hover:border-blue-100 hover:bg-white transition-all">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                                    <span className="font-black text-gray-900 text-sm uppercase tracking-tight">
                                      {item.subjectName}
                                    </span>
                                  </div>
                                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[11px] font-bold">
                                    <span className="text-gray-400 flex items-center gap-2 uppercase tracking-wide">
                                      <Users size={14} className="text-blue-400" /> Docente: {item.teacherName}
                                    </span>
                                    <span className="text-gray-300 flex items-center gap-2 uppercase tracking-wide">
                                      <Calendar size={14} /> {item.date}
                                    </span>
                                  </div>
                                </div>
                                <button 
                                  onClick={() => deleteSingle(item.id)}
                                  data-html2canvas-ignore="true"
                                  className="text-gray-200 hover:text-red-600 p-3 transition-all opacity-0 group-hover/item:opacity-100"
                                >
                                  <Trash2 size={20} />
                                </button>
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))
        )}
      </div>
      <style>{`
        .page-break-inside-avoid { break-inside: avoid; }
      `}</style>
    </div>
  );
};

export default ReportManager;
