package com.basile.calendar.infrastructure.out.persistence.event;

import com.basile.calendar.domain.model.Event;
import com.basile.calendar.domain.port.out.event.EventRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
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
    public List<Event> findVisibleOnDate(LocalDate date, Long viewerId) {
        return springDataEventRepository.findVisibleOnDate(date, viewerId).stream()
                .map(EventEntity::toDomain)
                .toList();
    }

    @Override
    public Optional<Event> findById(Long id) {
        return springDataEventRepository.findById(id).map(EventEntity::toDomain);
    }

    @Override
    public void delete(Long id) {
        springDataEventRepository.deleteById(id);
    }
}
