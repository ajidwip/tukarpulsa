import { Component, ViewChild, ElementRef } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform, ToastController, AlertController } from 'ionic-angular';
import { SMS } from '@ionic-native/sms';
import { ApiProvider } from '../../providers/api/api';
import { HttpHeaders } from "@angular/common/http";
import moment from 'moment';
import { UniqueDeviceID } from '@ionic-native/unique-device-id';

@IonicPage()
@Component({
  selector: 'page-detailpembayaran',
  templateUrl: 'detailpembayaran.html',
})
export class DetailpembayaranPage {
  @ViewChild('checkbox') checkbox: ElementRef;
  public id = '';
  public namabank = '';
  public namarekening = '';
  public nomorrekening = '';
  public overlay = false;
  public nomortelp = '';
  public operator = '';
  public nominaljual = '';
  public nominaltrf = '';
  public rate = '';
  public iddevices = '';

  constructor(
    public navCtrl: NavController,
    private sms: SMS,
    public api: ApiProvider,
    public toastCtrl: ToastController,
    public navParam: NavParams,
    public alertCtrl: AlertController,
    private uniqueDeviceID: UniqueDeviceID,
    public platform: Platform) {
    this.id = this.navParam.get('id')
    this.overlay = false;
    this.uniqueDeviceID.get()
      .then((uuid: any) => {
        let iddevices = uuid
        this.api.get("table/x_devices", { params: { limit: 100, filter: "id_devices=" + "'" + uuid + "'" } })
          .subscribe(val => {
            let data = val['data']
            if (data[0].nomor_rek != '') {
              this.namabank = data[0].nama_bank
              this.namarekening = data[0].nama_rek
              this.nomorrekening = data[0].nomor_rek
            }
          });
      })
      .catch((error: any) => {

      });
    this.api.get("table/x_jual_pulsa_header", { params: { limit: 100, filter: "id=" + "'" + this.id + "' AND status='OPEN'" } })
      .subscribe(val => {
        let data = val['data']
        if (data.length != 0) {
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
    this.api.get("table/x_jual_pulsa_detail", { params: { limit: 100, filter: "id_header=" + "'" + this.id + "' AND status='OPEN'" } })
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
  doCheck() {
    if (this.checkbox.nativeElement.checked == true) {
      this.uniqueDeviceID.get()
        .then((uuid: any) => {
          let iddevices = uuid
          this.api.get("table/x_devices", { params: { limit: 100, filter: "id_devices=" + "'" + uuid + "'" } })
            .subscribe(val => {
              let data = val['data']
              if (data.length != 0) {
                const headers = new HttpHeaders()
                  .set("Content-Type", "application/json");
                this.api.put("table/x_devices",
                  {
                    "id_devices": data[0].id_devices,
                    "nama_bank": this.namabank,
                    "nama_rek": this.namarekening,
                    "nomor_rek": this.nomorrekening
                  },
                  { headers })
                  .subscribe(
                    (val) => {
                    });
              }
              else {
                const headers = new HttpHeaders()
                  .set("Content-Type", "application/json");
                this.api.post("table/x_devices",
                  {
                    "id_devices": iddevices,
                    "nama_bank": this.namabank,
                    "nama_rek": this.namarekening,
                    "nomor_rek": this.nomorrekening
                  },
                  { headers })
                  .subscribe(
                    (val) => {
                    });
              }
            });
        })
        .catch((error: any) => {

        });
    }
    else {

    }
  }
  doOffOverlay() {
    this.overlay = false;
  }
  doInsert() {
    if (this.id == '' || this.id == undefined) {
      this.presentToast('Transaksi gagal harap restart aplikasi anda !')
    }
    else if (this.namabank == '') {
      this.presentToast('Nama Bank Masih Kosong')
    }
    else if (this.namarekening == '') {
      this.presentToast('Nama Rekening Masih Kosong')
    }
    else if (this.nomorrekening == '') {
      this.presentToast('Nomor Rekening Masih Kosong')
    }
    else if (this.id != '' &&
      this.id != undefined &&
      this.namabank != '' &&
      this.namarekening != '' &&
      this.nomorrekening != '' &&
      this.nomortelp != '' &&
      this.operator != '' &&
      this.rate != '' &&
      this.nominaljual != '' &&
      this.nominaltrf != '') {
      this.overlay = true;
    }
    else {
      this.presentToast('Transaksi gagal harap restart aplikasi anda !!!')
    }
  }
  doUpdatePembayaranDetail(id, datenow) {
    const headers = new HttpHeaders()
      .set("Content-Type", "application/json");
    this.api.put("table/x_jual_pulsa_detail",
      {
        "id_header": id,
        "datetime": datenow,
        "status": 'INPG'
      },
      { headers })
      .subscribe(
        (val) => {
          this.navCtrl.setRoot('ReviewPage', {
            id: this.id
          })
        }, err => {
          this.doUpdatePembayaranDetail(id, datenow)
        });
  }
  doUpdatePembayaran(id) {
    var datenow = moment().format('YYYY-MM-DD HH:mm')
    var date = moment(datenow, 'YYYY-MM-DD HH:mm')
      .add(30, 'minutes')
      .format('YYYY-MM-DD HH:mm');
    const headers = new HttpHeaders()
      .set("Content-Type", "application/json");
    this.api.put("table/x_jual_pulsa_header",
      {
        "id": id,
        "datetime": datenow,
        "datetime_exp": date,
        "status": 'INPG'
      },
      { headers })
      .subscribe(
        (val) => {
          this.doUpdatePembayaranDetail(id, datenow)
        }, err => {
          this.doUpdatePembayaran(id)
        });
  }
  doInsertDetail(data) {
    if (data.length != 0) {
      const headers = new HttpHeaders()
        .set("Content-Type", "application/json");
      this.api.put("table/x_jual_pulsa_detail",
        {
          "id_header": data[0].id_header,
          "nama_rek": this.namabank,
          "kd_bank_rek": this.namarekening,
          "no_rek": this.nomorrekening,
          "status": 'OPEN'
        },
        { headers })
        .subscribe(
          (val) => {
            let id = data[0].id_header
            this.doUpdatePembayaran(id)
          });
    }
    else {
      const headers = new HttpHeaders()
        .set("Content-Type", "application/json");
      this.api.post("table/x_jual_pulsa_detail",
        {
          "id_header": this.id,
          "nama_rek": this.namabank,
          "kd_bank_rek": this.namarekening,
          "no_rek": this.nomorrekening,
          "status": 'OPEN',
          "datetime": moment().format('YYYY-MM-DD HH:mm')
        },
        { headers })
        .subscribe(
          (val) => {
            let id = this.id
            this.doUpdatePembayaran(id)
          });
    }
  }
  doPembayaran() {
    this.api.get("table/x_jual_pulsa_detail", { params: { limit: 100, filter: "id_header=" + "'" + this.id + "' AND status='OPEN'" } })
      .subscribe(val => {
        let data = val['data']
        this.doInsertDetail(data)
      }, err => {
        this.doPembayaran()
      });
  }
  presentToast(msg) {
    let toast = this.toastCtrl.create({
      message: msg,
      duration: 2000,
      position: 'top',
      cssClass: 'toast-container'
    });

    toast.onDidDismiss(() => {
    });

    toast.present();
  }
  doGetLengthNamaBank() {
    if (this.namabank == '') {
      document.getElementById('namabank').style.borderColor = '#c00808'
    }
    else {
      document.getElementById('namabank').style.borderColor = '#092e61'
    }
  }
  doGetLengthNamaRekening() {
    if (this.namarekening == '') {
      document.getElementById('namarekening').style.borderColor = '#c00808'
    }
    else {
      document.getElementById('namarekening').style.borderColor = '#092e61'
    }
  }
  doGetLengthNomorRekening() {
    if (this.nomorrekening == '') {
      document.getElementById('nomorrekening').style.borderColor = '#c00808'
    }
    else {
      document.getElementById('nomorrekening').style.borderColor = '#092e61'
    }
  }
}
