import { Component, Input, ViewChild } from '@angular/core';
import { NavController, Platform, ToastController, } from 'ionic-angular';
import { SMS } from '@ionic-native/sms';
import { ApiProvider } from '../../providers/api/api';
import { HttpHeaders } from "@angular/common/http";
import moment from 'moment';
import { UniqueDeviceID } from '@ionic-native/unique-device-id';

declare var SMSReceive: any;
declare var sms: any;

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  public menu = 'ptop'
  public nohp = '';
  public nominal = 0;
  public rupiah = '';
  public rupiahterima = '';
  public imgopt: any;
  public rate: any;
  public nominalterima = 0;
  public id: any;
  public operator: any;
  public iddevices: any;

  constructor(
    public navCtrl: NavController,
    private sms: SMS,
    public api: ApiProvider,
    public toastCtrl: ToastController,
    private uniqueDeviceID: UniqueDeviceID,
    public platform: Platform) {
    this.uniqueDeviceID.get()
      .then((uuid: any) => {
        this.iddevices = uuid
        this.api.get("table/x_devices", { params: { limit: 100, filter: "id_devices=" + "'" + uuid + "'" } })
          .subscribe(val => {
            let data = val['data']
            if (data.length != 0) {
              const headers = new HttpHeaders()
                .set("Content-Type", "application/json");
              this.api.put("table/x_devices",
                {
                  "id_devices": data[0].id_devices,
                  "count_login": parseInt(data[0].count_login) + 1,
                  "nama_bank": '',
                  "nama_rek": '',
                  "nomor_rek": '',
                  "datetime": moment().format('YYYY-MM-DD HH:mm')
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
                  "id_devices": this.iddevices,
                  "count_login": 1,
                  "nama_bank": '',
                  "nama_rek": '',
                  "nomor_rek": '',
                  "datetime": moment().format('YYYY-MM-DD HH:mm')
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
    this.menu = 'ptop'
    this.nohp = ''
    this.rupiah = '0';
    this.rate = '';
  }
  doSendSMS() {
    var number = '151' /* iOS: ensure number is actually a string */
    var message = 'Transfer pulsa 08159596494'

    //CONFIGURATION
    var options = {
      replaceLineBreaks: false, // true to replace \n by a new line, false by default
      android: {
        intent: 'INTENT'  // send SMS with the native android SMS messaging
        //intent: '' // send SMS without opening any other app
      }
    };

    var success = function () {
      console.log('Message sent successfully');
    };
    var error = function (e) {
      console.log('Message Failed:' + e);
    };
    sms.send(number, message, options, success, error);
  }
  doDeleteNoHP() {
    this.nohp = ''
    this.rate = '';
    this.nominal = 0;
    this.nominalterima = 0;
    this.rupiah = '0'
    this.rupiahterima = '0'
  }
  ngAfterViewInit() {
    if (this.platform.is('cordova')) {
      SMSReceive.startWatch(function () {
        console.log('smsreceive: watching started');
      }, function () {
        console.log('smsreceive: failed to start watching');
      });
      document.addEventListener('onSMSArrive', function (e) {
        console.log('No: ' + e['data'].address + " Message: " + e['data'].body)
      });
    }
  }
  doGetLength() {
    if (this.nohp[0] == '0') {
      let nohp = parseInt(this.nohp) * 1
      this.nohp = nohp.toString()
    }
    this.api.get("table/x_prefix_operator", { params: { limit: 100, filter: "kode_prefix=" + "'" + this.nohp.substring(0, 3) + "' AND status='OPEN'" } })
      .subscribe(val => {
        let data = val['data']
        if (data.length != 0) {
          this.imgopt = data[0].icon
          this.rate = data[0].rate
          this.operator = data[0].operator
        }
        else {
          this.imgopt = ''
          this.rate = ''
        }
      });
    if (this.nohp.length > 7 && this.nohp.length < 14) {
      document.getElementById('nohpkey').style.borderColor = '#092e61'
      document.getElementById('length').style.color = '#092e61'
    }
    else {
      document.getElementById('nohpkey').style.borderColor = '#c00808'
      document.getElementById('length').style.color = '#c00808'
    }
  }
  doGetLengthNominal() {
    if (this.nominal[0] == 0) {
      this.nominal = this.nominal * 1
    }
    if (this.nominal < 1) {
      this.nominal = 0
      this.rupiah = '0'
    }
    else {
      this.nominal = this.nominal
      if (this.nominal >= 50000 && this.nominal <= 1000000) {
        document.getElementById('nominal').style.borderColor = '#092e61'
        document.getElementById('lengthnominal').style.color = '#092e61'
      }
      else if (this.nominal > 1000000) {
        document.getElementById('nominal').style.borderColor = '#c00808'
        document.getElementById('lengthnominal').style.color = '#c00808'
        this.nominal = 0
        this.rupiah = '0'
      }
      else {
        document.getElementById('nominal').style.borderColor = '#c00808'
        document.getElementById('lengthnominal').style.color = '#c00808'
      }
      var number_string = this.nominal.toString(),
        sisa = number_string.length % 3,
        rupiah = number_string.substr(0, sisa),
        ribuan = number_string.substr(sisa).match(/\d{3}/g);

      if (ribuan) {
        var separator = sisa ? '.' : '';
        rupiah += separator + ribuan.join('.');
      }
      this.rupiah = rupiah
    }
    this.nominalterima = this.nominal * this.rate
  }
  doDeleteNominal() {
    this.nominal = 0
    this.rupiah = '0';
    this.nominalterima = 0;
    this.rupiahterima = '0'
  }
  doChangeNominalterima() {
    var number_string = this.nominalterima.toString(),
      sisa = number_string.length % 3,
      rupiah = number_string.substr(0, sisa),
      ribuan = number_string.substr(sisa).match(/\d{3}/g);

    if (ribuan) {
      var separator = sisa ? '.' : '';
      rupiah += separator + ribuan.join('.');
    }
    this.rupiahterima = rupiah
  }
  on() {
    document.getElementById("overlay").style.display = "block";
  }

  off() {
    document.getElementById("overlay").style.display = "none";
  }
  doGetNextNo() {
    return this.api.get('nextno/x_jual_pulsa_header/no_urut')
  }
  doInsertTr() {
    if (this.nohp == '') {
      this.presentToast('No HP Masih Kosong')
    }
    else if (this.nohp.length < 8 || this.nohp.length > 13) {
      this.presentToast('No HP tidak boleh kurang dari 8 Digit Atau lebih dari 13 Digit')
    }
    else if (this.nominal < 50000 || this.nominal > 1000000) {
      this.presentToast('Nominal tidak boleh kurang dari 50.000 atau lebih dari 1.000.000')
    }
    else if ((this.nohp.length > 8 || this.nohp.length < 14) && (this.nominal >= 20000 || this.nominal <= 1000000)) {
      this.api.get("table/x_jual_pulsa_header", { params: { limit: 100, filter: "id=" + "'" + this.id + "' AND status='OPEN'" } })
        .subscribe(val => {
          let data = val['data']
          if (data.length != 0) {
            const headers = new HttpHeaders()
              .set("Content-Type", "application/json");
            this.api.put("table/x_jual_pulsa_header",
              {
                "id": data[0].id,
                "no_telp": this.nohp,
                "operator": this.operator,
                "nominal_jual": this.nominal,
                "nominal_trf": this.nominalterima,
                "rate": this.rate,
                "id_devices": this.iddevices,
                "datetime": moment().format('YYYY-MM-DD HH:mm'),
                "datetime_exp": moment().format('YYYY-MM-DD HH:mm')
              },
              { headers })
              .subscribe(
                (val) => {
                  this.navCtrl.push('DetailpembayaranPage', {
                    id: this.id
                  })
                }, err => {
                  this.doInsertTr()
                });
          }
          else {
            this.doGetNextNo().subscribe(val => {
              let nextno = val['nextno'];
              let date = new Date(moment().format('YYYY-MM-DD HH:mm'));
              date.setHours(0, 0, 0, 0);
              // Thursday in current week decides the year.
              date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
              // January 4 is always in week 1.
              let week1 = new Date(date.getFullYear(), 0, 4);
              // Adjust to Thursday in week 1 and count number of weeks from date to week1.
              let batch = (Math.round(((date.getTime() - week1.getTime()) / 86400000
                - 3 + (week1.getDay() + 6) % 7) / 7) + 1)
              let batchfix = '';
              if (batch < 10) {
                batchfix = '0' + batch.toString()
              }
              else {
                batchfix = batch.toString()
              }
              let batchno = (date.getFullYear().toString().substr(-2)) + batchfix
              this.id = batchno + nextno
              const headers = new HttpHeaders()
                .set("Content-Type", "application/json");
              this.api.post("table/x_jual_pulsa_header",
                {
                  "id": this.id,
                  "no_urut": nextno,
                  "no_telp": this.nohp,
                  "operator": this.operator,
                  "nominal_jual": this.nominal,
                  "nominal_trf": this.nominalterima,
                  "rate": this.rate,
                  "id_devices": this.iddevices,
                  "status": 'OPEN',
                  "datetime": moment().format('YYYY-MM-DD HH:mm'),
                  "datetime_exp ": moment().format('YYYY-MM-DD HH:mm')
                },
                { headers })
                .subscribe(
                  (val) => {
                    /*this.nohp = ''
                    this.nominal = 0
                    this.nominalterima = 0
                    this.rate = ''
                    this.rupiah = ''
                    this.rupiahterima = ''*/
                    this.navCtrl.push('DetailpembayaranPage', {
                      id: this.id
                    })
                  }, err => {
                    this.doInsertTr()
                  });
            });
          }
        });
    }
    else {
      this.presentToast('Silahkan lengkapi inputan diatas!')
    }
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
}
