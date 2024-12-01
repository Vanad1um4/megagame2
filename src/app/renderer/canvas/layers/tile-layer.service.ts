import { Injectable } from '@angular/core';
import { Sprite, Texture } from 'pixi.js';
import { StateService } from '../../../logic/state.service';
import { Coordinates } from '../../../shared/type';
import { BaseLayerService } from './base-layer.service';

@Injectable({
  providedIn: 'root'
})
export class TileLayerService extends BaseLayerService {
  private tileTexture!: Texture;
  private readonly BUFFER_TILES = 1;

  constructor(private stateService: StateService) {
    super();
  }

  public initLayer(tileTexture: Texture): void {
    this.tileTexture = tileTexture;
  }

  public updateVisibleTiles(screenWidth: number, screenHeight: number, offset: Coordinates): void {
    const visibleArea = this.getVisibleArea(screenWidth, screenHeight, offset, this.BUFFER_TILES);
    const newTileKeys = new Set<string>();

    for (let x = visibleArea.startX; x <= visibleArea.endX; x++) {
      for (let y = visibleArea.startY; y <= visibleArea.endY; y++) {
        const key = `${ x },${ y }`;
        newTileKeys.add(key);

        if (!this.activeSprites.has(key)) {
          const sprite = new Sprite(this.tileTexture);
          sprite.x = x * this.TILE_SIZE;
          sprite.y = y * this.TILE_SIZE;
          sprite.width = this.TILE_SIZE;
          sprite.height = this.TILE_SIZE;
          sprite.tint = 0x808080;

          this.container.addChild(sprite);
          this.activeSprites.set(key, sprite);
        }
      }
    }

    this.clearInactiveSprites(newTileKeys);
  }
}
