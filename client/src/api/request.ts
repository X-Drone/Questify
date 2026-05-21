import type { AxiosRequestConfig } from "axios";
import { api } from "./axios";
import { handleApiError } from "./errors";

export async function request<T>(
  config: AxiosRequestConfig
): Promise<T> {
  try {
    const response = await api.request<T>(config);

    return response.data;
  } catch (error) {
    handleApiError(error);
  }
}
