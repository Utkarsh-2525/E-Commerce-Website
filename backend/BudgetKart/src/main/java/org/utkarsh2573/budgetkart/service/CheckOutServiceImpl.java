package org.utkarsh2573.budgetkart.service;

import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.utkarsh2573.budgetkart.dao.CustomerRepository;
import org.utkarsh2573.budgetkart.dto.PaymentInfo;
import org.utkarsh2573.budgetkart.dto.Purchase;
import org.utkarsh2573.budgetkart.dto.PurchaseResponse;
import org.utkarsh2573.budgetkart.entity.Customer;
import org.utkarsh2573.budgetkart.entity.Order;
import org.utkarsh2573.budgetkart.entity.OrderItem;

import java.util.*;

@Service
public class CheckOutServiceImpl implements CheckOutService {
    private CustomerRepository customerRepository;

    @Autowired
    public CheckOutServiceImpl(CustomerRepository customerRepository,
                               @Value("${stripe.key.secret}") String secretKey) {
        this.customerRepository = customerRepository;

        // initialise stripe API with secret key
        Stripe.apiKey=secretKey;
    }

    @Override
    @Transactional
    public PurchaseResponse placeOrder(Purchase purchase) {
        // retrieve order info from DTO
        Order order = purchase.getOrder();

        // generate tracking number
        String trackingNumber = generateOrderTrackingNumber();
        order.setOrderTrackingNumber(trackingNumber);

        //populate order with orderItems
        Set<OrderItem> orderItems = purchase.getOrderItems();
        orderItems.forEach(item -> order.add(item));

        //populate order with billing & shipping Address
        order.setBillingAddress(purchase.getBillingAddress());
        order.setShippingAddress(purchase.getShippingAddress());

        // populate customer with order
        Customer customer = purchase.getCustomer();
        // check if current user is existing user
        Customer customerFromDB=customerRepository.findByEmail(customer.getEmail());
        if(customerFromDB!=null)
            customer=customerFromDB;

        customer.add(order);

        // save to DB
        customerRepository.save(customer);

        // return response
        return new PurchaseResponse(trackingNumber);
    }

    @Override
    public PaymentIntent createPaymentIntent(PaymentInfo paymentInfo) throws StripeException {
        List<String> paymentMethodTypes=new ArrayList<>();
        paymentMethodTypes.add("card");

        Map<String, Object> params=new HashMap<>();
        params.put("amount", paymentInfo.getAmount());
        params.put("currency", paymentInfo.getCurrency());
        params.put("payment_method_types", paymentMethodTypes);
        params.put("description","BudgetKart purchase");
        params.put("receipt_email", paymentInfo.getReceiptEmail());
        return PaymentIntent.create(params);
    }

    private String generateOrderTrackingNumber() {
        return UUID.randomUUID().toString();
    }
}
