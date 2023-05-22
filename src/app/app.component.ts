import { Component } from '@angular/core';
import { Router, NavigationStart } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  constructor(private router: Router) {}
  title = 'hw8';
  favorites: any = [];
  ngOnInit(): void {
    // this.router.navigate(['']);
    // localStorage.setItem('favorites', this.favorites);
  }
}
