import { Injectable } from '@angular/core';

@Injectable()
export class DemographicsService {

    getPopulation(){
        return BR_DEMOGRAPHICS;
    }
}																							

var BR_DEMOGRAPHICS = {
    updatedAt: '04/01/2020',
    total: 211328308,
    states: [
        {  name: 'Acre', qty:  891494},
        {  name: 'Alagoas', qty:  3348192},
        {  name: 'Amapá', qty:  857611},
        {  name: 'Amazonas', qty:  4191872},
        {  name: 'Bahia', qty:  14915483},
        {  name: 'Ceará', qty:  9173347},
        {  name: 'Distrito Federal', qty:  3042269},
        {  name: 'Espírito Santo', qty:  4052224},
        {  name: 'Goiás', qty:  7091251},
        {  name: 'Maranhão', qty:  7104957},
        {  name: 'Mato Grosso', qty:  3514742},
        {  name: 'Mato Grosso do Sul', qty:  2801361},
        {  name: 'Minas Gerais', qty:  21260985},
        {  name: 'Pará', qty:  8669797},
        {  name: 'Paraíba', qty:  4032819},
        {  name: 'Paraná', qty:  11494492},
        {  name: 'Pernambuco', qty:  9602831},
        {  name: 'Piauí', qty:  3278583},
        {  name: 'Rio de Janeiro', qty:  17337551},
        {  name: 'Rio Grande do Norte', qty:  3527818},
        {  name: 'Rio Grande do Sul', qty:  11410216},
        {  name: 'Rondônia', qty:  1791413},
        {  name: 'Roraima', qty:  615009},
        {  name: 'Santa Catarina', qty:  7229037},
        {  name: 'São Paulo', qty:  46192876},
        {  name: 'Sergipe', qty:  2314021},
        {  name: 'Tocantins', qty:  1586058}
    ]
}