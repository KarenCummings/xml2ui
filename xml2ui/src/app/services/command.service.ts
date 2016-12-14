/**
 * Created by jscarsdale on 5/13/16.
 *
 *
 * Get a single Battery Summary the web server.
 *
 */

import { Injectable }     from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Observable }      from 'rxjs/Observable';
import { XmlToJsonConverter } from '../../tools/xml-to-json-converter';

import 'rxjs/Rx';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

@Injectable()
export class CommandService {
    constructor (private http: Http) { }

    _response: any[] = [];

    sendCommand(svcURL:string, xmlCommand:string): Observable<string[]> {
        let headers = new Headers({'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'});
        let options = new RequestOptions({ headers: headers });
        let body = '<?xml version="1.0" encoding="UTF-8"?>\n' + xmlCommand;

        return this.http.post(svcURL, body, options)
            .map(this.extractData)
            .catch(this.handleError);
    }

    private extractData(res: Response) {
        if (res.status < 200 || res.status >= 300) {
            throw new Error('Bad response status: ' + res.status);
        }
        try {
            let xmlConverter = new XmlToJsonConverter();
            let jsonText = xmlConverter.xml2json(res.text(), '  ');
            let body = JSON.parse(jsonText);
            if ((typeof body.response.status == "object") && (body.response.status.value != 0)) {
                alert("Error processing command:\n" + res.text());
                throw new Error("Bad query status: " + body.response.status.value);
            }

            this._response = typeof body.response == "object" ? [body.response]: [];

        } finally {

        }

        return this._response;
    }

    private handleError(error: any) {
        let errMsg = error.message || 'Server error';
        console.error(errMsg); /* log to console */
        return Observable.throw(errMsg);
    }
}
