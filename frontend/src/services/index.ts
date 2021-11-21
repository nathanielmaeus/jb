import { action, atom } from "nanostores";
import { Message } from "../../../types";
import { getMessagesApi } from "./api";
import { debounce } from "~/helpers";

export enum Status {
  initial = "initial",
  loading = "loading",
  loaded = "loaded",
  failed = "failed",
}

export const $messages = atom<Message[]>([]);
export const $nextMessages = atom<Message[]>([]);
export const $nextId = atom<number | null>(null);
export const $status = atom<Status>(Status.initial);
export const $initialSize = atom<number>(0);

export const getMessages = action(
  $messages,
  "getMessages",
  async ($messages, size = 20) => {
    if (
      $status.get() === Status.loading ||
      ($nextId.get() === null && $messages.get().length !== 0)
    ) {
      return;
    }

    $status.set(Status.loading);
    try {
      const { posts: newMessages, next } = await getMessagesApi({
        lastMessageId: $nextId.get(),
        size,
      });

      $status.set(Status.loaded);
      $nextId.set(next);

      $nextMessages.set(newMessages);
      $messages.set(newMessages.concat($messages.get()));
    } catch (e) {
      $status.set(Status.failed);
    }
  },
);

const getMessagesFromScratch = action(
  $messages,
  "getMessagesFromScratch",
  async ($messages, size = 20) => {
    if (
      $status.get() === Status.loading ||
      ($nextId.get() === null && $messages.get().length !== 0)
    ) {
      return;
    }

    $status.set(Status.loading);
    try {
      const { posts: newMessages, next } = await getMessagesApi({
        lastMessageId: null,
        size,
      });

      $status.set(Status.loaded);
      $nextId.set(next);
      $nextMessages.set(newMessages);
      $initialSize.set(size);
      $messages.set(newMessages);
    } catch (e) {
      console.error(e);
      $status.set(Status.failed);
    }
  },
);

export const getMessagesFromScratchDebounced = debounce(
  getMessagesFromScratch,
  300,
);
