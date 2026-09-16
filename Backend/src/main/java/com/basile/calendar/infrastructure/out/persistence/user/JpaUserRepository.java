package com.basile.calendar.infrastructure.out.persistence.user;

import com.basile.calendar.domain.model.User;
import com.basile.calendar.domain.port.out.auth.UserRepository;
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

    @Override
    public User save(User user) {
        return springDataUserRepository.save(UserEntity.fromDomain(user)).toDomain();
    }
}
