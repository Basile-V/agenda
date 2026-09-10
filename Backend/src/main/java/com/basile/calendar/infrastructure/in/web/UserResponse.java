package com.basile.calendar.infrastructure.in.web;

import com.basile.calendar.domain.model.AuthenticatedUser;
import com.basile.calendar.domain.model.Role;

record UserResponse(Long id, String username, String displayName, Role role) {

    static UserResponse from(AuthenticatedUser user) {
        return new UserResponse(user.id(), user.username(), user.displayName(), user.role());
    }
}
