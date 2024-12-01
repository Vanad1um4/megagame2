import { Container, Sprite } from 'pixi.js';
import { Coordinates } from '../../../shared/type';

export interface VisibleArea {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

export abstract class BaseLayerService {
  protected container: Container;
  protected activeSprites: Map<string, Sprite> = new Map();
  protected readonly TILE_SIZE = 100;

  constructor() {
    this.container = new Container();
  }

  public getContainer(): Container {
    return this.container;
  }

  protected getVisibleArea(screenWidth: number, screenHeight: number, offset: Coordinates, bufferTiles: number = 1): VisibleArea {
    const startX = Math.floor((-offset.x + this.TILE_SIZE / 2) / (this.TILE_SIZE)) - bufferTiles;
    const startY = Math.floor((-offset.y + this.TILE_SIZE / 2) / (this.TILE_SIZE)) - bufferTiles;
    const tilesX = Math.ceil(screenWidth / this.TILE_SIZE) + bufferTiles * 2;
    const tilesY = Math.ceil(screenHeight / this.TILE_SIZE) + bufferTiles * 2;

    return {
      startX,
      startY,
      endX: startX + tilesX,
      endY: startY + tilesY
    };
  }

  protected clearInactiveSprites(activeKeys: Set<string>): void {
    for (const [key, sprite] of this.activeSprites) {
      if (!activeKeys.has(key)) {
        sprite.destroy();
        this.activeSprites.delete(key);
      }
    }
  }

  public destroy(): void {
    this.clearInactiveSprites(new Set());
    this.container.destroy();
  }
}
