package com.basile.calendar.domain.port.in.auth;

import com.basile.calendar.domain.model.AuthSession;

public interface Login {

    AuthSession login(String username, String password);
}
