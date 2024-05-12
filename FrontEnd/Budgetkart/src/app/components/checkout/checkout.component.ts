import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {BudgetCartFormService} from "../../services/budget-cart-form.service";
import {Country} from "../../common/country";
import {State} from "../../common/state";
import {BudgetKartValidators} from "../../validators/budget-kart-validators";
import {CartService} from "../../services/cart.service";
import {CheckOutService} from "../../services/check-out.service";
import {Router} from "@angular/router";
import {Order} from "../../common/order";
import {OrderItem} from "../../common/order-item";
import {Purchase} from "../../common/purchase";
import {environment} from "../../../environments/environment";
import {PaymentInfo} from "../../common/payment-info";

@Component({
    selector: 'app-checkout',
    templateUrl: './checkout.component.html',
    styleUrl: './checkout.component.css'
})
export class CheckoutComponent implements OnInit {
    // @ts-ignore
    checkoutFormGroup: FormGroup;

    totalPrice: number = 0;
    totalQuantity: number = 0;
    creditCardYears: number[] = [];
    creditCardMonths: number[] = [];

    countries: Country[] = [];

    shippingAddressStates: State[] = [];
    billingAddressStates: State[] = [];
    storage: Storage = sessionStorage;

    // initialize Stripe API
    stripe = Stripe(environment.stripePublishableKey);
    paymentInfo: PaymentInfo = new PaymentInfo();
    cardElement: any;
    displayError: any = "";
    isDisabled: boolean = false;

    constructor(private formBuilder: FormBuilder,
                private formService: BudgetCartFormService,
                private cartService: CartService,
                private checkoutService: CheckOutService,
                private router: Router) {
    }

    ngOnInit() {

        this.setupStripePaymentForm();
        this.reviewCartDetails();

        // read the user's email addr. from browser storage
        const theEmail = JSON.parse(this.storage.getItem('userEmail')!);

        this.checkoutFormGroup = this.formBuilder.group({
            customer: this.formBuilder.group({
                firstName: new FormControl('', [Validators.required,
                    Validators.minLength(2), BudgetKartValidators.onlyWhiteSpaces]),
                lastName: new FormControl('', [Validators.required,
                    Validators.minLength(2),
                    BudgetKartValidators.onlyWhiteSpaces]),
                email: new FormControl(theEmail, [Validators.required,
                    Validators.pattern('^[a-zA-Z0-9._%+-]+@[A-Za-z0-9.-]+\\.[a-z]{2,4}$')])
            }),
            shippingAddress: this.formBuilder.group({
                street: new FormControl('', [Validators.required,
                    Validators.minLength(8),
                    BudgetKartValidators.onlyWhiteSpaces]),
                city: new FormControl('', [Validators.required,
                    Validators.minLength(2),
                    BudgetKartValidators.onlyWhiteSpaces]),
                state: new FormControl('', [Validators.required]),
                country: new FormControl('', [Validators.required]),
                zipCode: new FormControl('', [Validators.required,
                    Validators.minLength(6),
                    Validators.pattern('[0-9]{6}')])
            }),
            billingAddress: this.formBuilder.group({
                street: new FormControl('', [Validators.required,
                    Validators.minLength(8),
                    BudgetKartValidators.onlyWhiteSpaces]),
                city: new FormControl('', [Validators.required,
                    Validators.minLength(2),
                    BudgetKartValidators.onlyWhiteSpaces]),
                state: new FormControl('', [Validators.required]),
                country: new FormControl('', [Validators.required]),
                zipCode: new FormControl('', [Validators.required,
                    Validators.minLength(6),
                    Validators.pattern('[0-9]{6}')])
            }),
            creditCard: this.formBuilder.group({
                //     cardType: new FormControl('', [Validators.required]),
                //     nameOnCard: new FormControl('', [Validators.required,
                //         Validators.minLength(2),
                //         BudgetKartValidators.onlyWhiteSpaces]),
                //     cardNumber: new FormControl('', [Validators.required,
                //         Validators.pattern('[0-9]{16}')]),
                //     securityCode: new FormControl('', [Validators.required,
                //         Validators.pattern('[0-9]{3}')]),
                //     expirationMonth: [''],
                //     expirationYear: ['']
            })

        });

        // // populate credit card months
        // const startMonth: number = new Date().getMonth() + 1;
        // console.log("Start Month: " + startMonth);
        // this.formService.getCreditCardMonths(startMonth).subscribe(
        //     data => {
        //         console.log("Retrieved CC month: " + JSON.stringify(data));
        //         this.creditCardMonths = data;
        //     }
        // );
        //
        // // populate credit card years
        // this.formService.getCreditCardYears().subscribe(
        //     data => {
        //         console.log("Retrieved year: " + JSON.stringify(data));
        //         this.creditCardYears = data;
        //     }
        // );

        // populate countries
        this.formService.getCountries().subscribe(
            data => {
                console.log("Retreived countries: " + JSON.stringify(data))
                this.countries = data;
            }
        );

    }

    onSubmit() {
        // @ts-ignore
        console.log(this.checkoutFormGroup.get('customer').value);

        if (this.checkoutFormGroup.invalid) {
            this.checkoutFormGroup.markAllAsTouched();
            return;
        }
        // setup order
        let order = new Order();
        order.totalPrice = this.totalPrice;
        order.totalQuantity = this.totalQuantity;

        // get cart items
        const cartItems = this.cartService.cartItems;

        // create Order Items from Cart Items
        let orderItems: OrderItem[] = cartItems.map(tempCartItem => new OrderItem(tempCartItem));

        // set up purchase
        let purchase = new Purchase();

        // populate purchase - customer
        purchase.customer = this.checkoutFormGroup.controls['customer'].value;

        // populate purchase(Shipping Address)
        purchase.shippingAddress = this.checkoutFormGroup.controls['shippingAddress'].value;
        const shippingState: State = JSON.parse(JSON.stringify(purchase.shippingAddress.state));
        const shippingCountry: Country = JSON.parse(JSON.stringify(purchase.shippingAddress.country));
        purchase.shippingAddress.state = shippingState.name;
        purchase.shippingAddress.country = shippingCountry.name;

        // populate purchase(Billing Address)
        purchase.billingAddress = this.checkoutFormGroup.controls['billingAddress'].value;
        const billingState: State = JSON.parse(JSON.stringify(purchase.billingAddress.state));
        const billingCountry: Country = JSON.parse(JSON.stringify(purchase.billingAddress.country));
        purchase.billingAddress.state = billingState.name;
        purchase.billingAddress.country = billingCountry.name;

        // populate purchase(order & order-items)
        purchase.order = order;
        purchase.orderItems = orderItems;

        // compute Payment Info
        if (this.totalPrice > 4000)
            this.paymentInfo.amount = Math.round((this.totalPrice - (this.totalPrice * 0.11)) * 100);
        else
            this.paymentInfo.amount = Math.round(this.totalPrice * 100);
        this.paymentInfo.currency = "INR";
        this.paymentInfo.receiptEmail=purchase.customer.email;

        // if valid
        // create payment intent
        // confirm card payment
        // place order
        this.isDisabled = true;
        if (!this.checkoutFormGroup.invalid && this.displayError.textContent === "")
            this.checkoutService.createPaymentIntent(this.paymentInfo).subscribe(
                (paymentIntentResponse) => {
                    this.stripe.confirmCardPayment(paymentIntentResponse.client_secret,
                        {
                            payment_method: {
                                card: this.cardElement,
                                billing_details: {
                                    email: purchase.customer.email,
                                    name: `${purchase.customer.firstName} ${purchase.customer.lastName}`,
                                    address: {
                                        line1: purchase.billingAddress.street,
                                        city: purchase.billingAddress.city,
                                        state: purchase.billingAddress.state,
                                        postal_code: purchase.billingAddress.zipCode,
                                        country: this.billingAddressCountry?.value.code
                                    }
                                }
                            }
                        }, {handleActions: false})
                        .then((result: any) => {
                            if (result.error) {
                                alert(`There was an error: ${result.error.message}`); // inform user of the error
                                this.isDisabled=false;
                            } else // call REST API via CheckOutService
                                this.checkoutService.placeOrder(purchase).subscribe({
                                    next: (response: any) => {
                                        alert(`Your Order has been received.\nOrder Tracking Number: ${response.orderTrackingNumber}`);
                                        // reset Cart
                                        this.resetCart();
                                        this.isDisabled=false;
                                    },
                                    error: (err: any) => {
                                        alert(`There was an error: ${err.message}`);
                                        this.isDisabled=false;
                                    }
                                });
                        })
                }
            );
        else {
            this.checkoutFormGroup.markAllAsTouched();
            return;
        }
    }

    get firstName() {
        return this.checkoutFormGroup.get('customer.firstName');
    }

    get lastName() {
        return this.checkoutFormGroup.get('customer.lastName');
    }

    get email() {
        return this.checkoutFormGroup.get('customer.email');
    }

    get shippingAddressStreet() {
        return this.checkoutFormGroup.get('shippingAddress.street');
    }

    get shippingAddressCity() {
        return this.checkoutFormGroup.get('shippingAddress.city');
    }

    get shippingAddressState() {
        return this.checkoutFormGroup.get('shippingAddress.state');
    }

    get shippingAddressZipCode() {
        return this.checkoutFormGroup.get('shippingAddress.zipCode');
    }

    get shippingAddressCountry() {
        return this.checkoutFormGroup.get('shippingAddress.country');
    }

    get billingAddressStreet() {
        return this.checkoutFormGroup.get('billingAddress.street');
    }

    get billingAddressCity() {
        return this.checkoutFormGroup.get('billingAddress.city');
    }

    get billingAddressState() {
        return this.checkoutFormGroup.get('billingAddress.state');
    }

    get billingAddressZipCode() {
        return this.checkoutFormGroup.get('billingAddress.zipCode');
    }

    get billingAddressCountry() {
        return this.checkoutFormGroup.get('billingAddress.country');
    }

    get creditCardType() {
        return this.checkoutFormGroup.get('creditCard.cardType');
    }

    get creditCardOwner() {
        return this.checkoutFormGroup.get('creditCard.nameOnCard');
    }

    get creditCardNumber() {
        return this.checkoutFormGroup.get('creditCard.cardNumber');
    }

    get creditCardSecurityCode() {
        return this.checkoutFormGroup.get('creditCard.securityCode');
    }


    // @ts-ignore
    copyShippingToBilling(event) {
        if (event.target.checked) {
            // @ts-ignore
            this.checkoutFormGroup.controls.billingAddress.setValue(this.checkoutFormGroup.controls.shippingAddress.value);
            this.billingAddressStates = this.shippingAddressStates;
        } else { // @ts-ignore
            this.checkoutFormGroup.controls.billingAddress.reset();
            this.billingAddressStates = [];
        }
    }

    handleYearsANDMonths() {
        const creditCardFormGroup = this.checkoutFormGroup.get('CreditCard');
        const currentYear: number = new Date().getFullYear();
        const selectedYear: number = Number(creditCardFormGroup?.value?.['expYear']);
        let startMonth: number;
        startMonth = (currentYear === selectedYear) ? new Date().getMonth() + 1 : 1;
        this.formService.getCreditCardMonths(startMonth).subscribe(
            data => {
                console.log("retrieved CC months: " + JSON.stringify(data));
                this.creditCardMonths = data;
            }
        );
    }

    getStates(formGroupName: string) {
        const formGroup = this.checkoutFormGroup.get(formGroupName);
        const countryCode = formGroup!.value.country.code;

        const countryName = formGroup!.value.country.name;
        console.log(`${formGroupName} country code: ${countryCode}`);
        console.log(`${formGroupName} country name: ${countryName}`);

        this.formService.getStates(countryCode).subscribe(
            data => {
                if (formGroupName === 'shippingAddress')
                    this.shippingAddressStates = data;
                else
                    this.billingAddressStates = data;

                (formGroup!.get('state'))!.setValue(data[0]);
            }
        );
    }

    private reviewCartDetails() {
        // subscribe total quantity
        this.cartService.totalQuantity.subscribe(
            totalQuantity => this.totalQuantity = totalQuantity
        );

        // subscribe total quantity
        this.cartService.totalPrice.subscribe(
            totalPrice => this.totalPrice = totalPrice
        );

    }

    resetCart() {
        // reset cart data
        this.cartService.cartItems = [];
        this.cartService.totalPrice.next(0);
        this.cartService.totalQuantity.next(0);
        this.cartService.persistCartItems();

        // reset form
        this.checkoutFormGroup.reset();

        // navigate back to Products
        this.router.navigateByUrl("4200/products");

    }

    private setupStripePaymentForm() {
        // get a handle for Stripe Elements
        var elements = this.stripe.elements();

        // create a card element
        this.cardElement = elements.create('card', {
            hidePostalCode: true
        });

        // Add an instance of card UI component into CARD-ELEMENT div
        this.cardElement.mount('#card-element');

        // Add event binding for 'change' event on card elements
        this.cardElement.on('change', (event: any) => {
            // get a handle to card-errors element
            this.displayError = document.getElementById('card-errors');
            if (event.complete)
                this.displayError.textContent = "";
            else if (event.error)
                this.displayError.textContent = event.error.message;
        });
    }
}
