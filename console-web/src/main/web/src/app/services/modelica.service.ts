import { Injectable, SecurityContext } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MessageService } from './message.service';
import { catchError, map, tap } from 'rxjs/operators';
import {Component, Point, Size, Port, Parameters, PortGroup, Package} from '../model/model';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';




interface ComponentJSON {
    id: string;
    name: string;
    svgIcon: string;
    position: Point;
    size: Size;
    portGroups: PortGroupJSON[];
    description: string;
    htmlDocumentation: string;
    parameters?: Parameters[];
}

interface PortGroupJSON{
  ports: Port[];
  definition: PortGroupDefinitionJSON;
}

interface PortGroupDefinitionJSON {
  name: string;
  svg: string;
}

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
export class ModelicaService {

    // map componnent ID with Component
  componentsMap = new Map<string, Component>();
    // map package ID with package
  packagesMap = new Map<string, Package>();
  private modelicaServiceUrl = '/modelicamodel';  // URL to web api

  constructor(
    private http: HttpClient,
    private messageService: MessageService,
    private sanitizer: DomSanitizer) {
    }

  public getComponent(nodeId: string):  Observable<Component>  {
    if (!this.componentsMap.has(nodeId)) {
      return this.getComponentAndStore(nodeId);
    } else {
      return of(this.componentsMap.get(nodeId));
    }
  }

  private getComponentAndStore(nodeId: string): Observable<Component>{
    const url = `${this.modelicaServiceUrl}/component/${nodeId}`;
    return this.http.get<any>(url)
    .pipe(
      map(apiResult => this.storeComponentAndConvert(apiResult)),
      catchError(this.handleError<Component>('getComponent',
                                                    {id: '',
                                                     name: 'Unknown',
                                                     svgContent: '<svg/>',
                                                     position: {x: 0, y: 0},
                                                     size: {width: 0, height: 0},
                                                     portGroups: [],
                                                     description: '',
                                                     htmlDocumentation: '',
                                                     parameters: []})
    ));
  }

  private storeComponentAndConvert(apiResult: ComponentJSON): Component {
    const component = this.buildComponent(apiResult);
    this.componentsMap.set(component.id, component);
    return component;
  }

  private buildComponent(componentJSON: ComponentJSON): Component {
    let parameters: Parameters[];
    if (componentJSON.parameters !== undefined) {
      parameters = componentJSON.parameters;
    }

    let portGroups: PortGroup[];
    if (componentJSON.portGroups !== undefined) {
      portGroups = componentJSON.portGroups.map(p => Object.assign({}, p, {
        definition:  {name: p.definition.name,
                      svg:  p.definition.svg .replace(/\<\?xml.+\?\>|\<\!DOCTYPE.+]\>/g, '')}
         })
      );
    }
    return Object.assign({}, componentJSON, {
      svgContent: componentJSON.svgIcon.replace(/\<\?xml.+\?\>|\<\!DOCTYPE.+]\>/g, ''), // TODO: remove script
      portGroups: portGroups,
      parameters: parameters
    });
  }

  public getPackage(nodeId: string):  Observable<Package>  {
    if (!this.packagesMap.has(nodeId)) {
      return this.getPackageAndStore(nodeId);
    } else {
      return of(this.packagesMap.get(nodeId));
    }
  }

  private getPackageAndStore(nodeId: string): Observable<Package> {
    const url = `${this.modelicaServiceUrl}/package/${nodeId}`;
    return this.http.get<any>(url)
    .pipe(
      map(result => this.storePackageAndConvert(result))
    );
  }

  private storePackageAndConvert(apiResult: PackageJSON): Package {
    const _package = this.buildPackage(apiResult);
    this.packagesMap.set(_package.id, _package);
    return _package;
  }

  private buildPackage(packageJSON: PackageJSON): Package {
    let componentIds: string [];
    let childsIds: string [];
    if (packageJSON.packagesNames !== undefined) {
      childsIds = packageJSON.packagesNames.map(p => packageJSON.id + '.' + p);
    }
    if (packageJSON.componentsName !== undefined) {
      componentIds = packageJSON.componentsName.map(c => packageJSON.id + '.' + c);
    }

    return Object.assign({}, packageJSON, {
      icon: this.sanitizer.bypassSecurityTrustHtml(packageJSON.svgIcon), // TODO: remove script
      childIds: childsIds,
      componentIds: componentIds
    });
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
