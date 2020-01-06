import { Component, OnInit } from '@angular/core';
import { BlocktreeComponent } from '../blocktree/blocktree.component';
import { PackageService } from '../services/package.service';
import { TreeDataService } from '../services/tree-data-service';
import { WorldModelService } from '../services/world-model.service';

@Component({
  selector: 'app-world-model-tree',
  templateUrl: '../blocktree/blocktree.component.html',
  styleUrls: ['../blocktree/blocktree.component.scss'],
  providers: [WorldModelService]
})
export class WorldModelTreeComponent extends BlocktreeComponent {

  constructor(database: WorldModelService) {
    super(database);
  }
}
