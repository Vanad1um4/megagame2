import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class StateService {
  private mapCells: Map<number, any> = new Map();
  private coordinateIndex: Map<number, Map<number, number>> = new Map();

  public getCellByCoordinates(x: number, y: number): undefined {
    return undefined;
  }
}
