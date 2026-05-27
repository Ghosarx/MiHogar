package com.mihogar.repository;

import com.mihogar.entity.Favorite;
import com.mihogar.entity.FavoriteId;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface FavoriteRepository extends JpaRepository<Favorite, FavoriteId> {

    @Query("""
        SELECT f FROM Favorite f
        JOIN FETCH f.property p
        WHERE f.user.id = :userId
          AND p.deletedAt IS NULL
    """)
    Page<Favorite> findByUserId(Long userId, Pageable pageable);

    boolean existsByUserIdAndPropertyId(Long userId, Long propertyId);
    void deleteByUserIdAndPropertyId(Long userId, Long propertyId);
}
