import { Component, OnInit } from "@angular/core";
import { Covid19BrazilApiService } from '../common/covid19-brazil-api.service';
import { ToastrService } from 'ngx-toastr';

declare let calculatePercentage: any;
declare let numberToDecimalAsString: any;

@Component({
    selector: 'app-summary',
    templateUrl: 'summary.component.html',
    styleUrls: ['summary.component.css']
})
export class SummaryComponent implements OnInit {
    summaryUpdatedAt: string;
    summaryBoxes = [
        {
            title: 'Confirmados',
            class: 'confirmed',
            qty: ''
        },
        {
            title: 'Recuperados',
            class: 'recovered',
            qty: ''
        },
        {
            title: 'Óbitos',
            class: 'deaths',
            qty: ''
        },
        {
            title: 'Letalidade',
            class: 'deadly',
            qty: ''
        }
    ];

    constructor(
        private covidCasesService: Covid19BrazilApiService,
        private toastr: ToastrService) { }

    ngOnInit() {

        this.covidCasesService.getCountrySummary()
            .subscribe(resp => {

                if (resp && resp.data) {

                    this.summaryUpdatedAt = resp.data.updated_at;

                    // confirmed cases
                    this.summaryBoxes[0].qty = resp.data.confirmed.toLocaleString('pt-BR');

                    // recovered
                    this.summaryBoxes[1].qty = resp.data.recovered.toLocaleString('pt-BR');

                    // deaths
                    this.summaryBoxes[2].qty = resp.data.deaths.toLocaleString('pt-BR');

                    // deadly
                    this.summaryBoxes[3].qty = calculatePercentage(this.summaryBoxes[2].qty, this.summaryBoxes[0].qty) + '%';

                    // update triangle
                    document.getElementById('update-at').innerText = this.convertDateToString(new Date(this.summaryUpdatedAt));
                }
            }, error => {
                this.toastr.warning(`Fonte de dados está indisponível, tente novamente mais tarde.`, 'ATENÇÃO');
            });
    }

    private convertDateToString(date){
        return `${date.getDate()}/${date.getMonth() +1}/${date.getFullYear().toString().substring(2)} ${date.getHours()}:${date.getMinutes()}`
    }
}