package com.basile.calendar.infrastructure.out.persistence;

import com.basile.calendar.domain.model.User;
import com.basile.calendar.domain.port.out.UserRepository;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class JpaUserRepository implements UserRepository {

    private final SpringDataUserRepository springDataUserRepository;

    @Override
    public Optional<User> findByUsername(String username) {
        return springDataUserRepository.findByUsername(username).map(UserEntity::toDomain);
    }
}
