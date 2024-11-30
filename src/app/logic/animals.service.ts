import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { Coordinates } from '../shared/type';
import { Animal } from './animal.model';

@Injectable({
  providedIn: 'root'
})
export class AnimalsService {
  private animals: Map<string, Animal> = new Map();
  private animalsSubject = new BehaviorSubject<Map<string, Animal>>(this.animals);
  private lastAnimalId = 0;

  constructor() {
    setInterval(() => this.updateAnimals(), 50);
  }

  public addRandomAnimal(): string {
    // const coordinates = this.generateRandomCoordinates();
    return this.addAnimal({ x: 0, y: 0 });
  }

  private addAnimal(coordinates: Coordinates, initialSatiety: number = 100): string {
    const id = this.generateAnimalId();
    const animal = new Animal(coordinates, initialSatiety);
    this.animals.set(id, animal);
    this.notifyChange();
    return id;
  }

  public removeAnimal(id: string): boolean {
    const removed = this.animals.delete(id);
    if (removed) {
      this.notifyChange();
    }
    return removed;
  }

  public getAnimal(id: string): Animal | undefined {
    return this.animals.get(id);
  }

  public getAnimalAtCoordinates(coordinates: Coordinates): Animal | undefined {
    for (const animal of this.animals.values()) {
      const animalCoords = animal.getCoordinates();
      if (animalCoords.x === coordinates.x && animalCoords.y === coordinates.y) {
        return animal;
      }
    }
    return undefined;
  }

  public getAllAnimals(): Map<string, Animal> {
    return new Map(this.animals);
  }

  public getAnimalsObservable(): Observable<Map<string, Animal>> {
    return this.animalsSubject.asObservable();
  }

  public updateAnimalsSatiety(decreaseAmount: number = 1): void {
    for (const [id, animal] of this.animals) {
      animal.decreaseSatiety(decreaseAmount);
      if (animal.isDead()) {
        this.animals.delete(id);
      }
    }
    this.notifyChange();
  }

  private generateRandomCoordinates(): Coordinates {
    return {
      x: Math.floor(Math.random() * 11) - 5,
      y: Math.floor(Math.random() * 11) - 5
    };
  }

  private generateAnimalId(): string {
    return String(++this.lastAnimalId);
  }

  private notifyChange(): void {
    this.animalsSubject.next(new Map(this.animals));
  }

  private updateAnimals(): void {
    for (const animal of this.animals.values()) {
      animal.move();
    }
    this.notifyChange();
  }
}
