import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import { questionsApi } from "../api/questions.api";

import type {
  ID,
  QuestionCreateRequest,
  QuestionUpdateRequest,
} from "../api/types";

import { queryKeys } from "./queryKeys";

export function useCreateQuestion(
  testId: ID
) {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: (
      data: QuestionCreateRequest
    ) =>
      questionsApi.create(
        testId,
        data
      ),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey:
          queryKeys.tests.detail(
            testId
          ),
      });
    },
  });
}

export function useUpdateQuestion(
  testId: ID,
  questionId: ID
) {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: (
      data: QuestionUpdateRequest
    ) =>
      questionsApi.update(
        testId,
        questionId,
        data
      ),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey:
          queryKeys.tests.detail(
            testId
          ),
      });
    },
  });
}

export function useDeleteQuestion(
  testId: ID
) {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: (
      questionId: ID
    ) =>
      questionsApi.delete(
        testId,
        questionId
      ),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey:
          queryKeys.tests.detail(
            testId
          ),
      });
    },
  });
}