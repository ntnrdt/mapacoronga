import { IStateModel } from './state.model';

export interface IFeatureModel {
    type: string,
    id: number,
    properties: IStateModel,
    geometry: any
}