package com.basile.calendar.infrastructure.out.persistence;

import com.basile.calendar.domain.model.Event;
import com.basile.calendar.domain.port.out.EventRepository;
import java.time.LocalDate;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class JpaEventRepository implements EventRepository {

    private final SpringDataEventRepository springDataEventRepository;

    @Override
    public Event save(Event event) {
        EventEntity saved = springDataEventRepository.save(EventEntity.fromDomain(event));
        return saved.toDomain();
    }

    @Override
    public List<Event> findByDate(LocalDate date) {
        return springDataEventRepository.findByDate(date).stream()
                .map(EventEntity::toDomain)
                .toList();
    }
}
