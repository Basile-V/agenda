package com.basile.calendar.domain.port.in;

import com.basile.calendar.domain.model.AuthSession;

public interface Register {

    AuthSession register(String username, String password, String displayName);
}
