import { FC, memo, useCallback, useEffect, useRef } from "react";
import { Message } from "../../../../../../types";

import styles from "./styles.scss";

type MessagesProps = {
  message: Message;
  onResize: (v: ResizeEventProps) => void;
};

export type ResizeEventProps = {
  offsetHeight: number;
  id: string;
};

const Message: FC<MessagesProps> = ({ message, onResize }) => {
  const resizeObserver = useRef<ResizeObserver | null>(null);
  const ref = useRef<HTMLDivElement | null>(null);

  const onSizeChange = useCallback(() => {
    if (!ref.current || !ref.current.offsetHeight) return;

    onResize({
      offsetHeight: ref.current.offsetHeight,
      id: message.id,
    });
  }, [message.id, onResize]);

  useEffect(() => {
    if (!ref.current) {
      return;
    }

    onSizeChange();
    resizeObserver.current = new ResizeObserver(onSizeChange);
    resizeObserver.current.observe(ref.current);

    return () => {
      resizeObserver.current?.disconnect();
      resizeObserver.current = null;
    };
  }, [onSizeChange]);

  return (
    <div className={styles.root} ref={ref} key={message.id}>
      <div
        className={styles.avatar}
        style={{ backgroundImage: `url(${message.avatarUrl})` }}
      />
      <div className={styles.message}>
        <div className={styles.author}>{message.author}</div>
        <div className={styles.content}>{message.content}</div>
      </div>
    </div>
  );
};

export default memo(Message);
