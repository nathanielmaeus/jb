import React, { useCallback, useEffect, useState } from "react";
import { useStore } from "@nanostores/react";
import {
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

  const [size, setSize] = useState(10);

  useEffect(() => {
    getMessagesFromScratchDebounced(size);
  }, [size]);

  const renderItem = useCallback((message, onResize) => {
    return <Message key={message.id} message={message} onResize={onResize} />;
  }, []);

  return (
    <div>
      <span>Items</span>
      <input
        className={styles.input}
        type="number"
        min={15}
        value={size}
        onChange={(e) => setSize(+e.target.value)}
      />
      <div className={styles.loader}>
        {status === Status.loading && "Loading..."}
      </div>
      <VirtualList
        onGetNewItems={getMessages}
        items={messages}
        nextItems={nextMessages}
        renderItem={renderItem}
      />
    </div>
  );
};

export default Messages;
