package com.basile.calendar.application.service.auth;

import com.basile.calendar.domain.model.AuthSession;
import com.basile.calendar.domain.model.AuthenticatedUser;
import com.basile.calendar.domain.model.Role;
import com.basile.calendar.domain.model.User;
import com.basile.calendar.domain.model.exception.UsernameAlreadyExistsException;
import com.basile.calendar.domain.port.in.auth.Register;
import com.basile.calendar.domain.port.out.auth.PasswordHasher;
import com.basile.calendar.domain.port.out.auth.TokenProvider;
import com.basile.calendar.domain.port.out.auth.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
public class RegisterService implements Register {

    private final UserRepository userRepository;
    private final PasswordHasher passwordHasher;
    private final TokenProvider tokenProvider;

    @Override
    public AuthSession register(String username, String password, String displayName) {
        if (userRepository.findByUsername(username).isPresent()) {
            throw new UsernameAlreadyExistsException();
        }

        String passwordHash = passwordHasher.hash(password);
        User savedUser = userRepository.save(User.draft(username, passwordHash, displayName, Role.USER));

        AuthenticatedUser authenticatedUser = AuthenticatedUser.from(savedUser);
        String accessToken = tokenProvider.generateAccessToken(authenticatedUser);
        String refreshToken = tokenProvider.generateRefreshToken(authenticatedUser);

        return new AuthSession(authenticatedUser, accessToken, refreshToken);
    }
}
