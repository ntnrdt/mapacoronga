import { IFeatureModel } from './feature.model';

export interface IMapModel {
    type: string,
    features: IFeatureModel[],
    totalCases: number,
    totalDeaths: number,
    totalRecovered: number,
    totalDeadly: string,
    lastUpdate: Date
}