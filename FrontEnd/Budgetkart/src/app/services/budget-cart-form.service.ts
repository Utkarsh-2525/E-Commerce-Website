import { Injectable } from '@angular/core';
import {map, Observable, of} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {Country} from "../common/country";
import {State} from "../common/state";
import {response} from "express";
import {environment} from "../../environments/environment";


@Injectable({
  providedIn: 'root'
})
export class BudgetCartFormService {
  private countriesURL=environment['BudgetKartApiUrl']+'/countries';
  private statesURL=environment['BudgetKartApiUrl']+'/states';

  constructor(private httpClient:HttpClient) { }


  getCountries():Observable<Country[]>
  {
    return this.httpClient.get<GetResponseCountries>(this.countriesURL).pipe(
      map(response=>response._embedded.countries)
  );
  }
  getStates(theCountryCode:string): Observable<State[]>
  {
    const searchStatesURL=`${this.statesURL}/search/findByCountryCode?code=${theCountryCode}`;
    return this.httpClient.get<GetResponseStates>(searchStatesURL).pipe(
      map(response => response._embedded.states)
    );
  }


  getCreditCardMonths(startMonth: number):Observable<number[]>
  {
    let data:number[]=[];
    for (let theMonth=startMonth; theMonth<=12; theMonth++)
      data.push(theMonth);
    return of(data);
  }

  getCreditCardYears():Observable<number[]>
  {
    let data:number[]=[];
    const startYear:number=new Date().getFullYear();
    const endYear:number=startYear+10;

    for (let theYear=startYear;theYear<=endYear;theYear++)
      data.push(theYear);
    return of(data);
  }
}

interface GetResponseStates
{
  _embedded:{
    states:State[];
  }
}

interface GetResponseCountries
{
  _embedded:{
    countries:Country[];
  }
}
