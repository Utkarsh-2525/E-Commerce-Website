import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {OrderHistory} from "../common/order-history";
import {environment} from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class OrderHistoryService {
    private orderURL=environment['BudgetKartApiUrl']+'/orders';
    constructor(private httpClient:HttpClient) { }

    getOrderHistory(theEmail:string): Observable<GetResponseOrderHistory>{
        // url built based on customer email
        const orderHistoryURL=`${this.orderURL}/search/findByCustomerEmailOrderByDateCreatedDesc?email=${theEmail}`;
        return this.httpClient.get<GetResponseOrderHistory>(orderHistoryURL);
    }
}

interface GetResponseOrderHistory {
    _embedded:{
        orders: OrderHistory[];
    }
}
