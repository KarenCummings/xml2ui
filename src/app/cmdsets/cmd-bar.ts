/**
 * Created by jscarsdale on 6/16/16.
 */

import { Component, Input, Output } from "@angular/core";
import { NVPairList } from "../interfaces/nv-pair-list";
import { PopupDialog } from "./popup-dialog";

@Component({
    selector: 'cmd-bar',
    styles: [require('../presentation/page-layout.css')],
    template: `
<div *ngIf="hasCommands()" id="cmd_bar">
<table border="0" width="100%">
    <tbody>
    <tr>
        <td class="cmd-bar" *ngIf="hasProcessCommands()"  align="left">
            <command-button *ngFor="let e of getProcessCommands()" [_uiTab]="_uiTab" [_cmdObject]="e" [_class]="'command'" [_props]="_props" [_popupDialog_L3]="_popupDialog_L2"></command-button>
        </td>
    </tr>
    </tbody>
</table>
</div>
`
})

// The common page layout with id tags for js
export class CmdBar {
    @Input() _popupDialog_L2: PopupDialog;
    @Input() _commands:NVPairList;
    @Input() _props: any;
    @Input() _uiTab: any;


    getProcessCommands() {
        if (this.hasProcessCommands()) {
            return this._commands.elements;
        }
        return [];
    }

    hasProcessCommands() {
        var ret = (typeof this._commands === "object" &&
        typeof this._commands.elements === "object" &&
        this._commands.elements.length > 0);
        return ret;
    }

    hasCommands():boolean {
        var ret = this.hasProcessCommands();
        return ret;
    }
}
