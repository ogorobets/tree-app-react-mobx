import { observer } from "mobx-react";
import ITree from "../types/tree";
import ITreeElement from "../types/tree-element";

const TreeControls: React.FC<{
  tree: ITree | null;
  currElem: ITreeElement | null;
  onRemoveSubtree: () => void;
  onRefresh: () => void;
}> = observer(({ tree, currElem, onRemoveSubtree, onRefresh }) => {
  const applyTree = () => {
    const currTree: ITree = JSON.parse(JSON.stringify(tree));
    delete currTree.entityLabelPages[0].levels;
    console.log(JSON.stringify(currTree, undefined, 2));
  };

  return (
    <div className="flex justify-end">
      <button className="btn-primary mr-5" onClick={applyTree}>
        Apply
      </button>
      <button className="btn-primary mr-5" onClick={onRefresh}>
        Refresh
      </button>
      <button className="btn-primary" onClick={onRemoveSubtree}>
        Remove
      </button>
    </div>
  );
});

export default TreeControls;
