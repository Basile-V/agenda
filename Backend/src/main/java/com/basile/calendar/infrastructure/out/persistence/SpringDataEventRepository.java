package com.basile.calendar.infrastructure.out.persistence;

import java.time.LocalDate;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

interface SpringDataEventRepository extends JpaRepository<EventEntity, Long> {

    @Query("SELECT e FROM EventEntity e WHERE e.date = :date AND (e.userId = :viewerId OR e.isPublic = true)")
    List<EventEntity> findVisibleOnDate(@Param("date") LocalDate date, @Param("viewerId") Long viewerId);
}
