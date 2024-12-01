import { Injectable } from '@angular/core';
import { Sprite, Texture } from 'pixi.js';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { Animal } from '../../../logic/animal.model';
import { AnimalsService } from '../../../logic/animals.service';
import { ANIMAL_SETTINGS } from '../../../shared/const';
import { BaseLayerService } from './base-layer.service';

@Injectable({
  providedIn: 'root'
})
export class AnimalLayerService extends BaseLayerService {
  private animalTexture!: Texture;
  private destroy$ = new Subject<void>();

  constructor(private animalsService: AnimalsService) {
    super();
    this.subscribeToAnimals();
  }

  public initLayer(animalTexture: Texture): void {
    this.animalTexture = animalTexture;
  }

  private subscribeToAnimals(): void {
    this.animalsService.getAnimalsObservable()
      .pipe(takeUntil(this.destroy$))
      .subscribe(animals => {
        this.updateAnimalSprites(animals);
      });
  }

  private updateAnimalSprites(animals: Map<string, Animal>): void {
    const activeKeys = new Set<string>();

    for (const [id, animal] of animals) {
      activeKeys.add(id);
      const coordinates = animal.getCoordinates();
      let sprite = this.activeSprites.get(id);

      if (!sprite) {
        sprite = new Sprite(this.animalTexture);
        sprite.width = ANIMAL_SETTINGS.SIZE;
        sprite.height = ANIMAL_SETTINGS.SIZE;
        sprite.anchor.set(0.5);
        this.container.addChild(sprite);
        this.activeSprites.set(id, sprite);
      }

      sprite.x = (coordinates.x * this.TILE_SIZE) + (this.TILE_SIZE / 2);
      sprite.y = (coordinates.y * this.TILE_SIZE) + (this.TILE_SIZE / 2);
    }

    this.clearInactiveSprites(activeKeys);
  }

  public override destroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    super.destroy();
  }
}
