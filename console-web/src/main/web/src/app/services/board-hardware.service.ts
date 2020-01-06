import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { MessageService } from './message.service';
import {Package} from '../model/model';
import {TreeDataService, PackageTreeNode} from './tree-data-service';
import { DomSanitizer } from '@angular/platform-browser';

interface PackageJSON {
  name: string;
  description: string;
  id: string;
  svgIcon: string;
  packagesNames?: string[];
  componentsName?: string[];
}

@Injectable({
  providedIn: 'root'
})
/**
 * Database for dynamic data. When expanding a node in the tree, the data source will need to fetch
 * the descendants data from the database.
 */
export class BoardHardwareService  implements TreeDataService {
  // map package ID with package
  dataMap = new Map<string, Package>();

  constructor( private messageService: MessageService, private sanitizer: DomSanitizer) {
    this.dataMap.set('raspberry', {name: 'RaspberryPi',
                                   icon: this.sanitizer.bypassSecurityTrustHtml('<svg/>'),
                                   id: 'raspberry',
                                   description: 'The RaspberryPi Board rev 3',
                                   childIds:['raspberry.extensions'],
                                   componentIds: []   });
    this.dataMap.set('raspberry.extensions', {name: 'Extensions',
                                   icon: this.sanitizer.bypassSecurityTrustHtml('<svg/>'),
                                   id: 'raspberry.extensions',
                                   description: 'The Extension card for RaspberryPi',
                                   childIds: ['raspberry.extensions.motor', 'raspberry.extensions.thermometer'],
                                   componentIds: []   });
    this.dataMap.set('raspberry.extensions.motor', {name: 'Motor',
                                   icon: this.sanitizer.bypassSecurityTrustHtml('<svg/>'),
                                   id: 'raspberry.extensions.motor',
                                   description: 'The Motor',
                                   childIds: [],
                                   componentIds: []   });
    this.dataMap.set('raspberry.extensions.thermometer', {name: 'Thermometer',
                                   icon: this.sanitizer.bypassSecurityTrustHtml('<svg/>'),
                                   id: 'raspberry.extensions.thermometer',
                                   description: 'The thermometer',
                                   childIds: [],
                                   componentIds: []   });
  }

  /** Initial data from database */
  initialData(): Observable<PackageTreeNode> {
    return this.getTreeNode('raspberry');
  }

  getTreeNode(nodeId: string):  Observable<PackageTreeNode>  {
    if (this.dataMap.has(nodeId)) {
      const _package = this.dataMap.get(nodeId);
      return of (new PackageTreeNode(_package.id,
          _package.name,
          _package.icon,
          this.computeLevel(_package.id),
          _package.childIds,
          false));
    } else {
      return of(new PackageTreeNode('',
      'Unknown',
      this.sanitizer.bypassSecurityTrustHtml( '<svg/>'),
      0,
      []));
    }
  }

  private computeLevel(id: string): number {
    // ID has the following form: package1.package2.package3.model
    return id.split('.').length - 1;
  }
}

