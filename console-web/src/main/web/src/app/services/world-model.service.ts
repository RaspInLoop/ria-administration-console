import { Injectable } from '@angular/core';
import {Apollo} from 'apollo-angular';
import { Observable, of, iif } from 'rxjs';
import {map, mergeMap} from 'rxjs/operators';
import gql from 'graphql-tag';
import { MessageService } from './message.service';
import {Package} from '../model/model';
import {TreeDataService, PackageTreeNode} from './tree-data-service';
import { DomSanitizer } from '@angular/platform-browser';
import { StorageService } from './storage.service';
import { StoredPackage } from '../model/storage-types';


@Injectable({
  providedIn: 'root'
})
/**
 * Database for dynamic data. When expanding a node in the tree, the data source will need to fetch
 * the descendants data from the database.
 */
export class WorldModelService  implements TreeDataService {


  constructor(
    private messageService: MessageService,
    private sanitizer: DomSanitizer,
    private storage: StorageService) {
  }

  /** Initial data from database */
  initialData(): Observable<PackageTreeNode> {
    return this.getTreeNode('Modelica');
  }

  getTreeNode(nodeId: string):  Observable<PackageTreeNode>  {
    return this.storage.getPackage(nodeId)
    .pipe(
      mergeMap( result => iif( () => result != null,
      of(result).pipe(
        map(_package => new PackageTreeNode(_package.packageId,
        this.extractName(_package.packageId),
        this.sanitizer.bypassSecurityTrustHtml(_package.svgIcon),
        this.computeLevel(_package.packageId),
        this.getAllChildren(_package),
        false))
      ),
      this.storage.getComponent(nodeId).pipe(
        map(component => new PackageTreeNode(component.componentId,
          this.extractName(component.componentId),
          this.sanitizer.bypassSecurityTrustHtml(component.svgIcon),
          this.computeLevel(component.componentId),
          [],
          false)) )))
    );
  }
  getAllChildren(_package: StoredPackage): string[] {
    const children:  string[] = new Array();
    _package.packages.map((p) => p.packageId).forEach(pid => children.push(pid));
    _package.components.map((c) => c.componentId).forEach(cid => children.push(cid));
    return children;
  }

  private computeLevel(id: string): number {
    // ID has the following form: package1.package2.package3.model
    return id.split('.').length - 1;
  }

  private extractName(id: string): string {
    // ID has the following form: package1.package2.package3.model
    const splitted = id.split('.');
    return splitted[splitted.length - 1];
  }
}

