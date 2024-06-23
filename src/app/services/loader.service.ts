import { Injectable } from '@angular/core';
import {BehaviorSubject, Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class LoaderService {
  loading$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor() { }

  show(): void {
    this.loading$.next(true);
  }

  hide(): void {
    this.loading$.next(false);
  }

  get state(): Observable<boolean> {
    return this.loading$.asObservable();
  }
}
