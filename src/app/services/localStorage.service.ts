import { Injectable } from '@angular/core';
import {reportNowModel} from "../models/reportNow.model";
import {reportFiveDaysModel} from "../models/reportFiveDays.model";

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {
  constructor() { }

  setLocalStorageReportNow(key: string, data: reportNowModel): void {
    localStorage.setItem(key, JSON.stringify(data));
  }

  setLocalStorageReportFiveDays(key: string, data: reportFiveDaysModel[]): void {
    localStorage.setItem(key, JSON.stringify(data));
  }

  getLocalStorage(key: string) {
    if (localStorage.getItem(key) !== null) {
      return JSON.parse(localStorage.getItem(key) || '{}');
    }
  }
}
