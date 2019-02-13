import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { RatelistPage } from './ratelist';

@NgModule({
  declarations: [
    RatelistPage,
  ],
  imports: [
    IonicPageModule.forChild(RatelistPage),
  ],
})
export class RatelistPageModule {}
