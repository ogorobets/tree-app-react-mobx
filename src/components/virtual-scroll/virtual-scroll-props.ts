import React from "react";

export default interface IVirtualScrollProps {
  className: string;
  offset?: number;
  minItemHeight: number;
  totalLength: number;
  length?: number;
  buffer?: number;
  forwardRef?: React.ForwardedRef<HTMLDivElement>;
  renderItem: React.FC<any>;
  onScroll?: (event: React.UIEvent) => void;
}
