package com.basile.calendar.infrastructure.in.web;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.basile.calendar.domain.model.AuthenticatedUser;
import com.basile.calendar.domain.model.Event;
import com.basile.calendar.domain.model.Role;
import com.basile.calendar.domain.model.exception.InvalidEventDurationException;
import com.basile.calendar.domain.port.in.CreateEvent;
import com.basile.calendar.domain.port.in.ListEventsForDay;
import com.basile.calendar.domain.port.out.TokenProvider;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(EventController.class)
@AutoConfigureMockMvc(addFilters = false)
class EventControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private CreateEvent createEvent;

    @MockitoBean
    private ListEventsForDay listEventsForDay;

    @MockitoBean
    private TokenProvider tokenProvider;

    private static Authentication authenticationFor(long userId) {
        AuthenticatedUser user = new AuthenticatedUser(userId, "basile", "Basile", Role.USER);
        return new UsernamePasswordAuthenticationToken(user, null, List.of(new SimpleGrantedAuthority("ROLE_USER")));
    }

    @Test
    void should_return_visible_events_for_given_date_when_listing() throws Exception {
        LocalDate date = LocalDate.of(2026, 9, 2);
        Event event = Event.draft("Point équipe", date, LocalTime.of(15, 0), 90, 2L, false)
                .withId(1L);
        when(listEventsForDay.list(date, 2L)).thenReturn(List.of(event));

        mockMvc.perform(get("/api/events").param("date", "2026-09-02").principal(authenticationFor(2L)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].title").value("Point équipe"))
                .andExpect(jsonPath("$[0].date").value("2026-09-02"))
                .andExpect(jsonPath("$[0].start").value("15:00"))
                .andExpect(jsonPath("$[0].duration").value(90))
                .andExpect(jsonPath("$[0].ownerId").value(2))
                .andExpect(jsonPath("$[0].isPublic").value(false));
    }

    @Test
    void should_create_event_owned_by_authenticated_user_when_posting_valid_request() throws Exception {
        LocalDate date = LocalDate.of(2026, 9, 2);
        Event created = Event.draft("Point équipe", date, LocalTime.of(15, 0), 90, 2L, true)
                .withId(1L);
        when(createEvent.create(any(Event.class))).thenReturn(created);

        mockMvc.perform(post("/api/events")
                        .principal(authenticationFor(2L))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "title": "Point équipe",
                                  "date": "2026-09-02",
                                  "start": "15:00",
                                  "duration": 90,
                                  "isPublic": true
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.title").value("Point équipe"))
                .andExpect(jsonPath("$.date").value("2026-09-02"))
                .andExpect(jsonPath("$.start").value("15:00"))
                .andExpect(jsonPath("$.duration").value(90))
                .andExpect(jsonPath("$.ownerId").value(2))
                .andExpect(jsonPath("$.isPublic").value(true));

        org.mockito.Mockito.verify(createEvent)
                .create(org.mockito.ArgumentMatchers.argThat(draft -> draft.ownerId().equals(2L)));
    }

    @Test
    void should_ignore_client_supplied_owner_and_use_authenticated_user_instead() throws Exception {
        Event created = Event.draft(
                        "Point équipe", LocalDate.of(2026, 9, 2), LocalTime.of(15, 0), 90, 2L, false)
                .withId(1L);
        when(createEvent.create(any(Event.class))).thenReturn(created);

        mockMvc.perform(post("/api/events")
                        .principal(authenticationFor(2L))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "title": "Point équipe",
                                  "date": "2026-09-02",
                                  "start": "15:00",
                                  "duration": 90,
                                  "ownerId": 99,
                                  "isPublic": false
                                }
                                """))
                .andExpect(status().isCreated());

        org.mockito.Mockito.verify(createEvent)
                .create(org.mockito.ArgumentMatchers.argThat(draft -> draft.ownerId().equals(2L)));
    }

    @Test
    void should_reject_request_when_duration_is_not_positive() throws Exception {
        mockMvc.perform(post("/api/events")
                        .principal(authenticationFor(2L))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "date": "2026-09-02",
                                  "start": "15:00",
                                  "duration": 0
                                }
                                """))
                .andExpect(status().isBadRequest());
    }

    @Test
    void should_return_bad_request_with_message_when_domain_rule_is_violated() throws Exception {
        when(createEvent.create(any(Event.class))).thenThrow(new InvalidEventDurationException(90));

        mockMvc.perform(post("/api/events")
                        .principal(authenticationFor(2L))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "date": "2026-09-02",
                                  "start": "15:00",
                                  "duration": 90
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message")
                        .value("La durée d'un événement doit être strictement positive, reçu : 90"));
    }
}
