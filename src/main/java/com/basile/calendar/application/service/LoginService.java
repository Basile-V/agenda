package com.basile.calendar.application.service;

import com.basile.calendar.domain.model.AuthSession;
import com.basile.calendar.domain.model.AuthenticatedUser;
import com.basile.calendar.domain.model.User;
import com.basile.calendar.domain.model.exception.InvalidCredentialsException;
import com.basile.calendar.domain.port.in.Login;
import com.basile.calendar.domain.port.out.PasswordHasher;
import com.basile.calendar.domain.port.out.TokenProvider;
import com.basile.calendar.domain.port.out.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
public class LoginService implements Login {

    private final UserRepository userRepository;
    private final PasswordHasher passwordHasher;
    private final TokenProvider tokenProvider;

    @Override
    public AuthSession login(String username, String password) {
        User user = userRepository.findByUsername(username).orElseThrow(InvalidCredentialsException::new);
        if (!passwordHasher.matches(password, user.passwordHash())) {
            throw new InvalidCredentialsException();
        }

        AuthenticatedUser authenticatedUser = AuthenticatedUser.from(user);
        String accessToken = tokenProvider.generateAccessToken(authenticatedUser);
        String refreshToken = tokenProvider.generateRefreshToken(authenticatedUser);

        return new AuthSession(authenticatedUser, accessToken, refreshToken);
    }
}
