package com.basile.calendar.infrastructure.in.web.security;

import static org.assertj.core.api.Assertions.assertThat;

import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.access.AccessDeniedException;
import tools.jackson.databind.ObjectMapper;

class JsonAccessDeniedHandlerTest {

    private final JsonAccessDeniedHandler accessDeniedHandler = new JsonAccessDeniedHandler(new ObjectMapper());

    @Test
    void should_write_forbidden_json_response_when_access_is_denied() throws Exception {
        MockHttpServletResponse response = new MockHttpServletResponse();

        accessDeniedHandler.handle(new MockHttpServletRequest(), response, new AccessDeniedException("denied"));

        assertThat(response.getStatus()).isEqualTo(HttpServletResponse.SC_FORBIDDEN);
        assertThat(response.getContentType()).contains("application/json");
        assertThat(response.getContentAsString()).contains("Accès refusé");
    }
}
