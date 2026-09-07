package com.basile.calendar.domain.port.out;

import com.basile.calendar.domain.model.User;
import java.util.Optional;

public interface UserRepository {

    Optional<User> findByUsername(String username);
}
