import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

import { AnimalsService } from '../../../../logic/animals.service';

@Component({
  selector: 'app-bottom-menu',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './bottom-menu.component.html',
  styleUrl: './bottom-menu.component.scss',
})
export class BottomMenuComponent {

  constructor(private animalsService: AnimalsService) { }

  addAnimal(): void {
    this.animalsService.addRandomAnimal();
  }

}
