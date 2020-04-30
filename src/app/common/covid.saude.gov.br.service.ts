import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable()
export class CovidSaudeGovBrService {
    constructor(private http: HttpClient) {

    }

    getAggregatedCasesTimeline() {
        return this.http.get<any>
            ('{{YOUR-ENDPOINT-GOES-HERE}}');
    }
}