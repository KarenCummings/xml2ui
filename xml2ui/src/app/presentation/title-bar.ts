/**
 * Created by kcummings on 10/17/16.
 */
import { Component, Input, EventEmitter, Output} from '@angular/core';
import { Data_Summary } from '../interfaces/data_summary';

@Component({
    selector: 'title-bar',
    styles: [require('../presentation/page-layout.css')],
    template: require ('./title-bar.html')
})

export class TitleBar {
    @Input() _Data_Summary: Data_Summary;
    @Input() _autoRefresh: boolean;
    @Input() _refreshState: string;
    @Input() _serverStatus: any;
    @Output() onToggleAutoRefresh = new EventEmitter<boolean>();

    _autoRefreshLabel:string = "Pause";

    toggleAutoRefresh() {
        if (this._autoRefreshLabel === "Pause") {
            this._autoRefreshLabel = "Resume";
            this._refreshState = "indicatorOff";
            this._serverStatus = "updates paused";

        } else {
            this._autoRefreshLabel = "Pause";
            this._refreshState = "indicatorOn";

        }
        this.onToggleAutoRefresh.emit(this._autoRefreshLabel === "Pause");
    }

    getRefreshLabel(): string {
        if (this._autoRefresh) {
            return "Click to pause updates ->";
        } else {
            return "Click to resume updates ->";
        }

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
   
}