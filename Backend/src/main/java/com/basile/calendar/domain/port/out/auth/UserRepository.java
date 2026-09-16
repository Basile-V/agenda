package com.basile.calendar.domain.port.out.auth;

import com.basile.calendar.domain.model.User;
import java.util.Optional;

public interface UserRepository {

    Optional<User> findByUsername(String username);

    User save(User user);
}
