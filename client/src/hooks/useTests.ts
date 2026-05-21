import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { testsApi } from "../api/tests.api";
import type {
  ID,
  TestCreateRequest,
} from "../api/types";

import { queryKeys } from "./queryKeys";

// =========================
// Queries
// =========================

export function usePublishedTests(
  limit = 50,
  offset = 0
) {
  return useQuery({
    queryKey: queryKeys.tests.published(
      limit,
      offset
    ),

    queryFn: () =>
      testsApi.getPublished({
        limit,
        offset,
      }),
  });
}

export function useMyTests() {
  return useQuery({
    queryKey: queryKeys.tests.my(),

    queryFn: () =>
      testsApi.getMyTests(),
  });
}

export function useTestDetail(
  testId: ID
) {
  return useQuery({
    queryKey: queryKeys.tests.detail(
      testId
    ),

    queryFn: () =>
      testsApi.getDetail(testId),

    enabled: !!testId,
  });
}

// =========================
// Mutations
// =========================

export function useCreateTest() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: (
      data: TestCreateRequest
    ) => testsApi.create(data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey:
          queryKeys.tests.all,
      });
    },
  });
}

export function usePublishTest() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: (
      testId: ID
    ) => testsApi.publish(testId),

    onSuccess: (_, testId) => {
      queryClient.invalidateQueries({
        queryKey:
          queryKeys.tests.detail(
            testId
          ),
      });

      queryClient.invalidateQueries({
        queryKey:
          queryKeys.tests.all,
      });
    },
  });
}

export function useDeleteTest() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: (
      testId: ID
    ) => testsApi.delete(testId),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey:
          queryKeys.tests.all,
      });
    },
  });
}
