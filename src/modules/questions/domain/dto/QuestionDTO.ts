export type CBTQuestionType =
  | "multichoice"
  | "mcma"
  | "truefalse"
  | "shortanswer"
  | "numerical"
  | "matching"
  | "cloze"
  | "essay";

export interface QuestionOptionDTO {
  id: string;
  label: string; // e.g., "A", "B", "1", "left-1"
  text: string;
  isCorrect?: boolean;
  matchTarget?: string; // for matching questions
  imageUrl?: string;
}

export interface QuestionDTO {
  id: string;
  code: string;
  subject: string;
  gradeLevel: string;
  type: CBTQuestionType;
  stem: string;
  imageUrl?: string;
  points: number;
  tolerance?: number; // for numerical questions
  options: QuestionOptionDTO[];
  explanation?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateQuestionInputDTO {
  subject: string;
  gradeLevel: string;
  type: CBTQuestionType;
  stem: string;
  imageUrl?: string;
  points: number;
  tolerance?: number;
  options: QuestionOptionDTO[];
  explanation?: string;
}

export interface QuestionsFilterQueryDTO {
  subject?: string;
  gradeLevel?: string;
  type?: CBTQuestionType;
  search?: string;
}
