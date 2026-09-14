package com.basile.calendar.infrastructure.out.persistence;

import com.basile.calendar.domain.model.Event;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDate;
import java.time.LocalTime;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "event")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PACKAGE)
class EventEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    @Column(name = "event_date", nullable = false)
    private LocalDate date;

    @Column(name = "start_time", nullable = false)
    private LocalTime start;

    private int durationMinutes;

    private Long userId;

    private boolean isPublic;

    static EventEntity fromDomain(Event event) {
        return new EventEntity(
                event.id(),
                event.title(),
                event.date(),
                event.start(),
                event.durationMinutes(),
                event.ownerId(),
                event.isPublic());
    }

    Event toDomain() {
        return new Event(id, title, date, start, durationMinutes, userId, isPublic);
    }
}
