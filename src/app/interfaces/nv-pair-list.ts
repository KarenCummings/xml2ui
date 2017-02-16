export class NVPair {
  name: string;
  value: string;
}

export class NVPairList {
  label: string;
  desc: string;
  u_id: string;
  url: string;
  tooltip: string;
  elements: any [];

  constructor() {
    this.label = "";
    this.desc = "";
    this.u_id = "";
    this.url = "";
    this.tooltip = "";
    this.elements = [];
  }
}

