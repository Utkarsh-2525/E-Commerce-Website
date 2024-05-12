package org.utkarsh2573.budgetkart.service;

import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import org.utkarsh2573.budgetkart.dto.PaymentInfo;
import org.utkarsh2573.budgetkart.dto.Purchase;
import org.utkarsh2573.budgetkart.dto.PurchaseResponse;

public interface CheckOutService
{
    PurchaseResponse placeOrder(Purchase purchase);

    PaymentIntent createPaymentIntent(PaymentInfo paymentInfo) throws StripeException;
}
