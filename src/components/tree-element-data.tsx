import { observer } from "mobx-react";
import ITreeElement from "../types/tree-element";

const TreeElementData: React.FC<{ element: ITreeElement }> = observer(
  ({ element }) => {
    return (
      <ul className="text-2xl">
        <li>Label: {element.label}</li>
        <li>Id: {element.id}</li>
        <li>ParentId: {element.parentId}</li>
      </ul>
    );
  }
);

export default TreeElementData;
