import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, fromEvent, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class InputHandlerService implements OnDestroy {
  private destroy$ = new Subject<void>();

  private isDebugWindowVisible$ = new BehaviorSubject<boolean>(false);

  constructor() {
    this.initKeyboardListeners();
  }

  private initKeyboardListeners(): void {
    fromEvent<KeyboardEvent>(document, 'keydown')
      .pipe(takeUntil(this.destroy$))
      .subscribe((event) => {
        if (event.key === 'F8') {
          event.preventDefault();
          this.toggleDebugWindow();
        }
      });
  }

  public getDebugWindowVisibility() {
    return this.isDebugWindowVisible$.asObservable();
  }

  private toggleDebugWindow(): void {
    this.isDebugWindowVisible$.next(!this.isDebugWindowVisible$.getValue());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
