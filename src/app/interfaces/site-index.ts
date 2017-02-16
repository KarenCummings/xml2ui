export class SiteIndex {
    id:number;
    urlHostName:string;
    modHostName:string;
    modResourceId:string;
    bscMySqlHost:string;
    mySqlDB:string;
    isModuleConfigured:number;

    constructor() {
        this.id = -1;
        this.urlHostName = "unknown-urlHostName";
        this.modHostName = "unknown-modHostName";
        this.modResourceId = "unknown-modResourceId";
        this.bscMySqlHost = "unknown-bscMySqlHost";
        this.mySqlDB = "unknown-mySqlDB";
        this.isModuleConfigured = 0;
    }
}
