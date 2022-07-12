import { useRef } from "react";
import styled from "styled-components";
import classNames from "classnames";
import {
  useDrag,
  useDrop,
  DragSourceMonitor,
  DropTargetMonitor,
} from "react-dnd";
import { observer } from "mobx-react";
import IDragObject from "./types/drag-object";
import { DND_ITEM_TYPE } from "../../constants/costants";
import ITreeElementProps from "./types/tree-element-props";

const TreeElementBlock = styled.div<{ level: number }>`
  width: ${(props) => `calc(100% - ${props.level * 3}%)`};
  min-width: 10%;
  margin-left: ${(props) => `${props.level * 3 <= 90 ? props.level * 3 : 90}%`};
  min-height: 40px;

  &:nth-last-child(2) {
    margin-bottom: 0;
  }
`;

const TreeElement: React.FC<ITreeElementProps> = observer(
  ({
    className = "",
    element,
    active,
    index,
    onClick,
    moveSubtreeRootElem,
  }) => {
    const { level = 0 } = element;
    const dragDropRef = useRef() as React.MutableRefObject<HTMLDivElement>;

    const [, drop] = useDrop<IDragObject, any, any>({
      accept: DND_ITEM_TYPE,
      hover: (item: IDragObject, monitor: DropTargetMonitor) => {
        if (!dragDropRef.current) {
          return;
        }
        const dragIndex = item.index;
        const hoverIndex = index;
        const dragId = item.id;
        const hoverId = element.id;
        // Don't replace items with themselves
        if (dragId === hoverId) {
          return;
        }

        // Determine rectangle on screen
        const hoverBoundingRect = dragDropRef.current.getBoundingClientRect();
        // Get vertical middle
        const hoverMiddleY =
          (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
        // Determine mouse position
        const clientOffset = monitor.getClientOffset();

        if (!clientOffset) {
          return;
        }

        // Get pixels to the top
        const hoverClientY = clientOffset!.y - hoverBoundingRect.top;
        // Only perform the move when the mouse has crossed half of the items height
        // When dragging downwards, only move when the cursor is below 50%
        // When dragging upwards, only move when the cursor is above 50%
        // Dragging downwards
        if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
          return;
        }
        // Dragging upwards
        if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
          return;
        }
        // Time to actually perform the action
        moveSubtreeRootElem(item.id, element.id);
        // Note: we're mutating the monitor item here!
        // Generally it's better to avoid mutations,
        // but it's good here for the sake of performance
        // to avoid expensive index searches.
        //item.index = hoverIndex;
      },
    });

    const [{ isDragging }, drag, preview] = useDrag<IDragObject, any, any>({
      item: { id: element.id, parentId: element.parentId, index },
      type: DND_ITEM_TYPE,
      collect: (monitor: DragSourceMonitor) => ({
        isDragging: monitor.isDragging(),
      }),
    });

    const opacity = isDragging ? 0 : 1;

    preview(drop(drag(dragDropRef)));

    const resClassName = classNames({
      "flex items-center mb-2 pl-3 border-solid border-2 border-black cursor-pointer":
        true,
      "outline outline-offset-2 outline-1 outline-blue-500": active,
      [className]: !!className,
    });

    return (
      <TreeElementBlock
        ref={dragDropRef}
        style={{ opacity }}
        level={level}
        onClick={() => onClick(element)}
        className={resClassName}
      >
        {element.label}
      </TreeElementBlock>
    );
  }
);

export default TreeElement;
