import { action, makeObservable, observable } from "mobx";
import ITree from "../types/tree";
import AppStore from "./app";
import removeSubtreeUtil from "../utils/removeSubtree";
import moveSubtreeRootElemUtil from "../utils/moveSubtreeRootElem";
export default class TreeStore {
  data: ITree | null = null;

  constructor(private store: AppStore) {
    makeObservable(this, {
      data: observable,
      set: action.bound,
      removeSubtree: action.bound,
      moveSubtreeRootElem: action.bound,
    });
  }

  set(data: ITree) {
    this.data = data;
  }

  removeSubtree(rootElemId: number) {
    if (this.data) {
      removeSubtreeUtil(rootElemId, this.data);
    }
  }

  moveSubtreeRootElem(dragId: number, hoverId: number) {
    if (this.data) {
      moveSubtreeRootElemUtil(dragId, hoverId, this.data);
    }
  }
}
