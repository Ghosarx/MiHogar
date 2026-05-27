package com.mihogar.repository;

import com.mihogar.entity.Property;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface PropertyRepository
        extends JpaRepository<Property, Long>, JpaSpecificationExecutor<Property> {

    Page<Property> findByOwnerIdAndDeletedAtIsNull(Long ownerId, Pageable pageable);
}
