import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform, ToastController } from 'ionic-angular';
import { SMS } from '@ionic-native/sms';
import { ApiProvider } from '../../providers/api/api';
import { HttpHeaders } from "@angular/common/http";
import moment from 'moment';

declare var cordova: any;

@IonicPage()
@Component({
  selector: 'page-review',
  templateUrl: 'review.html',
})
export class ReviewPage {
  public id = '';
  public namabank = '';
  public namarekening = '';
  public nomorrekening = '';
  public nomortelp = '';
  public operator = '';
  public nominaljual = '';
  public nominaltrf = '';
  public rate = '';
  public iddevices = '';
  public imgopt = '';
  public listcarabayar = [];
  public listcarabayardetail = [];
  public showdetail = false;
  public carabayartemp = '';

  constructor(
    public navCtrl: NavController,
    private sms: SMS,
    public api: ApiProvider,
    public toastCtrl: ToastController,
    public navParam: NavParams,
    public platform: Platform) {
    this.id = this.navParam.get('id')
    this.api.get("table/x_jual_pulsa_header", { params: { limit: 100, filter: "id=" + "'" + this.navParam.get('id') + "' AND status='INPG'" } })
      .subscribe(val => {
        let data = val['data']
        if (data.length != 0) {
          this.api.get("table/x_prefix_operator", { params: { limit: 1, filter: "operator=" + "'" + data[0].operator + "' AND status='OPEN'" } })
            .subscribe(val => {
              let dataoperator = val['data']
              this.imgopt = dataoperator[0].icon
              this.api.get("table/x_cara_bayar_header", { params: { limit: 30, filter: "operator=" + "'" + dataoperator[0].induk_operator + "' AND status='OPEN'" } })
                .subscribe(val => {
                  this.listcarabayar = val['data']
                });
            });
          this.nomortelp = data[0].no_telp
          this.operator = data[0].operator
          this.rate = data[0].rate
          this.iddevices = data[0].id_devices
          var number_string = data[0].nominal_jual.toString(),
            sisa = number_string.length % 3,
            rupiah = number_string.substr(0, sisa),
            ribuan = number_string.substr(sisa).match(/\d{3}/g);

          if (ribuan) {
            var separator = sisa ? '.' : '';
            rupiah += separator + ribuan.join('.');
          }
          this.nominaljual = rupiah
          var number_string2 = data[0].nominal_trf.toString(),
            sisa2 = number_string2.length % 3,
            rupiah2 = number_string2.substr(0, sisa2),
            ribuan2 = number_string2.substr(sisa2).match(/\d{3}/g);

          if (ribuan2) {
            var separator2 = sisa2 ? '.' : '';
            rupiah2 += separator2 + ribuan2.join('.');
          }
          this.nominaltrf = rupiah2
        }
        else {

        }
      });
    this.api.get("table/x_jual_pulsa_detail", { params: { limit: 100, filter: "id_header=" + "'" + this.navParam.get('id') + "' AND status='INPG'" } })
      .subscribe(val => {
        let data = val['data']
        if (data.length != 0) {
          this.namabank = data[0].nama_rek
          this.namarekening = data[0].kd_bank_rek
          this.nomorrekening = data[0].no_rek
        }
        else {
        }
      });
  }
  doDetailCaraBayar(carabayar) {
    this.carabayartemp = carabayar.title
    this.api.get("table/x_cara_bayar_line", { params: { limit: 30, filter: "id_header=" + "'" + carabayar.id + "' AND status='OPEN'", sort: 'line_no ASC' } })
      .subscribe(val => {
        this.listcarabayardetail = val['data']
      });
  }
  doHideDetailCaraBayar(carabayar) {
    this.carabayartemp = ''
    this.showdetail = false;
    this.listcarabayardetail = [];
  }
  doCopy() {
    cordova.plugins.clipboard.copy('test');
  }
}
