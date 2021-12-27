import qs from "query-string";
import { Message, GetMessagesParamsApi } from "../../../types";

const URL = process.env.API_URL;

const getUrl = (endpoint: string, params?: Record<string, unknown>) => {
  const query = params ? qs.stringify(params) : "";
  return `${URL}/.netlify/functions/${endpoint}${query ? `?${query}` : ""}`;
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
