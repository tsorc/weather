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
import {
  weatherUrlCity,
  appId,
  slDateFormat,
  addLanguage,
  localStorageReportNow,
  localStorageReportFiveDays
} from '../config';
import {LocalStorageService} from "./localStorage.service";

@Injectable({
  providedIn: 'root'
})
export class IndexService {
  listData: BehaviorSubject<listDataModel[]> = new BehaviorSubject<listDataModel[]>([]);
  weatherDataSub: Subscription = new Subscription();
  repData = {
    description: '',
    min: 0,
    max: 0
  };
  reportNow: BehaviorSubject<reportNowModel> = new BehaviorSubject<reportNowModel>(this.repData);
  reportNowData: reportNowModel = this.repData;
  reportFiveDaysData: reportFiveDaysModel[] = [];
  reportFiveDays: BehaviorSubject<reportFiveDaysModel[]> = new BehaviorSubject<reportFiveDaysModel[]>([])
  dateList: string[] = [];
  language: BehaviorSubject<string> = new BehaviorSubject<string>('');

  constructor(
    private httpService: HttpClient,
    private loaderService: LoaderService,
    private translateService: TranslateService,
    private storageService: LocalStorageService
  ) { }

  prepareWeatherData(): void {
    this.loaderService.show();
    this.getLanguage();

    this.language.subscribe((lang: string): void => {
      const openWeatherMapUrl: string = weatherUrlCity + appId + addLanguage + lang;
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

  getLanguage(): void {
    this.language.next(this.translateService.currentLang);
    this.translateService.onLangChange.subscribe((event: LangChangeEvent) => {
      this.language.next(event.lang);
    });
  }

  getReportNow(){
    this.reportNow.next(this.storageService.getLocalStorage(localStorageReportNow));
    this.listData.subscribe((data: listDataModel[]) => {
      if (data[0]) {
        this.reportNowData.description = data[0].weather[0].description;
        this.reportNowData.min = this.convertKelvinToDegrees(data[0].main.temp_min);
        this.reportNowData.max = this.convertKelvinToDegrees(data[0].main.temp_max);

        this.reportNow.next(this.reportNowData);
        this.storageService.setLocalStorageReportNow(localStorageReportNow, this.reportNowData);
      }
    })
  }

  getReportNowData(): Observable<reportNowModel> {
    return this.reportNow.asObservable();
  }

  getReportFiveDays(){
    this.reportFiveDays.next(this.storageService.getLocalStorage(localStorageReportFiveDays));
    this.listData.subscribe((data: listDataModel[]) => {
      this.reportFiveDaysData.map((dataInfo: reportFiveDaysModel) => {
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
          this.reportFiveDaysData.push(dateInfo);
        }

        this.reportFiveDaysData.map((dataReport: reportFiveDaysModel, j: number): void => {
          if (date === dataReport.date) {
            let reportInfo = {
              time: this.convertTimeToShort(time),
              temp: this.convertKelvinToDegrees(data.main.temp),
              description: data.weather[0].description
            };

            this.reportFiveDaysData[j].data.push(reportInfo);
          }
        });
      })

      if (this.reportFiveDaysData.length !== 0) {
        this.reportFiveDays.next(this.reportFiveDaysData);
        this.storageService.setLocalStorageReportFiveDays(localStorageReportFiveDays, this.reportFiveDaysData);
      }
    });
  }

  getReportFiveDaysData(): Observable<reportFiveDaysModel[]> {
    return this.reportFiveDays.asObservable();
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

  ngOnDestroy() {
    this.weatherDataSub.unsubscribe();
  }
}
