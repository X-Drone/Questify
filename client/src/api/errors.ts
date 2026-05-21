import axios from "axios";
import type { ApiErrorResponse } from "./types";

export class ApiError extends Error {
  status?: number;
  data?: ApiErrorResponse;

  constructor(
    message: string,
    status?: number,
    data?: ApiErrorResponse
  ) {
    super(message);

    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

export function handleApiError(error: unknown): never {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    throw new ApiError(
      error.response?.data?.detail ||
        error.message ||
        "API Error",
      error.response?.status,
      error.response?.data
    );
  }

  throw new ApiError("Unknown error");
}
