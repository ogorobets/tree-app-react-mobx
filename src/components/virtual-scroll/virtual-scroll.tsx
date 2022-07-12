import React, { MutableRefObject } from "react";
import { isInView } from "./utils";
import IVirtualScrollProps from "./virtual-scroll-props";
import IVirtualScrollState from "./virtual-scroll-state";

class VirtualScroll extends React.Component<
  IVirtualScrollProps,
  IVirtualScrollState
> {
  private lastScrollTop: number;
  private listRef: HTMLDivElement | null;

  constructor(props: IVirtualScrollProps) {
    super(props);

    this.state = {
      offset: props.offset || 0,
      init: false,
    };

    this.lastScrollTop = 0;
    this.listRef = null;
  }

  static defaultProps = {
    buffer: 10,
    length: 40,
    offset: 0,
  };

  componentDidMount() {
    window.requestAnimationFrame(() => {
      if (this.listRef) {
        const { minItemHeight } = this.props;
        this.listRef.scrollTop = this.state.offset * minItemHeight;
      }
    });
  }

  componentDidUpdate(
    _prevProps: IVirtualScrollProps,
    prevState: IVirtualScrollState
  ) {
    if (prevState.offset > this.state.offset) {
      this.updateOffset(prevState);
    }
  }

  updateOffset(prevState: IVirtualScrollState) {
    const offsetDiff = prevState.offset - this.state.offset;
    if (this.listRef) {
      const el = this.listRef;
      const items = el.querySelectorAll(".VS-item");

      let currOffset = prevState.offset;
      const start = Math.min(this.state.offset, this.props.buffer || 0);
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

      this.setState({
        offset: currOffset,
      });
    }
  }

  onScrollHandler(event: React.UIEvent<HTMLDivElement>) {
    if (this.listRef) {
      const { totalLength, length = 0, buffer = 0 } = this.props;

      const { offset } = this.state;

      const el = this.listRef;
      const { scrollTop } = el;
      const direction = Math.floor(scrollTop - this.lastScrollTop);

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
            const offsetToBeAdded = Math.floor(
              heightLeft / this.props.minItemHeight
            );
            newOffset += offsetToBeAdded;
            heightAdded += offsetToBeAdded * this.props.minItemHeight;
          }

          this.setState({
            offset: Math.min(newOffset, totalLength - length),
          });
        }
      } else {
        const scrollDiff =
          items[start].getBoundingClientRect().y - el.getBoundingClientRect().y;
        if (scrollDiff > 0) {
          const offsetDiff =
            Math.floor(scrollDiff / this.props.minItemHeight) || 1;
          const newOffset = offset - offsetDiff;
          this.setState({
            offset: Math.max(0, newOffset),
          });
        }
      }

      this.lastScrollTop = scrollTop;
    }

    if (this.props.onScroll) this.props.onScroll(event);
  }

  renderItems(start: number, end: number) {
    const { renderItem } = this.props;

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
  }

  render() {
    const {
      totalLength,
      length = 0,
      buffer = 0,
      offset: _offset,
      minItemHeight,
      renderItem,
      forwardRef,
      ...rest
    } = this.props;

    const { init, offset } = this.state;

    const start = Math.max(0, offset - buffer);
    const end = Math.min(offset + (length + buffer) - 1, totalLength - 1);

    const topPadding = Math.max(0, start * minItemHeight);
    const bottomPadding = Math.max(0, (totalLength - end - 1) * minItemHeight);

    return (
      <div
        {...rest}
        ref={(el) => {
          this.listRef = el;
          if (forwardRef)
            (forwardRef as MutableRefObject<HTMLDivElement>).current = el!;
          if (!init) this.setState({ init: true });
        }}
        onScroll={this.onScrollHandler.bind(this)}
      >
        {init && (
          <>
            <div
              style={{
                flexShrink: 0,
                height: topPadding,
              }}
            />
            {this.renderItems(start, end)}
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
  }
}

export default React.forwardRef(
  (props: IVirtualScrollProps, ref: React.ForwardedRef<HTMLDivElement>) => (
    <VirtualScroll forwardRef={ref} {...props} />
  )
);
