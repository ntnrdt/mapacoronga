import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MapComponent } from './map/map.component';
import { Covid19BrazilApiService } from './common/covid19-brazil-api.service';
import { HttpClientModule } from '@angular/common/http';
import { CoordinatesService } from './map/shared/coordinates.service';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule} from 'ngx-toastr';
import { CarouselComponent } from './carousel/carousel.component';
import { SummaryComponent } from './summary/summary.component';
import { FooterComponent } from './footer/footer.component';
import { HeaderComponent } from './header/header.component';
import { CovidSaudeGovBrService } from './common/covid.saude.gov.br.service';
import { TimelineComponent } from './timeline/timeline.component';
import { StatesComponent } from './states/states.component';
import { DemographicsService } from './common/demographics.service';
import { LinksComponent } from './links/links.component';
import { IntroComponent } from './intro/intro.component';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,
    MapComponent,
    CarouselComponent,
    SummaryComponent,
    TimelineComponent,
    StatesComponent,
    LinksComponent,
    IntroComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    NgxSpinnerModule,
    BrowserAnimationsModule,
    ToastrModule.forRoot({
      timeOut: 10000,
      positionClass: 'toast-top-right',
      preventDuplicates: true,
    })
    ],
  providers: [
    Covid19BrazilApiService,
    CovidSaudeGovBrService,
    DemographicsService,
    CoordinatesService,
    NgxSpinnerService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
