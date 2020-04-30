import { Component, OnInit } from '@angular/core';
import { Covid19BrazilApiService } from '../common/covid19-brazil-api.service';

@Component({
  selector: 'app-carousel',
  templateUrl: './carousel.component.html',
  styleUrls: ['./carousel.component.css']
})
export class CarouselComponent implements OnInit {
  worldWideCases: any;
  worldWideConfirmed: number = 0;
  worldWideRecovers: number = 0;
  worldWideDeaths: number = 0;

  constructor(private covidCasesService: Covid19BrazilApiService) { }

  ngOnInit(): void {
    this.covidCasesService.getWorldWide()
      .subscribe(resp => {
        if (resp && resp.data) {
          this.worldWideCases = resp.data;

          this.worldWideCases.forEach(element => {
            this.worldWideConfirmed += element.confirmed ?? 0;
            this.worldWideRecovers += element.recovered ?? 0;
            this.worldWideDeaths += element.deaths ?? 0;
          });
        }
      })
  }
}
