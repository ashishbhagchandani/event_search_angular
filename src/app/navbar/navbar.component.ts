import { Component, OnInit } from '@angular/core';
@Component({
  selector: 'navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent implements OnInit {
  activeNav: any = '';
  constructor() {}
  ngOnInit() {
    if (window.location.pathname === '/favorites') {
      this.activeNav = 'favorites';
    } else {
      this.activeNav = 'search';
    }
  }
  setActiveNav(nav: string): void {
    this.activeNav = nav;
  }
}
