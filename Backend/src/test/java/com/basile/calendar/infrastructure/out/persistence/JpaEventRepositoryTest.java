package com.basile.calendar.infrastructure.out.persistence;

import static org.assertj.core.api.Assertions.assertThat;

import com.basile.calendar.domain.model.Event;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@Transactional
class JpaEventRepositoryTest {

    @Autowired
    private JpaEventRepository eventRepository;

    @Test
    void should_generate_id_when_saving_draft_event() {
        Event draft = Event.draft("Point équipe", LocalDate.of(2026, 9, 2), LocalTime.of(15, 0), 90, 1L, false);

        Event saved = eventRepository.save(draft);

        assertThat(saved.id()).isNotNull();
    }

    @Test
    void should_return_own_events_for_given_date_when_events_exist() {
        LocalDate targetDate = LocalDate.of(2026, 9, 2);
        Event matching = eventRepository.save(
                Event.draft("Point équipe", targetDate, LocalTime.of(15, 0), 90, 1L, false));
        eventRepository.save(Event.draft("Autre jour", LocalDate.of(2026, 9, 3), LocalTime.of(10, 0), 30, 1L, false));

        var events = eventRepository.findVisibleOnDate(targetDate, 1L);

        assertThat(events).containsExactly(matching);
    }

    @Test
    void should_not_return_private_event_of_another_user() {
        LocalDate targetDate = LocalDate.of(2026, 9, 2);
        eventRepository.save(Event.draft("Privé de basile", targetDate, LocalTime.of(15, 0), 90, 2L, false));

        var events = eventRepository.findVisibleOnDate(targetDate, 1L);

        assertThat(events).isEmpty();
    }

    @Test
    void should_return_public_event_of_another_user() {
        LocalDate targetDate = LocalDate.of(2026, 9, 2);
        Event publicEvent = eventRepository.save(
                Event.draft("Public de basile", targetDate, LocalTime.of(15, 0), 90, 2L, true));

        var events = eventRepository.findVisibleOnDate(targetDate, 1L);

        assertThat(events).containsExactly(publicEvent);
    }

    @Test
    void should_return_empty_list_when_no_events_for_date() {
        var events = eventRepository.findVisibleOnDate(LocalDate.of(2026, 9, 2), 1L);

        assertThat(events).isEmpty();
    }

    @Test
    void should_find_event_by_id_when_it_exists() {
        Event saved = eventRepository.save(
                Event.draft("Point équipe", LocalDate.of(2026, 9, 2), LocalTime.of(15, 0), 90, 1L, false));

        Optional<Event> found = eventRepository.findById(saved.id());

        assertThat(found).contains(saved);
    }

    @Test
    void should_return_empty_when_id_does_not_exist() {
        Optional<Event> found = eventRepository.findById(-1L);

        assertThat(found).isEmpty();
    }
}
