import { Component } from '@angular/core';
import 'rxjs/Rx';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

import '../public/css/styles.css';
import { PropsFileService } from './services/props-file.service';
import { TabUI, AppLink } from './interfaces/props-data';

@Component({
    selector: 'my-app',
    template: require('./app.component.html'),
    styles: [require('./app.component.css')],
    providers: [ PropsFileService ]
})


export class AppComponent {
    _appDir: string = document.location.pathname;
    _props: any = {'tab': [], 'appLink': [], initialized: false};
    _errorMessage: string = '';
    _propsFileService_subscription: any = null;
    _appTitle: string = '';

    constructor( private _propsFileService: PropsFileService ) {}

    ngOnInit() {
        this.getProps();
    }

    getProps() {

        if (this._props.initialized) {
            // already have properties - don't fetch again
            return;
        }

        this._propsFileService_subscription = this._propsFileService.getProps()
            .subscribe(
                properties => {
                    this.onJSONupdate_props(properties);
                },
                error => {
                    this._errorMessage = <any>error;
                }
            );
        if (this._errorMessage !== '') {
            // this._serverStatus = this._errorMessage;
            // this._refreshState = 'pending';
            alert( this._errorMessage );
        }

    }

    onJSONupdate_props( properties: any ) {
        if (typeof properties === 'object') {
            if (properties instanceof Array) {
                this._props = properties[0];
            } else {
                this._props = properties;
            }
            this._appTitle = this._props.instance.name;
            this.normalizePropToArray('tab');
            this.normalizePropToArray('appLink');

            this._props.initialized = true;
        }
    }

    normalizePropToArray(propName: string): any {
        // Normalize this._props[propName] so that it's always an
        // array of 0 or more elements.
        if (typeof this._props[propName] === 'object') {
            if (Array.isArray(this._props[propName])) {
                // Nothing to do
                return;
            } else {
                this._props[propName] = [ this._props[propName] ];
            }
        } else {
            this._props[propName] = [];
        }
    }

    myTabChanged(e:any) {
        // alert('Tab changed!');
    }
} 
