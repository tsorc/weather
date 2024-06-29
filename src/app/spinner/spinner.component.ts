import { Component } from '@angular/core';
import {LoaderService} from "../services/loader.service";
import { NgIf } from '@angular/common';

@Component({
    selector: 'app-spinner',
    templateUrl: './spinner.component.html',
    styleUrls: ['./spinner.component.scss'],
    standalone: true,
    imports: [NgIf]
})
export class SpinnerComponent {
  loading: unknown = false;

  constructor(
    public loaderService: LoaderService
  ) { }

  ngOnInit(): void {
    this.subscribe();
  }

  private subscribe(): void {
    this.loaderService.state
      .subscribe(loading => {
        this.loading = loading;
      });
  }
}
