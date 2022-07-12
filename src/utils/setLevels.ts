import ITree from "../types/tree";
import { ROOT_ELEMENT_ID } from "../constants/costants";

export default function setLevels({ entityLabelPages }: ITree) {
  let treeData = entityLabelPages[0];
  treeData!.levels = [];

  treeData.parentEntityLongIds.forEach((parentId, index) => {
    if (parentId === ROOT_ELEMENT_ID) {
      treeData!.levels![index] = 0;
    } else {
      const parentElIndex = treeData.entityLongIds.indexOf(parentId);
      const parentLevel = treeData!.levels![parentElIndex];
      treeData!.levels![index] = parentLevel + 1;
    }
  });
}
