import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { Coordinates } from '../shared/type';
import { AnimalsService } from './animals.service';
import { Food } from './food.model';

@Injectable({
  providedIn: 'root'
})
export class FoodService {
  private food: Map<string, Food> = new Map();
  private foodSubject = new BehaviorSubject<Map<string, Food>>(this.food);
  private lastFoodId = 0;

  private readonly FOOD_SPAWN_INTERVAL = 2000;
  private readonly FOOD_DETECTION_RADIUS = 0.2;

  constructor(private animalsService: AnimalsService) {
    setInterval(() => this.spawnRandomFood(), this.FOOD_SPAWN_INTERVAL);
    setInterval(() => this.checkFoodConsumption(), 100);
  }

  private spawnRandomFood(): void {
    const coordinates = this.generateRandomCoordinates();
    this.addFood(coordinates);
  }

  private addFood(coordinates: Coordinates): string {
    const id = this.generateFoodId();
    const food = new Food(coordinates);
    this.food.set(id, food);
    this.notifyChange();
    return id;
  }

  private removeFood(id: string): boolean {
    const removed = this.food.delete(id);
    if (removed) {
      this.notifyChange();
    }
    return removed;
  }

  public getAllFood(): Map<string, Food> {
    return new Map(this.food);
  }

  public getFoodObservable(): Observable<Map<string, Food>> {
    return this.foodSubject.asObservable();
  }

  private checkFoodConsumption(): void {
    const animals = this.animalsService.getAllAnimals();

    for (const [foodId, food] of this.food) {
      const foodCoords = food.getCoordinates();

      for (const animal of animals.values()) {
        const animalCoords = animal.getCoordinates();

        if (this.isWithinRadius(foodCoords, animalCoords, this.FOOD_DETECTION_RADIUS)) {
          animal.feed(25);
          this.removeFood(foodId);
          break;
        }
      }
    }
  }

  private isWithinRadius(point1: Coordinates, point2: Coordinates, radius: number): boolean {
    const dx = point1.x - point2.x;
    const dy = point1.y - point2.y;
    return Math.sqrt(dx * dx + dy * dy) <= radius;
  }

  private generateRandomCoordinates(): Coordinates {
    return {
      x: Math.floor(Math.random() * 11) - 5,
      y: Math.floor(Math.random() * 11) - 5
    };
  }

  private generateFoodId(): string {
    return `food_${ ++this.lastFoodId }`;
  }

  private notifyChange(): void {
    this.foodSubject.next(new Map(this.food));
  }
}
