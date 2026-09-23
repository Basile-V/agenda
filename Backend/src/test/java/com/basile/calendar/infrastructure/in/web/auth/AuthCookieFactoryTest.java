package com.basile.calendar.infrastructure.in.web.auth;

import static org.assertj.core.api.Assertions.assertThat;

import com.basile.calendar.infrastructure.out.security.JwtProperties;
import java.time.Duration;
import org.junit.jupiter.api.Test;
import org.springframework.http.ResponseCookie;

class AuthCookieFactoryTest {

    @Test
    void should_use_configured_same_site_when_building_access_token_cookie() {
        JwtProperties jwtProperties =
                new JwtProperties("secret", Duration.ofMinutes(15), Duration.ofDays(7), true, "None");
        AuthCookieFactory cookieFactory = new AuthCookieFactory(jwtProperties);

        ResponseCookie cookie = cookieFactory.accessTokenCookie("access-token-value");

        assertThat(cookie.toString()).contains("SameSite=None");
    }

    @Test
    void should_use_configured_same_site_when_building_refresh_token_cookie() {
        JwtProperties jwtProperties =
                new JwtProperties("secret", Duration.ofMinutes(15), Duration.ofDays(7), false, "Lax");
        AuthCookieFactory cookieFactory = new AuthCookieFactory(jwtProperties);

        ResponseCookie cookie = cookieFactory.refreshTokenCookie("refresh-token-value");

        assertThat(cookie.toString()).contains("SameSite=Lax");
    }
}
