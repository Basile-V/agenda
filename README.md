# Calendar — Backend

Backend Java 25 / Spring Boot pour l'application **rendering-events** (agenda / vue journalière
d'événements). Il expose une API REST consommée par le frontend Angular : lister les événements
d'un jour donné et en créer de nouveaux.

## Stack technique

- Java 25
- Spring Boot 4.1.1 (`spring-boot-starter-webmvc`)
- Maven (wrapper fourni : `mvnw`)
- Lombok
- Tests : JUnit / Spring Test (`spring-boot-starter-webmvc-test`)

## Lancer le projet en local

Prérequis : JDK 25.

```bash
./mvnw spring-boot:run
```

L'API est ensuite accessible sur `http://localhost:8080`.

Autres commandes utiles :

```bash
./mvnw test     # tests unitaires / intégration
./mvnw package  # build du jar
```

Le frontend (`rendering-events/`, Angular, `http://localhost:4200`) doit pouvoir appeler cette API
en local : penser à configurer le CORS pour autoriser `http://localhost:4200` en dev.

## Architecture : hexagonale (ports & adapters)

Le périmètre fonctionnel est un **domaine unique et cohérent** : la gestion des événements d'un
agenda (lecture par jour, création, détection de chevauchement). Pas de sous-domaines
indépendants, pas de besoin de scaler ou déployer des parties du système séparément — un
découpage en microservices n'apporterait ici que le coût d'un système distribué (réseau,
orchestration, observabilité multi-services) sans aucun bénéfice en retour.

L'architecture hexagonale (ports & adapters) permet de garder le **domaine métier** (règles de
validation d'un événement, éventuellement le calcul de positionnement / chevauchement si celui-ci
devait un jour être vérifié côté serveur) totalement indépendant des détails techniques :

- le domaine ne connaît ni Spring, ni JPA, ni le format JSON exposé sur le réseau ;
- la persistance (aujourd'hui potentiellement un simple stockage en mémoire ou un fichier JSON,
  demain une vraie base de données) est un détail d'implémentation interchangeable derrière un
  port ;
- le domaine est testable unitairement sans contexte Spring ni base de données ;
- l'API REST n'est qu'un adaptateur d'entrée parmi d'autres possibles.

C'est le bon niveau de rigueur pour un projet mono-domaine appelé à évoluer (nouvelles règles
métier, changement de stockage) sans jamais justifier un découpage en services séparés.

### Structure de packages proposée

```
com.basile.calendar
├── domain
│   ├── model            // Event, VOs (EventTime, Duration...), règles métier
│   └── port
│       ├── in            // ports d'entrée : use cases (ex: ListEventsForDay, CreateEvent)
│       └── out           // ports de sortie (ex: EventRepository)
├── application
│   └── service           // implémentations des use cases (ports "in"), orchestration
└── infrastructure
    ├── in
    │   └── web            // contrôleurs REST, DTOs (EventRequest/EventResponse), mapping, CORS
    └── out
        └── persistence    // implémentation(s) du port EventRepository (mémoire, JPA, ...)
```

Le sens des dépendances va toujours de `infrastructure` vers `application`/`domain`, jamais
l'inverse : le domaine ne dépend de rien.

### API (proposition, alignée sur le contrat frontend)

Le frontend charge aujourd'hui ses événements depuis `assets/input.json`
(forme `EventRaw` : `id`, `title?`, `date` (`YYYY-MM-DD`), `start` (`HH:MM`), `duration` en
minutes). Le backend expose le même contrat :

| Méthode | Endpoint                        | Description                              |
|---------|----------------------------------|-------------------------------------------|
| `GET`   | `/api/events?date=YYYY-MM-DD`   | Liste des événements pour une journée     |
| `POST`  | `/api/events`                   | Création d'un événement (id généré côté serveur) |

Corps `POST` / réponse (identique à `EventRaw`) :

```json
{
  "id": 1,
  "title": "Point équipe",
  "date": "2026-09-02",
  "start": "15:00",
  "duration": 90
}
```

## Prochaines étapes

- Scaffolder les packages `domain` / `application` / `infrastructure` ci-dessus.
- Définir le port `EventRepository` et une première implémentation en mémoire.
- Implémenter les contrôleurs REST + configuration CORS pour `http://localhost:4200`.
