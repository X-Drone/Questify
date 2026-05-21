import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { attemptsApi } from "../api/attempts.api";

import type {
  AnswerData,
  ID,
} from "../api/types";

import { queryKeys } from "./queryKeys";

// =========================
// Queries
// =========================

export function useAttemptHistory(
  limit = 50,
  offset = 0
) {
  return useQuery({
    queryKey:
      queryKeys.attempts.history(
        limit,
        offset
      ),

    queryFn: () =>
      attemptsApi.getHistory({
        limit,
        offset,
      }),
  });
}

export function useAttemptDetail(
  attemptId: ID
) {
  return useQuery({
    queryKey:
      queryKeys.attempts.detail(
        attemptId
      ),

    queryFn: () =>
      attemptsApi.getDetail(
        attemptId
      ),

    enabled: !!attemptId,
  });
}

// =========================
// Mutations
// =========================

export function useStartAttempt() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: (
      testId: ID
    ) =>
      attemptsApi.start(testId),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey:
          queryKeys.attempts.all,
      });
    },
  });
}

export function useSubmitAnswer<
  T extends AnswerData
>(
  attemptId: ID,
  questionId: ID
) {
  const queryClient =
    useQueryClient();

  return useMutation<
    void,
    Error,
    T
  >({
    mutationFn: (data) =>
      attemptsApi.submitAnswer(
        attemptId,
        questionId,
        data
      ),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey:
          queryKeys.attempts.detail(
            attemptId
          ),
      });
    },
  });
}

export function useCompleteAttempt() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: (
      attemptId: ID
    ) =>
      attemptsApi.complete(
        attemptId
      ),

    onSuccess: (_, attemptId) => {
      queryClient.invalidateQueries({
        queryKey:
          queryKeys.attempts.detail(
            attemptId
          ),
      });

      queryClient.invalidateQueries({
        queryKey:
          queryKeys.attempts.history(),
      });
    },
  });
}