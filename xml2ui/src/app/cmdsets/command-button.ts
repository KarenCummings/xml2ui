/**
 * Created by jscarsdale on 6/2/16.
 */

// The common page layout with id tags for js
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommandService } from '../services/command.service.ts';
import { HttpModule } from '@angular/http';
import { PopupDialog } from "../cmdsets/popup-dialog";
import { PopupDialogProps } from "../interfaces/popup-dialog-props";

@Component({
    selector: 'command-button',
    styles: [require('../presentation/page-layout.css')],
    template: `
<input *ngIf="_action == simpleCommand"    type="button" [class]="_class" title="{{ initCommandURL() }}" [id]="getDomId()" [value]="getLabel()"  (click)="onClick()" (dblclick)="_action()">
<input *ngIf="_action == confirmDialog"    type="button" [class]="_class" title="{{ initCommandURL() }}" [id]="getDomId()" [value]="getLabel()"  (click)="onClick()" (dblclick)="_action()">
<input *ngIf="_action == textInputDialog"  type="button" [class]="_class" title="{{ initCommandURL() }}" [id]="getDomId()" [value]="getLabel()"  (click)="onClick()" (dblclick)="_action()">
<input *ngIf="_action == boolInputDialog"  type="button" [class]="_class" title="{{ initCommandURL() }}" [id]="getDomId()" [value]="getLabel()"  (click)="onClick()" (dblclick)="_action()">
<input *ngIf="_action == floatInputDialog" type="button" [class]="_class" title="{{ initCommandURL() }}" [id]="getDomId()" [value]="getLabel()"  (click)="onClick()" (dblclick)="_action()">
<input *ngIf="_action == intInputDialog"   type="button" [class]="_class" title="{{ initCommandURL() }}" [id]="getDomId()" [value]="getLabel()"  (click)="onClick()" (dblclick)="_action()">
<input *ngIf="_action == commandHandler"   type="button" [class]="_class" title="{{ initCommandURL() }}" [id]="getDomId()" [value]="getLabel()"  (click)="onClick()" (dblclick)="_action()">
<input *ngIf="_action == disabled"         type="button" disabled="true" [id]="getDomId()" [value]="getLabel()" >
`,
    providers: [HttpModule, CommandService, PopupDialog]
})

export class CommandButton {
    @Input() _popupDialog_L3: PopupDialog;
    @Input() _cmdObject: any;
    @Input() _class: string;
    @Input() _props: any;
    @Input() _uiTab: any;
    @Output() onPopupDialogProps = new EventEmitter<PopupDialogProps>();
    _svcURL: string = "";

    _popupDialogProps: PopupDialogProps = new PopupDialogProps(
        this,
        false,
        "Default Title",
        "Default text",
        [],
        ["OK", "Cancel"]
    );
    _controls:any = [];
    _action: any = this.simpleCommand;
    _unknownLabel: string = "UNKNOWN COMMAND ";
    _domId:string = "";
    _disabled:boolean = false;
    _noHeader:boolean = false;
    _responses:any[];
    _response:any;
    _errorMessage:string;
    _commandAttrs:any = ["name", "confirm", "u_id", "controls"];

    _showPopupDialog:boolean = false;

    initCustomDialogProps() {

        if (typeof this._cmdObject === "undefined") {
            return;
        }

        this._popupDialogProps.callbackSource = this;
        this._popupDialogProps.hidden = false;
        this._popupDialogProps.title = this.getLabel();
        this._popupDialogProps.text = this.getQuestionText();
        this._popupDialogProps.controls = this.getControls();
    };


    ngOnChanges() {
        this.setAction();
    }

    getControls() {
        // Convert any "value" sub-elements into controls
        //   this._controls = [];
        if (typeof this._cmdObject.command.controls !== "undefined") {
            //      if (["float", "int", "bool"].indexOf(this._cmdObject.command.type) > -1) {
            //   if (typeof this._cmdObject.command.controls === "object") {
            //      this._controls.push(this._cmdObject.command.controls);
            //  } else {
            this._controls = [];
            for (let i in this._cmdObject.command.controls) {
                this._cmdObject.command.controls[i].label = this._cmdObject.command.controls[i]._type;
                this._cmdObject.command.controls[i].type = this._cmdObject.command.controls[i]._type;
                this._cmdObject.command.controls[i].size = 20;
                this._cmdObject.command.controls[i].cols = 20;
                this._cmdObject.command.controls[i].rows = 1;
                this._cmdObject.command.controls[i].name = "value" + i;
                this._controls.push(this._cmdObject.command.controls[i]);
            }
        } else {
            if (typeof this._cmdObject.command.type !== "undefined") { // it's a text input
                this.insertImplicitControl();
            }
        }
        return this._controls;
    }

    insertImplicitControl() {
        // Handle single "implicit" control for this type
        // E.g.: <command desc="Enter a log message" max="256" name="User_Log_Text" type="text" u_id="2021"/>

        var command = this._cmdObject.command;

        if (typeof command === "undefined") {
            return;
        }

        var implicitCommand = {
            "type": command.type,
            "label": command.type,
            "size": 20,
            "cols": 20,
            "rows": 1,
            "value": "",
            "name": "value0"
        };

        if (command.type === "text") {
            // Determine the width of the input box
            if (typeof command.size === "undefined") {
                command.size = command.max;
            }
            implicitCommand["size"] = command.size;
            implicitCommand["cols"] = Math.min(80, command.size);
            implicitCommand["rows"] = Math.max(1, Math.ceil(command.size / 80));

        } else {
            if (typeof command.min === "string") {
                implicitCommand["min"] = command.min;
            }

            if (typeof command.max === "string") {
                implicitCommand["max"] = command.max;
            }

            if (typeof command.units === "string") {
                implicitCommand["units"] = command.units;
            }
        }
        this._controls.push(implicitCommand);
    }

    getUnits():string {
        if (typeof this._cmdObject.units === "string") {
            return this._cmdObject.units;
        }
        return "";
    }

    getDomElem():any {
        var e = document.getElementById(this.getDomId());
        return e;
    }

    getDomId(): string {
        if (this._domId === "") {
            if (typeof this._cmdObject.command === "object" && typeof this._cmdObject.command.name === "string") {
                this._domId = this._cmdObject.command.name.trim().replace(" ", "_") + "_btn";
            }

            if (this._domId === "") {
                if (!("generated_cmd_btns" in window)) {
                    window["generated_cmd_btns"] = [];
                }
                this._domId = ("anonymous_" + window["generated_cmd_btns"].length + "_btn");
                window["generated_cmd_btns"].push(this._domId);
            }
        }
        return this._domId;
    }

    getQuestionText(): string {
        var qText:string = "Perform unknown action?";
        if (typeof this._cmdObject.command.desc === "string") {
            qText = this._cmdObject.command.desc.replace(/\(NL\)/g, "\n");
        } else {
            qText = this.getLabel().replace("_", " ") + "?";
        }
        return qText;
    }

    getLabel():string {
        let label: string = "Unnamed";
        if (typeof this._cmdObject.command.name === "string") {
            label = "";
            let tokens:string[] = this._cmdObject.command.name.split("_");
            for (var i in tokens) {
                label += tokens[i].slice(0, 1) + tokens[i].slice(1).toLowerCase() + " ";
            }
        }

        return label.trim();
    }

    setAction() {
        this._action = this.simpleCommand; // default button type
        if ((typeof this._cmdObject.command.disabled !== "undefined") &&
             this._cmdObject.command.disabled === "true") {
            this._action = this.disabled;
        } else {

            if (typeof this._cmdObject.command.controls !== "undefined") {
                for (let c of this._cmdObject.command.controls)
                    switch (c._type) {
                        case "float":
                            this._action = this.floatInputDialog;
                            this.initCustomDialogProps();
                            break;
                        case "int":
                            this._action = this.intInputDialog;
                            this.initCustomDialogProps();
                            break;
                        case "bool":
                            this._action = this.boolInputDialog;
                            this.initCustomDialogProps();
                            break;
                        default:
                            break;
                    }
            }
            if (this._cmdObject.command.confirm === "true") {
                this._action = this.confirmDialog;
                this.initCustomDialogProps();
            }
            if (this._cmdObject.command.type === "text") {
                this._action = this.textInputDialog;
                this.initCustomDialogProps();
            }
        }
    }

    simpleCommand() {
        this.sendCommand();
    }

    constructor(
        private _moduleCommandService: CommandService) { }

    getExtraAttributes() {
        let attrs: string = "";
        var attrKeys = Object.keys( this._cmdObject.command );
        for ( let a of attrKeys ) {
            if ( this._commandAttrs.indexOf( a ) === -1) {
                attrs += " " + a + "=\"" + this._cmdObject.command[a] + "\"";
            }
        }
        return attrs;
    }

    buildCommandXml(valueObjsFromPopup:any): string{
        var xmlCommand = "<request COMMAND=\"" + this._cmdObject.command.name + "\"" + this.getExtraAttributes() + " valueName=\"Module\">";
        if ((typeof valueObjsFromPopup !== "undefined") && Array.isArray(valueObjsFromPopup)) {
            valueObjsFromPopup.forEach(function(e:any) {
                if (typeof e === "object") {
                    xmlCommand += "<value name=\"" + e.name + "\"   value=\"" + e.value + "\" type=\"" + e.type + "\" />";
                }
            });
        }
        xmlCommand += "</request>"
        return xmlCommand;
    }

    sendCommand(valueObjsFromPopup:any = []) {
        var xmlCommand = this.buildCommandXml(valueObjsFromPopup);
        this._moduleCommandService.sendCommand(this._svcURL, xmlCommand)
            .subscribe(
                responses => {
                    this.onJSONupdate(responses);

                    var statusValue = "";
                    var statusData = "";
                    if (typeof this._response.status === "object") {
                        if (typeof this._response.status.value === "string") {
                            statusValue = this._response.status.value;
                        }
                        if (typeof this._response.status["#cdata"] === "string") {
                            statusData = this._response.status["#cdata"] ;
                        }
                    }
                    var msg = "The command '" + this._cmdObject.command.name + "' returned:\n" +
                        "    status.value: " + statusValue + "\n" +
                        "    status.#cdata: " + statusData;
                    //  alert(msg);
                },
                error => {
                    this._errorMessage = <any>error
                }
            );
    }


    onJSONupdate(responses:any) {
        if (typeof responses === "object") {
            this._responses = responses;

            if (this._responses.length > 0) {
                this._response = this._responses[0];
            } else {
                this._response = {};
            }
        }
    }

    disabled() {
        this._disabled = true;
    }

    confirmDialog() {
        // function CgiConfirmBeforeSend(question_text, button_id, cmd, idnum, cgi_handler, dcdcNum, acacNum, ExtraParm, ExtraParmVal, callback_fn)
        this._disabled = true;
        this._popupDialogProps["hidden"] = false;
        this._popupDialogProps.callbackSource = this;
        this._popupDialogProps.hidden = false;
        this._popupDialogProps.title = "Confirm: ";
        this._popupDialogProps.text = this.getQuestionText();
        if (this.onPopupDialogProps.emit(this._popupDialogProps)) {
            this.sendCommand();
            // if(confirm(this.getQuestionText()));
            /*
             if(typeof callback_fn != 'undefined')
             {
             window[callback_fn](button_id, cmd, idnum, cgi_handler, dcdcNum, acacNum, '', ExtraParm, ExtraParmVal);
             }
             else if(typeof ExtraParm != 'undefined' && typeof ExtraParmVal != 'undefined')
             {
             SendCgiCommand(button_id, cmd, idnum, cgi_handler, dcdcNum, acacNum, '', ExtraParm, ExtraParmVal);
             }
             else
             {
             SendCgiCommand(button_id, cmd, idnum, cgi_handler, dcdcNum, acacNum);
             }
             */

        } else {
            this._disabled = false;
        }
    }

    textInputDialog() {
        this._popupDialogProps["hidden"] = false;
        this.onPopupDialogProps.emit(this._popupDialogProps);
    }

    floatInputDialog() {
        this._popupDialogProps["hidden"] = false;
        this.onPopupDialogProps.emit(this._popupDialogProps);
    }

    intInputDialog() {
        this._popupDialogProps["hidden"] = false;
        this.onPopupDialogProps.emit(this._popupDialogProps);
    }

    boolInputDialog() {
        this._popupDialogProps["hidden"] = false;
        this.onPopupDialogProps.emit(this._popupDialogProps);
    }

    initCommandURL() {
        if (this._uiTab && typeof this._uiTab["commandUrl"] == "string") {
            this._svcURL = this._uiTab["commandUrl"];
        }

        let title: string = this._svcURL; // Default, if desc not passed
        if (typeof this._cmdObject.command === "object" && typeof this._cmdObject.command.desc === "string") {
            title = this._cmdObject.command.desc.replace(/\(NL\)/g, "\n");
        }

        return title;
    }

    onClick() {
        // alert("You clicked me!");
        try {
            this.setAction();
            if ( this._action == this.simpleCommand) {
                this._popupDialog_L3._hidden = true;
                this.simpleCommand();
            } else {
                this._popupDialog_L3.setProps(this._popupDialogProps);
                this._popupDialog_L3._hidden = false;
            }
        } catch (err) {
            alert("Error: " + err.toString());
        }
    }

}
