package com.basile.calendar.application.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

import com.basile.calendar.domain.model.AuthSession;
import com.basile.calendar.domain.model.AuthenticatedUser;
import com.basile.calendar.domain.model.Role;
import com.basile.calendar.domain.model.User;
import com.basile.calendar.domain.model.exception.InvalidCredentialsException;
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
class LoginServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordHasher passwordHasher;

    @Mock
    private TokenProvider tokenProvider;

    private LoginService loginService;

    @BeforeEach
    void setUp() {
        loginService = new LoginService(userRepository, passwordHasher, tokenProvider);
    }

    @Test
    void should_return_auth_session_when_credentials_are_valid() {
        User user = User.draft("basile", "hashed-password", "Basile", Role.USER).withId(1L);
        AuthenticatedUser authenticatedUser = AuthenticatedUser.from(user);
        when(userRepository.findByUsername("basile")).thenReturn(Optional.of(user));
        when(passwordHasher.matches("secret", "hashed-password")).thenReturn(true);
        when(tokenProvider.generateAccessToken(authenticatedUser)).thenReturn("access-token");
        when(tokenProvider.generateRefreshToken(authenticatedUser)).thenReturn("refresh-token");

        AuthSession session = loginService.login("basile", "secret");

        assertThat(session).isEqualTo(new AuthSession(authenticatedUser, "access-token", "refresh-token"));
    }

    @Test
    void should_throw_invalid_credentials_when_user_not_found() {
        when(userRepository.findByUsername("unknown")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> loginService.login("unknown", "secret"))
                .isInstanceOf(InvalidCredentialsException.class);
    }

    @Test
    void should_throw_invalid_credentials_when_password_does_not_match() {
        User user = User.draft("basile", "hashed-password", "Basile", Role.USER).withId(1L);
        when(userRepository.findByUsername("basile")).thenReturn(Optional.of(user));
        when(passwordHasher.matches("wrong", "hashed-password")).thenReturn(false);

        assertThatThrownBy(() -> loginService.login("basile", "wrong"))
                .isInstanceOf(InvalidCredentialsException.class);
    }
}
