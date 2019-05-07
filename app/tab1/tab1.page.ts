import { Component, ViewChild, ElementRef } from "@angular/core";
import { NavController, LoadingController } from "@ionic/angular";

import {
  Geolocation,
  GeolocationOptions,
  Geoposition,
  PositionError
} from "@ionic-native/geolocation/ngx";

import api from "../../services/api";

declare var google;
var iconBase = "../../assets/img/";

@Component({
  selector: "app-tab1",
  templateUrl: "tab1.page.html",
  styleUrls: ["tab1.page.scss"]
})
export class Tab1Page {
  options: GeolocationOptions;
  currentPos: Geoposition;
  @ViewChild("map") mapElement: ElementRef;
  map: any;
  listings: any;
  currentPositionMarker: any;
  markers: any;
  loader: any;

  constructor(
    public navCtrl: NavController,
    private geolocation: Geolocation,
    public loadingController: LoadingController
  ) {
    // this.listings = this.getDataApi();
    this.getDataApi = this.getDataApi.bind(this);
    this.getListingPosition = this.getListingPosition.bind(this);
  }

  showLoader() {
    this.loader = this.loadingController
      .create({
        message: "Searching nearby listings..."
      })
      .then(res => {
        res.present();

        res.onDidDismiss().then(dis => {
          console.log("Loading dismissed!");
        });
      });
  }

  hideLoader() {
    this.loadingController.dismiss();
  }

  async getDataApi(lat, lng) {
    try {
      let array = [];
      this.showLoader();

      this.geolocation.getCurrentPosition(this.options).then(
        async (pos: Geoposition) => {
          this.currentPos = pos;
          // const latitude = (lat) ? lat : pos.coords.latitude;
          // const longitude = (lng) ? lng : pos.coords.longitude;
          const latitude = lat ? lat : 40.767649;
          const longitude = lng ? lng : -73.976277;

          const { data } = await api.get(
            `/location/${latitude}/${longitude}/0.03`
          );

          array = data;
          console.log(data);

          let marker = "";
          let markers = [];

          array.map(function(i) {
            // console.log(i);
            marker = this.getListingPosition(i, this);
            markers.push(marker);
          }, this);

          this.markers = markers;
          this.map.setZoom(14);
          this.hideLoader();

          return array;
        },
        (err: PositionError) => {
          console.log("error : " + err.message);
        }
      );
    } catch (error) {}
  }

  // Sets the map on all markers in the array.
  setMapOnAll(map) {
    for (var i = 0; i < this.markers.length; i++) {
      this.markers[i].setMap(map);
    }

    this.searchNewData();
  }

  getUserPosition() {
    this.options = {
      enableHighAccuracy: false
    };
    this.geolocation.getCurrentPosition(this.options).then(
      (pos: Geoposition) => {
        this.currentPos = pos;
        // this.addMap(pos.coords.latitude, pos.coords.longitude);
        this.addMap(40.767649, -73.976277);
      },
      (err: PositionError) => {
        console.log("error : " + err.message);
      }
    );
  }

  searchNewData() {
    this.getDataApi(this.map.getCenter().lat(), this.map.getCenter().lng());
  }

  searchThisArea() {
    this.options = {
      enableHighAccuracy: false
    };
    this.geolocation.getCurrentPosition(this.options).then(
      (pos: Geoposition) => {
        this.currentPos = pos;
        // this.addMap(pos.coords.latitude, pos.coords.longitude);

        this.setMapOnAll(null);
      },
      (err: PositionError) => {
        console.log("error : " + err.message);
      }
    );
  }

  setUserPosition() {
    this.options = {
      enableHighAccuracy: false
    };
    this.geolocation.getCurrentPosition(this.options).then(
      (pos: Geoposition) => {
        this.currentPos = pos;
        // this.addMap(pos.coords.latitude, pos.coords.longitude);
        let latLng = new google.maps.LatLng(40.76763, -73.97622);
        this.map.setCenter(latLng);
        this.removeCurrentPositionMarker();
        this.addMarker();
      },
      (err: PositionError) => {
        console.log("error : " + err.message);
      }
    );
  }

  getListingPosition(listing) {
    let array = listing._job_location_map.split(`,`);
    const latitude = array[0];
    const longitude = array[1];

    var icon = {
      url: iconBase + "listing-position.png", // url
      scaledSize: new google.maps.Size(55, 55), // scaled size
      origin: new google.maps.Point(0, 0), // origin
      anchor: new google.maps.Point(0, 0) // anchor
    };

    let marker = new google.maps.Marker({
      position: new google.maps.LatLng(latitude, longitude),
      map: this.map,
      icon: icon
    });

    var infowindow = new google.maps.InfoWindow();

    google.maps.event.addListener(
      marker,
      "click",
      (function(marker, i) {
        return function() {
          infowindow.setContent(`
            <div style="
              background-image: url('${listing._listing_gallery}');
              background-size: cover;
              background-position: center;
              height: 100px;
              width: 100%">
            </div>
            <h1 style="margin-top: 10px; font-size: 16px; width: 150px;">${
              listing.post_title
            }</h1>
            `);
          infowindow.open(this.map, marker);
        };
      })(marker)
    );

    return marker;
  }

  ngOnInit() {
    this.getUserPosition();
    this.getDataApi(null, null);
  }

  addMap(lat, long) {
    let latLng = new google.maps.LatLng(lat, long);

    let mapOptions = {
      center: latLng,
      zoom: 14,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      fullscreenControl: false,
      mapTypeControl: false,
      streetViewControl: false,
      zoomControl: false
    };

    this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);
    this.addMarker();
  }

  addMarker() {
    var icon = {
      url: iconBase + "user-position.png", // url
      scaledSize: new google.maps.Size(35, 35), // scaled size
      origin: new google.maps.Point(0, 0), // origin
      anchor: new google.maps.Point(0, 0) // anchor
    };

    let marker = new google.maps.Marker({
      map: this.map,
      position: this.map.getCenter(),
      icon: icon
    });

    this.currentPositionMarker = marker;
    console.log(this.currentPositionMarker);
  }

  removeCurrentPositionMarker() {
    this.currentPositionMarker.setMap(null);
  }
}
