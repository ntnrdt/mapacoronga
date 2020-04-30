export interface ICountryModel{
    country: string,
    confirmed: number,
    deaths: number,
    recovered: number,
    updated_at: Date,
    pctRecovered: string,
    pctDeadly: string
}