import React, {
  MutableRefObject,
  useRef,
  useState,
  useEffect,
  useCallback,
} from "react";
import { isInView } from "./utils/is-in-view";
import { usePrevious } from "./utils/use-previous";
import IVirtualScrollProps from "./virtual-scroll-props";

const VirtualScroll = ({
  offset: initOffset = 0,
  buffer = 10,
  totalLength,
  length = 40,
  minItemHeight,
  renderItem,
  forwardRef,
  ...rest
}: IVirtualScrollProps) => {
  const lastScrollTop = useRef<number>(0);
  const listRef = useRef<HTMLDivElement | null>(null);
  const [offset, setOffset] = useState<number>(initOffset || 0);
  const prevOffset = usePrevious(offset);
  const [init, setInit] = useState<boolean>(false);
  const { onScroll } = rest;

  const updateOffset = useCallback(() => {
    const offsetDiff = prevOffset - offset;
    if (listRef.current) {
      const el = listRef.current;
      const items = el.querySelectorAll(".VS-item");

      let currOffset = prevOffset;
      const start = Math.min(offset, buffer || 0);
      const end = start + offsetDiff;
      for (let i = Math.min(items.length, end) - 1; i >= start; i--) {
        const inView = isInView(el, items[i] as HTMLElement);
        if (inView) {
          currOffset--;
        } else {
          break;
        }
      }

      if (items.length < end) {
        const diff = end - items.length;
        currOffset -= diff;
      }

      setOffset(currOffset);
    }
  }, [buffer, offset, prevOffset]);

  const onScrollHandler = (event: React.UIEvent<HTMLDivElement>) => {
    if (listRef.current) {
      const el = listRef.current;
      const { scrollTop } = el;
      const direction = Math.floor(scrollTop - (lastScrollTop.current || 0));

      if (direction === 0) return;

      const items = el.querySelectorAll(".VS-item");
      let newOffset = offset;
      const start = Math.min(offset, buffer);
      if (direction > 0) {
        if (offset < totalLength - length) {
          let heightAdded = 0;
          for (let i = start; i < items.length; i++) {
            const inView = isInView(el, items[i] as HTMLElement);
            const rowHeight = items[i].clientHeight;
            if (!inView) {
              heightAdded += rowHeight;
              newOffset++;
            } else {
              break;
            }
          }
          if (heightAdded < direction) {
            const heightLeft = direction - heightAdded;
            const offsetToBeAdded = Math.floor(heightLeft / minItemHeight);
            newOffset += offsetToBeAdded;
            heightAdded += offsetToBeAdded * minItemHeight;
          }

          setOffset(Math.min(newOffset, totalLength - length));
        }
      } else {
        const scrollDiff =
          items[start].getBoundingClientRect().y - el.getBoundingClientRect().y;
        if (scrollDiff > 0) {
          const offsetDiff = Math.floor(scrollDiff / minItemHeight) || 1;
          const newOffset = offset - offsetDiff;
          setOffset(Math.max(0, newOffset));
        }
      }

      lastScrollTop.current = scrollTop;
    }

    if (onScroll) onScroll(event);
  };

  const renderItems = (start: number, end: number) => {
    return Array.from({ length: end - start + 1 }, (_, index) => {
      const rowIndex = start + index;
      const component: React.ReactElement<any, any> = renderItem(
        rowIndex
      ) as React.ReactElement<any, any>;
      return React.cloneElement(component, {
        ...component.props,
        className: ["VS-item", component.props.className].join(" ").trim(),
      });
    });
  };

  useEffect(() => {
    if (prevOffset > offset) {
      updateOffset();
    }
  }, [prevOffset, offset, updateOffset]);

  useEffect(() => {
    window.requestAnimationFrame(() => {
      if (listRef.current) {
        listRef.current.scrollTop = offset * minItemHeight;
      }
    });
  }, []);

  const start = Math.max(0, offset - buffer);
  const end = Math.min(offset + (length + buffer) - 1, totalLength - 1);

  const topPadding = Math.max(0, start * minItemHeight);
  const bottomPadding = Math.max(0, (totalLength - end - 1) * minItemHeight);

  return (
    <div
      {...rest}
      ref={(el) => {
        listRef.current = el;
        if (forwardRef)
          (forwardRef as MutableRefObject<HTMLDivElement>).current = el!;
        if (!init) setInit(true);
      }}
      onScroll={onScrollHandler.bind(this)}
    >
      {init && (
        <>
          <div
            style={{
              flexShrink: 0,
              height: topPadding,
            }}
          />
          {renderItems(start, end)}
          <div
            style={{
              flexShrink: 0,
              height: bottomPadding,
            }}
          />
        </>
      )}
    </div>
  );
};

export default React.forwardRef(
  (props: IVirtualScrollProps, ref: React.ForwardedRef<HTMLDivElement>) => (
    <VirtualScroll forwardRef={ref} {...props} />
  )
);
