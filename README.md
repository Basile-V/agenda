# Calendar — Backend

Backend Java 25 / Spring Boot pour l'application **rendering-events** (agenda / vue journalière
d'événements). Il expose une API REST consommée par le frontend Angular : lister les événements
d'un jour donné et en créer de nouveaux.

## Stack technique

- Java 25
- Spring Boot 4.1.1 (`spring-boot-starter-webmvc`)
- Spring Data JPA + H2 (persistance, base fichier en local)
- Liquibase (migrations de schéma + données de seed)
- Bean Validation (`spring-boot-starter-validation`)
- Maven (wrapper fourni : `mvnw`)
- Lombok
- Tests : JUnit / AssertJ / Mockito / Spring Test (`spring-boot-starter-webmvc-test`)

## Lancer le projet en local

Prérequis : JDK 25.

```bash
./mvnw spring-boot:run
```

L'API est ensuite accessible sur `http://localhost:8080`. Au premier démarrage, Liquibase crée le
schéma et insère des événements de démonstration (aujourd'hui / hier / demain) dans une base H2
fichier (`./data/calendar.mv.db`, ignorée par Git — se re-génère automatiquement, à supprimer
sans risque pour repartir d'une base vide).

Autres commandes utiles :

```bash
./mvnw test     # tests unitaires / intégration
./mvnw package  # build du jar
```

Le frontend (`rendering-events/`, Angular, `http://localhost:4200`) appelle cette API en local ;
le CORS est déjà configuré pour autoriser cette origine (voir `infrastructure.in.web.WebConfig`).

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
- la persistance (aujourd'hui H2 via Spring Data JPA, potentiellement une autre base demain) est
  un détail d'implémentation interchangeable derrière un port ;
- le domaine est testable unitairement sans contexte Spring ni base de données ;
- l'API REST n'est qu'un adaptateur d'entrée parmi d'autres possibles.

C'est le bon niveau de rigueur pour un projet mono-domaine appelé à évoluer (nouvelles règles
métier, changement de stockage) sans jamais justifier un découpage en services séparés.

### Structure de packages

```
com.basile.calendar
├── domain
│   ├── model                        // Event (record), exceptions métier
│   └── port
│       ├── in                       // ports d'entrée : CreateEvent, ListEventsForDay
│       └── out                      // port de sortie : EventRepository
├── application
│   └── service                      // CreateEventService, ListEventsForDayService
└── infrastructure
    ├── in
    │   └── web                      // EventController, EventRequest/EventResponse, WebConfig (CORS)
    └── out
        └── persistence              // JpaEventRepository (port), EventEntity, SpringDataEventRepository
```

Le sens des dépendances va toujours de `infrastructure` vers `application`/`domain`, jamais
l'inverse : le domaine ne dépend de rien.

Les migrations de schéma et les données de seed vivent dans
`src/main/resources/db/changelog/` (YAML). Le changeset de seed est isolé derrière un contexte
Liquibase dédié (`seed`), actif uniquement au run réel — jamais en test, pour ne pas fausser les
assertions sur les dates.

### API

Le frontend charge ses événements sous la forme `EventRaw` : `id`, `title?`, `date` (`YYYY-MM-DD`),
`start` (`HH:MM`), `duration` en minutes. Le backend expose le même contrat :

| Méthode | Endpoint                      | Description                                      |
|---------|--------------------------------|---------------------------------------------------|
| `GET`   | `/api/events?date=YYYY-MM-DD` | Liste des événements pour une journée              |
| `POST`  | `/api/events`                 | Création d'un événement (id généré côté serveur)   |

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

- Endpoints de modification/suppression d'un événement (`PUT`/`DELETE`) si le besoin apparaît côté
  frontend.
- Implémenter l'identification
