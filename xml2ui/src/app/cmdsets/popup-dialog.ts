import { Component, Injectable } from '@angular/core';
import { PopupDialogProps } from '../interfaces/popup-dialog-props';

@Component({
    selector: 'popup-dialog',
    styles: [require('../cmdsets/popup-dialog.css')],
    template: `
<div id="popup-dialog" [hidden]="getHidden()" class="popup-dialog-modal">
  <div class="popup-dialog-modal-content">
    <header>
      <span class="titleBar">&nbsp;{{ _props.title }}</span>
      <span (click)="hide()" class="closeBtn">&nbsp;&times;&nbsp;</span>
    </header>
    
    <div id="popup-dialog-text" class="popup-dialog-text">{{ _props.text }}</div>
    <div id="popup-dialog-controls">
    </div> 
    
    <footer class="popup-dialog-container">
      <button (click)="validateAndSend(_props)">OK</button>
      <button (click)="hide()">Cancel</button>
    </footer>
  </div>
</div>
`
})

@Injectable()
export class PopupDialog {
    _props: PopupDialogProps = new PopupDialogProps(
        "", // callback_source
        true, // this.isPopupHidden(), // hidden
        "Default Popup Title", // title
        "Default Prompt", // text
        [], // controls
        ["OK", "Cancel"]  // buttons
    );

    _hidden: boolean;

    getHidden() {
        return this._props.hidden;
    }

    setProps(props:PopupDialogProps) {
        if (props && typeof props === "object") {
            this._props = props;
            this.initControls();
        }
    }

    initControls() {
        let controlsHTML: string = "";
        let controlsDiv:any = document.getElementById("popup-dialog-controls");
        if (this._props.controls && Array.isArray(this._props.controls) ) {
            for (var i = 0; i < this._props.controls.length; i++) {
                let e:any = this._props.controls[i];
                if (e.label && e.label !== "text"){
                    controlsHTML += "<div  class=\"control-label\">" + e.desc + " [" + e.label + ", " + e.min + "-" + e.max + "]</div>";
                }
                if (e.rows && e.rows == 1){
                    controlsHTML += "<div><input type=\"text\" value=\"" + e.value + "\" id=\"popup-control-" + i + "\" value=\"" + e.value + "\" size]=\"" + e.size + "\"/></div>";
                }
                if (e.label && e.label === "text") {
                    controlsHTML ="<div><textarea id=\"popup-control-" + i + "\" rows=\"" + e.rows  + "\" cols=\"" + e.cols + "\" value=\"" + e.value + "\" ></textarea></div>"
                }
            }
        }
        // alert("controlsHTML:" + controlsHTML);
        controlsDiv.innerHTML = controlsHTML;

        /*
        <div *ngFor="let e of getControls(); let i=index" class="popup-dialog-text">
            <div *ngIf="e.label !=='text'" class="control-label">{{e.desc}} [{{e.label}}, {{e.min}}-{{e.max}}]</div>
            <div *ngIf="e.rows == 1"><input type="text" value="{{e.value}}" [id]="'popup-control-' + i" [value]="e.value" [size]="e.size"/></div>
        <div><textarea *ngIf="e.rows > 1" [id]="'popup-control-' + i" [rows]="e.rows" [cols]="e.cols" >{{ e.value }}</textarea></div>
        </div>
        */

    }

    getId() {
        return "popup-dialog";
    }

    getSize(e:any) {
        var defaultSize = 20;
        if (typeof e === 'undefined' || typeof e.max === 'undefined') {
            return defaultSize;
        }

        let i = parseInt( e.max );
        return isNaN(i) ? defaultSize: i;
    }

    hide(hidden:boolean = true) {
        this._props.hidden = hidden;
    }

    getControls(): any {
        /* support this._props.controls array like this:
         "controls": [
         {"type": "input", "data-type": "float", "label": "Floating Point Value 1:", "value": "1.123" },
         {"type": "input", "data-type": "float", "label": "Floating Point Value 2:", "value": "2.357" }
         ],
         */
        if (typeof this._props !== undefined && typeof this._props.controls !== undefined) {
            return this._props.controls;
        }
        return [];
    }

    controlChanged(control:any) {

    }

    validateAndSend(props:any) {
        if (props && typeof props === "object") {
            if (props.callbackSource && typeof props.callbackSource === "object") {
                if (this.validateInputs(props.controls) == 0) {
                    props.callbackSource.sendCommand(props.controls);
                    this.hide();
                } else {
                    alert("Invalid Value(s)");
                }
            } else {
                    alert("Invalid callbackSource");
            }
        }
    }

    validateInputs(controls:Array<any>) {
        let errCount: number = 0;
        controls.forEach(function(e, index) {
            var o = document.getElementById('popup-control-' + index);
            if (typeof o !== "undefined" && o !== null) {
                switch (e.type) {
                    case "text":
                        e.value = o["value"];
                        if (e.value.length > e.size) {
                            errCount += 1;
                        } else {
                            o["value"] = e.value;
                        }
                        break;
                    case "float":
                        e.value = Number.parseFloat(o["value"]);
                        if (e.value < e.min || e.value > e.max || isNaN(e.value)) {
                            errCount += 1;
                        } else {
                            o["value"] = e.value;
                        }
                        break;
                    case "int":
                        e.value = Number.parseInt(o["value"], 10);
                        if (e.value < e.min || e.value > e.max || isNaN(e.value)) {
                            errCount += 1;
                        } else {
                            o["value"] = e.value;
                        }
                        break;
                    case "bool":
                        if (["1","0", "t", "f", "false", "true"].indexOf((o["value"]).toLowerCase()) < 0){
                            errCount += 1;
                        } else {
                            e.value = o["value"];
                        }
                        break;
                }
            }
        });
        return errCount;
    }

    ngAfterContentChecked() {
        if (!document.body.onscroll) {
            document.body.onscroll = function() {
                let e:any = document.getElementById("popup-dialog");
                if (e) {
                    e.style.top = Math.max(0, (document.body.scrollTop + ((window.innerHeight - e.clientHeight) / 2) ) ) + "px";
                }
            }
        }
        if (!document.body["onresize"]) {
            document.body["onresize"] = document.body.onscroll;
        }
    }

    ngOnChanges(changes: {"newProps": PopupDialogProps }) {
        for (let propName in changes) {
            let props = changes[propName];
            if (typeof props !== "undefined" && typeof props.hidden !== "undefined") {
                this.hide(props.hidden);
            }
            if (typeof props !== "undefined" && typeof props.controls !== "undefined") {
                this._props.controls.forEach(function(e) {
                    if (e.type === "input") {
                        e.size = this.getSize(e);
                    }
                })
            }
        }
    }
}