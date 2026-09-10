# Agenda — Frontend + Backend

Ce dépôt contient deux parties : le backend Java/Spring Boot et le frontend Angular. Ce README rassemble les informations essentielles pour démarrer et comprendre l'architecture globale.

## Arborescence

- `Backend/` : code backend Java (Spring Boot, Maven)
- `Frontend/` : code frontend Angular

Consultez les READMEs dédiés pour plus de détails :

- Backend : Backend/README.md
- Frontend : Frontend/README.md

## Description rapide

Application de type "agenda" (vue jour) permettant d'afficher et de créer des événements sur une
grille horaire, avec gestion visuelle des chevauchements (deux événements qui se recouvrent dans le
temps se partagent la largeur disponible). Le frontend interroge le backend via une API REST
exposée sur le port `8080`.

## Stack technique

- Backend : Java 25, Spring Boot 4.1.x, Spring Data JPA (H2), Liquibase, JWT, Maven (mvnw)
- Frontend : Angular 22.x, Angular Material, TypeScript strict, SCSS

## Lancer l'application en local

1) Démarrer le backend

```bash
cd Backend
# Prérequis : JDK 25
./mvnw spring-boot:run
```

L'API est disponible sur `http://localhost:8080`.

Commandes utiles (dans `Backend/`) :

```bash
./mvnw test
./mvnw package
```

2) Démarrer le frontend

```bash
cd Frontend
# Prérequis : Node.js + npm
npm install
npm start
```

Le frontend est ensuite accessible sur `http://localhost:4200` et communique avec le backend (CORS configuré pour `http://localhost:4200`).

## API (résumé)

- `GET /api/events?date=YYYY-MM-DD` : liste des événements du jour
- `POST /api/events` : création d'un événement

Authentification : le backend protège l'API par cookies httpOnly (JWT). Points importants :

- Endpoints d'auth : `/api/auth/login`, `/api/auth/me`, `/api/auth/refresh`, `/api/auth/logout`
- Les cookies `access_token` et `refresh_token` sont httpOnly ; un cookie `XSRF-TOKEN` non httpOnly est fourni pour la protection CSRF.
- Deux comptes de démonstration sont seedés : `admin` / `demo1234` (rôle `ADMIN`) et `basile` / `demo1234` (rôle `USER`).

Documentation interactive de l'API une fois le backend lancé : Swagger UI sur
`http://localhost:8080/swagger-ui.html`.

Voir le fichier `Backend/README.md` pour le contrat JSON complet et les détails de sécurité.

## Tests & build

- Backend : `./mvnw test`, `./mvnw package`
- Frontend : `npm test`, `npm run build` (depuis `Frontend/`)

## Contribution / workflow

- Travaillez sur une branche dédiée puis ouvrez une merge request vers `main`.
- Respectez les consignes de lint/tests avant de pousser.

## Ressources et documentation

- Détails backend : Backend/README.md
- Détails frontend : Frontend/README.md
