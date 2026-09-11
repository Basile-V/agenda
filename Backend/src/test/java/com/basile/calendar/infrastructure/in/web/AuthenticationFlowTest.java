package com.basile.calendar.infrastructure.in.web;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.cookie;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

@SpringBootTest
@AutoConfigureMockMvc
class AuthenticationFlowTest {

    private static final String LOGIN_BODY = """
            {
              "username": "basile",
              "password": "demo1234"
            }
            """;

    @Autowired
    private MockMvc mockMvc;

    @Test
    void should_authenticate_and_access_protected_resource_when_credentials_are_valid() throws Exception {
        MvcResult loginResult = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(LOGIN_BODY))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("basile"))
                .andExpect(cookie().httpOnly("access_token", true))
                .andExpect(cookie().httpOnly("refresh_token", true))
                .andReturn();

        Cookie accessTokenCookie = loginResult.getResponse().getCookie("access_token");
        assertThat(accessTokenCookie).isNotNull();

        mockMvc.perform(get("/api/auth/me").cookie(accessTokenCookie))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("basile"));

        mockMvc.perform(get("/api/events").param("date", "2026-09-02").cookie(accessTokenCookie))
                .andExpect(status().isOk());
    }

    @Test
    void should_register_and_access_protected_resource_when_username_is_available() throws Exception {
        MvcResult registerResult = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "username": "new-user",
                                  "password": "secretpwd",
                                  "displayName": "New User"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("new-user"))
                .andExpect(cookie().httpOnly("access_token", true))
                .andExpect(cookie().httpOnly("refresh_token", true))
                .andReturn();

        Cookie accessTokenCookie = registerResult.getResponse().getCookie("access_token");
        assertThat(accessTokenCookie).isNotNull();

        mockMvc.perform(get("/api/events").param("date", "2026-09-02").cookie(accessTokenCookie))
                .andExpect(status().isOk());
    }

    @Test
    void should_reject_register_when_username_is_already_taken() throws Exception {
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "username": "basile",
                                  "password": "secretpwd",
                                  "displayName": "Basile"
                                }
                                """))
                .andExpect(status().isBadRequest());
    }

    @Test
    void should_reject_login_when_password_is_wrong() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "username": "basile",
                                  "password": "wrong-password"
                                }
                                """))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void should_return_unauthorized_when_calling_me_without_cookie() throws Exception {
        mockMvc.perform(get("/api/auth/me")).andExpect(status().isUnauthorized());
    }

    @Test
    void should_return_unauthorized_when_calling_protected_resource_without_cookie() throws Exception {
        mockMvc.perform(get("/api/events").param("date", "2026-09-02")).andExpect(status().isUnauthorized());
    }

    @Test
    void should_issue_new_access_token_when_refreshing_with_valid_refresh_token() throws Exception {
        MvcResult loginResult = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(LOGIN_BODY))
                .andReturn();
        Cookie refreshTokenCookie = loginResult.getResponse().getCookie("refresh_token");
        assertThat(refreshTokenCookie).isNotNull();

        MvcResult refreshResult = mockMvc.perform(post("/api/auth/refresh").cookie(refreshTokenCookie))
                .andExpect(status().isOk())
                .andExpect(cookie().httpOnly("access_token", true))
                .andReturn();

        Cookie newAccessTokenCookie = refreshResult.getResponse().getCookie("access_token");
        assertThat(newAccessTokenCookie).isNotNull();

        mockMvc.perform(get("/api/auth/me").cookie(newAccessTokenCookie))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("basile"));
    }

    @Test
    void should_return_unauthorized_when_refreshing_without_refresh_token_cookie() throws Exception {
        mockMvc.perform(post("/api/auth/refresh")).andExpect(status().isUnauthorized());
    }

    @Test
    void should_clear_cookies_when_logout_is_called() throws Exception {
        MvcResult csrfResult = mockMvc.perform(get("/api/auth/me")).andReturn();
        Cookie xsrfCookie = csrfResult.getResponse().getCookie("XSRF-TOKEN");
        assertThat(xsrfCookie).isNotNull();

        mockMvc.perform(post("/api/auth/logout").cookie(xsrfCookie).header("X-XSRF-TOKEN", xsrfCookie.getValue()))
                .andExpect(status().isOk())
                .andExpect(cookie().maxAge("access_token", 0))
                .andExpect(cookie().maxAge("refresh_token", 0));
    }

    @Test
    void should_reject_logout_without_matching_csrf_header() throws Exception {
        mockMvc.perform(post("/api/auth/logout")).andExpect(status().isForbidden());
    }

    @Test
    void should_include_credentialed_cors_headers_for_allowed_origin() throws Exception {
        mockMvc.perform(get("/api/auth/me").header("Origin", "http://localhost:4200"))
                .andExpect(header().string("Access-Control-Allow-Origin", "http://localhost:4200"))
                .andExpect(header().string("Access-Control-Allow-Credentials", "true"));
    }

    @Test
    void should_set_xsrf_token_cookie_on_any_request() throws Exception {
        mockMvc.perform(get("/api/auth/me"))
                .andExpect(cookie().exists("XSRF-TOKEN"));
    }

    @Test
    void should_reject_state_changing_request_without_matching_csrf_header() throws Exception {
        MvcResult loginResult = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(LOGIN_BODY))
                .andReturn();
        Cookie accessTokenCookie = loginResult.getResponse().getCookie("access_token");

        mockMvc.perform(post("/api/events")
                        .cookie(accessTokenCookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "date": "2026-09-02",
                                  "start": "15:00",
                                  "duration": 30
                                }
                                """))
                .andExpect(status().isForbidden());
    }

    @Test
    void should_accept_state_changing_request_with_matching_csrf_cookie_and_header() throws Exception {
        MvcResult loginResult = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(LOGIN_BODY))
                .andReturn();
        Cookie accessTokenCookie = loginResult.getResponse().getCookie("access_token");

        MvcResult csrfResult = mockMvc.perform(get("/api/auth/me").cookie(accessTokenCookie)).andReturn();
        Cookie xsrfCookie = csrfResult.getResponse().getCookie("XSRF-TOKEN");
        assertThat(xsrfCookie).isNotNull();

        mockMvc.perform(post("/api/events")
                        .cookie(accessTokenCookie, xsrfCookie)
                        .header("X-XSRF-TOKEN", xsrfCookie.getValue())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "date": "2026-09-02",
                                  "start": "15:00",
                                  "duration": 30
                                }
                                """))
                .andExpect(status().isCreated());
    }

    @Test
    void should_set_non_secure_xsrf_token_cookie_even_when_request_is_perceived_as_secure() throws Exception {
        mockMvc.perform(get("/api/auth/me").secure(true)).andExpect(cookie().secure("XSRF-TOKEN", false));
    }
}
