import { Message, GetMessagesParamsApi } from "../../types";
import * as faker from "faker";

function generateMessages(count: number, lastMessageId: number): Message[] {
  let index = lastMessageId;
  return new Array(count)
    .fill(0)
    .map(() => {
      return {
        id: `${index++}`,
        content: `${faker.lorem.sentences(
          Math.floor(Math.random() * 20),
        )} by ${index}`,
        author: faker.name.firstName() + " " + faker.name.lastName(),
        date: new Date().toISOString(),
        avatarUrl: faker.image.avatar(),
      };
    })
    .reverse();
}

const MAX_COUNT = 1000000;

export function getMessages({
  lastMessageId,
  size,
}: GetMessagesParamsApi): Promise<{ posts: Message[]; next: number | null }> {
  const lastId = lastMessageId || 0;
  const isFinished = lastId >= MAX_COUNT;

  const next = isFinished ? null : lastId + size;
  const posts = generateMessages(size, lastId);

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ posts, next });
    }, 300);
  });
}
