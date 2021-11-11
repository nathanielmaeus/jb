import React, {
  FC,
  memo,
  ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { Message } from "../../../../../../types";
import { ResizeEventProps } from "../Message/Message";
import Virtual, { Config } from "./helpers/virtual";
import styles from "./styles.scss";

function throttle(callee: (...v: unknown[]) => void, timeout: number) {
  let timer: number | null = null;

  return (...args: unknown[]) => {
    if (timer) return;

    timer = window.setTimeout(() => {
      callee(...args);

      timer && clearTimeout(timer);
      timer = null;
    }, timeout);
  };
}

export function usePrevious<T>(state: T): T | undefined {
  const ref = useRef<T>();

  useEffect(() => {
    ref.current = state;
  });

  return ref.current;
}

type Range = {
  start: number;
  end: number;
  padFront: number;
  padBehind: number;
};
type HandleResizeCallback = (v: ResizeEventProps) => void;
type VirtualListProps = {
  items: Message[];
  nextItems: Message[];
  renderItem: (item: Message, onResize: HandleResizeCallback) => ReactNode;
  onGetNewItems: () => void;
};

const VIRTUAL_LIST_PARAMS: Config = {
  keeps: 45,
  estimateSize: 150,
  buffer: 25,
  uniqueIds: [],
};
const bottomStyles = { width: "100%", height: "0px" };

const VirtualList: FC<VirtualListProps> = ({
  items,
  nextItems,
  onGetNewItems,
  renderItem,
}) => {
  const [range, setRange] = useState<Range>({} as Range);

  const rootScrollElementRef = useRef<HTMLDivElement | null>(null);
  const bottomElementRef = useRef<HTMLDivElement | null>(null);

  const virtual = useRef<Virtual | null>(null);
  const isLoading = useRef<boolean>(false);

  const prevItems = usePrevious<typeof items>(items);

  useEffect(() => {
    virtual.current = new Virtual(VIRTUAL_LIST_PARAMS, setRange);
    setRange(virtual.current.getRange());
  }, []);

  useEffect(() => {
    if (!virtual.current) return;

    const scrollToBottom = () => {
      if (!bottomElementRef.current || !rootScrollElementRef.current) {
        return;
      }

      const { current: scrollableElement } = rootScrollElementRef;
      scrollableElement.scrollTop = bottomElementRef.current.offsetTop;

      setTimeout(() => {
        if (!rootScrollElementRef.current) {
          return;
        }

        if (
          scrollableElement.scrollTop + scrollableElement.clientHeight <
          scrollableElement.scrollHeight
        ) {
          scrollToBottom();
        }
      }, 0);
    };

    const calculateOffset = () => {
      return nextItems.reduce((acc, message) => {
        if (!virtual.current) return acc;

        const itemHeight =
          virtual.current.heights.get(message.id) ||
          virtual.current.averageHeight;
        return acc + itemHeight;
      }, 0);
    };

    const updateCurrentOffset = () => {
      if (!rootScrollElementRef.current) {
        return;
      }
      rootScrollElementRef.current.scrollTop = calculateOffset();
    };

    virtual.current.onUpdateIds(items.map((m) => m.id));

    requestAnimationFrame(() => {
      if (!virtual.current) return;

      virtual.current.onUpdateData();
      updateCurrentOffset();

      if (prevItems?.length === 0) {
        scrollToBottom();
      }
      isLoading.current = false;
    });
  }, [items, nextItems, prevItems]);

  const loadNewItems = useCallback(() => {
    if (rootScrollElementRef.current?.scrollTop === 0) {
      isLoading.current = true;
      onGetNewItems();
    }
  }, [onGetNewItems]);

  const recalculateOffset = useCallback(() => {
    if (!virtual.current) return;

    const { heights, averageHeight, offsets } = virtual.current;

    items.reduce((offsetAcc, item) => {
      offsetAcc += heights.get(item.id) || averageHeight;
      offsets.set(item.id, offsetAcc);
      return offsetAcc;
    }, 0);
  }, [items]);

  const handleResize = useCallback(
    (data: ResizeEventProps) => {
      if (!virtual.current) return;

      virtual.current.onSaveHeight(data.id, data.offsetHeight);
      if (!virtual.current.heights.get(data.id)) {
        recalculateOffset();
      }
    },
    [recalculateOffset],
  );

  const handleScroll = useCallback(() => {
    if (
      !rootScrollElementRef.current ||
      isLoading.current ||
      !virtual.current
    ) {
      return;
    }

    loadNewItems();
    virtual.current.onScroll(rootScrollElementRef.current.scrollTop);
  }, [loadNewItems]);

  const { start = 0, end = 0, padBehind = 0, padFront = 0 } = range;

  const renderItems = useCallback(() => {
    return items
      .slice(start, end + 1)
      .map((item) => renderItem(item, handleResize));
  }, [items, start, end, renderItem, handleResize]);

  return (
    <div
      ref={rootScrollElementRef}
      className={styles.root}
      onScroll={throttle(handleScroll, 100)}
    >
      <div style={{ padding: `${padFront}px 0px ${padBehind}px` }}>
        {renderItems()}
      </div>
      <div ref={bottomElementRef} style={bottomStyles} />
    </div>
  );
};

export default memo(VirtualList);
