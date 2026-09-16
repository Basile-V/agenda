package com.basile.calendar.domain.model;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.basile.calendar.domain.model.exception.InvalidEventDurationException;
import java.time.LocalDate;
import java.time.LocalTime;
import org.junit.jupiter.api.Test;

class EventTest {

    @Test
    void should_create_event_when_data_is_valid() {
        Event event = Event.draft("Point équipe", LocalDate.of(2026, 9, 2), LocalTime.of(15, 0), 90, 2L, false);

        assertThat(event.id()).isNull();
        assertThat(event.title()).isEqualTo("Point équipe");
        assertThat(event.date()).isEqualTo(LocalDate.of(2026, 9, 2));
        assertThat(event.start()).isEqualTo(LocalTime.of(15, 0));
        assertThat(event.durationMinutes()).isEqualTo(90);
        assertThat(event.ownerId()).isEqualTo(2L);
        assertThat(event.isPublic()).isFalse();
    }

    @Test
    void should_reject_event_when_duration_is_not_positive() {
        assertThatThrownBy(
                        () -> Event.draft("Point équipe", LocalDate.of(2026, 9, 2), LocalTime.of(15, 0), 0, 2L, false))
                .isInstanceOf(InvalidEventDurationException.class);
    }

    @Test
    void should_reject_event_when_owner_is_missing() {
        assertThatThrownBy(() ->
                        Event.draft("Point équipe", LocalDate.of(2026, 9, 2), LocalTime.of(15, 0), 90, null, false))
                .isInstanceOf(NullPointerException.class);
    }

    @Test
    void should_return_new_instance_with_id_when_assigning_id_to_draft() {
        Event draft = Event.draft("Point équipe", LocalDate.of(2026, 9, 2), LocalTime.of(15, 0), 90, 2L, true);

        Event persisted = draft.withId(1L);

        assertThat(persisted.id()).isEqualTo(1L);
        assertThat(persisted.title()).isEqualTo(draft.title());
        assertThat(persisted.date()).isEqualTo(draft.date());
        assertThat(persisted.start()).isEqualTo(draft.start());
        assertThat(persisted.durationMinutes()).isEqualTo(draft.durationMinutes());
        assertThat(persisted.ownerId()).isEqualTo(draft.ownerId());
        assertThat(persisted.isPublic()).isEqualTo(draft.isPublic());
        assertThat(draft.id()).isNull();
    }

    @Test
    void should_return_new_instance_with_updated_details_keeping_id_and_owner() {
        Event existing = Event.draft("Point équipe", LocalDate.of(2026, 9, 2), LocalTime.of(15, 0), 90, 2L, false)
                .withId(1L);

        Event updated = existing.withDetails(
                "Point équipe renommé", LocalDate.of(2026, 9, 3), LocalTime.of(16, 0), 45, true);

        assertThat(updated.id()).isEqualTo(1L);
        assertThat(updated.ownerId()).isEqualTo(2L);
        assertThat(updated.title()).isEqualTo("Point équipe renommé");
        assertThat(updated.date()).isEqualTo(LocalDate.of(2026, 9, 3));
        assertThat(updated.start()).isEqualTo(LocalTime.of(16, 0));
        assertThat(updated.durationMinutes()).isEqualTo(45);
        assertThat(updated.isPublic()).isTrue();
    }
}
