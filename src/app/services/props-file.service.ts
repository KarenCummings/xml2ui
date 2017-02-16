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
import { XmlToJsonConverter } from '../../tools/xml-to-json-converter';

@Injectable()
export class PropsFileService {
    _props:any = null;

    constructor (private http: Http) { }

    getProps(): Observable<string[]> {
        return this.http.get(window.location.pathname + 'php/get_props_file.php')
            .map(this.extractProps)
            .catch(this.handlePropsFileXmlError);
    }

    private extractProps(res: Response) {
        if (res.status < 200 || res.status >= 300) {
            throw new Error('Bad response status: ' + res.status);
        }

        let xmlConverter = new XmlToJsonConverter();

        let jsonText = xmlConverter.xml2json(res.text(), '  ');
        /*
        let offset = 130;
        window["myRight"] = jsonText.substr(offset, 10);
        prompt("right", window["myRight"]);
        window["myLeft"] = jsonText.substr(0, offset);
        prompt("left", window["myLeft"]);
        prompt("jsonText", jsonText);
        */

        let body = JSON.parse(jsonText);
        if (  typeof body.AppInfo === "object"
           && typeof body.AppInfo.props === "object") {
            this._props = [body.AppInfo.props];
        } else {
            this._props = [];
        }

        return this._props;
    }

    private handlePropsFileXmlError(error: any) {
        let errMsg = error.message || 'Server error';
        console.error(errMsg); // log to console
        return Observable.throw(errMsg);
    }

}
