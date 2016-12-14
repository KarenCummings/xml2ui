/**
 * Created by kcummings on 11/30/16.
 */
// import { MdDialog, MdDialogRef } from '@angular/material';
// import { Component, Optional }  from '@angular/core';
// @Component({
//     selector: 'app-tab',
//     templateUrl: 'app-tab.component.html'
//
// })
//
// export class AppTabComponent {}
import { Component, OnInit, Output, Input } from '@angular/core';
import { HttpModule } from '@angular/http';
import 'rxjs/Rx';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { Observable } from 'rxjs/Observable';

import '../public/css/styles.css';
// import { DataService } from './data.service';
import { Data_Summary } from './interfaces/data_summary';
// import { PropsFileService } from './services/props-file.service';
import { SystemSummaryService } from './services/system-summary.service';
import { NVPairList } from './interfaces/nv-pair-list';
import { TabUI, AppLink } from './interfaces/props-data';
import { PopupDialog } from './cmdsets/popup-dialog';
// import { PopupDialogProps } from './interfaces/popup-dialog-props';

@Component({
    selector: 'app-tab',
    template: require('./app-tab.component.html'),
    styles: [require('./app.component.css')],
    // providers: [ PropsFileService, SystemSummaryService, HttpModule, PopupDialog ]
    providers: [ SystemSummaryService, HttpModule, PopupDialog ]
})

export class AppTabComponent {
    @Input() _uiTab: TabUI;
    @Input() _props: any;

    // _propsFileService_subscription: any = null;

    _Data_Summaries: Data_Summary[];
    _Data_Summary: Data_Summary = new Data_Summary();
    _Data_Summary_Subscription: any = null;

    _errorMessage: string = '';
    _ticks = 0;
    _prevTicks = 0;

    _serverStatus: string;
    _autoRefresh: boolean = true;
    _autoRefreshLabel: string = 'Pause';
    _refreshState: string = 'pending';
    _cmdSets: any = [];

    constructor(
                private _systemSummaryService: SystemSummaryService) {
    }

    // onToggleAutoRefresh( autoRefresh: boolean ) {
    //     this._autoRefresh = autoRefresh;
    // }

    tabIsSelected(): boolean {
        let currentTab: any;
        currentTab = document.getElementsByClassName('md-tab-active');
        if (currentTab.length > 0) {
            return currentTab[0].innerText === this._uiTab.name;
        } else {
           return false;
        }
    }

    getData_Summaries() {
        if (this._autoRefresh) {
            this._refreshState = 'pending';
            this._serverStatus = 'connection pending';
        }

        if (this._Data_Summary_Subscription) {
            this._Data_Summary_Subscription.unsubscribe();
            this._Data_Summary_Subscription = null;
        }

        if (this.bypassRefreshCycle()) {
            return;
        }
        this._Data_Summary_Subscription = this._systemSummaryService.getData_Summaries(this._uiTab.dataUrl)
            .subscribe(
                Data_Summaries => {
                    this.onJSONupdate(Data_Summaries);
                },
                error => {
                    this._errorMessage = <any>error;
                }
            );
        if (this._errorMessage !== '') {
            this._serverStatus = this._errorMessage;
            this._refreshState = 'pending';
        }
        this.updateHeader();
    }

    bypassRefreshCycle(): boolean {
        return ( !(this._autoRefresh && this.tabIsSelected()
                   && this._uiTab && typeof this._uiTab === 'object'
                   && typeof this._uiTab['dataUrl'] === 'string'
                ));
    }

    normalizeSectionArray() {
        if (typeof this._Data_Summary === 'object') {
            if (typeof this._Data_Summary.Section === 'object') {
                if (!(this._Data_Summary.Section instanceof Array)) {
                    // Convert single object into array
                    this._Data_Summary.Section = [this._Data_Summary.Section];
                }
            }
        }
        return;
    }

    normalizeSectionChild( sectIdx: string, childName: string) {
        let key: string = childName;
        let dataSection = this._Data_Summary.Section[ sectIdx ];

        if (typeof this._Data_Summary === 'object') {
            if (typeof dataSection[key] === 'object') {
                if (!(dataSection[key] instanceof Array)) {
                    dataSection[key] = [dataSection[key]];
                }
                this._Data_Summary.Section[ sectIdx ] = dataSection;
                return;
            }
        }
        // If not set above
        dataSection[key] = [];
        this._Data_Summary.Section[ sectIdx ] = dataSection;

    }

    normalizeCommandSection( sectIdx: string, cmdsectName: string, cmdsectLabel: string) {
        let dataSection = this._Data_Summary.Section[ sectIdx ];
        if ( dataSection [cmdsectName] ) {
            if (! Array.isArray( dataSection[cmdsectName])) {
                dataSection[cmdsectName] = [ dataSection[cmdsectName] ]; // need to handle array of cmdset(s)
            }
            for ( let c in dataSection[cmdsectName] ) {
                let normalSection: NVPairList = new NVPairList;
                normalSection.label = cmdsectLabel;
                normalSection.u_id = dataSection[cmdsectName][c].u_id;
                normalSection.elements = [];
                normalSection.desc = dataSection[cmdsectName][c].name;

                let cmdArr = dataSection[cmdsectName][c].command;
                if ( ! Array.isArray(cmdArr) ) {
                    // Got a single command, instead of an array of commands
                    cmdArr = [cmdArr];
                }

                for (let i in cmdArr) {
                    if (cmdArr[i].hasOwnProperty('_input')) {
                        cmdArr[i]['controls'] = cmdArr[i]['_input'];
                        delete cmdArr[i]['_input'];
                        if ( ! Array.isArray(cmdArr[i]['controls']) ) {
                            // Got a single control, instead of an array of controls
                            cmdArr[i]['controls'] = [cmdArr[i]['controls']];
                        }
                    }
                    let e = {'name': i, 'command': cmdArr[i]};
                    normalSection.elements.push(e);
                }
                dataSection[cmdsectName][c] = normalSection;
            }
            this._Data_Summary.Section[ sectIdx ] = dataSection;
        }
    }

    onJSONupdate( Data_Summaries: any ) {
        if (typeof Data_Summaries === 'object') {
            this._serverStatus = 'Server connection okay';
            this._refreshState = 'indicatorOn';
            this._autoRefreshLabel = 'Pause';
            if (Data_Summaries instanceof Array) {
                if (Data_Summaries.length > 0) {
                    this._Data_Summaries = Data_Summaries;
                    this._Data_Summary = this._Data_Summaries[0];
                } else {
                    this._Data_Summaries = [];
                    this._Data_Summary = new Data_Summary();
                }
            } else {
                this._Data_Summaries = [this._Data_Summary];
                this._Data_Summary = this._Data_Summaries[0];
            }

            this.normalizeSectionArray();  // ensure that sections appear as an array
            if (typeof this._Data_Summary === 'object' &&
                typeof this._Data_Summary.Section === 'object') {

                for (let sectionIndex in this._Data_Summary.Section) {
                    if (this._Data_Summary.Section[sectionIndex].hasOwnProperty('CmdSet')) {
                        this.normalizeCommandSection(sectionIndex, 'CmdSet', 'CmdSet');
                    }
                    if (this._Data_Summary.Section[sectionIndex].hasOwnProperty('DataSets')) {
                        this.normalizeSectionChild(sectionIndex, 'DataSets');
                    }
                    if (this._Data_Summary.Section[sectionIndex].hasOwnProperty('Fault_List')) {
                        this.normalizeSectionChild(sectionIndex, 'Fault_List');
                    }
                }
            }
        }
        this.updateHeader();
    }

    updateHeader() {
        // update the title fields
        let el1 = document.getElementById('title-version');
        if (typeof el1 !== null ) {
            el1.innerHTML = this.getTitle() + '&nbsp;&nbsp;' + this.getVersion();
        }
        let el2 = document.getElementById('updateTime');
        if (typeof el2 !== null) {
            el2.innerHTML = this.getUpdateTime();
        }
        let el3 = document.getElementById('dbPulse');  //refresh button
        if (typeof el3 !== null) {
            el3['className'] = this._refreshState;
            el3['_tabRef'] = this;
            el3['onclick'] = function(e){ el3['_tabRef'].toggleAutoRefresh();};
            el3['value'] = this._autoRefreshLabel;
            el3['title'] = this._serverStatus;
        }
    }

    toggleAutoRefresh() {
        this._autoRefresh = !this._autoRefresh;

        if (this._autoRefresh) {
            this._autoRefreshLabel = "Pause";
            this._refreshState = "indicatorOn";
        } else {
            this._autoRefreshLabel = "Resume";
            this._refreshState = "indicatorOff";
            this._serverStatus = "updates paused";
        }
        this.updateHeader();
    }

    getUpdateTime() {
        var dTime = "";

        if (typeof this._Data_Summary === "object" && typeof this._Data_Summary.timeStamp === "object") {
            // Based on update_time_display from VTS_main.html.
            var system_utc = new Date();
            system_utc.setTime(this._Data_Summary.timeStamp.value);
            dTime = system_utc.toDateString() + ", " + system_utc.toLocaleTimeString();
        }

        return dTime;
    }

    getVersion() {
        var dVersion = "";
        if (typeof this._Data_Summary === "object" && typeof this._Data_Summary.Version === "object")
        {
            dVersion= this._Data_Summary.Version.value;
        }
        return dVersion;
    }

    getTitle() {
        var dTitle = "";
        if (typeof this._Data_Summary === "object" && typeof this._Data_Summary.Title === "object")
        {
            dTitle= this._Data_Summary.Title.value;
        }
        return dTitle;
    }


    ngOnInit() {
        this._autoRefresh = true;
        let timer = Observable.timer(100, 1000);
        timer.subscribe(t => {
            this._ticks = t;
        });
        if (this.tabIsSelected()) {
            this.getData_Summaries();
        }
    }

    ngDoCheck() {
        if ( this._autoRefreshLabel === 'Pause' ) {
            this._autoRefresh = true;
        }

        if (this._ticks > this._prevTicks + 1) {
            if (this.tabIsSelected()) {
                if (this._uiTab !== null) {
                    this.getData_Summaries();
                    this.updateHeader();
                }
            } else {
                this._autoRefresh = false;
            }
            this._prevTicks = this._ticks;
        }
    }
}

