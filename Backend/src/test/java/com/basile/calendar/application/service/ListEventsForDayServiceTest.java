package com.basile.calendar.application.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.basile.calendar.domain.model.Event;
import com.basile.calendar.domain.port.out.EventRepository;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import org.junit.jupiter.api.Test;

class ListEventsForDayServiceTest {

    private final EventRepository eventRepository = mock(EventRepository.class);
    private final ListEventsForDayService listEventsForDayService = new ListEventsForDayService(eventRepository);

    @Test
    void should_return_events_for_given_date_when_events_exist() {
        LocalDate date = LocalDate.of(2026, 9, 2);
        Event event = Event.draft("Point équipe", date, LocalTime.of(15, 0), 90).withId(1L);
        when(eventRepository.findByDate(date)).thenReturn(List.of(event));

        List<Event> result = listEventsForDayService.list(date);

        assertThat(result).containsExactly(event);
    }

    @Test
    void should_return_empty_list_when_no_events_for_date() {
        LocalDate date = LocalDate.of(2026, 9, 2);
        when(eventRepository.findByDate(date)).thenReturn(List.of());

        List<Event> result = listEventsForDayService.list(date);

        assertThat(result).isEmpty();
    }
}
