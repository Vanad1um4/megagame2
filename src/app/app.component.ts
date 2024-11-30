import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';

import { CanvasComponent } from './renderer/canvas/canvas.component';
import { DebugWindowComponent } from './ui/components/debug-window/debug-window.component';
import { MenuBottomComponent } from './ui/components/menu-bottom/menu-bottom.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    CanvasComponent,
    MenuBottomComponent,
    DebugWindowComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {

  constructor() {
  }

  ngOnInit() {
  }

}
