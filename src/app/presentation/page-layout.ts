import { Component, EventEmitter, Input, Output } from "@angular/core";
import { Data_Summary } from '../interfaces/data_summary';
import { NVPairList } from "../interfaces/nv-pair-list";
import { PopupDialog } from "../cmdsets/popup-dialog";


@Component({
    selector: 'page-layout',
    template: require('./page-layout.html'),
    styles: [require('./page-layout.css')],
})

// The common page layout with id tags for js
export class PageLayout {
    @Input() _popupDialog_L1: PopupDialog;
    @Input() _uiTab: any;
    @Input() _Data_Summary:Data_Summary;
    @Input() _props: any;

    _showDebugOverviewTables:boolean = false;

    hasSection(name:string):boolean {
        return (
            this._Data_Summary
            && typeof this._Data_Summary === "object"
            && typeof this._Data_Summary["Section"] === "object"
            && typeof this._Data_Summary["Section"][name] === "object"
        )
    }

    hasCmdSet(name:string):boolean {
        return (
            this._Data_Summary
            && typeof this._Data_Summary === "object"
            && typeof this._Data_Summary["CmdSet"] === "object"
            && typeof this._Data_Summary["CmdSet"][name] === "object"
        )
    }

    addTableId(o:any, sectionId:number, dataSetId: number, tableId:number): any {
        o["tableId"] = "" + sectionId + "-" + dataSetId + "-" + tableId;
        return o;
    }

    objToArray(o:any): any {
        let arr:any = [];
        for (var e in o) {
            if (e !== "u_id" && e !== "name" && e !== "url" && e !== "tooltip") {
                let pair:NVPairList = new NVPairList();
                pair.label = e;
                for (let c in o[e]) {
                    if (pair.hasOwnProperty(c)) {
                        pair[c] = o[e][c];
                    }
                    if (c === 'name' && typeof o[e][c] !== null) {
                        pair.label = o[e][c];
                    }
                    if (c === "desc") {
                        pair.desc = o[e][c].replace(/\(NL\)/g, "\n");
                    } else {
                        let cObj = o[e][c];
                        if (typeof cObj === "object") {
                            if (!Array.isArray( cObj )) {
                                // a single object
                                if ( !(cObj.hasOwnProperty('name') && cObj['name'] !== '')) {
                                    cObj['name'] = c;
                                }
                                pair.elements.push( cObj );
                            } else {  // we have an array of pairs, append the whole thing
                                for ( let ae of cObj ) {
                                    pair.elements.push( ae );
                                }
                            }
                        }
                    }
                }
                arr.push(pair);
            }
        }
        return arr;
    }
}

