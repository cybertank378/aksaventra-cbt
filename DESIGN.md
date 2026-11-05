# 🎨 UI/UX, State & TypeScript Data Design: `aksaventra-cbt-ui`

## 1. Definisi Tipe Data Inti (`src/core/domain/entities/ExamTypes.ts`)
```typescript
export type QuestionType = 'multichoice_single' | 'multichoice_multi' | 'shortanswer' | 'matching';
export type AttemptStatus = 'inprogress' | 'locked' | 'submitted' | 'abandoned';

export interface QuestionOption {
  key: string;
  html: string;
}

export interface ExamQuestionItem {
  slot: number;
  questionId: number;
  type: QuestionType;
  stemHtml: string;
  options: QuestionOption[];
}

export interface LocalAnswerEntry {
  questionId: number;
  answer: string | string[];
  flagged: boolean;
  updatedAt: number;
  synced: boolean;
}
```
