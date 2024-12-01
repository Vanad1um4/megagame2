import { Injectable } from '@angular/core';
import { Sprite, Texture } from 'pixi.js';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { Food } from '../../../logic/food.model';
import { FoodService } from '../../../logic/food.service';
import { ANIMAL_SETTINGS } from '../../../shared/const';
import { BaseLayerService } from './base-layer.service';

@Injectable({
  providedIn: 'root'
})
export class FoodLayerService extends BaseLayerService {
  private foodTexture!: Texture;
  private destroy$ = new Subject<void>();

  constructor(private foodService: FoodService) {
    super();
    this.subscribeToFood();
  }

  public initLayer(foodTexture: Texture): void {
    this.foodTexture = foodTexture;
  }

  private subscribeToFood(): void {
    this.foodService.getFoodObservable()
      .pipe(takeUntil(this.destroy$))
      .subscribe(food => {
        this.updateFoodSprites(food);
      });
  }

  private updateFoodSprites(food: Map<string, Food>): void {
    const activeKeys = new Set<string>();

    for (const [id, foodItem] of food) {
      activeKeys.add(id);
      const coordinates = foodItem.getCoordinates();
      let sprite = this.activeSprites.get(id);

      if (!sprite) {
        sprite = new Sprite(this.foodTexture);
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
