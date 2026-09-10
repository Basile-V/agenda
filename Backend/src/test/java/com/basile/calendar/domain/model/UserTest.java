package com.basile.calendar.domain.model;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class UserTest {

    @Test
    void should_create_user_when_data_is_valid() {
        User user = User.draft("basile", "hashed-password", "Basile", Role.USER);

        assertThat(user.id()).isNull();
        assertThat(user.username()).isEqualTo("basile");
        assertThat(user.passwordHash()).isEqualTo("hashed-password");
        assertThat(user.displayName()).isEqualTo("Basile");
        assertThat(user.role()).isEqualTo(Role.USER);
    }

    @Test
    void should_create_admin_user_when_role_is_admin() {
        User admin = User.draft("root", "hashed-password", "Administrateur", Role.ADMIN);

        assertThat(admin.role()).isEqualTo(Role.ADMIN);
    }

    @Test
    void should_return_new_instance_with_id_when_assigning_id_to_draft() {
        User draft = User.draft("basile", "hashed-password", "Basile", Role.USER);

        User persisted = draft.withId(1L);

        assertThat(persisted.id()).isEqualTo(1L);
        assertThat(persisted.username()).isEqualTo(draft.username());
        assertThat(persisted.passwordHash()).isEqualTo(draft.passwordHash());
        assertThat(persisted.displayName()).isEqualTo(draft.displayName());
        assertThat(persisted.role()).isEqualTo(draft.role());
        assertThat(draft.id()).isNull();
    }
}
