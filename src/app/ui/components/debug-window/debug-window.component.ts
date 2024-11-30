import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';


@Component({
  selector: 'app-debug-window',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './debug-window.component.html',
  styleUrl: './debug-window.component.scss',
})
export class DebugWindowComponent {

  constructor() { }

}
