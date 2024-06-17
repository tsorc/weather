import {weatherInfoModel} from "./weatherInfo.model";

export interface listDataModel {
  clouds: string[];
  dt: string;
  dt_txt: string;
  date: string;
  main: {
    temp: string;
    temp_min: string;
    temp_max: string;
  };
  pop: number;
  sys: string[];
  visibility: number;
  weather: weatherInfoModel[];
  wind: string[];
}
