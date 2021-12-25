import React, { useCallback, useEffect } from "react";
import { useStore } from "@nanostores/react";
import {
  $initialSize,
  $messages,
  $nextMessages,
  $status,
  getMessages,
  getMessagesFromScratchDebounced,
  Status,
} from "~/services";
import { VirtualList } from "./components/VirtualList";
import { Message } from "./components/Message";

import styles from "./styles.scss";

const Messages = () => {
  const messages = useStore($messages);
  const nextMessages = useStore($nextMessages);
  const status = useStore($status);
  const initialSize = useStore($initialSize);

  useEffect(() => {
    getMessagesFromScratchDebounced(50);
  }, []);

  const renderItem = useCallback((message, onResize) => {
    return <Message key={message.id} message={message} onResize={onResize} />;
  }, []);

  return (
    <>
      <div className={styles.loader}>
        {status === Status.loading && "Loading..."}
      </div>
      <VirtualList
        onGetNewItems={getMessages}
        items={messages}
        nextItems={nextMessages}
        renderItem={renderItem}
        initialSize={initialSize}
      />
    </>
  );
};

export default Messages;
