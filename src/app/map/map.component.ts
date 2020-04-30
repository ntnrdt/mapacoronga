import { Component, OnInit } from '@angular/core';
import { Covid19BrazilApiService } from '../common/covid19-brazil-api.service';
import { IStateModel } from '../models/state.model';
import { IMapModel } from '../models/map.model';
import { CoordinatesService } from './shared/coordinates.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';

declare let L: any;
declare let numberToDecimalAsString: any;
declare let calculatePercentage: any;
declare let kFormatter: any;

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit {
  mapModel: IMapModel = {
    features: [],
    lastUpdate: new Date('01/01/1900'),
    qtyCases: 0,
    pctDeadly: '0%',
    qtyDeaths: 0,
    qtyRecovered: 0,
    pctRecovery: '0%',
    type: 'FeatureCollection'
  };

  constructor(
    private mapService: Covid19BrazilApiService,
    private coordinatesService: CoordinatesService,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService) { }

  ngOnInit() {
    this.initializeMap();
  }

  /**
   * Initialize map
   */
  initializeMap() {

    this.spinner.show();

    this.mapService.getConfirmed()
      .subscribe(cases => {
        if (cases && cases.data) {
          this.loadStatesData(cases.data);
          this.buildMap();
        }
      }, error => {
        this.toastr.warning(`Fonte de dados está indisponível, tente novamente mais tarde.`, 'ATENÇÃO');
      }, () => {
        this.spinner.hide();
      });
  }

  /**
   * Load COVID-19 cases on each state.
   */
  loadStatesData(cases: IStateModel[]) {
    cases.forEach((item, i) => {
      this.mapModel.features.push({
        type: 'Feature',
        id: i + 1,
        properties: {
          state: item.state,
          cases: item.cases,
          datetime: item.datetime,
          deadly: calculatePercentage(item.deaths, item.cases),
          deaths: item.deaths
        },
        geometry: this.coordinatesService.getGeometryByStateName(item.state)
      });
    });
  }

  /**
   * Build map and includes the info and legend.
   */
  buildMap() {

    // initialization of the Choropleth map
    map = L.map('map').setView([-14.2350, -51.9253], 4);

    // set the map tile layer
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
  }

  /**
   * Add info to the map.
   */
  addInfo() {

    // info control
    info = L.control();

    // details for the legend
    info.summary = {
      country: 'Brasil',
      qtyCases: this.mapModel.qtyCases,
      pctDeadly: this.mapModel.pctDeadly,
      qtyDeaths: this.mapModel.qtyDeaths,
      qtyRecovered: this.mapModel.qtyRecovered,
      pctRecovery: this.mapModel.pctRecovery
    };
    info.onAdd = function (map) {
      this._div = L.DomUtil.create('div', 'info');
      this.update();
      return this._div;
    };

    /**
     * Method that we will use to update the control based on feature properties passed.
     */
    info.update = function (props: IStateModel) {

      this._div.innerHTML = `
      ${(props ?
          `<h2>${props.state}</h2>
          <h3>${numberToDecimalAsString(props.cases.toString())}</h3><p>Confirmados</p>
          <h3>${numberToDecimalAsString(props.deaths.toString())}</h3><p>Óbitos</p>
          <h3>${props.deadly}%</h3><p>Letalidade` :
          `<h2>Para Visualizar</h2>
          <p>Posicione o cursor <br>sobre ou clique<br> em um estado.</p>
          `)}
        `;
    };

    // attach information to the map
    info.addTo(map);
  }

  /**
   * Add legend to the map.
   */
  addLegend() {

    // legend control
    var legend = L.control({ position: 'bottomright' });

    legend.onAdd = function (map) {

      var div = L.DomUtil.create('div', 'info legend');

      // loop through our density intervals and generate a label with a colored square for each interval
      for (var i = 0; i < colors.length; i++) {
        let colorBox = `<span class="legend-item" style="background: ${colors[i].color}">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>`;
        let indicator = `${kFormatter(colors[i].indicator)}`;

        if (i === 0)
          indicator += '<br />';
        else if (i < colors.length - 1)
          indicator += `&ndash;${kFormatter(colors[i + 1].indicator)}<br>`;
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

/**
 * For each feature (state) enables the mouse over/out/click.
 * @param feature State.
 * @param layer State Layer.
 */
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

/**
 * Select a state through mouseover or click.
 * @param event Click event.
 */
export function stateSelect(event: any) {
  event.target.setStyle({
    weight: 2,
    color: '#666',
    dashArray: '',
    fillOpacity: 1
  });

  if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge)
    event.target.bringToFront();

  info.update(event.target.feature.properties);
}

/**
 * Deselect state.
 * @param event Click event.
 */
export function stateDeselect(event: any) {
  geojson.resetStyle(event.target);
  info.update();
}

/**
 * Get color based on the amount of cases.
 * @param d 
 */
export function getColor(d) {
  for (let i = colors.length - 1; i > 0; i--) {
    if (d >= colors[i].indicator)
      return colors[i].color;
  }
}

/**
 * Array with the MAP Colors.
 */
export var colors = [
  { indicator: 0, color: '#ffffff' },
  { indicator: 1, color: '#e9f0f5' },
  { indicator: 100, color: '#dde6ec' },
  { indicator: 250, color: '#c8d5df' },
  { indicator: 500, color: '#a8bac9' },
  { indicator: 1000, color: '#89a0b3' },
  { indicator: 2000, color: '#6a869f' },
  { indicator: 3000, color: '#4c6e8a' },
  { indicator: 5000, color: '#2d5676' },
  { indicator: 7000, color: '#003f63' },
  { indicator: 8000, color: '#001724' }
];
