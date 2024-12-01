import { Injectable } from '@angular/core';
import { Application, Graphics, Texture } from 'pixi.js';
import { ANIMAL_SETTINGS } from '../../../shared/const';

export interface GameTextures {
  tileTexture: Texture;
  animalTexture: Texture;
  foodTexture: Texture;
}

@Injectable({
  providedIn: 'root'
})
export class TextureManagerService {
  private readonly TILE_SIZE = 100;

  constructor() { }

  public async loadTextures(app: Application): Promise<GameTextures> {
    const [tileTexture, animalTexture, foodTexture] = await Promise.all([
      this.loadGroundTexture(app),
      this.loadAnimalTexture(app),
      this.loadFoodTexture(app)
    ]);

    return { tileTexture, animalTexture, foodTexture };
  }

  private async loadGroundTexture(app: Application): Promise<Texture> {
    return new Promise<Texture>((resolve) => {
      const image = new Image();
      image.onload = () => {
        resolve(Texture.from(image));
      };
      image.onerror = () => {
        const graphics = new Graphics();
        graphics.beginFill(0x808080);
        graphics.drawRect(0, 0, this.TILE_SIZE, this.TILE_SIZE);
        graphics.lineStyle(1, 0x606060);
        graphics.moveTo(0, 0);
        graphics.lineTo(this.TILE_SIZE, this.TILE_SIZE);
        graphics.moveTo(this.TILE_SIZE, 0);
        graphics.lineTo(0, this.TILE_SIZE);
        graphics.endFill();
        resolve(app.renderer.generateTexture(graphics));
      };
      image.src = 'assets/textures/ground.png';
    });
  }

  private async loadAnimalTexture(app: Application): Promise<Texture> {
    return new Promise<Texture>((resolve) => {
      const graphics = new Graphics();
      graphics.beginFill(0xFF0000);
      graphics.drawCircle(ANIMAL_SETTINGS.SIZE / 2, ANIMAL_SETTINGS.SIZE / 2, ANIMAL_SETTINGS.SIZE / 3);
      graphics.endFill();
      resolve(app.renderer.generateTexture(graphics));
    });
  }

  private async loadFoodTexture(app: Application): Promise<Texture> {
    return new Promise<Texture>((resolve) => {
      const graphics = new Graphics();
      graphics.beginFill(0x00FF00);
      graphics.drawCircle(ANIMAL_SETTINGS.SIZE / 2, ANIMAL_SETTINGS.SIZE / 2, ANIMAL_SETTINGS.SIZE / 4);
      graphics.endFill();
      resolve(app.renderer.generateTexture(graphics));
    });
  }
}
