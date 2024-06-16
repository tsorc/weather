import {Injectable} from '@angular/core';
import {BehaviorSubject, map, Observable, Subscription, tap} from "rxjs";
import {weatherDataModel} from "../models/weatherData.model";
import { HttpClient } from "@angular/common/http";
import {weatherModel} from "../models/weather.model";
import {listDataModel} from "../models/listData.model";
import {resultDataModel} from "../models/resultData.model";
import {reportNowModel} from "../models/reportNow.model";
import {reportFiveDaysModel} from "../models/reportFiveDays.model";
import {dataModel} from "../models/data.model";

@Injectable({
  providedIn: 'root'
})
export class IndexService {
  weatherData = new BehaviorSubject<weatherDataModel[]>([]);
  listData = new BehaviorSubject<listDataModel[]>([]);
  weatherDataSub = new Subscription();
  appId = 'db010d505fd0e52023ed41ae1e81da11';
  reportNow: reportNowModel = {
    description: '',
    min: 0,
    max: 0
  };
  reportFiveDays: reportFiveDaysModel[] = [{
    date: '',
    data: []
  }];
  dateList: string[] = [];

  constructor(
    private http: HttpClient,
  ) { }

  prepareWeatherData() {
    // By zip code: https://api.openweathermap.org/data/2.5/forecast?zip=2000,si&appid=
    const openWeatherMapUrl = 'https://api.openweathermap.org/data/2.5/forecast?q=maribor&appid=' + this.appId;
    this.weatherDataSub = this.http.get<weatherModel>(openWeatherMapUrl)
      .pipe(
        map(val => {
          val.list.map((data, index) => {
            let dateTime = data.dt_txt.split(' ');
            let date = dateTime[0];
            data.date = date;
            return data;
          })
          return val;
        })
      )
      .subscribe((response) => {
        console.error('prepareWeatherData')
        console.error(response.list)
        this.listData.next(response.list);
      });
  }

  getReportNow(data: listDataModel[]) {
    if (data[0]) {
      this.reportNow.description = data[0].weather[0].description;
      this.reportNow.min = this.convertKelvinToDegrees(data[0].main.temp_min);
      this.reportNow.max = this.convertKelvinToDegrees(data[0].main.temp_max);
    }

    return this.reportNow;
  }

  getReportFiveDays(data: listDataModel[]) {
    this.reportFiveDays.map((dataInfo, k)=> {
      dataInfo.data = [];
      return dataInfo;
    });

    console.log('reportFiveDays - clean');
    console.log(this.reportFiveDays);

    data.map((data, i) => {
      let dateTime = data.dt_txt.split(' ');
      let date = dateTime[0];
      let time = dateTime[1];

      this.reportFiveDays.map(dataInfo=> {
        if (!this.dateList.includes(date)) {
          let dateInfo = {
            date: date,
            data: []
          };

          this.dateList.push(date);
          this.reportFiveDays.push(dateInfo);
        }
      });

      this.reportFiveDays.map((dataReport, j) => {
        if (date === dataReport.date) {
          let reportInfo = {
            time: time,
            temp: this.convertKelvinToDegrees(data.main.temp),
            description: data.weather[0].description
          };

          this.reportFiveDays[j].data.push(reportInfo);
        }
      });
    })

    console.log('report');
    console.log(this.reportFiveDays);

    return this.reportFiveDays;
  }

  convertKelvinToDegrees(kelvin: string) {
    return Math.round(Number(-273.15 + kelvin));
  }

  getWeatherData(): Observable<listDataModel[]> {
    return this.listData.asObservable();
  }

  ngOnDestroy() {
    this.weatherDataSub.unsubscribe();
  }
}
