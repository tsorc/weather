import {Component, inject} from '@angular/core';
import {Subscription} from "rxjs";
import {IndexService} from "../services/index.service";
import moment from 'moment/moment.js';
import {TranslateService} from "@ngx-translate/core";
import {LoaderService} from "../services/loader.service";
import {reportNowModel} from "../models/reportNow.model";
import {reportFiveDaysModel} from "../models/reportFiveDays.model";

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.scss']
})
export class IndexComponent {
  reportFiveDays: reportFiveDaysModel[] = [];
  reportNow: reportNowModel = {
    description: '',
    min: 0,
    max: 0
  };
  reportDataSub = new Subscription();
  iService = inject(IndexService);
  date: string = '';
  time: string = '';

  constructor(
    private translate: TranslateService,
    private loaderService: LoaderService
  ) {
    this.translate.setDefaultLang('si');
  }

  ngOnInit(): void {
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
    this.loaderService.setLoading(true);
    this.iService.prepareWeatherData();
    this.reportDataSub.unsubscribe();
    this.reportDataSub = this.iService.getWeatherData().subscribe(value => {
      this.reportNow = this.iService.getReportNow(value);
      this.reportFiveDays = this.iService.getReportFiveDays(value);
      this.loaderService.setLoading(false);
    });
  }

  switchLanguage(language: string) {
    this.translate.use(language);
  }

  ngOnDestroy() {
    this.reportDataSub.unsubscribe();
  }
}
