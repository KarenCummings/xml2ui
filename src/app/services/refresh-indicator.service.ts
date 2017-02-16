/**
 * Created by kcummings on 10/17/16.
 *   service updates refresh status and LED indicator
 */
import { Injectable }     from '@angular/core';

@Injectable()
export class RefreshIndicatorService {
    constructor() {}
        public _autoRefresh:boolean;
        private _promptOn: string = "Push button to pause > ";
        private _promptOff: string = "Push button to resume > ";
        
        public _autoRefreshPrompt: string;
    
    onToggleAutoRefresh( autoRefresh:boolean ) {
        this._autoRefresh = autoRefresh;
    }

    toggleAutoRefresh() {
        if (this._autoRefresh) {
            this._autoRefreshPrompt = this._promptOn;
                      
        }
        if (this._autoRefreshLabel === "Pause") {
            this._autoRefreshLabel = "Resume";

        } else {
            this._autoRefreshLabel = "Pause";
        }
        this.onToggleAutoRefresh.emit(this._autoRefreshLabel === "Pause");
    }
}