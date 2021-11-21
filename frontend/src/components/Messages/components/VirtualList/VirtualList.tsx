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
import { debounce } from "~/helpers";
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
  initialSize: number;
};

const VIRTUAL_LIST_PARAMS: Config = {
  keeps: 45,
  estimatedSize: 115,
  buffer: 25,
  uniqueIds: [],
};

const VirtualList: FC<VirtualListProps> = ({
  items,
  nextItems,
  onGetNewItems,
  renderItem,
  initialSize,
}) => {
  const [range, setRange] = useState<Range>({} as Range);

  const rootScrollElementRef = useRef<HTMLDivElement | null>(null);
  const virtual = useRef<Virtual | null>(null);
  const isLoading = useRef<boolean>(false);

  useEffect(() => {
    virtual.current = new Virtual(VIRTUAL_LIST_PARAMS, setRange);
    setRange(virtual.current.getRange());
  }, [initialSize]);

  useEffect(() => {
    if (!virtual.current) return;

    const ids = items.map((m) => m.id);
    virtual.current.onUpdateIds(ids);

    requestAnimationFrame(() => {
      if (!virtual.current || !rootScrollElementRef.current) {
        return;
      }

      virtual.current.onUpdateRange();
      const currentOffset = virtual.current.onGetShiftedOffset(nextItems);
      rootScrollElementRef.current.scrollTop = currentOffset;

      isLoading.current = false;
    });
  }, [items, nextItems]);

  const loadNewItems = useCallback(() => {
    if (rootScrollElementRef.current?.scrollTop === 0) {
      isLoading.current = true;
      onGetNewItems();
    }
  }, [onGetNewItems]);

  const debouncedRecalculateOffset = useRef(
    debounce((ref: Virtual) => {
      ref.onRecalculateOffset();
    }, 50),
  );

  const handleResize = useCallback((data: ResizeEventProps) => {
    if (!virtual.current || virtual.current.heights.has(data.id)) {
      return;
    }

    virtual.current.onSaveHeight(data.id, data.offsetHeight);
    debouncedRecalculateOffset.current(virtual.current);
  }, []);

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
    </div>
  );
};

export default memo(VirtualList);
