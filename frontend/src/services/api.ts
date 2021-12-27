import qs from "query-string";
import { Message, GetMessagesParamsApi } from "../../../types";

const API_ENV_URL = process.env.API_ENV_URL;

const getUrl = (endpoint: string, params?: Record<string, unknown>) => {
  const query = params ? qs.stringify(params) : "";
  return `${API_ENV_URL}/.netlify/functions/${endpoint}${
    query ? `?${query}` : ""
  }`;
};

export async function getMessagesApi({
  lastMessageId,
  size,
}: GetMessagesParamsApi) {
  const response = await fetch(getUrl("messages", { lastMessageId, size }), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const data: { posts: Message[]; next: number | null } = await response.json();

  return data;
}
