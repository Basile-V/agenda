package com.basile.calendar.infrastructure.in.web;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.basile.calendar.domain.model.AuthenticatedUser;
import com.basile.calendar.domain.model.Role;
import com.basile.calendar.domain.port.out.TokenProvider;
import jakarta.servlet.FilterChain;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.util.Optional;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.context.SecurityContextHolder;

@ExtendWith(MockitoExtension.class)
class JwtAuthenticationFilterTest {

    @Mock
    private TokenProvider tokenProvider;

    @Mock
    private HttpServletRequest request;

    @Mock
    private HttpServletResponse response;

    @Mock
    private FilterChain filterChain;

    private JwtAuthenticationFilter filter;

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void should_authenticate_when_access_token_cookie_is_valid() throws Exception {
        filter = new JwtAuthenticationFilter(tokenProvider);
        AuthenticatedUser user = new AuthenticatedUser(1L, "basile", "Basile", Role.ADMIN);
        when(request.getCookies()).thenReturn(new Cookie[] {new Cookie("access_token", "valid-token")});
        when(tokenProvider.parseAccessToken("valid-token")).thenReturn(Optional.of(user));

        filter.doFilter(request, response, filterChain);

        var authentication = SecurityContextHolder.getContext().getAuthentication();
        assertThat(authentication).isNotNull();
        assertThat(authentication.getPrincipal()).isEqualTo(user);
        assertThat(authentication.getAuthorities()).extracting(Object::toString).containsExactly("ROLE_ADMIN");
        verify(filterChain).doFilter(request, response);
    }

    @Test
    void should_not_authenticate_when_access_token_cookie_is_missing() throws Exception {
        filter = new JwtAuthenticationFilter(tokenProvider);
        when(request.getCookies()).thenReturn(null);

        filter.doFilter(request, response, filterChain);

        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
        verify(filterChain).doFilter(request, response);
    }

    @Test
    void should_not_authenticate_when_access_token_is_invalid() throws Exception {
        filter = new JwtAuthenticationFilter(tokenProvider);
        when(request.getCookies()).thenReturn(new Cookie[] {new Cookie("access_token", "invalid-token")});
        when(tokenProvider.parseAccessToken("invalid-token")).thenReturn(Optional.empty());

        filter.doFilter(request, response, filterChain);

        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
        verify(filterChain).doFilter(request, response);
    }

    @Test
    void should_not_authenticate_when_no_matching_cookie_is_present() throws Exception {
        filter = new JwtAuthenticationFilter(tokenProvider);
        when(request.getCookies()).thenReturn(new Cookie[] {new Cookie("other_cookie", "some-value")});

        filter.doFilter(request, response, filterChain);

        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
        verify(filterChain).doFilter(request, response);
    }
}
