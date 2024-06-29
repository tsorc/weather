import { Component } from '@angular/core';
import { SpinnerComponent } from './spinner/spinner.component';
import { RouterOutlet } from '@angular/router';
import {appName} from "./config";

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    standalone: true,
    imports: [RouterOutlet, SpinnerComponent]
})
export class AppComponent {
  title = appName;
}
