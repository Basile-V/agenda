package com.basile.calendar.infrastructure.in.web.auth;

import com.basile.calendar.domain.model.AuthSession;
import com.basile.calendar.domain.model.AuthenticatedUser;
import com.basile.calendar.domain.model.exception.InvalidRefreshTokenException;
import com.basile.calendar.domain.port.in.auth.Login;
import com.basile.calendar.domain.port.in.auth.RefreshSession;
import com.basile.calendar.domain.port.in.auth.Register;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final Login login;
    private final Register register;
    private final RefreshSession refreshSession;
    private final AuthCookieFactory cookieFactory;

    @PostMapping("/login")
    public ResponseEntity<UserResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthSession session = login.login(request.username(), request.password());
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookieFactory.accessTokenCookie(session.accessToken()).toString())
                .header(HttpHeaders.SET_COOKIE, cookieFactory.refreshTokenCookie(session.refreshToken()).toString())
                .body(UserResponse.from(session.user()));
    }

    @PostMapping("/register")
    public ResponseEntity<UserResponse> register(@Valid @RequestBody RegisterRequest request) {
        AuthSession session = register.register(request.username(), request.password(), request.displayName());
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookieFactory.accessTokenCookie(session.accessToken()).toString())
                .header(HttpHeaders.SET_COOKIE, cookieFactory.refreshTokenCookie(session.refreshToken()).toString())
                .body(UserResponse.from(session.user()));
    }

    @GetMapping("/me")
    public UserResponse me(Authentication authentication) {
        return UserResponse.from((AuthenticatedUser) authentication.getPrincipal());
    }

    @PostMapping("/refresh")
    public ResponseEntity<Void> refresh(@CookieValue(name = "refresh_token", required = false) String refreshToken) {
        if (refreshToken == null) {
            throw new InvalidRefreshTokenException();
        }

        String newAccessToken = refreshSession.refresh(refreshToken);
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookieFactory.accessTokenCookie(newAccessToken).toString())
                .build();
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout() {
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookieFactory.expiredAccessTokenCookie().toString())
                .header(HttpHeaders.SET_COOKIE, cookieFactory.expiredRefreshTokenCookie().toString())
                .build();
    }
}
