import { IFeatureModel } from './feature.model';

export interface IMapModel {
    features: IFeatureModel[],
    lastUpdate: Date,
    totalCases: number,
    totalDeadly: string,
    totalDeaths: number,
    totalRecovered: number,
    type: string
}