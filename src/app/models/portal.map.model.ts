export interface IPortalMapModel {
    results: IPortalMapItemModel[]
}

export interface IPortalMapItemModel {
    objectId: string,
    nome: string,
    qtd_confirmado: number,
    latitude: string,
    longitude: string,
    createdAt: Date,
    updatedAt: Date,
    letalidade: string,
    qtd_obito: number,
}