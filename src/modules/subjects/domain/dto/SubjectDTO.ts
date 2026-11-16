export interface SubjectDTO {
  id: string;
  moodleCourseId?: number | null;
  name: string;
  shortName?: string | null;
  description?: string | null;
  questionCount: number;
  examCount: number;
  gradeLevels: string[];
  createdAt: string;
  updatedAt: string;
}

export interface SubjectDetailDTO extends SubjectDTO {
  questions: Array<{
    id: string;
    code: string;
    gradeLevel: string;
    type: string;
    points: number;
  }>;
  exams: Array<{
    id: string;
    title: string;
    durationSeconds: number;
    timeOpen: string;
  }>;
}

export interface CreateSubjectInputDTO {
  name: string;
  shortName?: string;
  description?: string;
}

export interface UpdateSubjectInputDTO {
  name?: string;
  shortName?: string | null;
  description?: string | null;
}
