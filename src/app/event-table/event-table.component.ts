import {
  Component,
  OnInit,
  EventEmitter,
  Output,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { CommonService } from '../shared/common.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { HttpParams } from '@angular/common/http';

@Component({
  selector: 'event-table',
  templateUrl: './event-table.component.html',
  styleUrls: ['./event-table.component.css'],
  // encapsulation: ViewEncapsulation.None,
})
export class EventTableComponent implements OnInit {
  @Output() slideChange = new EventEmitter<number>();
  eventData: any = '';
  openEventDetail: boolean = false;
  images = [944, 1011, 984].map((n) => `https://picsum.photos/id/${n}/900/500`);
  eventtitle: string = '';
  date: string = '';
  artist: string = '';
  venue: string = '';
  genre: string = '';
  price: string = '';
  ticketstatus: string = '';
  ticketsat: string = '';
  statuscolor: any = [];
  statuscode: string = '';
  url: string = '';
  seatmap: string = '';
  artistlist: any = [];
  artistres: any = [];
  address: string = '';
  city: string = '';
  phone: string = '';
  openhr: string = '';
  generalrule: string = '';
  childrule: string = '';
  maxLength: number = 85;
  showFullText: boolean = false;
  showFullTextgr: boolean = false;
  showFullTextcr: boolean = false;
  venuelat: number = 0;
  venuelng: number = 0;
  eventid: string = '';
  close: boolean = true;
  mapOptions: google.maps.MapOptions = {};
  marker = { position: { lat: 0, lng: 0 } };
  venue1: string = '';
  venueshow: boolean = true;
  state: string = '';
  showmore: string = 'showmore';
  showmore1: string = 'showmore1';
  showmore2: string = 'showmore2';
  private carousel: any;
  constructor(private shared: CommonService, private http: HttpClient) {}
  apiUrl = `${environment.apiUrl}`;
  onPrev(event: Event): void {
    event.preventDefault();
    this.slideChange.emit(-1);
  }
  getLineCount(text: string): number {
    const lines = text.split('\n');
    return lines.length;
  }

  isLiked = false;

  onClick(
    id: string,
    date: string,
    eventtitle: string,
    genre: string,
    venue: string
  ) {
    console.log(id);
    if (this.isLiked) {
      alert('Event Removed from Favorites!');
    } else {
      alert('Event Added to Favorites!');
    }

    const data = {
      id: id,
      date: date,
      eventtitle: eventtitle,
      genre: genre,
      venue: venue,
    };
    let favorites = [];
    const storedFavorites = localStorage.getItem('favorites');
    if (storedFavorites) {
      favorites = JSON.parse(storedFavorites);
    }

    this.isLiked = !this.isLiked;

    if (this.isLiked) {
      favorites.push(data);
    } else {
      const index = favorites.findIndex((item: any) => item.id === data.id);
      if (index !== -1) {
        favorites.splice(index, 1);
      }
    }

    localStorage.setItem('favorites', JSON.stringify(favorites));
  }

  displayStyle = 'none';

  openPopup() {
    this.displayStyle = 'block';
    console.log(this.venuelat, this.venuelng);
  }
  closePopup() {
    this.displayStyle = 'none';
  }

  onNext(event: Event): void {
    event.preventDefault();
    this.slideChange.emit(1);
  }
  ngOnInit(): void {
    this.shared.showeventdetails.subscribe((data) => {
      console.log(data);
      this.close = data;
      this.openEventDetail = false;
    });
    this.shared.events.subscribe((data) => {
      this.backEvent(false);
      this.close = false;
      this.openEventDetail = false;
      if (data.page && data.page.totalElements && data.page.totalElements > 0) {
        console.log('heere', data._embedded.events);
        this.eventData = data._embedded.events;
        console.log('before', this.eventData);
        this.eventData.sort((a: any, b: any) => {
          const dateA = new Date(
            a.dates.start.dateTime || a.dates.start.localDate
          );
          const dateB = new Date(
            b.dates.start.dateTime || b.dates.start.localDate
          );
          return dateA.getTime() - dateB.getTime();
        });
        console.log('after', this.eventData);
        this.close = false;
      } else {
        this.eventData = [];
      }
    });
  }
  custom_sort(a: any, b: any) {
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  }

  eventDetail(id: any) {
    console.log(id);
    this.eventid = id;
    this.openEventDetail = true;
    const url = `${this.apiUrl}ticketmastereventdetail`;
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    const options = { headers: headers };
    this.http.get(url, { params: { id } }).subscribe(
      (res) => {
        console.log(res);
        const favlist: string | null = localStorage.getItem('favorites');
        if (favlist) {
          const fav1 = JSON.parse(favlist);
          const getid = fav1.some((item: any) => item.id === id);
          this.isLiked = getid;
        }

        this.eventtitle = (<any>res).name;
        if ((<any>res).dates && (<any>res).dates.start) {
          if ((<any>res).dates.start.localDate) {
            this.date = (<any>res).dates.start.localDate;
          }
        }
        this.artist = '';
        this.artistlist = [];
        if (
          (<any>res).hasOwnProperty('_embedded') &&
          (<any>res)._embedded.hasOwnProperty('attractions')
        ) {
          // var artist_team = '';
          var artiststr = (<any>res)._embedded.attractions;

          for (var i = 0; i < artiststr.length; ++i) {
            if (
              artiststr[i].hasOwnProperty('classifications') &&
              artiststr[i].classifications[0].hasOwnProperty('segment') &&
              artiststr[i].classifications[0].segment.name === 'Music'
            ) {
              this.artistlist.push(artiststr[i].name);
            }
            if (artiststr[i].hasOwnProperty('url')) {
              if (i !== 0) {
                this.artist += ` | ${artiststr[i].name}`;
              } else {
                this.artist += `${artiststr[i].name}`;
              }
            } else {
              if (i !== 0) {
                this.artist += ` | ${artiststr[i].name}`;
              } else {
                this.artist += `${artiststr[i].name}`;
              }
            }
          }
        }

        //  var getGenre = '';
        if ((<any>res).hasOwnProperty('classifications')) {
          var genrestr = (<any>res).classifications;

          if (
            genrestr[0].hasOwnProperty('genre') &&
            genrestr[0].genre.name &&
            genrestr[0].genre.name !== 'Undefined'
          ) {
            this.genre += genrestr[0].genre.name + ' ';
          }
          if (
            genrestr[0].hasOwnProperty('subGenre') &&
            genrestr[0].subGenre.name &&
            genrestr[0].subGenre.name !== 'Undefined'
          ) {
            this.genre += ' | ' + ' ' + genrestr[0].subGenre.name + ' ';
          }
          if (
            genrestr[0].hasOwnProperty('segment') &&
            genrestr[0].segment.name &&
            genrestr[0].segment.name !== 'Undefined'
          ) {
            this.genre += ' | ' + ' ' + genrestr[0].segment.name + ' ';
          }
          if (
            genrestr[0].hasOwnProperty('subType') &&
            genrestr[0].subType.name &&
            genrestr[0].subType.name !== 'Undefined'
          ) {
            this.genre += ' | ' + ' ' + genrestr[0].subType.name;
          }
        }

        if ((<any>res)._embedded && (<any>res)._embedded.venues[0].name) {
          this.venue = (<any>res)._embedded.venues[0].name;
        }

        var pricerange: string = '';
        if ((<any>res).hasOwnProperty('priceRanges')) {
          if (
            (<any>res).priceRanges[0].hasOwnProperty('min') &&
            (<any>res).priceRanges[0].hasOwnProperty('max')
          ) {
            pricerange = `${(<any>res).priceRanges[0].min} - ${
              (<any>res).priceRanges[0].max
            }`;
          } else if (
            !(<any>res).priceRanges[0].hasOwnProperty('min') &&
            (<any>res).priceRanges[0].hasOwnProperty('max')
          ) {
            pricerange = `${(<any>res).priceRanges[0].max} - ${
              (<any>res).priceRanges[0].max
            }`;
          } else if (
            (<any>res).priceRanges[0].hasOwnProperty('min') &&
            !(<any>res).priceRanges[0].hasOwnProperty('max')
          ) {
            pricerange = `${(<any>res).priceRanges[0].min} - ${
              (<any>res).priceRanges[0].min
            }`;
          }
        }
        // if (pricerange && (<any>res).hasOwnProperty('priceRanges')) {
        //   if ((<any>res).priceRanges[0].hasOwnProperty('currency')) {
        //     pricerange += ` ${(<any>res).priceRanges[0].currency}`;
        //   }
        // }
        this.price = pricerange;

        if (
          (<any>res).hasOwnProperty('dates') &&
          (<any>res).dates.hasOwnProperty('status') &&
          (<any>res).dates.status.hasOwnProperty('code')
        ) {
          if ((<any>res).dates.status.code === 'onsale') {
            this.statuscolor = 'onsale';
            this.statuscode = 'On Sale';
          } else if ((<any>res).dates.status.code === 'offsale') {
            this.statuscolor = 'offsale';
            this.statuscode = 'Off Sale';
          } else if ((<any>res).dates.status.code === 'rescheduled') {
            this.statuscolor = 'rescheduled';
            this.statuscode = 'Rescheduled';
          } else if ((<any>res).dates.status.code === 'postponed') {
            this.statuscolor = 'postponed';
            this.statuscode = 'Postponed';
          } else if ((<any>res).dates.status.code === 'cancelled') {
            this.statuscolor = 'cancelled';
            this.statuscode = 'Cancelled';
          }
        }

        if ((<any>res).seatmap && (<any>res).seatmap.staticUrl) {
          this.seatmap = (<any>res).seatmap.staticUrl;
        }

        if ((<any>res).url) {
          this.url = (<any>res).url;
        }

        if (this.artistlist) {
          console.log('artist list', this.artistlist);
          // const data = this.artistlist;
          const params = new HttpParams().set('artistlist', this.artistlist);
          const url = `${this.apiUrl}spotifysearchartist`;
          const headers = new HttpHeaders().set(
            'Content-Type',
            'application/json'
          );
          const options = { headers: headers };
          this.http.get(url, { params }).subscribe((artistres) => {
            console.log(artistres);
            this.artistres = artistres;
          });
        }

        const url = `${this.apiUrl}ticketmastervenue`;
        const headers = new HttpHeaders().set(
          'Content-Type',
          'application/json'
        );
        const venue = (<any>res)._embedded.venues[0].name;
        const options = { headers: headers };
        this.http.get(url, { params: { venue } }).subscribe((venuedetails) => {
          console.log(venuedetails);
          console.log(this.mapOptions, this.marker.position.lat == 0);
          if (
            venuedetails &&
            (<any>venuedetails)._embedded &&
            (<any>venuedetails)._embedded.venues &&
            (<any>venuedetails)._embedded.venues[0]
          ) {
            if ((<any>venuedetails)._embedded.venues[0].name) {
              this.venue1 = (<any>venuedetails)._embedded.venues[0].name;
            }
            if (
              (<any>venuedetails)._embedded.venues[0].boxOfficeInfo &&
              (<any>venuedetails)._embedded.venues[0].boxOfficeInfo
                .phoneNumberDetail
            ) {
              this.phone = (<any>(
                venuedetails
              ))._embedded.venues[0].boxOfficeInfo.phoneNumberDetail;
            }
            if (
              (<any>venuedetails)._embedded.venues[0].address &&
              (<any>venuedetails)._embedded.venues[0].address.line1
            ) {
              this.address = (<any>(
                venuedetails
              ))._embedded.venues[0].address.line1;
            }
            if (
              (<any>venuedetails)._embedded.venues[0].boxOfficeInfo &&
              (<any>venuedetails)._embedded.venues[0].boxOfficeInfo
                .openHoursDetail
            ) {
              this.openhr = (<any>(
                venuedetails
              ))._embedded.venues[0].boxOfficeInfo.openHoursDetail;
            }
            if ((<any>venuedetails)._embedded.venues[0].generalInfo) {
              if (
                (<any>venuedetails)._embedded.venues[0].generalInfo.generalRule
              ) {
                this.generalrule = (<any>(
                  venuedetails
                ))._embedded.venues[0].generalInfo.generalRule;
              }
              if (
                (<any>venuedetails)._embedded.venues[0].generalInfo.childRule
              ) {
                this.childrule = (<any>(
                  venuedetails
                ))._embedded.venues[0].generalInfo.childRule;
              }
            }
            if (
              (<any>venuedetails)._embedded.venues[0].city &&
              (<any>venuedetails)._embedded.venues[0].city.name
            ) {
              this.city = `${
                (<any>venuedetails)._embedded.venues[0].city.name
              } `;
            }
            if (
              (<any>venuedetails)._embedded.venues[0].state.name &&
              (<any>venuedetails)._embedded.venues[0].state.name
            ) {
              this.state = `${
                (<any>venuedetails)._embedded.venues[0].state.name
              }`;
            }
            if (
              (<any>venuedetails)._embedded.venues[0].location &&
              (<any>venuedetails)._embedded.venues[0].location.latitude &&
              (<any>venuedetails)._embedded.venues[0].location.longitude
            ) {
              this.marker = {
                position: {
                  lat: Number(
                    (<any>venuedetails)._embedded.venues[0].location.latitude
                  ),
                  lng: Number(
                    (<any>venuedetails)._embedded.venues[0].location.longitude
                  ),
                },
              };

              this.mapOptions = {
                center: {
                  lat: Number(
                    (<any>venuedetails)._embedded.venues[0].location.latitude
                  ),
                  lng: Number(
                    (<any>venuedetails)._embedded.venues[0].location.longitude
                  ),
                },
                zoom: 14,
              };
            }
          } else {
            this.venueshow = false;
          }
        });
      },
      (error) => {
        console.log(error);
      }
    );
  }

  changeShow() {
    this.showmore = this.showmore == 'showmore' ? '' : 'showmore';
  }
  changeShow1() {
    this.showmore1 = this.showmore1 == 'showmore1' ? '' : 'showmore1';
  }
  changeShow2() {
    this.showmore2 = this.showmore2 == 'showmore2' ? '' : 'showmore2';
  }
  backEvent(val: any) {
    this.openEventDetail = false;
    this.eventtitle = '';
    this.date = '';
    this.artist = '';
    this.venue = '';
    this.genre = '';
    this.price = '';
    this.ticketstatus = '';
    this.ticketsat = '';
    this.statuscolor = [];
    this.statuscode = '';
    this.url = '';
    this.seatmap = '';
    this.artistlist = [];
    this.artistres = [];
    this.address = '';
    this.city = '';
    this.state = '';
    this.phone = '';
    this.openhr = '';
    this.generalrule = '';
    this.childrule = '';
    this.maxLength = 85;
    this.showFullText = false;
    this.showFullTextgr = false;
    this.showFullTextcr = false;
    this.venuelat = 0;
    this.venuelng = 0;
    this.eventid = '';
    this.mapOptions = {};
    this.marker = { position: { lat: 0, lng: 0 } };
    this.venueshow = true;
    this.showmore = 'showmore';
    this.showmore1 = 'showmore1';
    this.showmore2 = 'showmore2';
  }
}
