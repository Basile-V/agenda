package com.basile.calendar.application.service;

import com.basile.calendar.domain.model.AuthenticatedUser;
import com.basile.calendar.domain.model.exception.InvalidRefreshTokenException;
import com.basile.calendar.domain.port.in.RefreshSession;
import com.basile.calendar.domain.port.out.TokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
public class RefreshSessionService implements RefreshSession {

    private final TokenProvider tokenProvider;

    @Override
    public String refresh(String refreshToken) {
        AuthenticatedUser user =
                tokenProvider.parseRefreshToken(refreshToken).orElseThrow(InvalidRefreshTokenException::new);
        return tokenProvider.generateAccessToken(user);
    }
}
