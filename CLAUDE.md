# CLAUDE.md

Point d'entrée pour travailler sur ce dépôt. Voir [README.md](README.md) pour la présentation
générale du projet (stack, lancement local, API).

## Structure du dépôt

Ce dépôt est un monorepo à deux parties, chacune avec son propre guide de conventions :

- `Backend/` — API Java 25 / Spring Boot (architecture hexagonale, TDD, SOLID).
  → **Pour toute tâche backend, lire [Backend/CLAUDE.md](Backend/CLAUDE.md) avant de coder.**
- `Frontend/` — application Angular 22 (standalone, Angular Material, atomic design).
  → **Pour toute tâche frontend, lire [Frontend/CLAUDE.md](Frontend/CLAUDE.md) avant de coder.**

Une tâche qui touche aux deux (ex. : évolution de contrat d'API) doit respecter les deux guides
simultanément, côté serveur comme côté client.

## Directives générales

- Toujours consulter le `CLAUDE.md` du dossier concerné avant de modifier son code : chaque
  partie a ses propres conventions de nommage, de tests et d'architecture, volontairement
  différentes (SOLID/TDD/hexagonal côté Java, atomic design/signals côté Angular).
- Ne pas dupliquer une règle d'un des deux guides ici : ce fichier ne fait que router, les
  détails vivent dans `Backend/CLAUDE.md` et `Frontend/CLAUDE.md`.
- Avant de committer, lancer les vérifications du côté modifié : `./mvnw test` (Backend) et/ou
  `npm test` + `npm run lint` (Frontend) — voir README.md pour le détail des commandes.
- Garder les trois README (racine, `Backend/`, `Frontend/`) synchronisés avec le code quand une
  commande, un chemin ou un contrat d'API change.
