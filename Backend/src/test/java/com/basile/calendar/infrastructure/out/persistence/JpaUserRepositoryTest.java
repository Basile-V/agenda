package com.basile.calendar.infrastructure.out.persistence;

import static org.assertj.core.api.Assertions.assertThat;

import com.basile.calendar.domain.model.Role;
import com.basile.calendar.domain.model.User;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@Transactional
class JpaUserRepositoryTest {

    @Autowired
    private JpaUserRepository userRepository;

    @Autowired
    private SpringDataUserRepository springDataUserRepository;

    @Test
    void should_return_user_when_username_exists() {
        springDataUserRepository.save(UserEntity.fromDomain(User.draft("alice", "hashed-password", "Alice", Role.ADMIN)));

        var found = userRepository.findByUsername("alice");

        assertThat(found).isPresent();
        assertThat(found.get().username()).isEqualTo("alice");
        assertThat(found.get().passwordHash()).isEqualTo("hashed-password");
        assertThat(found.get().displayName()).isEqualTo("Alice");
        assertThat(found.get().role()).isEqualTo(Role.ADMIN);
    }

    @Test
    void should_return_empty_when_username_does_not_exist() {
        var found = userRepository.findByUsername("unknown");

        assertThat(found).isEmpty();
    }
}
