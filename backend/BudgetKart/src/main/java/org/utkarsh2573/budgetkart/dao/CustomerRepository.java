package org.utkarsh2573.budgetkart.dao;

import org.springframework.data.jpa.repository.JpaRepository;
import org.utkarsh2573.budgetkart.entity.Customer;

public interface CustomerRepository extends JpaRepository<Customer,Long>
{
    Customer findByEmail(String theEmail);

}
