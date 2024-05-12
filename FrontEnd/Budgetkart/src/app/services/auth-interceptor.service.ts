import {Inject, Injectable} from '@angular/core';
import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from "@angular/common/http";
import {from, lastValueFrom, Observable} from 'rxjs';
import {request} from "node:http";
import {OKTA_AUTH} from "@okta/okta-angular";
import {OktaAuth} from "@okta/okta-auth-js";
import {environment} from "../../environments/environment";

@Injectable({
    providedIn: 'root'
})
export class AuthInterceptorService implements HttpInterceptor {

    constructor(@Inject(OKTA_AUTH) private oktaAuth:OktaAuth) {
    }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return from(this.handleAccess(request,next));
    }

    private async handleAccess(request:HttpRequest<any>, next:HttpHandler):Promise<HttpEvent<any>>
    {
        const theEndPoint=environment['BudgetKartApiUrl']+'/orders';
        // only one access token for secured endpoint
        const securedEndpoints=[theEndPoint];
        if(securedEndpoints.some(url=>request.urlWithParams.includes(url))) {
            // get access token
            const accessToken = this.oktaAuth.getAccessToken();

            // clone request and add new header with access token
            request=request.clone({
                setHeaders:{
                    Authorization:'Bearer '+accessToken
                }
            });
        }
        return await lastValueFrom(next.handle(request));
    }
}
