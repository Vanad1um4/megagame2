import { Coordinates } from "../shared/type";

export class Animal {
  private coordinates: Coordinates;
  private satiety: number;
  private readonly MAX_SATIETY = 100;

  constructor(coordinates: Coordinates, initialSatiety: number = 100) {
    this.coordinates = coordinates;
    this.satiety = Math.min(initialSatiety, this.MAX_SATIETY);
  }

  public getCoordinates(): Coordinates {
    return { ...this.coordinates };
  }

  public setCoordinates(newCoordinates: Coordinates): void {
    this.coordinates = { ...newCoordinates };
  }

  public getSatiety(): number {
    return this.satiety;
  }

  public feed(amount: number): void {
    this.satiety = Math.min(this.satiety + amount, this.MAX_SATIETY);
  }

  public decreaseSatiety(amount: number): void {
    this.satiety = Math.max(this.satiety - amount, 0);
  }

  public isHungry(): boolean {
    return this.satiety < this.MAX_SATIETY / 2;
  }

  public isDead(): boolean {
    return this.satiety <= 0;
  }
}
