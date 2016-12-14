import { NgModule }      from '@angular/core';
import { MaterialModule } from '@angular/material';
import { BrowserModule } from '@angular/platform-browser';
import { HttpModule } from '@angular/http';
import { PageLayout } from './presentation/page-layout';
import { TitleBar } from './presentation/title-bar';
import { CommandButton } from './cmdsets/command-button';
import { PopupDialog } from './cmdsets/popup-dialog';
import { OverviewTable } from './presentation/overview-table';
import { CmdBar } from './cmdsets/cmd-bar';
import { AppTabComponent } from './app-tab.component';

import { AppComponent }  from './app.component.ts';

@NgModule({
  imports: [ BrowserModule, HttpModule, MaterialModule.forRoot() ],
  declarations: [ AppComponent,
                  PageLayout,
                  CommandButton,
                  PopupDialog,
                  OverviewTable,
                  CmdBar,
                  TitleBar,
                  AppTabComponent
  ],
  bootstrap: [ AppComponent ]
})
export class AppModule {
}
