/*
* Created by jscarsdale on 5/13/16.
 *
 *
 * Get XML data stream from the server and convert to JSON.
 *
 */

import { Injectable }     from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Observable }      from 'rxjs/Observable';
import 'rxjs/Rx';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

import { Data_Summary } from '../interfaces/data_summary';
import { XmlToJsonConverter } from '../../tools/xml-to-json-converter';

@Injectable()
export class SystemSummaryService {

    constructor (private http: Http) { }

    _Data_Summaries: Data_Summary[] = [];

    getData_Summaries(svcUrl:string): Observable<Data_Summary[]> {
        return this.http.get(svcUrl)
            .map(this.extractData)
            .catch(this.handleError);
    }

    getData_Summary() {
        return this._Data_Summaries[0];
    }

    private extractData(res: Response) {
        if (res.status < 200 || res.status >= 300) {
            throw new Error('Bad response status: ' + res.status);
        }

        let xmlConverter = new XmlToJsonConverter();

        let jsonText = xmlConverter.xml2json(res.text(), '  ');
        let body = JSON.parse(jsonText);

        // we don't know what the data header will be, so make it Data_Summary going forward
        let summaryTag = Object.keys(body)[0];
        if ( summaryTag !== "Data_Summary" ) {
            body.Data_Summary = body[ summaryTag ] ;
            delete body[ summaryTag ];
        }

        if (typeof body.Data_Summary === "object") {
            if ((typeof body.Data_Summary.status == "object") && (body.Data_Summary.status.value != 0)) {
                throw new Error("Bad query status: " + body.Data_Summary.status.value);
            }
            this._Data_Summaries = [body.Data_Summary];
        } else {
            this._Data_Summaries = [];
        }

        return this._Data_Summaries;
    }

    private handleError(error: any) {
        let errMsg = error.message || 'Server error';
        console.error(errMsg); // log to console
        return Observable.throw(errMsg);
    }
}
