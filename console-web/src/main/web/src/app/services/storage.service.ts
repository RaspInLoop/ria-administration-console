import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { HttpLink } from 'apollo-angular-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';
import gql from 'graphql-tag';
import { Observable, of, throwError } from 'rxjs';
import { StoredPackage,
         StoredComponent,
         StoredPackageInput,
         StoredPackageResponse,
         StoredComponentResponse,
         StoredUpdatePackageResponse } from '../model/storage-types';
import { map, flatMap, catchError, tap } from 'rxjs/operators';

const getPackageQuery = gql`query getpackage( $input:  String!) {
  package(packageId: $input){
    id
    packageId
    description
    svgIcon
    packages {
      packageId
    }
    components {
      componentId
    }
  }
}`;

const storePackageQuery = gql`mutation($package: PackageInput!){
  updatePackage(pack: $package){
    id,
    packageId
  }
}`;

const storeComponentQuery = gql`mutation($component: ComponentInput!){
  updateComponent(component: $component){
    id,
    componentId
  }
}`;

const getComponentQuery = gql`query  getComponent($input: String!) {
  component(componentId: $input){
    componentId
    description
    svgContent
    svgIcon
    htmlDocumentation
    parameters
    portGroups {
        name
        svg
        ports{
          portId
          x
          y
          description
        }
    }
  }
}`;



@Injectable({
  providedIn: 'root'
})
export class StorageService {

  constructor(private apollo: Apollo, httpLink: HttpLink) {
    apollo.create({
      link: httpLink.create({ uri: '/storage/graphql' }),
      cache: new InMemoryCache({
        dataIdFromObject: object => {
          switch (object.__typename) {
            case 'StoredPackage':
            case 'StoredComponent':
            case 'StoredPackageInput': return (<any>object).packageId;
            default: return object.id ; // fall back to `id` and `_id` for all other types
          }
        }
      })
    });
  }



  public getPackage(packageId: string): Observable<StoredPackage> {
    return this.apollo.query<StoredPackageResponse>({
      query: getPackageQuery,
      variables: { input: packageId }
    })
    .pipe(
      map(result => result.data.package)
    );
  }

  public getComponent(componentId: string): Observable<StoredComponent> {
    return this.apollo.query<StoredComponentResponse>({
      query: getComponentQuery,
      variables: { input: componentId }
    })
    .pipe(
      map(result => result.data.component)
    );
  }

  public storePackage(inputPackage: StoredPackageInput): Observable<StoredPackage> {
    return this.apollo.mutate<StoredUpdatePackageResponse>({
      mutation: storePackageQuery,
      refetchQueries: [{
        query: getPackageQuery,
        variables: { input: inputPackage.packageId},
      }],
      variables: {package: inputPackage}
    }).pipe(
      tap( (result) => {console.log('store package[' + inputPackage.packageId + ']: ' , result); } ),
      map(result => result.data.updatePackage),
      catchError( err => {
        console.log('unable to store package[' + inputPackage.packageId + ']' , err);
        return throwError(err);
      } )
    );
  }

  public storeComponent(comp: StoredComponent): Observable<StoredComponent> {
    return this.apollo.mutate<StoredComponentResponse>({
      mutation: storeComponentQuery,
      refetchQueries: [{
        query: getComponentQuery,
        variables: { input: comp.componentId},
      }],
      variables: {component: comp}
    }).pipe(
      tap( (result) => {console.log('store component[' + comp.componentId + '] :', result); } ),
      map(result => result.data.component),
      catchError( err => {
        console.log('unable to store component[' + comp.componentId + ']' , err);
        return throwError(err);
      } )
    );
  }

}
