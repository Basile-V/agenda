package com.basile.calendar.infrastructure.out.security;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class BCryptPasswordHasherTest {

    private final BCryptPasswordHasher passwordHasher = new BCryptPasswordHasher();

    @Test
    void should_produce_a_hash_different_from_raw_password() {
        String hash = passwordHasher.hash("secret");

        assertThat(hash).isNotEqualTo("secret");
    }

    @Test
    void should_match_when_raw_password_corresponds_to_hash() {
        String hash = passwordHasher.hash("secret");

        assertThat(passwordHasher.matches("secret", hash)).isTrue();
    }

    @Test
    void should_not_match_when_raw_password_is_wrong() {
        String hash = passwordHasher.hash("secret");

        assertThat(passwordHasher.matches("wrong", hash)).isFalse();
    }
}
