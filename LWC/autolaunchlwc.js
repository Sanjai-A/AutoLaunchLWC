import { LightningElement, api, wire,track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { getRecord } from 'lightning/uiRecordApi';
import saveLocation from "@salesforce/apex/autolaunchController.saveLocation";
const FIELDS=['Account.Current_Location__Latitude__s'];

export default class Autolaunch extends LightningElement {
    @api recordId;
    @wire(getRecord, { recordId: '$recordId', fields: FIELDS })
    wiredRecord({ error, data }) {
        if (data) {
           if(data.fields.Current_Location__Latitude__s.value == null ){
           this.captureLocation();}
        }
        if (error) {
          console.log("Error");
        }
    }
    @track latitude=0;
    @track longitude=0;
    captureLocation(){
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
              this.latitude = position.coords.latitude;
              this.longitude = position.coords.longitude;
          saveLocation({recordId: this.recordId,latitude:this.latitude,longitude:this.longitude})
              .then(() => {
              const evt = new ShowToastEvent({
                title: 'Geolocation Saved',
                message: 'Current Location Captured',
                variant: 'success',
              });
              this.dispatchEvent(evt);
              eval("$A.get('e.force:refreshView').fire();");
            });
        });
          } else {
            const evt = new ShowToastEvent({
              title: 'Geolocation is not supported by browser',
              message: 'Check your browser options or use another browser',
              variant: 'error',
            });
            this.dispatchEvent(evt);
          }
    }
}
