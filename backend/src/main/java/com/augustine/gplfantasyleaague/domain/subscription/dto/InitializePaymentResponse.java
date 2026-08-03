package com.augustine.gplfantasyleaague.domain.subscription.dto;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InitializePaymentResponse {
    // Open this URL in a WebView on the frontend - it's Paystack's own
    // hosted checkout page, so card details never pass through this app.
    private String authorizationUrl;
    private String reference;
    private Integer amountPesewas;
}
