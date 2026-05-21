import { request } from "./request";

import type {
  ID,
  QuestionCreateRequest,
  QuestionUpdateRequest,
} from "./types";

export const questionsApi = {
  create: (
    testId: ID,
    data: QuestionCreateRequest
  ) =>
    request<void>({
      method: "POST",
      url: `/tests/${testId}/questions`,
      data,
    }),

  update: (
    testId: ID,
    questionId: ID,
    data: QuestionUpdateRequest
  ) =>
    request<void>({
      method: "PUT",
      url: `/tests/${testId}/questions/${questionId}`,
      data,
    }),

  delete: (
    testId: ID,
    questionId: ID
  ) =>
    request<void>({
      method: "DELETE",
      url: `/tests/${testId}/questions/${questionId}`,
    }),
};
