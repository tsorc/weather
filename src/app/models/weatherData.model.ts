import {listDataModel} from "./listData.model";

export interface weatherDataModel {
  city: string[];
  cnt: number;
  cod: string;
  list: listDataModel[];
  message: 0;
}
