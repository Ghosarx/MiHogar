package com.mihogar.repository;

import com.mihogar.entity.Tag;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Set;

public interface TagRepository extends JpaRepository<Tag, Long> {
    List<Tag> findAllByOrderByCategoriaAscNombreAsc();
    Set<Tag> findByNombreIn(List<String> nombres);
}
