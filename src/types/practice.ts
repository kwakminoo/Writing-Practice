export interface PracticeProblem {
  id?: number;
  category: string;
  type: string;
  prompt: string;
  difficulty?: string;
  keywords?: string[];
  length?: number;
  created_at?: string;
}

export interface PracticeType {
  key: string;
  label: string;
  desc: string;
}

export interface ProblemWithType extends PracticeProblem, PracticeType {}

export interface AIFeedbackRequest {
  content: string;
  category: string;
  practiceType: string;
}

export interface AIFeedbackResponse {
  result?: string;
  error?: string;
  details?: any;
} 