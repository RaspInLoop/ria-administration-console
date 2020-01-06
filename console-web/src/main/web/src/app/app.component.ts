import { Component, Inject } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { ModelicaTreeDialogComponent } from './modelica-tree-dialog';
import { PackageTreeNode } from './services/tree-data-service';
import { StorageService } from './services/storage.service';
import { StoredComponent, StoredPortGroup, StoredPackage, StoredPackageInput } from './model/storage-types';
import { mergeMap, map, catchError } from 'rxjs/operators';
import { Observable, of, throwError, iif } from 'rxjs';
import { ModelicaService } from './services/modelica.service';
import * as model from './model/model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent {
  constructor(public modelicaDialog: MatDialog, private storage: StorageService, private modelicaDatabase: ModelicaService) {}

  title = 'RaspInLoop';

  isExpanded = false;
  element: HTMLElement;

  toggleActive(event: any) {
    event.preventDefault();
    if (this.element !== undefined){
      this.element.style.backgroundColor = '#232e31';
    }
    const target = event.currentTarget;
    target.style.backgroundColor = '#d36423';
    this.element = target;
  }
  openModelicaTreeDialog() {
    const dialogRef = this.modelicaDialog.open(ModelicaTreeDialogComponent, {
      data: {
        selectedModelicaModel: ''
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      this.addNewModelicaComponent(result);
    });
  }

  addNewModelicaComponent(nodeId: string) {
    if (nodeId){
      // create package as long as it doesn't exist
      const packages = nodeId.split('.');
      packages.pop(); // remove the component part.
      this.addPackageIfNeeded(packages, 0).pipe(
        mergeMap(() => this.addComponent(nodeId))
      ).subscribe(
        _res => console.log(nodeId + 'stored in DB'),
        err => console.log('cannot store ' + nodeId + ': ', err),
        () => {console.log('storage in DB completed'); });
    } else {
      console.log('cannot add modelica component: undefined node selected');
    }
  }

  addPackageIfNeeded(packages: string[], level: number): Observable<boolean> {
    if (level < packages.length ) {
      console.log('add Package needed for level ' + level + ' and package ' + packages);
      const currentLevel = packages.slice(0, level + 1).join('.');
      return this.storage.getPackage(currentLevel).pipe(
        // if package exist, try to create next one else createthe current one.
        mergeMap( result => iif( () => result != null,
                                this.addPackageIfNeeded(packages, level + 1 ),
                                this.addPackage(currentLevel).pipe(
                                  mergeMap( () => this.addPackageIfNeeded(packages, level + 1 ))
                                )))
        );
    } else {
      console.log('add Package not needed for level ' + level + ' and package ' + packages);
      return of(true);
    }
  }

  addPackage(currentPackage: string): Observable<boolean> {
    // get package Info
    return this.modelicaDatabase.getPackage(currentPackage).pipe(
      // store it.
      mergeMap( (pack) => {
        const storedPackinput = this.convertModelicaPack(pack);
        return this.storage.storePackage(storedPackinput).pipe(
          mergeMap( stored => this.addToParentPackage(stored)),
          map(() => true) );
      })
    );
  }

  addToParentPackage(stored: StoredPackage):  Observable<void> {
    const parents = stored.packageId.split('.');
    const parent = parents.slice(0, parents.length - 1) .join('.');
    return this.storage.getPackage(parent).pipe(
      mergeMap( (parentPack) => {
        const storedPackinput = this.convertPack(parentPack);
        storedPackinput.packages.push(this.convertPack(stored));
        return this.storage.storePackage(storedPackinput);
      }),
          map(() => {} )
      );
  }

  addComponent(id: string): Observable<boolean> {
    // get component info
    return this.modelicaDatabase.getComponent(id).pipe(
       // store it.
      mergeMap( (comp) => {
        const storedComp = this.convertComp(comp);
        return this.storage.storeComponent(storedComp).pipe(
          map(() => true) );
      })
    );
  }

  convertModelicaPack(comp: model.Package): StoredPackageInput {
    return  {
      packageId: comp.id,
      description: comp.description,
      svgIcon: comp.icon as string,
      packages: [],
      componentIds: []
    };
  }

  convertPack(comp: StoredPackage): StoredPackageInput {
    return  {
      id: comp.id,
      packageId: comp.packageId,
      description: comp.description,
      svgIcon: comp.svgIcon,
      packages:  comp.packages ? comp.packages.map(p => this.convertPack(p)) : [],
      componentIds: comp.components ? comp.components.map( c => c.componentId) : []
    };
  }

  convertComp(comp: model.Component): StoredComponent {
    return  {
      componentId: comp.id,
      description: comp.description,
      svgContent: comp.svgContent,
      svgIcon: comp.svgContent,
      htmlDocumentation: comp.description,
      parameters: JSON.stringify(comp.parameters),
      portGroups: comp.portGroups ? comp.portGroups.map(p => this.convertPortGroup(p)) : []
    };
  }

  convertPortGroup(pg: model.PortGroup): StoredPortGroup {
    return  {
      name: pg.definition.name,
      svg: pg.definition.svg,
      ports: pg.ports.map(p => {return  {
        portId: p.id,
        x: p.position.x,
        y: p.position.y,
        // missing orientation
        description: p.description
      }; } )
    };
  }

}



