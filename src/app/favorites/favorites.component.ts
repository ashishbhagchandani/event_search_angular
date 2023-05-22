import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'favorites',
  templateUrl: './favorites.component.html',
  styleUrls: ['./favorites.component.css'],
})
export class FavoritesComponent implements OnInit {
  title = 'hw8';

  storedFavorites: any = [];

  ngOnInit() {
    this.storedFavorites = localStorage.getItem('favorites');
    if (this.storedFavorites) {
      this.storedFavorites = JSON.parse(this.storedFavorites);
    }

    console.log(this.storedFavorites);
  }
  deletefav(id: string) {
    alert('Removed from favorites!');
    console.log(id);
    const index = this.storedFavorites.findIndex((item: any) => item.id === id);
    console.log(index);
    if (index !== -1) {
      this.storedFavorites.splice(index, 1);
    }
    localStorage.setItem('favorites', JSON.stringify(this.storedFavorites));
  }
}
