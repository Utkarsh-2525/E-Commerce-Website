package org.utkarsh2573.budgetkart.dto;

import lombok.Data;
import org.utkarsh2573.budgetkart.entity.Address;
import org.utkarsh2573.budgetkart.entity.Customer;
import org.utkarsh2573.budgetkart.entity.Order;
import org.utkarsh2573.budgetkart.entity.OrderItem;

import java.util.Set;

@Data
public class Purchase
{
    private Customer customer;

    private Address shippingAddress;

    private Address billingAddress;

    private Order order;

    private Set<OrderItem> orderItems;
}
