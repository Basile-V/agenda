package com.basile.calendar.domain.port.out;

import com.basile.calendar.domain.model.AuthenticatedUser;
import java.util.Optional;

public interface TokenProvider {

    String generateAccessToken(AuthenticatedUser user);

    String generateRefreshToken(AuthenticatedUser user);

    Optional<AuthenticatedUser> parseAccessToken(String accessToken);

    Optional<AuthenticatedUser> parseRefreshToken(String refreshToken);
}
