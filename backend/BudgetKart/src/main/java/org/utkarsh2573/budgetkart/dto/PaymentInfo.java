package org.utkarsh2573.budgetkart.dto;

import lombok.Data;

@Data
public class PaymentInfo
{
    private int amount;
    private String currency;
    private String receiptEmail;
}
