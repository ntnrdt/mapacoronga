import { Component, OnInit } from '@angular/core';
import { DemographicsService } from '../common/demographics.service';
import { Covid19BrazilApiService } from '../common/covid19-brazil-api.service';

declare let calculatePercentage: any;

@Component({
    selector: 'app-states',
    templateUrl: './states.component.html',
    styleUrls: [`states.component.css`]
})
export class StatesComponent implements OnInit {
    summaryItems = []
    constructor(
        private demographicsService: DemographicsService, 
        private covidService: Covid19BrazilApiService){
    }

    ngOnInit() {
        this.covidService.getConfirmed()
            .subscribe(res=> {
                if (res && res.data){
                    
                    let population = this.demographicsService.getPopulation();

                    res.data.forEach(item=> {
                        this.summaryItems.push({
                            name: item.state,
                            code: item.uf,
                            population: population.states.find(x=> x.name === item.state).qty,
                            confirmed: item.cases,
                            deaths: item.deaths,
                            qty: ((item.cases / 100000) * 100).toFixed(2).toString().replace(',', '.')
                        })
                    })
                }
            })
    }
}