import { Coordinates } from "../shared/type";

export class Food {
  constructor(
    private coordinates: Coordinates
  ) {
  }

  public getCoordinates(): Coordinates {
    return { ...this.coordinates };
  }

  public setCoordinates(newCoordinates: Coordinates): void {
    this.coordinates = { ...newCoordinates };
  }
}
