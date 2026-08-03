package com.augustine.gplfantasyleaague.domain.subscription.repository;

import com.augustine.gplfantasyleaague.domain.subscription.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PaymentRepository extends JpaRepository<Payment, Integer> {
    Optional<Payment> findByReference(String reference);
}
