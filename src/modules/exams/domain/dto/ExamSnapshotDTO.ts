export interface QuestionOptionDTO {
  key: string; // "A", "B", "C", "D", "E"
  html: string;
}

export interface QuestionItemDTO {
  slot: number;
  questionId: number;
  type: string; // "multichoice", "mcma", "truefalse", "shortanswer", "numerical", "matching", "cloze", "essay"
  stemHtml: string;
  imageUrl?: string;
  points?: number;
  maxScore?: number;
  tolerance?: number | null;
  options?: QuestionOptionDTO[];
}

export interface ExamSnapshotDTO {
  examId: string;
  moodleCbtId: number;
  title: string;
  courseName: string;
  durationSeconds: number;
  maxStrikes: number;
  sebRequired: boolean;
  sebConfigKey?: string | null;
  serverTimestamp: number;
  activeToken?: string | null;
  timeOpen?: string;
  timeClose?: string;
  questions: QuestionItemDTO[];
  snapshotHash?: string | null;
}

export interface CreateExamInput {
  moodleCbtId: number;
  title: string;
  courseName: string;
  durationSeconds?: number;
  maxStrikes?: number;
  sebRequired?: boolean;
  sebConfigKey?: string | null;
  activeToken: string;
  tokenExpiresAt: Date;
  questions: QuestionItemDTO[];
  answerKeys?: Record<string, string>; // Stored securely on server only
  timeOpen: Date;
  timeClose: Date;
}

export interface UpdateExamInput {
  id: string;
  title?: string;
  courseName?: string;
  durationSeconds?: number;
  maxStrikes?: number;
  sebRequired?: boolean;
  sebConfigKey?: string | null;
  activeToken?: string;
  tokenExpiresAt?: Date;
  timeOpen?: Date;
  timeClose?: Date;
}
