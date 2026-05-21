import { request } from "./request";

import type {
  ID,
  TestCreateRequest,
  TestDetailResponse,
  TestListResponse,
} from "./types";

export const testsApi = {
  create: (data: TestCreateRequest) =>
    request<void>({
      method: "POST",
      url: "/tests/create",
      data,
    }),

  publish: (testId: ID) =>
    request<void>({
      method: "POST",
      url: `/tests/${testId}/publish`,
    }),

  delete: (testId: ID) =>
    request<void>({
      method: "DELETE",
      url: `/tests/${testId}`,
    }),

  getDetail: (testId: ID) =>
    request<TestDetailResponse>({
      method: "GET",
      url: `/tests/${testId}`,
    }),

  getMyTests: () =>
    request<TestListResponse[]>({
      method: "GET",
      url: "/tests/creator/my-tests",
    }),

  getPublished: (params?: {
    limit?: number;
    offset?: number;
  }) =>
    request<TestListResponse[]>({
      method: "GET",
      url: "/tests/published",
      params,
    }),
};
