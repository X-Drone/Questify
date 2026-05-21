import { request } from "./request";

import type {
  AnswerData,
  AnswerSubmitRequest,
  AttemptCompleteResponse,
  AttemptDetailResponse,
  AttemptHistoryResponse,
  ID,
} from "./types";

export const attemptsApi = {
  start: (testId: ID) =>
    request<{ attempt_id: ID }>({
      method: "POST",
      url: `/attempts/start/${testId}`,
    }),

  submitAnswer: <T extends AnswerData>(
    attemptId: ID,
    questionId: ID,
    data: T
  ) =>
    request<void>({
      method: "POST",
      url: `/attempts/${attemptId}/questions/${questionId}/answer`,
      data: {
        data,
      } satisfies AnswerSubmitRequest<T>,
    }),

  complete: (attemptId: ID) =>
    request<AttemptCompleteResponse>({
      method: "POST",
      url: `/attempts/${attemptId}/complete`,
    }),

  getHistory: (params?: {
    limit?: number;
    offset?: number;
  }) =>
    request<AttemptHistoryResponse[]>({
      method: "GET",
      url: "/attempts/history",
      params,
    }),

  getDetail: (attemptId: ID) =>
    request<AttemptDetailResponse>({
      method: "GET",
      url: `/attempts/${attemptId}`,
    }),
};
