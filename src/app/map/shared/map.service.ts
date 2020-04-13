import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { IPortalMapModel } from 'src/app/models/portal.map.model';
import { Observable } from 'rxjs';

@Injectable()
export class MapService {
    constructor(
        private httpClient: HttpClient) { }

    getCases(): Observable<IPortalMapModel> {

        return this.httpClient
            .get<IPortalMapModel>('{{SOURCE-DOMAIN}}}', {
                headers: new HttpHeaders({
                    'Access-Control-Allow-Origin': '*'
                })
            });
    }

    getCasesRecovered(): Observable<any[]> {

        return this.httpClient
            .get<any[]>('{{SOURCE-DOMAIN}}}', {
                headers: new HttpHeaders({
                    'Access-Control-Allow-Origin': '*'
                })
            });
    }
}