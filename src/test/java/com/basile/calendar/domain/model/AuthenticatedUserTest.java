package com.basile.calendar.domain.model;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.Test;

class AuthenticatedUserTest {

    @Test
    void should_project_user_without_password_hash_when_mapping_from_user() {
        User user = User.draft("basile", "hashed-password", "Basile", Role.ADMIN).withId(1L);

        AuthenticatedUser authenticatedUser = AuthenticatedUser.from(user);

        assertThat(authenticatedUser.id()).isEqualTo(1L);
        assertThat(authenticatedUser.username()).isEqualTo("basile");
        assertThat(authenticatedUser.displayName()).isEqualTo("Basile");
        assertThat(authenticatedUser.role()).isEqualTo(Role.ADMIN);
    }

    @Test
    void should_throw_when_mapping_from_user_without_id() {
        User draft = User.draft("basile", "hashed-password", "Basile", Role.USER);

        assertThatThrownBy(() -> AuthenticatedUser.from(draft)).isInstanceOf(NullPointerException.class);
    }

    @Test
    void should_throw_when_id_is_null() {
        assertThatThrownBy(() -> new AuthenticatedUser(null, "basile", "Basile", Role.USER))
                .isInstanceOf(NullPointerException.class);
    }

    @Test
    void should_throw_when_username_is_null() {
        assertThatThrownBy(() -> new AuthenticatedUser(1L, null, "Basile", Role.USER))
                .isInstanceOf(NullPointerException.class);
    }
}
