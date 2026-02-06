
import { Teacher, Group, Subject, Student, Citation } from '../types';

const KEYS = {
  TEACHERS: 'school_teachers',
  GROUPS: 'school_groups',
  SUBJECTS: 'school_subjects',
  STUDENTS: 'school_students',
  CITATIONS: 'school_citations',
  CLOUD_CONFIG: 'school_cloud_config'
};

export interface CloudConfig {
  url: string;
  key: string;
  connected: boolean;
}

export const storage = {
  getTeachers: (): Teacher[] => JSON.parse(localStorage.getItem(KEYS.TEACHERS) || '[]'),
  setTeachers: (data: Teacher[]) => localStorage.setItem(KEYS.TEACHERS, JSON.stringify(data)),

  getGroups: (): Group[] => JSON.parse(localStorage.getItem(KEYS.GROUPS) || '[]'),
  setGroups: (data: Group[]) => localStorage.setItem(KEYS.GROUPS, JSON.stringify(data)),

  getSubjects: (): Subject[] => JSON.parse(localStorage.getItem(KEYS.SUBJECTS) || '[]'),
  setSubjects: (data: Subject[]) => localStorage.setItem(KEYS.SUBJECTS, JSON.stringify(data)),

  getStudents: (): Student[] => JSON.parse(localStorage.getItem(KEYS.STUDENTS) || '[]'),
  setStudents: (data: Student[]) => localStorage.setItem(KEYS.STUDENTS, JSON.stringify(data)),

  getCitations: (): Citation[] => JSON.parse(localStorage.getItem(KEYS.CITATIONS) || '[]'),
  setCitations: (data: Citation[]) => localStorage.setItem(KEYS.CITATIONS, JSON.stringify(data)),

  getCloudConfig: (): CloudConfig => JSON.parse(localStorage.getItem(KEYS.CLOUD_CONFIG) || '{"url":"","key":"","connected":false}'),
  setCloudConfig: (config: CloudConfig) => localStorage.setItem(KEYS.CLOUD_CONFIG, JSON.stringify(config)),

  exportAllData: () => {
    return JSON.stringify({
      teachers: storage.getTeachers(),
      groups: storage.getGroups(),
      subjects: storage.getSubjects(),
      students: storage.getStudents(),
      citations: storage.getCitations(),
      backupDate: new Date().toISOString()
    });
  },

  importAllData: (jsonString: string) => {
    try {
      const data = JSON.parse(jsonString);
      if (data.teachers) storage.setTeachers(data.teachers);
      if (data.groups) storage.setGroups(data.groups);
      if (data.subjects) storage.setSubjects(data.subjects);
      if (data.students) storage.setStudents(data.students);
      if (data.citations) storage.setCitations(data.citations);
      return true;
    } catch (e) {
      return false;
    }
  },

  // SUBIR A LA NUBE (UPSERT REAL)
  async uploadToCloud(): Promise<{success: boolean, message: string}> {
    const config = storage.getCloudConfig();
    if (!config.url || !config.key) return {success: false, message: "Faltan credenciales de Supabase"};

    // Limpiamos la URL por si acaso termina en /
    const baseUrl = config.url.endsWith('/') ? config.url.slice(0, -1) : config.url;
    const url = `${baseUrl}/rest/v1/school_backups`;
    
    const payload = { 
      id: 1, 
      data: storage.exportAllData(), 
      updated_at: new Date().toISOString() 
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'apikey': config.key,
          'Authorization': `Bearer ${config.key}`,
          'Content-Type': 'application/json',
          'Prefer': 'resolution=merge-duplicates'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || "Error en servidor");
      }
      return { success: true, message: "¡Éxito! Datos guardados en la nube." };
    } catch (e: any) {
      console.error(e);
      return { success: false, message: `Error: ${e.message || "No hay conexión"}` };
    }
  },

  // BAJAR DE LA NUBE (SELECT REAL)
  async downloadFromCloud(): Promise<{success: boolean, message: string}> {
    const config = storage.getCloudConfig();
    if (!config.url || !config.key) return {success: false, message: "Faltan credenciales de Supabase"};

    const baseUrl = config.url.endsWith('/') ? config.url.slice(0, -1) : config.url;
    const url = `${baseUrl}/rest/v1/school_backups?id=eq.1&select=data`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'apikey': config.key,
          'Authorization': `Bearer ${config.key}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error("Error al obtener datos");

      const result = await response.json();
      if (result && result.length > 0 && result[0].data) {
        if (storage.importAllData(result[0].data)) {
          return { success: true, message: "¡Sincronización exitosa! Datos descargados." };
        }
      }
      return { success: false, message: "La nube está vacía. Primero debes 'Subir' datos." };
    } catch (e: any) {
      return { success: false, message: `Error de conexión: ${e.message}` };
    }
  }
};
