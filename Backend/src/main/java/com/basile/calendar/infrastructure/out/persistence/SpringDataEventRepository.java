package com.basile.calendar.infrastructure.out.persistence;

import java.time.LocalDate;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

interface SpringDataEventRepository extends JpaRepository<EventEntity, Long> {

    List<EventEntity> findByDate(LocalDate date);
}
