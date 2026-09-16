package com.basile.calendar.domain.port.in.auth;

public interface RefreshSession {

    String refresh(String refreshToken);
}
