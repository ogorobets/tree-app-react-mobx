import axios from "axios";
import AppStore from "../stores/app";
import TreeApi from "./tree";

export default class AppApi {
  client = axios;

  tree: TreeApi;

  constructor(store: AppStore) {
    this.tree = new TreeApi(this, store);
  }
}
