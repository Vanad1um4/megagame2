import { ANIMAL_SETTINGS } from "../shared/const";
import { Coordinates } from "../shared/type";

export class Animal {
  private coordinates: Coordinates;
  private satiety: number;
  private readonly MAX_SATIETY = 100;

  private angle: number = 0;
  private speed: number = 0;
  private movementTimer: number = 0;

  constructor(coordinates: Coordinates, initialSatiety: number = 100) {
    this.coordinates = coordinates;
    this.satiety = Math.min(initialSatiety, this.MAX_SATIETY);
    this.resetMovement();
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

  public move(): void {
    this.movementTimer--;

    if (this.movementTimer <= 0) {
      this.resetMovement();
    }

    this.coordinates = {
      x: this.coordinates.x + Math.sin(this.angle) * this.speed,
      y: this.coordinates.y - Math.cos(this.angle) * this.speed
    };
  }

  private resetMovement(): void {
    this.angle = Math.random() * Math.PI * 2;

    this.speed = ANIMAL_SETTINGS.BASE_SPEED + Math.random() * ANIMAL_SETTINGS.SPEED_VARIATION;
    this.movementTimer = ANIMAL_SETTINGS.MIN_MOVEMENT_TIME +
      Math.floor(Math.random() * (ANIMAL_SETTINGS.MAX_MOVEMENT_TIME - ANIMAL_SETTINGS.MIN_MOVEMENT_TIME));
  }

  public getAngle(): number {
    return this.angle;
  }
}
