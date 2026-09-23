package com.basile.calendar.infrastructure.out.security;

import static org.assertj.core.api.Assertions.assertThat;

import com.basile.calendar.domain.model.AuthenticatedUser;
import com.basile.calendar.domain.model.Role;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.Optional;
import org.junit.jupiter.api.Test;

class JwtTokenProviderTest {

    private static final Instant NOW = Instant.parse("2026-09-04T10:00:00Z");
    private static final JwtProperties PROPERTIES = new JwtProperties(
            "test-secret-key-not-for-production-use-32-bytes-minimum-required",
            Duration.ofMinutes(15),
            Duration.ofDays(7),
            false,
            "Lax");
    private static final AuthenticatedUser USER = new AuthenticatedUser(1L, "basile", "Basile", Role.ADMIN);

    @Test
    void should_generate_access_token_that_parses_back_to_the_same_user() {
        JwtTokenProvider tokenProvider = new JwtTokenProvider(PROPERTIES, Clock.fixed(NOW, ZoneOffset.UTC));

        String accessToken = tokenProvider.generateAccessToken(USER);

        assertThat(tokenProvider.parseAccessToken(accessToken)).contains(USER);
    }

    @Test
    void should_generate_refresh_token_that_parses_back_to_the_same_user() {
        JwtTokenProvider tokenProvider = new JwtTokenProvider(PROPERTIES, Clock.fixed(NOW, ZoneOffset.UTC));

        String refreshToken = tokenProvider.generateRefreshToken(USER);

        assertThat(tokenProvider.parseRefreshToken(refreshToken)).contains(USER);
    }

    @Test
    void should_reject_access_token_when_used_as_refresh_token() {
        JwtTokenProvider tokenProvider = new JwtTokenProvider(PROPERTIES, Clock.fixed(NOW, ZoneOffset.UTC));
        String accessToken = tokenProvider.generateAccessToken(USER);

        assertThat(tokenProvider.parseRefreshToken(accessToken)).isEmpty();
    }

    @Test
    void should_reject_refresh_token_when_used_as_access_token() {
        JwtTokenProvider tokenProvider = new JwtTokenProvider(PROPERTIES, Clock.fixed(NOW, ZoneOffset.UTC));
        String refreshToken = tokenProvider.generateRefreshToken(USER);

        assertThat(tokenProvider.parseAccessToken(refreshToken)).isEmpty();
    }

    @Test
    void should_reject_access_token_when_expired() {
        JwtTokenProvider issuingProvider = new JwtTokenProvider(PROPERTIES, Clock.fixed(NOW, ZoneOffset.UTC));
        String accessToken = issuingProvider.generateAccessToken(USER);
        Clock afterExpiry = Clock.fixed(NOW.plus(Duration.ofMinutes(16)), ZoneOffset.UTC);
        JwtTokenProvider verifyingProvider = new JwtTokenProvider(PROPERTIES, afterExpiry);

        assertThat(verifyingProvider.parseAccessToken(accessToken)).isEmpty();
    }

    @Test
    void should_reject_token_when_signature_does_not_match() {
        JwtTokenProvider tokenProvider = new JwtTokenProvider(PROPERTIES, Clock.fixed(NOW, ZoneOffset.UTC));
        JwtProperties otherProperties = new JwtProperties(
                "another-secret-key-completely-different-from-the-first-one-used",
                Duration.ofMinutes(15),
                Duration.ofDays(7),
                false,
                "Lax");
        JwtTokenProvider otherTokenProvider = new JwtTokenProvider(otherProperties, Clock.fixed(NOW, ZoneOffset.UTC));
        String accessToken = otherTokenProvider.generateAccessToken(USER);

        assertThat(tokenProvider.parseAccessToken(accessToken)).isEmpty();
    }

    @Test
    void should_reject_malformed_token() {
        JwtTokenProvider tokenProvider = new JwtTokenProvider(PROPERTIES, Clock.fixed(NOW, ZoneOffset.UTC));

        Optional<AuthenticatedUser> result = tokenProvider.parseAccessToken("not-a-jwt");

        assertThat(result).isEmpty();
    }
}
