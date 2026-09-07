package com.basile.calendar.domain.model;

import java.util.Objects;

public record User(Long id, String username, String passwordHash, String displayName, Role role) {

    public User {
        Objects.requireNonNull(username, "username");
        Objects.requireNonNull(passwordHash, "passwordHash");
        Objects.requireNonNull(displayName, "displayName");
        Objects.requireNonNull(role, "role");
    }

    public static User draft(String username, String passwordHash, String displayName, Role role) {
        return new User(null, username, passwordHash, displayName, role);
    }

    public User withId(Long id) {
        return new User(id, username, passwordHash, displayName, role);
    }
}
