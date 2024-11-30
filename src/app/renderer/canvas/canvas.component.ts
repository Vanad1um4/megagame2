import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Application, Container, Graphics, Sprite, Texture } from 'pixi.js';
import { BehaviorSubject, fromEvent, Subject, takeUntil, throttleTime } from 'rxjs';

import { Animal } from '../../logic/animal.model';
import { AnimalsService } from '../../logic/animals.service';
import { StateService } from '../../logic/state.service';
import { ANIMAL_SETTINGS } from '../../shared/const';

interface Point {
  x: number;
  y: number;
}

interface VisibleArea {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

@Component({
  selector: 'app-canvas',
  standalone: true,
  imports: [CommonModule],
  template: '<canvas #gameCanvas></canvas>',
  styles: [`
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }
    canvas {
      display: block;
      width: 100%;
      height: 100%;
    }
  `]
})
export class CanvasComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('gameCanvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  private readonly TILE_SIZE = 100;
  private readonly BUFFER_TILES = 1;

  private app!: Application;
  private worldContainer!: Container;
  private tileContainer!: Container;
  private animalsContainer!: Container;
  private tileTexture!: Texture;
  private animalTexture!: Texture;
  private activeTiles: Map<string, Sprite> = new Map();
  private activeAnimals: Map<string, Sprite> = new Map();

  private destroy$ = new Subject<void>();
  private offset$ = new BehaviorSubject<Point>({ x: 0, y: 0 });
  private tempOffset$ = new BehaviorSubject<Point>({ x: 0, y: 0 });

  private isDragging = false;
  private lastMousePos: Point = { x: 0, y: 0 };

  constructor(
    private ngZone: NgZone,
    private stateService: StateService,
    private animalsService: AnimalsService
  ) { }

  async ngOnInit() {
    await this.initPixiApp();
    await this.loadTextures();
    this.initWorld();
    this.setupControls();
    this.startGameLoop();
    this.subscribeToAnimals();
  }

  private async initPixiApp() {
    this.app = new Application();
    await this.app.init({
      canvas: this.canvasRef.nativeElement,
      resizeTo: this.canvasRef.nativeElement,
      antialias: true,
      backgroundColor: 0x666666,
    });
  }

  private async loadTextures() {
    await Promise.all([
      this.loadGroundTexture(),
      this.loadAnimalTexture()
    ]);
  }

  private async loadGroundTexture() {
    return new Promise<void>((resolve) => {
      const image = new Image();
      image.onload = () => {
        this.tileTexture = Texture.from(image);
        resolve();
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
        this.tileTexture = this.app.renderer.generateTexture(graphics);
        resolve();
      };
      image.src = 'assets/textures/ground.png';
    });
  }

  private async loadAnimalTexture() {
    return new Promise<void>((resolve) => {
      const graphics = new Graphics();
      graphics.beginFill(0xFF0000);
      graphics.drawCircle(ANIMAL_SETTINGS.SIZE / 2, ANIMAL_SETTINGS.SIZE / 2, ANIMAL_SETTINGS.SIZE / 3);
      graphics.endFill();
      this.animalTexture = this.app.renderer.generateTexture(graphics);
      resolve();
    });
  }

  private initWorld() {
    this.worldContainer = new Container();
    this.tileContainer = new Container();
    this.animalsContainer = new Container();

    this.worldContainer.addChild(this.tileContainer);
    this.worldContainer.addChild(this.animalsContainer);
    this.app.stage.addChild(this.worldContainer);

    this.updateVisibleTiles();
  }

  private getVisibleArea(): VisibleArea {
    const offset = this.getCurrentOffset();
    const scale = 1;

    const startX = Math.floor(-offset.x / (this.TILE_SIZE * scale)) - this.BUFFER_TILES;
    const startY = Math.floor(-offset.y / (this.TILE_SIZE * scale)) - this.BUFFER_TILES;
    const tilesX = Math.ceil(this.app.screen.width / (this.TILE_SIZE * scale)) + this.BUFFER_TILES * 2;
    const tilesY = Math.ceil(this.app.screen.height / (this.TILE_SIZE * scale)) + this.BUFFER_TILES * 2;

    return {
      startX,
      startY,
      endX: startX + tilesX,
      endY: startY + tilesY
    };
  }

  private updateVisibleTiles() {
    const visibleArea = this.getVisibleArea();
    const newTileKeys = new Set<string>();

    for (let x = visibleArea.startX; x <= visibleArea.endX; x++) {
      for (let y = visibleArea.startY; y <= visibleArea.endY; y++) {
        const key = `${ x },${ y }`;
        newTileKeys.add(key);

        if (!this.activeTiles.has(key)) {
          const sprite = new Sprite(this.tileTexture);
          sprite.x = x * this.TILE_SIZE;
          sprite.y = y * this.TILE_SIZE;
          sprite.width = this.TILE_SIZE;
          sprite.height = this.TILE_SIZE;
          sprite.tint = 0x808080;

          this.tileContainer.addChild(sprite);
          this.activeTiles.set(key, sprite);
        }
      }
    }

    for (const [key, sprite] of this.activeTiles) {
      if (!newTileKeys.has(key)) {
        sprite.destroy();
        this.activeTiles.delete(key);
      }
    }
  }

  private getCurrentOffset(): Point {
    const offset = this.offset$.getValue();
    const tempOffset = this.tempOffset$.getValue();
    return {
      x: offset.x + tempOffset.x,
      y: offset.y + tempOffset.y
    };
  }

  private setupControls() {
    const canvas = this.canvasRef.nativeElement;

    fromEvent<MouseEvent>(canvas, 'mousedown')
      .pipe(takeUntil(this.destroy$))
      .subscribe(e => {
        this.isDragging = true;
        this.lastMousePos = { x: e.clientX, y: e.clientY };
      });

    fromEvent<MouseEvent>(document, 'mousemove')
      .pipe(
        takeUntil(this.destroy$),
        throttleTime(16)
      )
      .subscribe(e => {
        if (this.isDragging) {
          const dx = e.clientX - this.lastMousePos.x;
          const dy = e.clientY - this.lastMousePos.y;
          const current = this.tempOffset$.getValue();
          this.tempOffset$.next({
            x: current.x + dx,
            y: current.y + dy
          });
          this.lastMousePos = { x: e.clientX, y: e.clientY };
        }
      });

    fromEvent<MouseEvent>(document, 'mouseup')
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        if (this.isDragging) {
          this.isDragging = false;
          const finalOffset = this.getCurrentOffset();
          this.offset$.next(finalOffset);
          this.tempOffset$.next({ x: 0, y: 0 });
        }
      });
  }

  private startGameLoop() {
    this.ngZone.runOutsideAngular(() => {
      this.app.ticker.add(() => {
        const offset = this.getCurrentOffset();
        this.worldContainer.x = offset.x;
        this.worldContainer.y = offset.y;
        this.updateVisibleTiles();
      });
    });
  }

  private subscribeToAnimals() {
    this.animalsService.getAnimalsObservable()
      .pipe(takeUntil(this.destroy$))
      .subscribe(animals => {
        this.updateAnimals(animals);
      });
  }

  private updateAnimals(animals: Map<string, Animal>) {
    for (const [id, sprite] of this.activeAnimals) {
      if (!animals.has(id)) {
        sprite.destroy();
        this.activeAnimals.delete(id);
      }
    }

    for (const [id, animal] of animals) {
      const coordinates = animal.getCoordinates();
      let sprite = this.activeAnimals.get(id);

      if (!sprite) {
        sprite = new Sprite(this.animalTexture);
        sprite.width = ANIMAL_SETTINGS.SIZE;
        sprite.height = ANIMAL_SETTINGS.SIZE;
        sprite.anchor.set(0.5);
        this.animalsContainer.addChild(sprite);
        this.activeAnimals.set(id, sprite);
      }

      sprite.x = (coordinates.x * this.TILE_SIZE) + (this.TILE_SIZE / 2);
      sprite.y = (coordinates.y * this.TILE_SIZE) + (this.TILE_SIZE / 2);
    }
  }

  ngAfterViewInit() {
    const resizeObserver = new ResizeObserver(() => {
      if (this.app?.renderer) {
        const parent = this.canvasRef.nativeElement.parentElement;
        if (parent) {
          this.app.renderer.resize(parent.clientWidth, parent.clientHeight);
          this.updateVisibleTiles();
        }
      }
    });

    resizeObserver.observe(this.canvasRef.nativeElement);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.app.destroy(true);
  }
}
