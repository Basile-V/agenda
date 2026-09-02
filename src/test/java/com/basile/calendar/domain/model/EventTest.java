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
        Event event = Event.draft("Point équipe", LocalDate.of(2026, 9, 2), LocalTime.of(15, 0), 90);

        assertThat(event.id()).isNull();
        assertThat(event.title()).isEqualTo("Point équipe");
        assertThat(event.date()).isEqualTo(LocalDate.of(2026, 9, 2));
        assertThat(event.start()).isEqualTo(LocalTime.of(15, 0));
        assertThat(event.durationMinutes()).isEqualTo(90);
    }

    @Test
    void should_reject_event_when_duration_is_not_positive() {
        assertThatThrownBy(() -> Event.draft("Point équipe", LocalDate.of(2026, 9, 2), LocalTime.of(15, 0), 0))
                .isInstanceOf(InvalidEventDurationException.class);
    }

    @Test
    void should_return_new_instance_with_id_when_assigning_id_to_draft() {
        Event draft = Event.draft("Point équipe", LocalDate.of(2026, 9, 2), LocalTime.of(15, 0), 90);

        Event persisted = draft.withId(1L);

        assertThat(persisted.id()).isEqualTo(1L);
        assertThat(persisted.title()).isEqualTo(draft.title());
        assertThat(persisted.date()).isEqualTo(draft.date());
        assertThat(persisted.start()).isEqualTo(draft.start());
        assertThat(persisted.durationMinutes()).isEqualTo(draft.durationMinutes());
        assertThat(draft.id()).isNull();
    }
}
