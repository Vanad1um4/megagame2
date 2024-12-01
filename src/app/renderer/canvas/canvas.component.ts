import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Application, Container } from 'pixi.js';
import { BehaviorSubject, Subject, fromEvent } from 'rxjs';
import { takeUntil, throttleTime } from 'rxjs/operators';

import { AnimalLayerService } from './layers/animal-layer.service';
import { FoodLayerService } from './layers/food-layer.service';
import { TileLayerService } from './layers/tile-layer.service';
import { TextureManagerService } from './services/texture-manager.service';

interface Point {
  x: number;
  y: number;
}

@Component({
  selector: 'app-canvas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './canvas.component.html',
  styleUrls: ['./canvas.component.scss']
})
export class CanvasComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('gameCanvas', { static: true })
  private canvasRef!: ElementRef<HTMLCanvasElement>;

  private app!: Application;
  private worldContainer!: Container;
  private destroy$ = new Subject<void>();
  private offset$ = new BehaviorSubject<Point>({ x: 0, y: 0 });
  private tempOffset$ = new BehaviorSubject<Point>({ x: 0, y: 0 });

  private isDragging = false;
  private lastMousePos: Point = { x: 0, y: 0 };

  constructor(
    private ngZone: NgZone,
    private tileLayer: TileLayerService,
    private animalLayer: AnimalLayerService,
    private foodLayer: FoodLayerService,
    private textureManager: TextureManagerService
  ) { }

  public async ngOnInit() {
    await this.initGame();
    this.setupControls();
    this.startGameLoop();
  }

  public ngAfterViewInit() {
    const resizeObserver = new ResizeObserver(() => {
      if (this.app?.renderer) {
        const parent = this.canvasRef.nativeElement.parentElement;
        if (parent) {
          this.app.renderer.resize(parent.clientWidth, parent.clientHeight);
          this.centerView();
        }
      }
    });

    resizeObserver.observe(this.canvasRef.nativeElement);
  }

  public ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();

    this.tileLayer.destroy();
    this.animalLayer.destroy();
    this.foodLayer.destroy();
    this.app.destroy(true);
  }

  private async initGame() {
    await this.initPixiApp();
    const textures = await this.textureManager.loadTextures(this.app);

    this.initWorld();

    this.tileLayer.initLayer(textures.tileTexture);
    this.animalLayer.initLayer(textures.animalTexture);
    this.foodLayer.initLayer(textures.foodTexture);

    this.centerView();
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

  private initWorld() {
    this.worldContainer = new Container();
    this.worldContainer.addChild(this.tileLayer.getContainer());
    this.worldContainer.addChild(this.foodLayer.getContainer());
    this.worldContainer.addChild(this.animalLayer.getContainer());
    this.app.stage.addChild(this.worldContainer);
  }

  private centerView() {
    const centerX = this.app.screen.width / 2;
    const centerY = this.app.screen.height / 2;

    this.offset$.next({
      x: centerX,
      y: centerY
    });
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

  private getCurrentOffset(): Point {
    const offset = this.offset$.getValue();
    const tempOffset = this.tempOffset$.getValue();
    return {
      x: offset.x + tempOffset.x,
      y: offset.y + tempOffset.y
    };
  }

  private startGameLoop() {
    this.ngZone.runOutsideAngular(() => {
      this.app.ticker.add(() => {
        const offset = this.getCurrentOffset();
        this.worldContainer.x = offset.x;
        this.worldContainer.y = offset.y;
        this.tileLayer.updateVisibleTiles(
          this.app.screen.width,
          this.app.screen.height,
          offset
        );
      });
    });
  }
}
