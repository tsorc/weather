import { Injectable } from '@angular/core';
import {BehaviorSubject, Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  language$: BehaviorSubject<string> = new BehaviorSubject('sl');
  constructor() { }

  setLanguage(language: string) {
    if (language == 'si') {
      this.language$.next('sl');
    } else {
      this.language$.next('en');
    }
  }

  getLanguage(): Observable<string> {
    return this.language$.asObservable();
  }
}
