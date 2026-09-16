package com.basile.calendar.infrastructure.out.security;

import com.basile.calendar.domain.model.AuthenticatedUser;
import com.basile.calendar.domain.model.Role;
import com.basile.calendar.domain.port.out.auth.TokenProvider;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.time.Clock;
import java.time.Duration;
import java.util.Date;
import java.util.Optional;
import javax.crypto.SecretKey;
import org.springframework.stereotype.Component;

@Component
public class JwtTokenProvider implements TokenProvider {

    private static final String CLAIM_USER_ID = "uid";
    private static final String CLAIM_DISPLAY_NAME = "displayName";
    private static final String CLAIM_ROLE = "role";
    private static final String CLAIM_TOKEN_TYPE = "type";
    private static final String TOKEN_TYPE_ACCESS = "access";
    private static final String TOKEN_TYPE_REFRESH = "refresh";

    private final SecretKey signingKey;
    private final Duration accessTokenTtl;
    private final Duration refreshTokenTtl;
    private final Clock clock;

    public JwtTokenProvider(JwtProperties properties, Clock clock) {
        this.signingKey = Keys.hmacShaKeyFor(properties.secret().getBytes(StandardCharsets.UTF_8));
        this.accessTokenTtl = properties.accessTokenTtl();
        this.refreshTokenTtl = properties.refreshTokenTtl();
        this.clock = clock;
    }

    @Override
    public String generateAccessToken(AuthenticatedUser user) {
        return buildToken(user, TOKEN_TYPE_ACCESS, accessTokenTtl);
    }

    @Override
    public String generateRefreshToken(AuthenticatedUser user) {
        return buildToken(user, TOKEN_TYPE_REFRESH, refreshTokenTtl);
    }

    @Override
    public Optional<AuthenticatedUser> parseAccessToken(String accessToken) {
        return parseToken(accessToken, TOKEN_TYPE_ACCESS);
    }

    @Override
    public Optional<AuthenticatedUser> parseRefreshToken(String refreshToken) {
        return parseToken(refreshToken, TOKEN_TYPE_REFRESH);
    }

    private String buildToken(AuthenticatedUser user, String tokenType, Duration ttl) {
        Date issuedAt = Date.from(clock.instant());
        Date expiration = Date.from(clock.instant().plus(ttl));

        return Jwts.builder()
                .subject(user.username())
                .claim(CLAIM_USER_ID, user.id())
                .claim(CLAIM_DISPLAY_NAME, user.displayName())
                .claim(CLAIM_ROLE, user.role().name())
                .claim(CLAIM_TOKEN_TYPE, tokenType)
                .issuedAt(issuedAt)
                .expiration(expiration)
                .signWith(signingKey)
                .compact();
    }

    private Optional<AuthenticatedUser> parseToken(String token, String expectedTokenType) {
        try {
            Claims claims = Jwts.parser()
                    .verifyWith(signingKey)
                    .clock(() -> Date.from(clock.instant()))
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();

            if (!expectedTokenType.equals(claims.get(CLAIM_TOKEN_TYPE, String.class))) {
                return Optional.empty();
            }

            return Optional.of(new AuthenticatedUser(
                    claims.get(CLAIM_USER_ID, Long.class),
                    claims.getSubject(),
                    claims.get(CLAIM_DISPLAY_NAME, String.class),
                    Role.valueOf(claims.get(CLAIM_ROLE, String.class))));
        } catch (JwtException | IllegalArgumentException exception) {
            return Optional.empty();
        }
    }
}
