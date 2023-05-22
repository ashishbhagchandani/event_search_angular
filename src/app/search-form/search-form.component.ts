import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormControl } from '@angular/forms';
import { CommonService } from '../shared/common.service';
import { environment } from 'src/environments/environment';
import { HttpParams } from '@angular/common/http';
import {
  debounceTime,
  tap,
  switchMap,
  finalize,
  distinctUntilChanged,
  filter,
} from 'rxjs/operators';

@Component({
  selector: 'search-form',
  templateUrl: './search-form.component.html',
  styleUrls: ['./search-form.component.css'],
})
export class SearchComponent implements OnInit {
  keyword: string = '';
  distance: number = 10;
  category: string = 'default';
  location: string = '';
  locationcheck: boolean = false;
  parentData: any = '';

  searchKeyword = new FormControl();
  filteredKeyword: any = [];
  isLoading = false;
  errorMsg!: string;
  minLengthTerm = 2;

  constructor(private http: HttpClient, private shared: CommonService) {}
  apiUrl = `${environment.apiUrl}`;

  onSelected() {
    this.keyword = this.keyword;
  }
  clear(myForm: NgForm, distanceInput: any, categoryInput: any) {
    myForm.reset();
    this.filteredKeyword = [];
    this.keyword = '';
    distanceInput.value = 10;
    categoryInput.value = 'default';
    this.category = 'default';
    this.distance = 10;
    this.shared.closeEventData(true);
  }

  ngOnInit() {
    console.log(this.apiUrl);
    this.filteredKeyword = [];
    this.category = 'default';
    this.distance = 10;
    console.log(this.searchKeyword);
    this.searchKeyword.valueChanges
      .pipe(
        filter((res) => {
          return res !== null && res.length >= this.minLengthTerm;
        }),
        distinctUntilChanged(),
        debounceTime(100),
        tap(() => {
          this.errorMsg = '';
          this.filteredKeyword = [];
          this.isLoading = true;
        }),

        switchMap((value) =>
          this.http
            .get(`${this.apiUrl}ticketmastersuggest`, { params: { value } })
            .pipe(
              finalize(() => {
                this.isLoading = false;
              })
            )
        )
      )
      .subscribe((data: any) => {
        if (!data._embedded) {
          this.filteredKeyword = [];
        } else {
          this.errorMsg = '';
          this.filteredKeyword = data._embedded.attractions;
        }
      });
  }

  onAutoDetectLocationChange(target: EventTarget | null) {
    this.location = '';
    if (target instanceof HTMLInputElement) {
      console.log(target.checked);
    }
  }

  onSubmit = async (form: NgForm) => {
    console.log(form.value, this.keyword, this.category);

    const url = `${this.apiUrl}ticketmastersearch`;
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    const options = { headers: headers };

    var segmentId: string = '';
    if (this.category == 'music') {
      segmentId = 'KZFzniwnSyZfZ7v7nJ';
    } else if (this.category == 'sports') {
      segmentId = 'KZFzniwnSyZfZ7v7nE';
    } else if (this.category == 'artsTheatre') {
      segmentId = 'KZFzniwnSyZfZ7v7na';
    } else if (this.category == 'film') {
      segmentId = 'KZFzniwnSyZfZ7v7nn';
    } else if (this.category == 'miscellaneous') {
      segmentId = 'KZFzniwnSyZfZ7v7n1';
    }

    if (this.locationcheck) {
      const request = await fetch(
        'https://ipinfo.io/json?token='
      );
      const jsonResponse = await request.json();
      console.log(jsonResponse);
      var location_corr: any[] = jsonResponse.loc.split(',');
    } else {
      const request = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${this.location}&key=`
      );
      const jsonResponse = await request.json();
      var location_corr: any[] = [
        jsonResponse.results[0].geometry.location.lat,
        jsonResponse.results[0].geometry.location.lng,
      ];
    }

    const databody: any = {
      keyword: this.keyword,
      segmentId: segmentId,
      lat: location_corr[0],
      lng: location_corr[1],
      radius: this.distance,
    };

    const params = new HttpParams()
      .set('keyword', this.keyword)
      .set('segmentId', segmentId)
      .set('lat', location_corr[0])
      .set('lng', location_corr[1])
      .set('radius', this.distance);
    // console.log(databody);
    await this.http.get(url, { params }).subscribe(
      (res) => {
        console.log(res);
        this.parentData = res;
        this.shared.setEventData(this.parentData);
      },
      (error) => {
        console.log(error);
      }
    );
  };
}
