import {Component, inject} from '@angular/core';
import {Observable, Observer, Subscription} from "rxjs";
import {IndexService} from "../services/index.service";
import moment from 'moment/moment.js';
import { TranslateService, TranslateModule } from "@ngx-translate/core";
import {reportNowModel} from "../models/reportNow.model";
import {reportFiveDaysModel} from "../models/reportFiveDays.model";
import {NgIf, NgFor, AsyncPipe} from '@angular/common';
import {city} from "../config";

@Component({
    selector: 'app-index',
    templateUrl: './index.component.html',
    styleUrls: ['./index.component.scss'],
    standalone: true,
    imports: [NgIf, NgFor, TranslateModule, AsyncPipe]
})
export class IndexComponent {
  protected readonly city:string = city;
  reportNow$: Observable<reportNowModel> | undefined;
  reportFiveDays$: Observable<reportFiveDaysModel[]> | undefined;
  reportDataSub: Subscription = new Subscription();
  iService: IndexService = inject(IndexService);
  date: string = '';
  time: string = '';

  constructor(
    public translateService: TranslateService
  ) {}

  ngOnInit(): void {
    this.translateService.use(this.translateService.getDefaultLang());
    this.refreshData();
  }

  refreshData() {
    this.getTime();
    this.getWeatherData();
    this.iService.getReportNow();
    this.iService.getReportFiveDays();
  }

  getTime() {
    this.date = moment().format('DD.MM.YYYY');
    this.time = moment().format('HH:mm:ss');
  }

  getWeatherData() {
    this.iService.prepareWeatherData();

    this.reportNow$ = new Observable<reportNowModel>((observer: Observer<reportNowModel>): void => {
      this.iService.getReportNowData().subscribe((data: reportNowModel): void => {
        observer.next(data);
      })
    });
    this.reportFiveDays$ = new Observable<reportFiveDaysModel[]>((observer: Observer<reportFiveDaysModel[]>): void => {
      this.iService.getReportFiveDaysData().subscribe((data: reportFiveDaysModel[]): void => {
        observer.next(data);
      })
    });
  }

  switchLanguage(language: string) {
    this.translateService.use(language);
  }

  ngOnDestroy() {
    this.reportDataSub.unsubscribe();
  }
}
