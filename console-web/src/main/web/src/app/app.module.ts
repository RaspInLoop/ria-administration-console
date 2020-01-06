import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { PropertiesComponent } from './properties/properties.component';
import { MenuComponent } from './menu/menu.component';
import { StatusComponent } from './status/status.component';
import { HardwareEditorComponent } from './hardware-editor/hardware-editor.component';
import { MessageService } from './services/message.service';
import { GraphService } from './services/graph.service';
import { PackageService } from './services/package.service';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MaterialModule} from './material.module';
import { WorldModelTreeComponent } from './world-model-tree/world-model-tree.component';
import { BoardHardwareTreeComponent } from './board-hardware-tree/board-hardware-tree.component';
import { BoardHardwareService } from './services/board-hardware.service';
import { ModelicaTreeComponent } from './modelica-tree/modelica-tree.component';
import { ModelicaTreeDialogComponent } from './modelica-tree-dialog';
import { ApolloModule } from 'apollo-angular';
import { HttpLinkModule } from 'apollo-angular-link-http';
import { StorageService } from './services/storage.service';

@NgModule({
  declarations: [
    AppComponent,
    PropertiesComponent,
    MenuComponent,
    StatusComponent,
    HardwareEditorComponent,
    WorldModelTreeComponent,
    BoardHardwareTreeComponent,
    ModelicaTreeComponent,
    ModelicaTreeDialogComponent
  ],
  entryComponents: [ModelicaTreeDialogComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MaterialModule,
    ApolloModule,
    HttpLinkModule,
    HttpClientModule
  ],
  providers: [
     GraphService,
     MessageService,
     PackageService,
     StorageService,
     BoardHardwareService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
