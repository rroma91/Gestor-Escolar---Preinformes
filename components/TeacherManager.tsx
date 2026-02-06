
import React, { useState, useEffect } from 'react';
import { storage } from '../services/storage';
import { Teacher } from '../types';
import { Plus, Edit2, Trash2, X, Check, Lock, AlertTriangle } from 'lucide-react';

const TeacherManager: React.FC = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', pin: '' });

  useEffect(() => {
    setTeachers(storage.getTeachers());
  }, []);

  const generateId = () => Math.random().toString(36).substring(2, 9) + Date.now().toString(36);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let updatedList: Teacher[];
    
    if (isEditing) {
      updatedList = teachers.map(t => t.id === isEditing ? { ...t, ...formData } : t);
    } else {
      updatedList = [...teachers, { id: generateId(), ...formData }];
    }
    
    setTeachers(updatedList);
    storage.setTeachers(updatedList);
    setFormData({ name: '', pin: '' });
    setIsEditing(null);
  };

  const confirmDelete = (id: string) => {
    const filtered = teachers.filter(t => t.id !== id);
    setTeachers(filtered);
    storage.setTeachers(filtered);
    setDeletingId(null);
  };

  const startEdit = (teacher: Teacher) => {
    setIsEditing(teacher.id);
    setFormData({ name: teacher.name, pin: teacher.pin });
    setDeletingId(null);
  };

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit} className="bg-gray-50 p-6 rounded-xl border border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Docente</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Ej: Profe. Roberto Gómez"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">PIN de Acceso</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              maxLength={4}
              value={formData.pin}
              onChange={(e) => setFormData({ ...formData, pin: e.target.value.replace(/\D/g, '') })}
              className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="4 dígitos"
              required
            />
          </div>
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            {isEditing ? <Check size={18} /> : <Plus size={18} />}
            {isEditing ? 'Guardar' : 'Registrar Docente'}
          </button>
          {isEditing && (
            <button
              type="button"
              onClick={() => { setIsEditing(null); setFormData({ name: '', pin: '' }); }}
              className="bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </form>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="py-4 font-semibold text-gray-700">Nombre</th>
              <th className="py-4 font-semibold text-gray-700 text-center">PIN</th>
              <th className="py-4 font-semibold text-gray-700 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {teachers.map((teacher) => (
              <tr key={teacher.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="py-4 text-gray-800 font-medium">{teacher.name}</td>
                <td className="py-4 text-center font-mono text-blue-600 font-bold">{teacher.pin}</td>
                <td className="py-4 text-right">
                  {deletingId === teacher.id ? (
                    <div className="flex justify-end gap-2 items-center">
                      <span className="text-xs font-bold text-red-600 animate-pulse">¿Borrar?</span>
                      <button onClick={() => confirmDelete(teacher.id)} className="bg-red-600 text-white px-3 py-1 rounded text-xs font-bold hover:bg-red-700">SÍ</button>
                      <button onClick={() => setDeletingId(null)} className="bg-gray-200 text-gray-600 px-3 py-1 rounded text-xs font-bold hover:bg-gray-300">NO</button>
                    </div>
                  ) : (
                    <div className="space-x-1">
                      <button onClick={() => startEdit(teacher)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                        <Edit2 size={18} />
                      </button>
                      <button onClick={() => setDeletingId(teacher.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {teachers.length === 0 && (
          <div className="py-12 text-center text-gray-500 italic">No hay docentes registrados aún.</div>
        )}
      </div>
    </div>
  );
};

export default TeacherManager;
