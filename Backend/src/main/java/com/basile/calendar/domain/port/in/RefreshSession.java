package com.basile.calendar.domain.port.in;

public interface RefreshSession {

    String refresh(String refreshToken);
}
