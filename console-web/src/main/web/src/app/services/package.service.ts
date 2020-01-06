import { Injectable, SecurityContext } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MessageService } from './message.service';
import { catchError, map, tap } from 'rxjs/operators';
import {Package} from '../model/model';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import {TreeDataService, PackageTreeNode} from './tree-data-service';
import { ModelicaService } from './modelica.service';

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
export class PackageService  implements TreeDataService {


  constructor(private modelicaService: ModelicaService,
              private messageService: MessageService,
              private sanitizer: DomSanitizer ) {
  }

  rootLevelNodes: string[] = ['Modelica'];

  /** Initial data from database */
  initialData(): Observable<PackageTreeNode> {
    return this.getTreeNode('Modelica');
  }

  getTreeNode(nodeId: string):  Observable<PackageTreeNode>  {
    return this.modelicaService.getPackage(nodeId)
      .pipe(
        map(result => this.convert(result)),
        catchError(this.handleError<PackageTreeNode>('getPackage',
                                                      new PackageTreeNode('',
                                                        'Unknown',
                                                        this.sanitizer.bypassSecurityTrustHtml( '<svg/>'),
                                                        0,
                                                        [])))
      );
  }

  private convert(_package: Package): PackageTreeNode {
    if (_package.childIds === undefined) {
      _package.childIds = [];
    }
    return new PackageTreeNode(_package.id,
            _package.name,
            _package.icon,
            this.computeLevel(_package.id),
            _package.childIds.concat(_package.componentIds),
             false);
  }

  private computeLevel(id: string): number {
    // ID has the following form: package1.package2.package3.model
    return id.split('.').length - 1;
  }

  /**
   * Handle Http operation that failed.
   * Let the app continue.
   * @param operation - name of the operation that failed
   * @param result - optional value to return as the observable result
   */
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {

      // TODO: send the error to remote logging infrastructure
      console.error(error); // log to console instead

      this.messageService.add(`${operation} failed: ${error.message}`);

      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }
}

