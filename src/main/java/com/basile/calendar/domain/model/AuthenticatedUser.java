package com.basile.calendar.domain.model;

import java.util.Objects;

public record AuthenticatedUser(Long id, String username, String displayName, Role role) {

    public AuthenticatedUser {
        Objects.requireNonNull(id, "id");
        Objects.requireNonNull(username, "username");
        Objects.requireNonNull(displayName, "displayName");
        Objects.requireNonNull(role, "role");
    }

    public static AuthenticatedUser from(User user) {
        return new AuthenticatedUser(user.id(), user.username(), user.displayName(), user.role());
    }
}
