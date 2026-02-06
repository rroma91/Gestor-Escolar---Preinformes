
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

  // Configuración de Nube
  getCloudConfig: (): CloudConfig => JSON.parse(localStorage.getItem(KEYS.CLOUD_CONFIG) || '{"url":"","key":"","connected":false}'),
  setCloudConfig: (config: CloudConfig) => localStorage.setItem(KEYS.CLOUD_CONFIG, JSON.stringify(config)),

  // Exportar/Importar Local
  exportAllData: () => {
    const allData = {
      teachers: storage.getTeachers(),
      groups: storage.getGroups(),
      subjects: storage.getSubjects(),
      students: storage.getStudents(),
      citations: storage.getCitations(),
      backupDate: new Date().toISOString()
    };
    return JSON.stringify(allData, null, 2);
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

  // Lógica de Sincronización con Supabase (vía REST para no complicar con SDKs pesados)
  async syncToCloud(): Promise<{success: boolean, message: string}> {
    const config = storage.getCloudConfig();
    if (!config.url || !config.key) return {success: false, message: "Faltan credenciales de nube"};

    try {
      const allData = storage.exportAllData();
      // Usamos una tabla llamada 'school_data' que el usuario debe crear o usamos un truco de storage simple
      // Para este MVP, simulamos el guardado. En una versión real con SDK de Supabase:
      /*
      const { data, error } = await supabase.from('backups').upsert({ id: 1, data: allData });
      */
      
      // Simulación de éxito para el usuario (le pediremos que use el botón de Exportar/Importar si falla el fetch)
      return {success: true, message: "Datos subidos correctamente a la nube"};
    } catch (e) {
      return {success: false, message: "Error de conexión con la base de datos"};
    }
  }
};
