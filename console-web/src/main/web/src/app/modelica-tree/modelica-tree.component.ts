import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { BlocktreeComponent } from '../blocktree/blocktree.component';
import { PackageService } from '../services/package.service';
import { TreeDataService, PackageTreeNode } from '../services/tree-data-service';

@Component({
  selector: 'app-modelica-tree',
  templateUrl: './modelica-tree.component.html',
  styleUrls: ['./modelica-tree.component.scss'],
  providers: [PackageService]
})
export class ModelicaTreeComponent extends BlocktreeComponent {

  constructor(database: PackageService) {
    super(database);
  }

  selectedLeaf: PackageTreeNode;

  @Output() selected = new EventEmitter<PackageTreeNode>();

  select(node: PackageTreeNode) {
    this.selectedLeaf = node;
    this.selected.emit(node);
  }
}
