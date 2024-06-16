import {Injectable} from '@angular/core';
import {BehaviorSubject, map, Observable, Subscription, tap} from "rxjs";
import {weatherDataModel} from "../models/weatherData.model";
import {HttpClient} from "@angular/common/http";
import {weatherModel} from "../models/weather.model";
import {listDataModel} from "../models/listData.model";
import {resultDataModel} from "../models/resultData.model";
import {reportNowModel} from "../models/reportNow.model";

@Injectable({
  providedIn: 'root'
})
export class IndexService {
  weatherData = new BehaviorSubject<weatherDataModel[]>([]);
  listData = new BehaviorSubject<listDataModel[]>([]);
  weatherDataSub = new Subscription();
  appId = 'db010d505fd0e52023ed41ae1e81da11';
  showData: weatherDataModel[] = [];
  report: resultDataModel = {
    data: []
  };
  reportNow: reportNowModel = {
    description: '',
    min: 0,
    max: 0
  };

  constructor(
    private http: HttpClient,
  ) { }

  prepareWeatherData() {
    // By zip code: https://api.openweathermap.org/data/2.5/forecast?zip=2000,si&appid=
    const openWeatherMapUrl = 'https://api.openweathermap.org/data/2.5/forecast?q=maribor&appid=' + this.appId;
    this.weatherDataSub = this.http.get<weatherModel>(openWeatherMapUrl)
      .pipe(
        map(val => {
          /*val.list.map((data, index) => {
            let date = this.getDate(data.dt_txt);
            /!*val.result[index].date = [];
            //val.result[index].date.push(date);
            val.result[index].date.push(date);*!/
            data.date = date;

            return data; // return randomized answers
          })*/
          return val;
        }),
        tap(data => {
          console.log('Data');
          console.log(data);
        })
      )
      .subscribe((response) => {
        console.error('prepareWeatherData')
        console.error(response.list)
        this.listData.next(response.list);
      });
  }

  getFiveDaysReport(data: listDataModel[]) {
    console.error('getFiveDaysReport')
    console.error(data)

    data.map((data, i) => {
      let dateTime = data.dt_txt.split(' ');
      let date = dateTime[0];
      let time = dateTime[1];
      this.report.data[i] = {
        date: '',
        time: '',
        temp: 0,
        description: ''
      };
      console.error(date)
      this.report.data[i].date = date;
      this.report.data[i].time = time;
      this.report.data[i].temp = this.convertKelvinToDegrees(data.main.temp);
      this.report.data[i].description = data.weather[0].description;
      console.error(this.report)

      return this.report;
    })

    return this.report;
  }

  getNowReport(data: listDataModel[]) {
    if (data[0]) {
      this.reportNow.description = data[0].weather[0].description;
      this.reportNow.min = this.convertKelvinToDegrees(data[0].main.temp_min);
      this.reportNow.max = this.convertKelvinToDegrees(data[0].main.temp_max);
    }

    return this.reportNow;
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
