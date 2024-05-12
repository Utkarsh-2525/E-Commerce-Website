import {Component, Inject, OnInit} from '@angular/core';
import {OKTA_AUTH} from "@okta/okta-angular";
import {OktaAuth} from "@okta/okta-auth-js";
import OktaSignIn from '@okta/okta-signin-widget';
import myAppConfig from "../../config/my-app-config";
import {response} from "express";
import {error} from "@angular/compiler-cli/src/transformers/util";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit
{
    oktaSignin:any;
    constructor(@Inject(OKTA_AUTH) private oktaAuth:OktaAuth)
    {
        this.oktaSignin=new OktaSignIn({
            logo:'assets/images/products/budgetkart%20logo.png',
            baseUrl:myAppConfig.oidc.issuer.split('/oauth2')[0],
            clientId:myAppConfig.oidc.clientId,
            redirectUri:myAppConfig.oidc.redirectUri,
            authParams:{
                pkce:true, // Proof Key for Code Exchange
                issuer:myAppConfig.oidc.issuer,
                scopes:myAppConfig.oidc.scopes
            },
            useClassicEngine:true
        });
    }
    ngOnInit() {
        this.oktaSignin.remove();
        this.oktaSignin.renderEl(
            {el:'#okta-sign-in-widget'}, (response:any)=>{
                if(response.status==='SUCCESS')
                    this.oktaAuth.signInWithRedirect();
            },
            (error:any)=>{
                throw error;
            }
        );
    }
}
