import { Component, OnInit } from '@angular/core';
import { PackageService } from '../services/package.service';
import { BlocktreeComponent } from '../blocktree/blocktree.component';
import { TreeDataService } from '../services/tree-data-service';
import { BoardHardwareService } from '../services/board-hardware.service';

@Component({
  selector: 'app-board-hardware-tree',
  templateUrl: '../blocktree/blocktree.component.html',
  styleUrls: ['../blocktree/blocktree.component.scss'],
  providers: [BoardHardwareService]
})
export class BoardHardwareTreeComponent extends BlocktreeComponent {

  constructor(database: BoardHardwareService) {
    super(database);
  }
}
