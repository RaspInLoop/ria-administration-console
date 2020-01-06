import { Observable } from 'rxjs';
import { SafeHtml } from '@angular/platform-browser';

/** Flat node with expandable and level information */
export class PackageTreeNode {
    constructor(public id: string,
                public item: string,
                public icon: SafeHtml,
                public level = 0,
                public childrenIds: string[],
                public isLoading = false) {}
  }

export interface TreeDataService {
  getTreeNode(id: string): Observable<PackageTreeNode>;
  initialData(): Observable<PackageTreeNode>;
}
