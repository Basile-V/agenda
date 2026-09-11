package com.basile.calendar.infrastructure.in.web;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.basile.calendar.domain.model.AuthSession;
import com.basile.calendar.domain.model.AuthenticatedUser;
import com.basile.calendar.domain.model.Role;
import com.basile.calendar.domain.model.exception.InvalidCredentialsException;
import com.basile.calendar.domain.model.exception.InvalidRefreshTokenException;
import com.basile.calendar.domain.model.exception.UsernameAlreadyExistsException;
import com.basile.calendar.domain.port.in.Login;
import com.basile.calendar.domain.port.in.RefreshSession;
import com.basile.calendar.domain.port.in.Register;
import com.basile.calendar.domain.port.out.TokenProvider;
import com.basile.calendar.infrastructure.out.security.JwtProperties;
import jakarta.servlet.http.Cookie;
import java.time.Duration;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(AuthController.class)
@AutoConfigureMockMvc(addFilters = false)
@Import(AuthCookieFactory.class)
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private Login login;

    @MockitoBean
    private Register register;

    @MockitoBean
    private RefreshSession refreshSession;

    @MockitoBean
    private TokenProvider tokenProvider;

    @TestConfiguration
    static class TestConfig {

        @Bean
        JwtProperties jwtProperties() {
            return new JwtProperties("test-secret", Duration.ofMinutes(15), Duration.ofDays(7), false);
        }
    }

    @Test
    void should_return_profile_and_set_auth_cookies_when_login_succeeds() throws Exception {
        AuthenticatedUser user = new AuthenticatedUser(1L, "basile", "Basile", Role.USER);
        when(login.login("basile", "secret"))
                .thenReturn(new AuthSession(user, "access-token-value", "refresh-token-value"));

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "username": "basile",
                                  "password": "secret"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.username").value("basile"))
                .andExpect(jsonPath("$.displayName").value("Basile"))
                .andExpect(jsonPath("$.role").value("USER"))
                .andExpect(header().stringValues("Set-Cookie",
                        org.hamcrest.Matchers.hasItem(org.hamcrest.Matchers.allOf(
                                org.hamcrest.Matchers.containsString("access_token=access-token-value"),
                                org.hamcrest.Matchers.containsString("HttpOnly")))))
                .andExpect(header().stringValues("Set-Cookie",
                        org.hamcrest.Matchers.hasItem(org.hamcrest.Matchers.allOf(
                                org.hamcrest.Matchers.containsString("refresh_token=refresh-token-value"),
                                org.hamcrest.Matchers.containsString("Path=/api/auth")))));
    }

    @Test
    void should_return_bad_request_when_login_fields_are_blank() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "username": "",
                                  "password": ""
                                }
                                """))
                .andExpect(status().isBadRequest());
    }

    @Test
    void should_return_unauthorized_when_login_credentials_are_invalid() throws Exception {
        when(login.login("basile", "wrong")).thenThrow(new InvalidCredentialsException());

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "username": "basile",
                                  "password": "wrong"
                                }
                                """))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Identifiants invalides"));
    }

    @Test
    void should_return_profile_and_set_auth_cookies_when_register_succeeds() throws Exception {
        AuthenticatedUser user = new AuthenticatedUser(2L, "carol", "Carol", Role.USER);
        when(register.register("carol", "secretpwd", "Carol"))
                .thenReturn(new AuthSession(user, "access-token-value", "refresh-token-value"));

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "username": "carol",
                                  "password": "secretpwd",
                                  "displayName": "Carol"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(2))
                .andExpect(jsonPath("$.username").value("carol"))
                .andExpect(jsonPath("$.displayName").value("Carol"))
                .andExpect(jsonPath("$.role").value("USER"))
                .andExpect(header().stringValues("Set-Cookie",
                        org.hamcrest.Matchers.hasItem(org.hamcrest.Matchers.allOf(
                                org.hamcrest.Matchers.containsString("access_token=access-token-value"),
                                org.hamcrest.Matchers.containsString("HttpOnly")))))
                .andExpect(header().stringValues("Set-Cookie",
                        org.hamcrest.Matchers.hasItem(org.hamcrest.Matchers.allOf(
                                org.hamcrest.Matchers.containsString("refresh_token=refresh-token-value"),
                                org.hamcrest.Matchers.containsString("Path=/api/auth")))));
    }

    @Test
    void should_return_bad_request_when_register_fields_are_blank() throws Exception {
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "username": "",
                                  "password": "",
                                  "displayName": ""
                                }
                                """))
                .andExpect(status().isBadRequest());
    }

    @Test
    void should_return_bad_request_when_register_password_is_too_short() throws Exception {
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "username": "carol",
                                  "password": "short",
                                  "displayName": "Carol"
                                }
                                """))
                .andExpect(status().isBadRequest());
    }

    @Test
    void should_return_bad_request_when_register_username_already_exists() throws Exception {
        when(register.register("basile", "secretpwd", "Basile")).thenThrow(new UsernameAlreadyExistsException());

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "username": "basile",
                                  "password": "secretpwd",
                                  "displayName": "Basile"
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Nom d'utilisateur déjà utilisé"));
    }

    @Test
    void should_return_current_user_when_me_called_with_authenticated_principal() throws Exception {
        AuthenticatedUser user = new AuthenticatedUser(1L, "basile", "Basile", Role.ADMIN);
        Authentication authentication = new UsernamePasswordAuthenticationToken(
                user, null, List.of(new SimpleGrantedAuthority("ROLE_ADMIN")));

        mockMvc.perform(get("/api/auth/me").principal(authentication))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.username").value("basile"))
                .andExpect(jsonPath("$.displayName").value("Basile"))
                .andExpect(jsonPath("$.role").value("ADMIN"));
    }

    @Test
    void should_set_new_access_token_cookie_when_refresh_succeeds() throws Exception {
        when(refreshSession.refresh("raw-refresh-token")).thenReturn("new-access-token");

        mockMvc.perform(post("/api/auth/refresh").cookie(new Cookie("refresh_token", "raw-refresh-token")))
                .andExpect(status().isOk())
                .andExpect(header().stringValues("Set-Cookie",
                        org.hamcrest.Matchers.hasItem(org.hamcrest.Matchers.containsString("access_token=new-access-token"))));
    }

    @Test
    void should_return_unauthorized_when_refresh_called_without_cookie() throws Exception {
        mockMvc.perform(post("/api/auth/refresh"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void should_return_unauthorized_when_refresh_token_is_invalid() throws Exception {
        when(refreshSession.refresh("bad-token")).thenThrow(new InvalidRefreshTokenException());

        mockMvc.perform(post("/api/auth/refresh").cookie(new Cookie("refresh_token", "bad-token")))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void should_clear_auth_cookies_when_logout_called() throws Exception {
        mockMvc.perform(post("/api/auth/logout"))
                .andExpect(status().isOk())
                .andExpect(header().stringValues("Set-Cookie",
                        org.hamcrest.Matchers.hasItem(org.hamcrest.Matchers.allOf(
                                org.hamcrest.Matchers.containsString("access_token="),
                                org.hamcrest.Matchers.containsString("Max-Age=0")))))
                .andExpect(header().stringValues("Set-Cookie",
                        org.hamcrest.Matchers.hasItem(org.hamcrest.Matchers.allOf(
                                org.hamcrest.Matchers.containsString("refresh_token="),
                                org.hamcrest.Matchers.containsString("Max-Age=0")))));
    }
}
