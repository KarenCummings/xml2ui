import { Component, Input } from '@angular/core';
import { NVPairList } from '../interfaces/nv-pair-list';

@Component({
    selector: 'overview-table',
    styles: [require('../presentation/page-layout.css')],
    template: `
<div id="data">
<table cellspacing="1" style="border-style: hidden; border-collapse: collapse" align="left" valign="top" >
  <tr>
    <td align="center" valign="top" width="300">
    <table>
      <thead>
        <tr><th colspan="2" class="tableTitle" align="center" uid="_nvPairList.u_id">
            <div style="float:left" [title]="" (click)="toggle()">{{ _hidden?'&#9658;':'&#9660;'}}</div>{{ getTitle() }}
           &nbsp;<a *ngIf="_nvPairList.url" target="_blank"  href={{_nvPairList.url}} title={{_nvPairList.tooltip}}>&#x2600;</a></th></tr>
      </thead>
      
      <tbody [id]="getTableId()" [hidden]="_hidden">
          <tr *ngFor="let e of _nvPairList.elements; let elementId=index" id="element-{{elementId}}">
            <th align="right"><span title="" id="{{e.name}}-{{_nvPairList.tableId}}">{{ e.name }}</span></th>
            <td><var id="{{e.u_id}}">{{ e.value }}&nbsp;{{ e.units }}</var></td>
          </tr>
      </tbody>    
    </table>
    
    </td>
</tr>

</table>
</div>
`
})

// The common page layout with id tags for js
export class OverviewTable {
    @Input() _nvPairList: NVPairList;
    @Input() _hidden:boolean;

    getTitle(): string {
        let retVal: string = "Overview";
        if (typeof this._nvPairList === "object") {
            if (typeof this._nvPairList.label === "string" && this._nvPairList.label != "") {
                retVal = this._nvPairList.label;
            }
        }
        retVal = retVal.replace(/_/g, " ");
        return retVal;
    }

    getTableId(): string {
        let retVal = this.getTitle();
        if (typeof this._nvPairList === "object" &&
            typeof this._nvPairList["tableId"] === "string") {
            retVal += "-" + this._nvPairList["tableId"];
        }
        return retVal;
    }

    toggle() {
        this._hidden = ! this._hidden;
    }
}
