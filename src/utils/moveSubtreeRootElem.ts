import IEntityLabelPage from "../types/entity-label-page";
import ITree from "../types/tree";
import setLevels from "./setLevels";

export default function moveSubtreeRootElem(
  dragId: number,
  hoverId: number,
  data: ITree
) {
  const tree: IEntityLabelPage = data.entityLabelPages[0];

  const { labels, entityLongIds, parentEntityLongIds } = tree;

  let hoverIndex = entityLongIds.indexOf(hoverId);
  const dragIndex = entityLongIds.indexOf(dragId);

  // Check if hover element doesn't have drag item in its parent
  // chain of element. And if so the just return;
  let currIndex = hoverIndex;
  while (parentEntityLongIds[currIndex] !== -1) {
    if (parentEntityLongIds[currIndex] === dragId) {
      return;
    }
    currIndex--;
  }

  parentEntityLongIds[dragIndex] = hoverId;
  const dragParentElemIds = [dragId];
  let amountDragElems = 1;

  parentEntityLongIds.forEach((currParentElemId, index) => {
    if (dragParentElemIds.includes(currParentElemId)) {
      const currElemId = entityLongIds[index];
      dragParentElemIds.push(currElemId);
      amountDragElems++;
    }
  });

  const labelsSubtree = labels.slice(dragIndex, dragIndex + amountDragElems);
  const entitySubtree = entityLongIds.slice(
    dragIndex,
    dragIndex + amountDragElems
  );
  const parentEntitySubtree = parentEntityLongIds.slice(
    dragIndex,
    dragIndex + amountDragElems
  );

  labels.splice(dragIndex, amountDragElems);
  entityLongIds.splice(dragIndex, amountDragElems);
  parentEntityLongIds.splice(dragIndex, amountDragElems);

  let amountHoverElems = 1;
  const hoverParentElemIds = [hoverId];
  parentEntityLongIds.forEach((currParentElemId, index) => {
    if (hoverParentElemIds.includes(currParentElemId)) {
      const currElemId = entityLongIds[index];
      hoverParentElemIds.push(currElemId);
      amountHoverElems++;
    }
  });

  hoverIndex = entityLongIds.indexOf(hoverId);
  const hoverIndexNext = hoverIndex + amountHoverElems;
  labels.splice(hoverIndexNext, 0, ...labelsSubtree);
  entityLongIds.splice(hoverIndexNext, 0, ...entitySubtree);
  parentEntityLongIds.splice(hoverIndexNext, 0, ...parentEntitySubtree);

  setLevels(data);
}
