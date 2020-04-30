import { IFeatureModel } from './feature.model';

export interface IMapModel {
    features: IFeatureModel[];
    lastUpdate: Date;
    qtyCases: number;
    pctDeadly: string;
    qtyDeaths: number;
    qtyRecovered: number;
    pctRecovery: string;
    type: string;
}
