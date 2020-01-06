export type StoredPackage = {
   id: number;
   packageId: string;
   description: string;
   svgIcon: string;
   packages: StoredPackage[];
   components: StoredComponent[];
};

export type StoredPackageInput = {
    id?: number;
    packageId: string;
    description?: string;
    svgIcon?: string;
    packages?: StoredPackageInput[];
    componentIds?: string[];
 };

 export type StoredPackageResponse = {
     package: StoredPackage
 }

 export type StoredUpdatePackageResponse = {
    updatePackage: StoredPackage
}

export type StoredComponent = {
   id?: number;
   componentId: string;
   description: string;
   svgContent: string;
   svgIcon: string;
   htmlDocumentation: string;
   parameters: string;
   portGroups: StoredPortGroup[];
};

export type StoredComponentResponse = {
    component: StoredComponent
}

export type StoredInstance = {
   id: number;
   name: String;
   parameters: string;
   component: StoredComponent;
};

export type StoredPortGroup = {
   name: string;
   svg: string;
   ports: StoredPort[];
};

export type StoredPort = {
   portId: string;
   x: number;
   y: number;
   // missing orientation
   description: string;
};
