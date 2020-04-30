import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class Covid19BrazilApiService {

    constructor(
        private httpClient: HttpClient) { }

    /**
     * Get all confirmed COVID-19 cases in Brazil
     */
    getConfirmed(): Observable<any> {

        return this.httpClient
            .get<any>('https://covid19-brazil-api.now.sh/api/report/v1/', {
                headers: new HttpHeaders({
                    'Access-Control-Allow-Origin': '*'
                })
            });
    }

    /**
     * Get a summary COVID-19 cases in Brazil
     */
    getCountrySummary(): Observable<any> {

        return this.httpClient
            .get<any>('https://covid19-brazil-api.now.sh/api/report/v1/brazil', {
                headers: new HttpHeaders({
                    'Access-Control-Allow-Origin': '*'
                })
            });
    }

    /**
     * Get all confirmed COVID-19 cases around the world by Country
     */
    getWorldWide(): Observable<any> {

        return this.httpClient
            .get<any[]>('https://covid19-brazil-api.now.sh/api/report/v1/countries/', {
                headers: new HttpHeaders({
                    'Access-Control-Allow-Origin': '*'
                })
            });
    }
}
