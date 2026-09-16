package com.basile.calendar.infrastructure.out.persistence.user;

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

    @Test
    void should_save_and_return_user_with_generated_id_when_saving_new_user() {
        User saved = userRepository.save(User.draft("carol", "hashed-password", "Carol", Role.USER));

        assertThat(saved.id()).isNotNull();
        assertThat(saved.username()).isEqualTo("carol");
        assertThat(saved.passwordHash()).isEqualTo("hashed-password");
        assertThat(saved.displayName()).isEqualTo("Carol");
        assertThat(saved.role()).isEqualTo(Role.USER);
        assertThat(userRepository.findByUsername("carol")).isPresent();
    }
}
