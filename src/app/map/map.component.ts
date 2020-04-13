import { Component, OnInit } from '@angular/core';
import { MapService } from './shared/map.service';
import { IStateModel } from '../models/state.model';
import { IMapModel } from '../models/map.model';
import { CoordinatesService } from './shared/coordinates.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';

declare let L: any;

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit {
  mapModel: IMapModel = {
    features: [],
    lastUpdate: new Date('01/01/1900'),
    totalCases: 0,
    totalDeadly: '0%',
    totalDeaths: 0,
    totalRecovered: 0,
    type: 'FeatureCollection'
  };

  constructor(
    private mapService: MapService,
    private coordinatesService: CoordinatesService,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService) { }

  ngOnInit() {
    this.initializeMap();
  }

  // initialize map
  initializeMap() {

    this.spinner.show();

    // get the model
    this.mapService.getCases()
      .subscribe(cases => {

        if (!cases || !cases.results) return;

        // the result is ordered from oldest to newest, with that, get the lastest report (newest)
        this.mapService.getCasesRecovered()
          .subscribe(casesRecovered => {
            this.loadDataToMap(cases, casesRecovered);
          }, error => {
            this.toastr.warning(`A fonte de dados sobre "Casos Recuperados" está indisponível, 
            tente novamente mais tarde.`, 'ATENÇÃO');
            this.loadDataToMap(cases, undefined);
          });
      }, error=>{
        this.toastr.error(`A fonte de dados sobre os casos de COVID-19 no Brasil está indisponível, 
        tente novamente mais tarde.`, 'OOPS');
      });
  }

  // giving the cases with or without recovered cases, build load to map
  loadDataToMap(cases: any, casesRecovered: any) {
    if (casesRecovered)
      this.mapModel.totalRecovered = casesRecovered[casesRecovered.length - 1].Cases;

    let count = 0;

    cases.results.forEach(item => {
      let updatedAt = new Date(item.updatedAt);

      this.mapModel.features.push({
        type: 'Feature',
        id: count + 1,
        properties: {
          name: item.nome,
          cases: item.qtd_confirmado,
          updatedAt: updatedAt,
          deadly: item.letalidade,
          deaths: item.qtd_obito
        },
        geometry: this.coordinatesService.getGeometryByStateName(item.nome)
      });

      this.mapModel.totalCases += item.qtd_confirmado;
      this.mapModel.totalDeaths += item.qtd_obito;
      this.mapModel.lastUpdate = updatedAt <= this.mapModel.lastUpdate ?
        this.mapModel.lastUpdate :
        updatedAt;
      count++;
    });

    this.mapModel.totalDeadly =
      ((this.mapModel.totalDeaths / this.mapModel.totalCases) * 100).toFixed(2).replace('.', ',')

    this.buildMap();
    this.spinner.hide();
  }

  // build map and includes the info and legend
  buildMap() {

    // initialization of the Choropleth map
    map = L.map('map').setView([-14.2350, -51.9253], 4);

    // set the map tile layer, PLEASE REPLACE WITH YOUR API TOKEN
    L.tileLayer('https://api.mapbox.com/styles/v1/ntnrdt/ck8sqxwbu1ms51im9s4jewmo8/tiles/{z}/{x}/{y}?fresh=true&access_token=pk.eyJ1IjoibnRucmR0IiwiYSI6ImNrOHNxdHBtaTBicGUzbXBhOGZna3NubGoifQ.rTKtElqa9KMFJtvCVfaqng', {
      attribution: `Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>`,
      id: 'mapbox/light-v9',
      maxZoom: 18,
      tileSize: 512,
      zoomOffset: -1
    }).addTo(map);

    // set data and style to the map
    geojson = L.geoJson(this.mapModel, {
      style: (feature: { properties: { cases: any; }; }) => {
        return {
          fillColor: getColor(feature.properties.cases),
          weight: 2,
          opacity: 1,
          color: '#ffffff',
          dashArray: '',
          fillOpacity: 1
        };
      },
      onEachFeature: onEachFeature
    }).addTo(map);

    this.addInfo();
    this.addLegend();
    this.updateLabels();
  }

  // update the label to inform when was the last update
  updateLabels() {

    let day = this.mapModel.lastUpdate.getDate();
    let month = this.mapModel.lastUpdate.getMonth() + 1; // month is an array starting at position 0 (Jan)
    let year = this.mapModel.lastUpdate.getFullYear();
    let hours = this.mapModel.lastUpdate.getHours();
    let minutes = this.mapModel.lastUpdate.getMinutes();

    document.getElementById('last-update-at').innerText = `${day}/${month}/${year} ${hours}:${minutes}`;
    document.getElementById('total-confirmed-cases').innerText = transformNumber(this.mapModel.totalCases.toString());
    document.getElementById('total-confirmed-recovered').innerText = transformNumber(this.mapModel.totalRecovered.toString());
    document.getElementById('total-confirmed-deaths').innerText = transformNumber(this.mapModel.totalDeaths.toString());
    document.getElementById('total-confirmed-deadly').innerText = this.mapModel.totalDeadly + '%';
  }

  // Add info to the map
  addInfo() {

    // info control
    info = L.control();

    // details for the legend
    info.summary = {
      country: 'Brasil',
      totalCases: this.mapModel.totalCases,
      totalDeadly: this.mapModel.totalDeadly,
      totalDeaths: this.mapModel.totalDeaths,
      totalRecovered: this.mapModel.totalRecovered,
    };

    // callback to be executed after info is attached to the map
    info.onAdd = function (map) {
      this._div = L.DomUtil.create('div', 'info');
      this.update();
      return this._div;
    };

    // method that we will use to update the control based on feature properties passed
    info.update = function (props: IStateModel) {

      this._div.innerHTML = `
      ${(props ?
          `<h2>${props.name}</h2><br />
          <h3>${transformNumber(props.cases.toString())}</h3><p>Confirmados</p>
          <h3>${transformNumber(props.deaths.toString())}</h3><p>Óbitos</p>
          <h3>${props.deadly}</h3><p>Letalidade` :
          `<h2>${this.summary.country}</h2><br />
          <h3>${transformNumber(this.summary.totalCases.toString())}</h3><p>Confirmados</p>
          <h3>${transformNumber(this.summary.totalRecovered.toString())}</h3><p>Recuperados</p>
          <h3>${transformNumber(this.summary.totalDeaths.toString())}</h3><p>Óbitos</p>
          <h3>${this.summary.totalDeadly}%</h3><p>Letalidade</p>
          `)}
        `;
    };

    // attach information to the map
    info.addTo(map);
  }

  // Add legend to the map
  addLegend() {

    // legend control
    var legend = L.control({ position: 'bottomright' });

    legend.onAdd = function (map) {

      var div = L.DomUtil.create('div', 'info legend');

      // loop through our density intervals and generate a label with a colored square for each interval
      for (var i = 0; i < colors.length; i++) {
        let colorBox = `<span class="legend-item" style="background: ${colors[i].color}">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>`;
        let indicator = `${colors[i].indicator}`;

        if (i == 0)
          indicator += '<br />';
        else if (i < colors.length - 1)
          indicator += `&ndash;${colors[i + 1].indicator}<br>`;
        else
          indicator += '+';

        div.innerHTML += `${colorBox}&nbsp;${indicator}`;
      }

      return div;
    };

    // add legend to the map
    legend.addTo(map);
  }
}

export var geojson, info, map;

// giving a number i.e. 22342 returns 22.342 string
export function transformNumber(number: string) {
  let result = '';
  let count = 0;

  for (var i = number.length; i > 0; i--) {
    result = number[i - 1] + result;
    count++;

    if (count == 3 && i > 1) {
      result = '.' + result;
      count = 0;
    }
  }

  return result;
}

// for each feature (state) enables the mouse over/out/click
export function onEachFeature(feature, layer) {
  layer.on({
    mouseover: stateSelect,
    mouseout: stateDeselect,
    click: (event: { target: { getBounds: () => any; }; }) => {

      // if any, remove previous selection
      if (map.stateSelected) {
        stateDeselect(map.stateSelected);
        map.stateSelected = undefined;
      }

      // select state
      stateSelect(event);
      map.fitBounds(event.target.getBounds());
      map.stateSelected = event;
    }
  });
}

// select a state through mouseover or click
export function stateSelect(event: any) {
  event.target.setStyle({
    weight: 2,
    color: '#666',
    dashArray: '',
    fillOpacity: 1
  });

  if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge)
    event.target.bringToFront();

  info.update(event.target.feature.properties)
}

// deselect state
export function stateDeselect(event: any) {
  geojson.resetStyle(event.target);
  info.update();
}

// get color based on the amount of cases
export function getColor(d) {
  for (let i = colors.length - 1; i > 0; i--) {
    if (d >= colors[i].indicator)
      return colors[i].color;
  }
}

export var colors = [
  { indicator: 0, color: '#ffffff' },
  { indicator: 1, color: '#f9e9e2' },
  { indicator: 100, color: '#fee0d2' },
  { indicator: 250, color: '#fcbba1' },
  { indicator: 500, color: '#fc9272' },
  { indicator: 1000, color: '#fb6a4a' },
  { indicator: 2000, color: '#ef3c2c' },
  { indicator: 3000, color: '#cb191c' },
  { indicator: 5000, color: '#a40f15' },
  { indicator: 7000, color: '#67000e' },
  { indicator: 8000, color: '#2d0006' }
]
