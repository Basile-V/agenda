package com.basile.calendar.infrastructure.out.persistence;

import static org.assertj.core.api.Assertions.assertThat;

import com.basile.calendar.domain.model.Event;
import java.time.LocalDate;
import java.time.LocalTime;
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
        Event draft = Event.draft("Point équipe", LocalDate.of(2026, 9, 2), LocalTime.of(15, 0), 90);

        Event saved = eventRepository.save(draft);

        assertThat(saved.id()).isNotNull();
    }

    @Test
    void should_return_events_for_given_date_when_events_exist() {
        LocalDate targetDate = LocalDate.of(2026, 9, 2);
        Event matching = eventRepository.save(Event.draft("Point équipe", targetDate, LocalTime.of(15, 0), 90));
        eventRepository.save(Event.draft("Autre jour", LocalDate.of(2026, 9, 3), LocalTime.of(10, 0), 30));

        var events = eventRepository.findByDate(targetDate);

        assertThat(events).containsExactly(matching);
    }

    @Test
    void should_return_empty_list_when_no_events_for_date() {
        var events = eventRepository.findByDate(LocalDate.of(2026, 9, 2));

        assertThat(events).isEmpty();
    }
}
