import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { PackageTreeNode } from './services/tree-data-service';
import { DomSanitizer } from '@angular/platform-browser';

export interface DialogData {
    selectedModelicaModel: string;
  }

@Component({
    selector: 'app-modelica-tree-dialog',
    templateUrl: 'modelica-tree-dialog.html',
  })
  export class ModelicaTreeDialogComponent {
    constructor(public dialogRef: MatDialogRef<ModelicaTreeDialogComponent>,
      @Inject(MAT_DIALOG_DATA) public data: DialogData,
      private sanitizer: DomSanitizer) {
        this.selectedModelica = new PackageTreeNode('',
        'Select a Component...',
        this.sanitizer.bypassSecurityTrustHtml( '<svg/>'),
        0,
        []);
      }

    public selectedModelica: PackageTreeNode;

    onNoClick(): void {
      this.dialogRef.close();
    }

    onNodeSelected(selectedNode: PackageTreeNode) {
        this.selectedModelica = selectedNode;
        this.data.selectedModelicaModel = this.selectedModelica.id;
    }
  }
