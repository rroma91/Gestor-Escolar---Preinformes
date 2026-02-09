
import React, { useState, useEffect } from 'react';
import { storage } from '../services/storage';
import { Teacher, Group, Subject, Student, Citation } from '../types';
import { Check, Send, AlertCircle, Info, Loader2 } from 'lucide-react';

interface Props {
  teacher: Teacher;
}

const TeacherModule: React.FC<Props> = ({ teacher }) => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [groupStudents, setGroupStudents] = useState<Student[]>([]);
  const [selectedStudentIds, setSelectedStudentIds] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setGroups(storage.getGroups());
    setSubjects(storage.getSubjects());
  }, []);

  useEffect(() => {
    if (selectedGroupId) {
      const students = storage.getStudents().filter(s => s.groupId === selectedGroupId);
      setGroupStudents(students.sort((a, b) => a.name.localeCompare(b.name)));
      setSelectedStudentIds(new Set());
    } else {
      setGroupStudents([]);
    }
  }, [selectedGroupId]);

  const toggleStudent = (id: string) => {
    const next = new Set(selectedStudentIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedStudentIds(next);
  };

  const handleSave = async () => {
    if (!selectedGroupId || !selectedSubjectId || selectedStudentIds.size === 0) {
      alert('Por favor seleccione grupo, asignatura y al menos un estudiante.');
      return;
    }

    setIsSubmitting(true);
    try {
      const existingCitations = storage.getCitations();
      const group = groups.find(g => g.id === selectedGroupId)!;
      const subject = subjects.find(s => s.id === selectedSubjectId)!;
      
      const newCitations: Citation[] = Array.from(selectedStudentIds).map(studentId => {
        const student = groupStudents.find(s => s.id === studentId)!;
        return {
          id: Math.random().toString(36).substring(2, 11),
          teacherId: teacher.id,
          teacherName: teacher.name,
          studentId: student.id,
          studentName: student.name,
          groupId: group.id,
          groupName: group.name,
          subjectId: subject.id,
          subjectName: subject.name,
          date: new Date().toLocaleDateString()
        };
      });

      // 1. Guardar localmente
      const updatedCitations = [...existingCitations, ...newCitations];
      storage.setCitations(updatedCitations);

      // 2. Subir a la nube automáticamente
      const cloud = storage.getCloudConfig();
      if (cloud.connected) {
        await storage.uploadToCloud();
      }

      alert(`¡Éxito! Se han generado y enviado ${newCitations.length} citaciones.`);
      setSelectedStudentIds(new Set());
    } catch (error) {
      alert('Error al guardar. Se guardó localmente pero no se pudo subir a la nube.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Selección de Entorno */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Info size={20} className="text-indigo-600" />
            Configuración del Preinforme
          </h2>
          <div>
            <label className="block text-sm font-bold text-gray-600 mb-1">1. Seleccione Grupo</label>
            <select 
              value={selectedGroupId}
              onChange={(e) => setSelectedGroupId(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none bg-gray-50 font-bold text-indigo-700"
            >
              <option value="">-- Escoger Grupo --</option>
              {groups.map(g => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-600 mb-1">2. Seleccione Asignatura</label>
            <select 
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none bg-gray-50 font-bold text-indigo-700"
            >
              <option value="">-- Escoger Asignatura --</option>
              {subjects.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          
          <button 
            onClick={handleSave}
            disabled={isSubmitting || selectedStudentIds.size === 0}
            className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-indigo-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Enviando a la nube...
              </>
            ) : (
              <>
                <Send size={20} /> 
                Generar Citaciones ({selectedStudentIds.size})
              </>
            )}
          </button>
        </div>

        {/* Listado de Estudiantes */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col h-[600px]">
          <div className="bg-gray-50 p-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="font-bold text-gray-800">3. Estudiantes del Grupo</h2>
            <span className="text-xs font-bold bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full uppercase">
              {groupStudents.length} en total
            </span>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {!selectedGroupId && (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 p-8 text-center">
                <AlertCircle size={48} className="mb-2 opacity-20" />
                <p>Primero seleccione un grupo para ver el listado de estudiantes</p>
              </div>
            )}
            {selectedGroupId && groupStudents.length === 0 && (
              <p className="text-center text-gray-500 py-10 italic">No hay estudiantes cargados en este grupo.</p>
            )}
            {groupStudents.map(student => (
              <label 
                key={student.id} 
                className={`flex items-center gap-3 p-4 rounded-xl border transition-all cursor-pointer ${
                  selectedStudentIds.has(student.id) 
                    ? 'border-indigo-500 bg-indigo-50/50 shadow-sm' 
                    : 'border-gray-100 hover:border-indigo-200 hover:bg-gray-50'
                }`}
              >
                <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors ${
                  selectedStudentIds.has(student.id) ? 'bg-indigo-600 border-indigo-600' : 'border-gray-300 bg-white'
                }`}>
                  {selectedStudentIds.has(student.id) && <Check size={16} className="text-white" />}
                </div>
                <input 
                  type="checkbox" 
                  className="hidden" 
                  checked={selectedStudentIds.has(student.id)}
                  onChange={() => toggleStudent(student.id)}
                />
                <span className={`flex-1 font-bold text-sm uppercase ${selectedStudentIds.has(student.id) ? 'text-indigo-900' : 'text-gray-700'}`}>
                  {student.name}
                </span>
              </label>
            ))}
          </div>
          
          {selectedGroupId && (
            <div className="p-4 bg-indigo-50 border-t border-indigo-100">
               <button 
                onClick={() => {
                  if (selectedStudentIds.size === groupStudents.length) setSelectedStudentIds(new Set());
                  else setSelectedStudentIds(new Set(groupStudents.map(s => s.id)));
                }}
                className="text-xs font-bold text-indigo-600 uppercase hover:underline"
              >
                {selectedStudentIds.size === groupStudents.length ? 'Desmarcar Todos' : 'Marcar Todos'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherModule;
