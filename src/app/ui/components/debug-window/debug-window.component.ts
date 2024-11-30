import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { Animal } from '../../../logic/animal.model';
import { AnimalsService } from '../../../logic/animals.service';
import { InputHandlerService } from '../../../logic/input-handler.service';

@Component({
  selector: 'app-debug-window',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './debug-window.component.html',
  styleUrl: './debug-window.component.scss',
})
export class DebugWindowComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  public isVisible = true;
  public animalsCount = 0;

  constructor(
    private inputHandler: InputHandlerService,
    private animalsService: AnimalsService
  ) { }

  public ngOnInit() {
    this.inputHandler.getDebugWindowVisibility()
      .pipe(takeUntil(this.destroy$))
      .subscribe(isVisible => {
        this.isVisible = isVisible;
      });

    this.animalsService.getAnimalsObservable()
      .pipe(takeUntil(this.destroy$))
      .subscribe((animals: Map<string, Animal>) => {
        this.animalsCount = animals.size;
      });
  }

  public ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
