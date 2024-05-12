package org.utkarsh2573.budgetkart.controller;

import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.utkarsh2573.budgetkart.dto.PaymentInfo;
import org.utkarsh2573.budgetkart.dto.Purchase;
import org.utkarsh2573.budgetkart.dto.PurchaseResponse;
import org.utkarsh2573.budgetkart.service.CheckOutService;

@RestController
@RequestMapping("/api/checkout")
public class CheckOutController {
    private CheckOutService checkOutService;

    public CheckOutController(CheckOutService checkOutService) {
        this.checkOutService=checkOutService;
    }

    @PostMapping("/purchase")
    public PurchaseResponse placeOrder(@RequestBody Purchase purchase)
    {
        PurchaseResponse purchaseResponse=checkOutService.placeOrder(purchase);
        return purchaseResponse;
    }

    @PostMapping("/payment-intent")
    public ResponseEntity<String> createPaymentIntent(@RequestBody PaymentInfo paymentInfo) throws StripeException
    {
        PaymentIntent paymentIntent=checkOutService.createPaymentIntent(paymentInfo);
        String paymantStr=paymentIntent.toJson();
        return new ResponseEntity<>(paymantStr, HttpStatus.OK);
    }
}
