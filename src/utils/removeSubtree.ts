import IEntityLabelPage from "../types/entity-label-page";
import ITree from "../types/tree";

export default function removeSubtree(rootElemId: number, data: ITree) {
  const tree: IEntityLabelPage = data.entityLabelPages[0];

  const index = tree.entityLongIds.indexOf(rootElemId);
  const { labels, entityLongIds, parentEntityLongIds, levels } = tree;
  const parentElemIds = [rootElemId];
  let amountElems = 1;

  parentEntityLongIds.forEach((currParentElemId, index) => {
    if (parentElemIds.includes(currParentElemId)) {
      const currElemId = entityLongIds[index];
      parentElemIds.push(currElemId);
      amountElems++;
    }
  });

  labels.splice(index, amountElems);
  entityLongIds.splice(index, amountElems);
  parentEntityLongIds.splice(index, amountElems);
  levels?.splice(index, amountElems);
}
