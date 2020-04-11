import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MapComponent } from './map/map.component';
import { MapService } from './map/shared/map.service';
import { HttpClientModule } from '@angular/common/http';
import { CoordinatesService } from './map/shared/coordinates.service';

@NgModule({
  declarations: [
    AppComponent,
    MapComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule
  ],
  providers: [
    MapService,
    CoordinatesService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
