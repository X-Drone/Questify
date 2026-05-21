export const queryKeys = {
  tests: {
    all: ["tests"] as const,

    published: (
      limit?: number,
      offset?: number
    ) =>
      [
        ...queryKeys.tests.all,
        "published",
        limit,
        offset,
      ] as const,

    my: () =>
      [
        ...queryKeys.tests.all,
        "my",
      ] as const,

    detail: (testId: number) =>
      [
        ...queryKeys.tests.all,
        "detail",
        testId,
      ] as const,
  },

  attempts: {
    all: ["attempts"] as const,

    history: (
      limit?: number,
      offset?: number
    ) =>
      [
        ...queryKeys.attempts.all,
        "history",
        limit,
        offset,
      ] as const,

    detail: (attemptId: number) =>
      [
        ...queryKeys.attempts.all,
        "detail",
        attemptId,
      ] as const,
  },
};
