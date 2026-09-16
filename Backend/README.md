# Calendar — Backend

Backend Java 25 / Spring Boot pour l'application **agenda** (vue journalière d'événements). Il
expose une API REST consommée par le frontend Angular : lister les événements d'un jour donné,
en créer de nouveaux et modifier ceux dont on est propriétaire. Chaque événement appartient à
l'utilisateur qui l'a créé ; un événement peut en plus être marqué **public**, auquel cas il est
visible par tous les utilisateurs authentifiés (un événement non public n'est visible que par son
créateur) — seul le propriétaire peut le modifier, qu'il soit public ou non.

## Stack technique

- Java 25
- Spring Boot 4.1.1 (`spring-boot-starter-webmvc`)
- Spring Data JPA + H2 (persistance, base fichier en local)
- Liquibase (migrations de schéma + données de seed)
- Bean Validation (`spring-boot-starter-validation`)
- Spring Security (`spring-boot-starter-security`) + JJWT (JWT stateless en cookies httpOnly)
- Maven (wrapper fourni : `mvnw`)
- Lombok
- Springdoc OpenAPI / Swagger UI (documentation API interactive)
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

Le frontend (`Frontend/`, Angular, `http://localhost:4200`) appelle cette API en local ;
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
│   ├── model                        // Event, User, AuthenticatedUser, AuthSession (records), exceptions métier
│   └── port
│       ├── in                       // ports d'entrée : CreateEvent, UpdateEvent, ListEventsForDay, Login, Register, RefreshSession
│       └── out                      // ports de sortie : EventRepository, UserRepository, PasswordHasher, TokenProvider
├── application
│   └── service                      // CreateEventService, UpdateEventService, ListEventsForDayService, LoginService, RegisterService, RefreshSessionService
└── infrastructure
    ├── in
    │   └── web                      // EventController, AuthController, SecurityConfig, JwtAuthenticationFilter, ...
    └── out
        ├── persistence              // JpaEventRepository, JpaUserRepository (ports), entités, repositories Spring Data
        └── security                 // JwtTokenProvider, BCryptPasswordHasher (implémentations des ports out)
```

Le sens des dépendances va toujours de `infrastructure` vers `application`/`domain`, jamais
l'inverse : le domaine ne dépend de rien.

Les migrations de schéma et les données de seed vivent dans
`src/main/resources/db/changelog/` (YAML), dans l'ordre d'exécution : création de la table
utilisateurs, création de la table événements (avec la colonne `user_id`, clé étrangère vers
`app_user`, et `is_public`), seed des utilisateurs de démo, seed des événements de démo. Le
changeset de seed des événements est isolé derrière un contexte Liquibase dédié (`seed`), actif
uniquement au run réel — jamais en test, pour ne pas fausser les assertions sur les dates. Le seed
des utilisateurs de démo n'a pas cette contrainte (pas de dépendance à la date du jour) et tourne
donc aussi en test, ce qui permet des tests d'intégration réalistes sur le flux d'authentification.

### API

Le frontend charge ses événements sous la forme `EventRaw` : `id`, `title?`, `date` (`YYYY-MM-DD`),
`start` (`HH:MM`), `duration` en minutes, `ownerId`, `isPublic`. Le backend expose le même contrat :

| Méthode | Endpoint                      | Description                                      |
|---------|--------------------------------|---------------------------------------------------|
| `GET`   | `/api/events?date=YYYY-MM-DD` | Liste des événements visibles par l'utilisateur courant pour une journée (ses propres événements + les événements publics d'autres utilisateurs) |
| `POST`  | `/api/events`                 | Création d'un événement (id et `ownerId` générés/déterminés côté serveur) |
| `PUT`   | `/api/events/{id}`            | Modification d'un événement existant (titre, date, heure, durée, visibilité) |

Toutes les routes `/api/events/**` nécessitent d'être authentifié (cookie `access_token`,
voir la section Authentification ci-dessous). Le propriétaire (`ownerId`) d'un événement créé
est **toujours** déterminé côté serveur à partir de l'utilisateur authentifié — un `ownerId` envoyé
dans le corps de la requête `POST`/`PUT` est ignoré. `PUT /api/events/{id}` renvoie 404 si l'id est
inconnu, et 403 si l'utilisateur authentifié n'est pas le propriétaire de l'événement (y compris
pour un événement public : la visibilité n'accorde jamais le droit de modification).

Corps `POST` (identique pour `PUT`) :

```json
{
  "title": "Point équipe",
  "date": "2026-09-02",
  "start": "15:00",
  "duration": 90,
  "isPublic": false
}
```

Réponse (`POST`, `PUT` et `GET`, identique à `EventRaw`) :

```json
{
  "id": 1,
  "title": "Point équipe",
  "date": "2026-09-02",
  "start": "15:00",
  "duration": 90,
  "ownerId": 2,
  "isPublic": false
}
```

### Authentification

L'API est protégée par une authentification par cookies httpOnly (JWT stateless, aucune session ni
refresh token stocké côté serveur) :

| Méthode | Endpoint             | Description                                                                |
|---------|-----------------------|-----------------------------------------------------------------------------|
| `POST`  | `/api/auth/login`    | Authentifie `{ username, password }`, pose les cookies et renvoie le profil |
| `POST`  | `/api/auth/register` | Crée un compte `{ username, password, displayName }` (rôle `USER`), pose les cookies et renvoie le profil — comme un login immédiat après inscription |
| `GET`   | `/api/auth/me`       | Profil de l'utilisateur courant (401 si non authentifié)                    |
| `POST`  | `/api/auth/refresh`  | Renouvelle le cookie `access_token` à partir du cookie `refresh_token`       |
| `POST`  | `/api/auth/logout`   | Efface les cookies côté client (aucun état à invalider côté serveur)        |

Détails du contrat :

- `/api/auth/register` refuse (400, `{ "message": "Nom d'utilisateur déjà utilisé" }`) un
  `username` déjà pris, et exige un `password` d'au moins 8 caractères (Bean Validation) ; le mot
  de passe est haché (BCrypt) avant persistance, jamais stocké en clair.
- `access_token` (httpOnly, `Path=/`, courte durée de vie — `app.jwt.access-token-ttl`) et
  `refresh_token` (httpOnly, `Path=/api/auth`, longue durée de vie — `app.jwt.refresh-token-ttl`)
  sont deux JWT signés indépendants (un claim `type` interne empêche d'utiliser l'un à la place de
  l'autre) ; aucun n'est jamais renvoyé dans le corps JSON des réponses.
- Un cookie `XSRF-TOKEN` non httpOnly est posé sur chaque requête (`CookieCsrfTokenRepository`) ;
  le frontend doit renvoyer sa valeur dans l'en-tête `X-XSRF-TOKEN` sur toute requête mutante
  (double-submit CSRF), sans quoi la requête est rejetée en 403.
- CORS autorise uniquement l'origine `app.cors.allowed-origin` (`http://localhost:4200` par
  défaut) avec `Access-Control-Allow-Credentials: true` — indispensable pour que les cookies
  passent en cross-origin depuis Angular (`withCredentials: true` côté client).
- Le secret de signature JWT (`app.jwt.secret`) est surchargeable par la variable d'environnement
  `JWT_SECRET` ; ne jamais garder la valeur par défaut en production.
- Le flag `Secure` des cookies (`app.jwt.cookie-secure`) est surchargeable par la variable
  d'environnement `COOKIE_SECURE` (`false` par défaut, pour le dev en HTTP local) ; le passer à
  `true` dès qu'un déploiement sert l'API en HTTPS — sans quoi les cookies (et donc le mot de
  passe envoyé au login, protégé uniquement par le chiffrement TLS) peuvent circuler en clair.
- Deux utilisateurs de démonstration sont seedés (mot de passe `demo1234`) : `admin` (rôle `ADMIN`)
  et `basile` (rôle `USER`).

### Documentation Swagger / OpenAPI

L'API est documentée automatiquement (à partir des `@RestController` et DTOs) via Springdoc
OpenAPI, accessible une fois l'application lancée :

| Ressource            | URL                                          |
|-----------------------|-----------------------------------------------|
| Swagger UI            | `http://localhost:8080/swagger-ui.html`       |
| Spécification OpenAPI (JSON) | `http://localhost:8080/v3/api-docs`     |

## Prochaines étapes

- Endpoint de suppression d'un événement (`DELETE`) si le besoin apparaît côté frontend.
