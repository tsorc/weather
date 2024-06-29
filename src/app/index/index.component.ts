import {Component, inject} from '@angular/core';
import {catchError, Subscription} from "rxjs";
import {IndexService} from "../services/index.service";
import moment from 'moment/moment.js';
import { TranslateService, TranslateModule } from "@ngx-translate/core";
import {reportNowModel} from "../models/reportNow.model";
import {reportFiveDaysModel} from "../models/reportFiveDays.model";
import {LocalStorageService} from "../services/localStorage.service";
import { NgIf, NgFor } from '@angular/common';

@Component({
    selector: 'app-index',
    templateUrl: './index.component.html',
    styleUrls: ['./index.component.scss'],
    standalone: true,
    imports: [NgIf, NgFor, TranslateModule]
})
export class IndexComponent {
  reportFiveDays: reportFiveDaysModel[] = [];
  reportNow: reportNowModel = {
    description: '',
    min: 0,
    max: 0
  };
  reportDataSub: Subscription = new Subscription();
  iService: IndexService = inject(IndexService);
  date: string = '';
  time: string = '';
  place: string = 'Maribor';

  constructor(
    public translateService: TranslateService,
    private storageService: LocalStorageService
  ) {}

  ngOnInit(): void {
    this.translateService.use(this.translateService.getDefaultLang());
    this.refreshData();
  }

  refreshData() {
    this.getTime();
    this.getWeatherData();
  }

  getTime() {
    this.date = moment().format('DD.MM.YYYY');
    this.time = moment().format('HH:mm:ss');
  }

  getWeatherData() {
    this.reportNow = this.storageService.getLocalStorage('report_now');
    this.reportFiveDays = this.storageService.getLocalStorage('report_five_days');

    this.iService.prepareWeatherData();
    this.reportDataSub = this.iService.getWeatherData()
      .pipe(
        catchError((e) => {
          throw new Error(e);
        })
      ).subscribe(value => {
        this.reportNow = this.iService.getReportNow(value);
        this.reportFiveDays = this.iService.getReportFiveDays(value);

        this.storageService.setLocalStorageReportNow('report_now', this.reportNow);
        this.storageService.setLocalStorageReportFiveDays('report_five_days', this.reportFiveDays);
      });
  }

  switchLanguage(language: string) {
    this.translateService.use(language);
  }

  ngOnDestroy() {
    this.reportDataSub.unsubscribe();
  }
}
