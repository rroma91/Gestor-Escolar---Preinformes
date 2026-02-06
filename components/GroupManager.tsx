
import React, { useState, useEffect } from 'react';
import { storage } from '../services/storage';
import { Group } from '../types';
import { Plus, Edit2, Trash2, X, Check } from 'lucide-react';

const GroupManager: React.FC = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [name, setName] = useState('');

  useEffect(() => {
    setGroups(storage.getGroups());
  }, []);

  const generateId = () => Math.random().toString(36).substring(2, 9) + Date.now().toString(36);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let updated: Group[];
    if (isEditing) {
      updated = groups.map(g => g.id === isEditing ? { ...g, name } : g);
    } else {
      updated = [...groups, { id: generateId(), name }];
    }
    setGroups(updated);
    storage.setGroups(updated);
    setName('');
    setIsEditing(null);
  };

  const confirmDelete = (id: string) => {
    const filtered = groups.filter(g => g.id !== id);
    setGroups(filtered);
    storage.setGroups(filtered);
    setDeletingId(null);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <form onSubmit={handleSubmit} className="bg-gray-50 p-6 rounded-xl border border-gray-200 flex gap-4 items-end">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Grupo</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="ej: 10-01"
            required
          />
        </div>
        <div className="flex gap-2">
          <button type="submit" className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
            {isEditing ? <Check size={18} /> : <Plus size={18} />}
            {isEditing ? 'Guardar' : 'Crear'}
          </button>
          {isEditing && (
            <button onClick={() => { setIsEditing(null); setName(''); }} className="bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400">
              <X size={18} />
            </button>
          )}
        </div>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {groups.map((group) => (
          <div key={group.id} className="p-4 bg-white border border-gray-200 rounded-xl flex items-center justify-between hover:shadow-sm">
            <span className="text-lg font-semibold text-gray-800">{group.name}</span>
            <div className="flex gap-1">
              {deletingId === group.id ? (
                <div className="flex gap-1">
                  <button onClick={() => confirmDelete(group.id)} className="bg-red-600 text-white px-2 py-1 rounded text-xs font-bold">SÍ</button>
                  <button onClick={() => setDeletingId(null)} className="bg-gray-200 text-gray-600 px-2 py-1 rounded text-xs font-bold">NO</button>
                </div>
              ) : (
                <>
                  <button onClick={() => { setIsEditing(group.id); setName(group.name); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => setDeletingId(group.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                    <Trash2 size={16} />
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
        {groups.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-500">No hay grupos creados.</div>
        )}
      </div>
    </div>
  );
};

export default GroupManager;
