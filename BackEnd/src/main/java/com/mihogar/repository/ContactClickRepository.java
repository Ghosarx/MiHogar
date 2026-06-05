package com.mihogar.repository;

import com.mihogar.entity.ContactClick;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface ContactClickRepository extends JpaRepository<ContactClick, Long> {
    long countByPropertyId(Long propertyId);

    @Query("SELECT COUNT(c) FROM ContactClick c")
    long countAll();
}
