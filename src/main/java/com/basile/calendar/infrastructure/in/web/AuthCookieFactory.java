package com.basile.calendar.infrastructure.in.web;

import com.basile.calendar.infrastructure.out.security.JwtProperties;
import java.time.Duration;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
class AuthCookieFactory {

    private static final String ACCESS_TOKEN_COOKIE = "access_token";
    private static final String REFRESH_TOKEN_COOKIE = "refresh_token";
    private static final String ACCESS_TOKEN_PATH = "/";
    private static final String REFRESH_TOKEN_PATH = "/api/auth";

    private final JwtProperties jwtProperties;

    ResponseCookie accessTokenCookie(String accessToken) {
        return buildCookie(ACCESS_TOKEN_COOKIE, accessToken, ACCESS_TOKEN_PATH, jwtProperties.accessTokenTtl());
    }

    ResponseCookie refreshTokenCookie(String refreshToken) {
        return buildCookie(REFRESH_TOKEN_COOKIE, refreshToken, REFRESH_TOKEN_PATH, jwtProperties.refreshTokenTtl());
    }

    ResponseCookie expiredAccessTokenCookie() {
        return buildCookie(ACCESS_TOKEN_COOKIE, "", ACCESS_TOKEN_PATH, Duration.ZERO);
    }

    ResponseCookie expiredRefreshTokenCookie() {
        return buildCookie(REFRESH_TOKEN_COOKIE, "", REFRESH_TOKEN_PATH, Duration.ZERO);
    }

    private ResponseCookie buildCookie(String name, String value, String path, Duration maxAge) {
        return ResponseCookie.from(name, value)
                .httpOnly(true)
                .secure(jwtProperties.cookieSecure())
                .sameSite("Lax")
                .path(path)
                .maxAge(maxAge)
                .build();
    }
}
