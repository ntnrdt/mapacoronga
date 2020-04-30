import { Component, OnInit } from '@angular/core';
import { CovidSaudeGovBrService } from '../common/covid.saude.gov.br.service';

declare let kFormatter: any;
declare let document: any;
declare let Chart: any;

@Component({
    selector: 'app-timeline',
    templateUrl: 'timeline.component.html',
    styleUrls: [`timeline.component.css`]
})
export class TimelineComponent implements OnInit {
    casesToBeProjected = [];
    qtyDaysToProject = 7;

    constructor(private covidService: CovidSaudeGovBrService) { }

    ngOnInit() {

        this.covidService.getAggregatedCasesTimeline()
            .subscribe(data => {

                let qtySlice = this.getQtyToPresentBasedOnSreenSize();

                data.results = qtySlice > 0 ?
                    data.results.slice(Math.max(data.results.length - qtySlice, 0)) :
                    data.results;

                this.casesToBeProjected = data.results.slice();

                this.projectCases(this.casesToBeProjected);
                this.projectLabels(this.casesToBeProjected);

                this.loadChart(data.results);
            });
    }

    /**
    * Based on the screen size, defines the amount of data to present in the timeline.
    */
    private getQtyToPresentBasedOnSreenSize() {

        let qtySlice = 0;
        let screenW = document.body.clientWidth;

        if (screenW < 576) { // xs
            qtySlice = 8;
        } else if (screenW < 767) { // sm
            qtySlice = 12;
        } else {
            qtySlice = 0;
        }

        return qtySlice;
    }

    /**
     * Giving the original cases and using the projected cases, build the chart.
     * @param originalCases 
     * @param projectedCases 
     */
    private loadChart(originalCases: any[]) {
        Chart.defaults.global.legend.labels.usePointStyle = true;
        Chart.defaults.global.tooltips.custom = function (tooltip) {
            if (tooltip.body) {
                for (let i = 0; i < tooltip.body.length; i++) {
                    let details = tooltip.body[i].lines[0].split(':');
                    details[1] = ` ${kFormatter(details[1].trim())}`;
                    tooltip.body[i].lines[0] = details.join(':');
                }
            }
        }

        let ctx = document.createElement('canvas');
        let div = document.getElementById('aggregated-chart');
        div.appendChild(ctx);

        // if it's a small size screen
        if (document.body.clientWidth < 576) {
            ctx.height = 100;
            ctx.width = 100;
        } else { 
            ctx.height = 40;
            ctx.width = 100;
        }

        new Chart(ctx.getContext('2d'), {
            type: 'line',
            data: {
                labels: this.casesToBeProjected.map(x => x.label),
                datasets: [{
                    label: 'Confirm.',
                    data: originalCases.map(x => x.qtd_confirmado),
                    backgroundColor: '#89a0b360',
                    borderColor: '#89a0b3',
                    pointBackgroundColor: '#89a0b3',
                    pointBorderColor: '#89a0b3',
                    borderWidth: 3
                },
                {
                    label: 'Confirm. (P)',
                    data: this.casesToBeProjected.map(x => x.qtd_confirmado),
                    backgroundColor: '#89a0b330',
                    borderColor: '#89a0b330',
                    borderDash: [10, 7],
                    pointBackgroundColor: '#89a0b330',
                    pointBorderColor: '#89a0b330',
                    borderWidth: 3
                },
                {
                    label: 'Óbitos',
                    data: originalCases.map(x => x.qtd_obito),
                    borderColor: '#003f63',
                    backgroundColor: '#003f6390',
                    pointBackgroundColor: '#003f63',
                    pointBorderColor: '#003f63',
                    borderWidth: 3
                },
                {
                    label: 'Óbitos (P)',
                    data: this.casesToBeProjected.map(x => x.qtd_obito),
                    borderColor: '#003f6330',
                    backgroundColor: '#003f6330',
                    borderDash: [10, 7],
                    pointBackgroundColor: '#003f6330',
                    pointBorderColor: '#003f6330',
                    borderWidth: 3
                }]
            },
            options: {
                maintainAspectRatio: true,
                layout: {
                    padding: {
                        left: 15,
                        right: 30,
                        top: 30,
                        bottom: 20
                    }
                },
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero: true,
                            callback: function (value, index, values) {
                                return kFormatter(value);
                            }
                        },
                        major: {
                            ticks: {
                                lineHeight: 0.3
                            }
                        }
                    }]
                },
                legend: {
                    position: 'bottom'
                },
                elements: {
                    point: {
                        radius: 0
                    }
                }
            }
        });
    }

    /**
     * Do the projection of cases.
     * @param cases Cases array.
     */
    private projectCases(cases: any[]) {

        let pctIncreased = this.getPercentageIncreasedFromPreviousDate(cases);
        let avgIncreased = this.getAverageFromPctIncreased(pctIncreased);

        for (let i = pctIncreased.confirmed.length - 1; i > 0; i--) {
            let item = this.casesToBeProjected[this.casesToBeProjected.length - 1];

            this.casesToBeProjected.push({
                qtd_confirmado: this.increaseByPct(avgIncreased.confirmed, item.qtd_confirmado),
                qtd_obito: this.increaseByPct(avgIncreased.deaths, item.qtd_obito)
            });
        }
    }

    /**
     * Get the percentage of increased cases based on the previous date.
     * @param cases Cases array.
     */
    private getPercentageIncreasedFromPreviousDate(cases: any[]) {
        let confirmed = [];
        let deaths = [];

        for (let i = cases.length - 1; i > cases.length - (this.qtyDaysToProject + 2); i--) {
            if (i < cases.length - 1) {
                confirmed.push(this.calculateIncreasePercentageFromPreviousDate(cases, i, 'qtd_confirmado'));
                deaths.push(this.calculateIncreasePercentageFromPreviousDate(cases, i, 'qtd_obito'));
            }
        }

        return { confirmed, deaths };
    }

    /**
     * Creates the projection Dates.
     * @param cases Array of cases to be projected.
     */
    private projectLabels(cases) {

        let latestCase = cases.filter(x => x.label).reverse()[0];
        let labelDate = latestCase.label.split('/');
        let latestDataCreatedAt = new Date(latestCase.createdAt);
        let latestFullDate = new Date(`${labelDate[1]}/${labelDate[0]}/${latestDataCreatedAt.getFullYear()}`);

        for (var i = this.qtyDaysToProject; i > 0; i--) {
            let date = new Date(latestFullDate.setDate(latestFullDate.getDate() + 1));
            cases[cases.length - i].label = date.getDate() + '/' + ("0" + (date.getMonth() + 1)).slice(-2);
        }
    }

    /**
     * Giving the cases, calculates its average.
     * @param cases 
     */
    private getAverageFromPctIncreased(cases) {
        return {
            confirmed: (cases.confirmed.sort()[0] + cases.confirmed.sort().reverse()[0]) / 2,
            deaths: (cases.deaths.sort()[0] + cases.deaths.sort().reverse()[0]) / 2
        }
    }

    /**
     * Giving the array of cases, the current position counter, and the property to be checked, calculates the difference in percentage.
     * @param cases 
     * @param counter 
     * @param property 
     */
    private calculateIncreasePercentageFromPreviousDate(cases: any[], counter: number, property: string) {
        return this.calculateIncreasePct((cases[counter + 1][property] - cases[counter][property]), cases[counter + 1][property]);
    }

    /**
     * Calculates what was the percentage based on 2 values.
     * @param fraction Fraction to be calculated againts the Total value.
     * @param total Total.
     */
    private calculateIncreasePct(fraction: number, total: number) {
        return ((fraction / total) * 100);
    }

    /**
     * Returns the increase of a value based on the percentage provided.
     * @param pct Percentage to be used for the increase.
     * @param total Value to be increased.
     */
    private increaseByPct(pct, total) {
        return Math.round((pct / 100) * total) + total;
    }
}