import ITreeElement from "../../../types/tree-element";

export default interface ITreeElementProps {
  className?: string;
  element: ITreeElement;
  active: boolean;
  index: number;
  onClick: (element: ITreeElement) => void;
  moveSubtreeRootElem: (dragId: number, hoverId: number) => void;
}
