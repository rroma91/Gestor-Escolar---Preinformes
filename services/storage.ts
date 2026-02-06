
import { Teacher, Group, Subject, Student, Citation } from '../types';

const KEYS = {
  TEACHERS: 'school_teachers',
  GROUPS: 'school_groups',
  SUBJECTS: 'school_subjects',
  STUDENTS: 'school_students',
  CITATIONS: 'school_citations',
};

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
};
