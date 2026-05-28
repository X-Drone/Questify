// =========================
// Common Types
// =========================

export type ID = number;
export type ISODateString = string;

export type QuestionType =
  | "single_choice"
  | "multiple_choice"
  | "true_false"
  | "text_answer"
  | "numeric_answer"
  | "matching_pairs"
  | "ordering";

// =========================
// Validation Errors
// =========================

export interface ValidationError {
  loc: (string | number)[];
  msg: string;
  type: string;
  input?: unknown;
  ctx?: Record<string, unknown>;
}

export interface HTTPValidationError {
  detail: ValidationError[];
}

// =========================
// Question Answer Options
// =========================

export interface AnswerOption {
  id?: ID;
  text: string;
  is_correct?: boolean;
  order?: number;
}

// =========================
// Test Requests
// =========================

export interface TestCreateRequest {
  title: string;
  description?: string | null;
  tags?: string[];
}

// =========================
// Question Requests
// =========================

export interface QuestionCreateRequest {
  title: string;
  description?: string | null;
  type: QuestionType;
  answer_options: Record<string, unknown>[];
  media_url?: string | null;
}

export interface QuestionUpdateRequest {
  title?: string | null;
  description?: string | null;
  answer_options?: Record<string, unknown>[] | null;
}

// =========================
// Question Responses
// =========================

export interface Question {
  id: ID;
  title: string;
  description?: string | null;
  type: QuestionType;
  media_url?: string | null;
  order: number;
  answer_options: AnswerOption[];
}

// =========================
// Test Responses
// =========================

export interface TestListResponse {
  id: ID;
  title: string;
  description?: string | null;
  status: string;
  question_count: number;
  tags?: string[];
  created_at?: ISODateString | null;
}

export interface TestDetailResponse {
  id: ID;
  title: string;
  description?: string | null;
  status: string;
  tags: string[];
  questions: Question[];
  created_at?: ISODateString | null;
  published_at?: ISODateString | null;
}

// =========================
// Attempt Responses
// =========================

export interface AttemptCompleteResponse {
  id: ID;
  status: string;
  score: number;
  max_score: number;
  percentage: number;
  passed: boolean;
}

export interface AttemptHistoryResponse {
  id: ID;
  test_id: ID;
  status: string;

  score?: number | null;
  max_score?: number | null;
  percentage?: number | null;

  created_at?: ISODateString | null;
  completed_at?: ISODateString | null;
}

export interface AttemptDetailResponse {
  id: ID;
  test_id: ID;
  user_id: string;

  status: string;

  score?: number | null;
  max_score?: number | null;
  percentage?: number | null;

  user_answers: Record<string, unknown>[];

  created_at?: ISODateString | null;
  completed_at?: ISODateString | null;
}

// =========================
// Answer Submit Types
// =========================

export interface SingleChoiceAnswerData {
  selected_id: number;
}

export interface MultipleChoiceAnswerData {
  selected_ids: number[];
}

export interface TrueFalseAnswerData {
  selected_value: boolean | "true" | "false";
}

export interface TextAnswerData {
  text: string;
}

export interface NumericAnswerData {
  value: number;
  tolerance?: number;
}

export interface MatchingPair {
  left: string;
  right: string;
}

export interface MatchingPairsAnswerData {
  pairs: MatchingPair[];
}

export interface OrderingAnswerData {
  order: number[];
}

// =========================
// Discriminated Union
// =========================

export type AnswerData =
  | SingleChoiceAnswerData
  | MultipleChoiceAnswerData
  | TrueFalseAnswerData
  | TextAnswerData
  | NumericAnswerData
  | MatchingPairsAnswerData
  | OrderingAnswerData;

export interface AnswerSubmitRequest<T = AnswerData> {
  data: T;
}

// =========================
// Axios API Response Wrapper
// =========================

export interface ApiErrorResponse {
  detail?: string;
  errors?: HTTPValidationError;
}
