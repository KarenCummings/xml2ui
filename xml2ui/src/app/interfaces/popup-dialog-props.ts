/**
 * Created by jscarsdale on 6/30/16.
 */
export class PopupDialogProps {
    constructor(
        public callbackSource: any,
        public hidden: boolean,
        public title: string,
        public text: string,
        public controls: Array<any>,
        public buttons: Array<any>
    ) { }

}