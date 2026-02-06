
export interface Teacher {
  id: string;
  name: string;
  pin: string;
}

export interface Group {
  id: string;
  name: string;
}

export interface Subject {
  id: string;
  name: string;
}

export interface Student {
  id: string;
  name: string;
  groupId: string;
}

export interface Citation {
  id: string;
  teacherId: string;
  teacherName: string;
  studentId: string;
  studentName: string;
  groupId: string;
  groupName: string;
  subjectId: string;
  subjectName: string;
  date: string;
}

export type View = 'dashboard' | 'teachers' | 'groups' | 'subjects' | 'students' | 'reports' | 'settings';
