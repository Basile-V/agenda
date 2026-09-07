package com.basile.calendar.domain.model;

import java.util.Objects;

public record AuthSession(AuthenticatedUser user, String accessToken, String refreshToken) {

    public AuthSession {
        Objects.requireNonNull(user, "user");
        Objects.requireNonNull(accessToken, "accessToken");
        Objects.requireNonNull(refreshToken, "refreshToken");
    }
}
