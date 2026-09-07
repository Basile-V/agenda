package com.basile.calendar.application.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

import com.basile.calendar.domain.model.AuthenticatedUser;
import com.basile.calendar.domain.model.Role;
import com.basile.calendar.domain.model.exception.InvalidRefreshTokenException;
import com.basile.calendar.domain.port.out.TokenProvider;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class RefreshSessionServiceTest {

    @Mock
    private TokenProvider tokenProvider;

    private RefreshSessionService refreshSessionService;

    @BeforeEach
    void setUp() {
        refreshSessionService = new RefreshSessionService(tokenProvider);
    }

    @Test
    void should_return_new_access_token_when_refresh_token_is_valid() {
        AuthenticatedUser user = new AuthenticatedUser(1L, "basile", "Basile", Role.USER);
        when(tokenProvider.parseRefreshToken("raw-refresh-token")).thenReturn(Optional.of(user));
        when(tokenProvider.generateAccessToken(user)).thenReturn("new-access-token");

        String accessToken = refreshSessionService.refresh("raw-refresh-token");

        assertThat(accessToken).isEqualTo("new-access-token");
    }

    @Test
    void should_throw_invalid_refresh_token_when_token_cannot_be_parsed() {
        when(tokenProvider.parseRefreshToken("invalid-token")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> refreshSessionService.refresh("invalid-token"))
                .isInstanceOf(InvalidRefreshTokenException.class);
    }
}
