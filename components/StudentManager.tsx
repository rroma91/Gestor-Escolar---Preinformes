
import React, { useState, useEffect, useRef } from 'react';
import { storage } from '../services/storage';
import { Student, Group } from '../types';
import { Plus, Edit2, Trash2, X, Check, FileUp, Info } from 'lucide-react';

const StudentManager: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string>('');
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setStudents(storage.getStudents());
    const g = storage.getGroups();
    setGroups(g);
    if (g.length > 0) setSelectedGroup(g[0].id);
  }, []);

  const generateId = () => Math.random().toString(36).substring(2, 9) + Date.now().toString(36);

  const filteredStudents = students.filter(s => s.groupId === selectedGroup);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGroup) return;

    let updatedList: Student[];
    if (isEditing) {
      updatedList = students.map(s => s.id === isEditing ? { ...s, name } : s);
    } else {
      updatedList = [...students, { id: generateId(), groupId: selectedGroup, name }];
    }
    
    setStudents(updatedList);
    storage.setStudents(updatedList);
    setName('');
    setIsEditing(null);
  };

  const confirmDelete = (id: string) => {
    const filtered = students.filter(s => s.id !== id);
    setStudents(filtered);
    storage.setStudents(filtered);
    setDeletingId(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedGroup) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const lines = content.split('\n');
      const importedStudents: Student[] = [];
      
      lines.forEach(line => {
        const studentName = line.trim();
        if (studentName) {
          importedStudents.push({
            id: generateId(),
            name: studentName,
            groupId: selectedGroup
          });
        }
      });

      if (importedStudents.length > 0) {
        const updated = [...students, ...importedStudents];
        setStudents(updated);
        storage.setStudents(updated);
      }
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-end">
        <div className="w-full md:w-64">
          <label className="block text-sm font-medium text-gray-700 mb-1">Grupo seleccionado</label>
          <select 
            value={selectedGroup} 
            onChange={(e) => setSelectedGroup(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 outline-none bg-white font-bold text-blue-600"
          >
            {groups.length === 0 && <option value="">No hay grupos</option>}
            {groups.map(g => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>
        </div>

        <div className="flex gap-2">
          <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept=".txt" />
          <button 
            disabled={!selectedGroup}
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors shadow-sm"
          >
            <FileUp size={18} /> Subir Lista .txt
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border border-gray-200 flex flex-col md:flex-row gap-4 items-end shadow-sm">
        <div className="flex-1 w-full">
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Nombre del estudiante"
            required
          />
        </div>
        <button type="submit" className="bg-blue-600 text-white py-2 px-6 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors">
          {isEditing ? <Check size={18} /> : <Plus size={18} />}
          {isEditing ? 'Actualizar' : 'Agregar'}
        </button>
      </form>

      <div className="overflow-x-auto border border-gray-100 rounded-xl">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="py-3 px-4 text-gray-600 font-semibold uppercase text-xs">Nombre Completo del Estudiante</th>
              <th className="py-3 px-4 text-right text-gray-600 font-semibold uppercase text-xs">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map((student) => (
              <tr key={student.id} className="border-b hover:bg-blue-50/30 transition-colors">
                <td className="py-3 px-4 uppercase text-sm font-bold text-gray-900">
                  {student.name}
                </td>
                <td className="py-3 px-4 text-right">
                  {deletingId === student.id ? (
                    <div className="flex justify-end gap-1">
                      <button onClick={() => confirmDelete(student.id)} className="bg-red-600 text-white px-2 py-1 rounded text-xs font-bold shadow-sm">SÍ</button>
                      <button onClick={() => setDeletingId(null)} className="bg-gray-200 text-gray-600 px-2 py-1 rounded text-xs font-bold shadow-sm">NO</button>
                    </div>
                  ) : (
                    <div className="flex justify-end gap-1">
                      <button onClick={() => { setIsEditing(student.id); setName(student.name); setDeletingId(null); }} className="p-2 text-blue-600 hover:bg-white rounded-lg transition-colors">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => setDeletingId(student.id)} className="p-2 text-red-600 hover:bg-white rounded-lg transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredStudents.length === 0 && (
          <div className="py-12 text-center text-gray-400 italic bg-gray-50/50">
            No hay estudiantes en este grupo.
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentManager;
