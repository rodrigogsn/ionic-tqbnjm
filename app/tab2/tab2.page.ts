import { Component, ViewChild, ElementRef } from "@angular/core";
import { NavController } from "@ionic/angular";

import {
  Geolocation,
  GeolocationOptions,
  Geoposition,
  PositionError
} from "@ionic-native/geolocation/ngx";

import api from "../../services/api";

declare var google;
@Component({
  selector: "app-tab2",
  templateUrl: "tab2.page.html",
  styleUrls: ["tab2.page.scss"]
})
export class Tab2Page {
  options: GeolocationOptions;
  currentPos: Geoposition;
  @ViewChild("map") mapElement: ElementRef;
  map: any;
  listings: any;

  constructor(public navCtrl: NavController, private geolocation: Geolocation) {
    this.listings = this.getDataApi();
  }

  async getDataApi() {
    try {
      let array = [];

      const { data } = await api.get("/job-listings", {
        params: { per_page: 10 }
      });

      array = data;
      console.log(array);
      return array;
    } catch (error) {}
  }

  getUserPosition() {
    this.options = {
      enableHighAccuracy: false
    };
    this.geolocation.getCurrentPosition(this.options).then(
      (pos: Geoposition) => {
        this.currentPos = pos;
        console.log(pos);

        this.addMap(pos.coords.latitude, pos.coords.longitude);
      },
      (err: PositionError) => {
        console.log("error : " + err.message);
      }
    );
  }

  ionViewDidEnter() {
    this.getUserPosition();
  }

  addMap(lat, long) {
    let latLng = new google.maps.LatLng(lat, long);

    let mapOptions = {
      center: latLng,
      zoom: 15,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);
    this.addMarker();
  }

  addMarker() {
    let marker = new google.maps.Marker({
      map: this.map,
      animation: google.maps.Animation.DROP,
      position: this.map.getCenter()
    });

    let content = "<p>This is your current position !</p>";
    let infoWindow = new google.maps.InfoWindow({
      content: content
    });

    google.maps.event.addListener(marker, "click", () => {
      infoWindow.open(this.map, marker);
    });
  }
}
