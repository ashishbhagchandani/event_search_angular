import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
@Injectable({
  providedIn: 'root',
})
export class CommonService {
  events = new Subject<any>();
  showeventdetails = new Subject<boolean>();
  constructor() {
    (this.events = new Subject<any>()),
      (this.showeventdetails = new Subject<boolean>());
  }
  setEventData(data: any) {
    console.log(data);
    this.events.next(data);
    console.log(this.events);
  }
  closeEventData(data: any) {
    console.log(data);
    this.showeventdetails.next(data);
  }
}
