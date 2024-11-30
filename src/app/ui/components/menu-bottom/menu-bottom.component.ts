import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

import { AnimalsService } from '../../../logic/animals.service';

@Component({
  selector: 'app-menu-bottom',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './menu-bottom.component.html',
  styleUrl: './menu-bottom.component.scss',
})
export class MenuBottomComponent {

  constructor(private animalsService: AnimalsService) { }

  addAnimal(): void {
    // [...Array(1000)].forEach(() => {
    //   this.animalsService.addRandomAnimal();
    // });

    this.animalsService.addRandomAnimal();
  }

}
