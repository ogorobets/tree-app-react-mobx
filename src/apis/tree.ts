import { AxiosResponse } from "axios";
import AppStore from "../stores/app";
import ITree from "../types/tree";
import ITreeWrapper from "../types/tree-wrapper";
import setLevels from "../utils/setLevels";
import AppApi from "./app";

export default class TreeApi {
  constructor(private api: AppApi, private store: AppStore) {}

  async getTree() {
    const res: AxiosResponse<ITreeWrapper> = await this.api.client.get(
      `https://api.github.com/gists/e1702c1ef26cddd006da989aa47d4f62`
    );
    const data: ITree = JSON.parse(res.data.files["view.json"].content);
    setLevels(data);
    this.store.tree.set(data);
  }
}
