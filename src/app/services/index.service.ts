import {Injectable} from '@angular/core';
import {BehaviorSubject, catchError, map, Observable, Subscription} from "rxjs";
import { HttpClient } from "@angular/common/http";
import {weatherModel} from "../models/weather.model";
import {listDataModel} from "../models/listData.model";
import {reportNowModel} from "../models/reportNow.model";
import {reportFiveDaysModel} from "../models/reportFiveDays.model";
import moment from "moment/moment.js";
import {LoaderService} from "./loader.service";
import {LangChangeEvent, TranslateService} from "@ngx-translate/core";
import {weatherUrlCity, appId, slDateFormat, addLanguage} from '../config';

@Injectable({
  providedIn: 'root'
})
export class IndexService {
  listData: BehaviorSubject<listDataModel[]> = new BehaviorSubject<listDataModel[]>([]);
  weatherDataSub: Subscription = new Subscription();
  reportNow: reportNowModel = {
    description: '',
    min: 0,
    max: 0
  };
  reportFiveDays: reportFiveDaysModel[] = [];
  dateList: string[] = [];

  constructor(
    private httpService: HttpClient,
    private loaderService: LoaderService,
    private translateService: TranslateService
  ) { }

  prepareWeatherData(): void {
    this.loaderService.show();

    this.translateService.onLangChange.subscribe((event: LangChangeEvent) => {
      const openWeatherMapUrl: string = weatherUrlCity + appId + addLanguage + event.lang;
      this.weatherDataSub = this.httpService.get<weatherModel>(openWeatherMapUrl)
        .pipe(
          catchError(e => {
            this.loaderService.hide();
            throw new Error(e);
          })
        ).subscribe((response: weatherModel): void => {
          map(val => {
            response.list.map((data: listDataModel) => {
              let dateTime: string[] = data.dt_txt.split(' ');
              let date :string = dateTime[0];
              data.date = date;
              return data;
            })
            return val;
          })
          this.listData.next(response.list);
          this.loaderService.hide();
        });
    });
  }

  getReportNow(data: listDataModel[]): reportNowModel {
    if (data[0]) {
      this.reportNow.description = data[0].weather[0].description;
      this.reportNow.min = this.convertKelvinToDegrees(data[0].main.temp_min);
      this.reportNow.max = this.convertKelvinToDegrees(data[0].main.temp_max);
    }

    return this.reportNow;
  }

  getReportFiveDays(data: listDataModel[]): reportFiveDaysModel[] {
    this.reportFiveDays.map((dataInfo: reportFiveDaysModel)=> {
      dataInfo.data = [];
      return dataInfo;
    });

    data.map((data: listDataModel): void => {
      let dateTime: string[] = data.dt_txt.split(' ');
      let date: string = this.convertDateToSlo(dateTime[0]);
      let time: string = dateTime[1];

      if (!this.dateList.includes(date)) {
        let dateInfo = {
          date: date,
          data: []
        };

        this.dateList.push(date);
        this.reportFiveDays.push(dateInfo);
      }

      this.reportFiveDays.map((dataReport: reportFiveDaysModel, j: number): void => {
        if (date === dataReport.date) {
          let reportInfo = {
            time: this.convertTimeToShort(time),
            temp: this.convertKelvinToDegrees(data.main.temp),
            description: data.weather[0].description
          };

          this.reportFiveDays[j].data.push(reportInfo);
        }
      });
    })

    return this.reportFiveDays;
  }

  convertDateToSlo(date: string): string {
    return moment(date).format(slDateFormat);
  }

  convertTimeToShort(time: string): string {
    return time.substring(0, time.length - 3);
  }

  convertKelvinToDegrees(kelvin: string): number {
    return Math.round(Number(-273.15 + kelvin));
  }

  getWeatherData(): Observable<listDataModel[]> {
    return this.listData.asObservable();
  }

  ngOnDestroy() {
    this.weatherDataSub.unsubscribe();
  }
}
