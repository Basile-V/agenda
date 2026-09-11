package com.basile.calendar.application.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.basile.calendar.domain.model.AuthSession;
import com.basile.calendar.domain.model.AuthenticatedUser;
import com.basile.calendar.domain.model.Role;
import com.basile.calendar.domain.model.User;
import com.basile.calendar.domain.model.exception.UsernameAlreadyExistsException;
import com.basile.calendar.domain.port.out.PasswordHasher;
import com.basile.calendar.domain.port.out.TokenProvider;
import com.basile.calendar.domain.port.out.UserRepository;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class RegisterServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordHasher passwordHasher;

    @Mock
    private TokenProvider tokenProvider;

    private RegisterService registerService;

    @BeforeEach
    void setUp() {
        registerService = new RegisterService(userRepository, passwordHasher, tokenProvider);
    }

    @Test
    void should_return_auth_session_when_username_is_available() {
        User draft = User.draft("carol", "hashed-password", "Carol", Role.USER);
        User saved = draft.withId(1L);
        AuthenticatedUser authenticatedUser = AuthenticatedUser.from(saved);
        when(userRepository.findByUsername("carol")).thenReturn(Optional.empty());
        when(passwordHasher.hash("secret")).thenReturn("hashed-password");
        when(userRepository.save(draft)).thenReturn(saved);
        when(tokenProvider.generateAccessToken(authenticatedUser)).thenReturn("access-token");
        when(tokenProvider.generateRefreshToken(authenticatedUser)).thenReturn("refresh-token");

        AuthSession session = registerService.register("carol", "secret", "Carol");

        assertThat(session).isEqualTo(new AuthSession(authenticatedUser, "access-token", "refresh-token"));
    }

    @Test
    void should_throw_username_already_exists_when_username_is_taken() {
        when(userRepository.findByUsername("carol"))
                .thenReturn(Optional.of(User.draft("carol", "hashed-password", "Carol", Role.USER).withId(1L)));

        assertThatThrownBy(() -> registerService.register("carol", "secret", "Carol"))
                .isInstanceOf(UsernameAlreadyExistsException.class);

        verify(userRepository, never()).save(any());
    }
}
