# 📅 RENDERING EVENTS 📅 

## Stack technique

- [Angular 22.1](https://angular.dev/) (composants standalone, sans `NgModule`)
- [Angular Material 22](https://material.angular.io/) + Angular CDK
- [RxJS 7.8](https://rxjs.dev/)
- TypeScript en mode `strict`
- SCSS pour le style
- Tests unitaires : Karma + Jasmine

## Lancer le projet en local

**Prérequis** : [Node.js](https://nodejs.org/) et npm installés.

```bash
cd Frontend
npm install
npm start
```

L'application est ensuite accessible sur [http://localhost:4200](http://localhost:4200).

Autres commandes utiles (à lancer depuis `Frontend/`) :

```bash
npm run build   # build de production
npm test        # tests unitaires (Karma/Jasmine)
npm run lint    # lint ESLint
```

## Configuration de l'URL du backend

L'URL de base de l'API est définie dans `src/environments/environment.ts` (dev, valeur par défaut
`http://localhost:8080`). Le build de production (`npm run build`, configuration `production`)
remplace ce fichier par `src/environments/environment.prod.ts` (`fileReplacements` dans
`angular.json`) : y renseigner l'URL du backend déployé (ex. le service Render) avant de builder
pour la prod.

## Déploiement

Le build de production (`npm run build`) génère `dist/rendering-events/browser/`, servi par
Cloudflare via **Workers Static Assets** (config `wrangler.json`) plutôt que l'ancien formulaire
Cloudflare Pages : build command `npm run build`, deploy command `npx wrangler deploy`. Le routage
SPA (routes de l'Angular Router comme `/:date` fonctionnant sur un rechargement ou un lien direct)
est géré nativement par `assets.not_found_handling: "single-page-application"` dans
`wrangler.json` — ne pas ajouter de fichier `_redirects` en plus, les deux mécanismes entrent en
conflit (boucle infinie détectée par Cloudflare au déploiement). Voir
[le README racine](../README.md) pour l'architecture de déploiement complète.

# Sujet


## L'objectif : afficher, ajouter et modifier des événements sur un calendrier journalier (vue "jour")

L'application affiche les événements d'une journée sur une grille horaire allant de 09h00 à 21h00
(`DAY_START_HOUR`/`DAY_END_HOUR`). La position verticale et la hauteur d'un événement se calculent
en fonction de la bordure supérieure de la grille, de son heure de début et de sa durée : par exemple,
sur une grille de 09h00 à 21h00 affichée sur 1200px de haut, un événement commençant à 12h00 et durant
1h occupera 100px de haut, positionné à 300px du haut de la grille.

En plus de la visualisation, il est possible d'**ajouter un nouvel événement** via un formulaire
(titre, date, heure de début, durée, case à cocher « public ») ouvert dans une boîte de dialogue ;
le nouvel événement est envoyé au backend puis positionné sur la grille avec le reste des
événements du jour, chevauchements inclus.

Un clic (ou `Entrée` au clavier) sur un événement ouvre une boîte de dialogue de **détails**
([`EventDetailsComponent`](src/app/component/organisms/event-details/event-details.component.ts))
affichant ses informations complètes. Si l'utilisateur courant est le propriétaire de l'événement,
un bouton « Modifier » bascule la boîte de dialogue vers le même formulaire réactif que pour la
création, pré-rempli ; la sauvegarde envoie les changements au backend puis met à jour l'événement
affiché sur la grille sans recharger la liste du jour. Un bouton « Supprimer » (visible dans les
mêmes conditions que « Modifier ») envoie une suppression au backend puis retire l'événement de la
grille. Pour un événement public d'un autre utilisateur, la boîte de dialogue reste en lecture
seule (pas de bouton « Modifier »/« Supprimer »).

Chaque événement appartient à l'utilisateur qui l'a créé (authentification requise, voir
[Backend/README.md](../Backend/README.md#authentification)). Un événement est par défaut privé
(visible seulement par son créateur) ; cocher « public » le rend visible par tous les
utilisateurs. Les événements publics des autres utilisateurs affichent un badge « Public ».

___
## Chevauchement d'évenements
Les évenement peuvent recouvrir une même plage horaire. Auquel cas, on parle de _chevauchement_. Le _chevauchement_ de 2 évenements ne doit pas empêcher leur visibilité.


Votre implémentation doit respecter les contraintes suivantes:

`1. Si A et B sont deux évenements en chevauchement, alors Largeur(A) = Largeur(B).`

`2. LargeurMax = largeur de la fenêtre`

`3. Si sur une plage horaire donnée, deux évenements A et B se chevauchent, alors Largeur(A) + Largeur(B) = LargeurMax`

Une illustration visuelle du problème est donnée ci-dessous.



___

## Input

Les événements du jour sélectionné sont récupérés auprès d'un backend REST par
[`EventService`](src/app/services/event.service.ts), via :

```
GET http://localhost:8080/api/events?date=2026-09-02
```

Un backend doit donc tourner en local sur le port `8080` pour que l'application affiche des
événements ; l'utilisateur doit être authentifié (cookie de session posé par
`/api/auth/login`). La réponse ne contient que les événements visibles par l'utilisateur courant
(ses propres événements + les événements publics des autres). Sa forme
([`EventRaw`](src/app/models/event.model.ts)) :

```typescript
[
  {
    id: 1,
    title: 'Point équipe', // optionnel
    date: '2026-09-02', // 'YYYY-MM-DD'
    start: '15:00', // heure de début, 'HH:MM'
    duration: 90, // durée en minutes
    ownerId: 2, // id de l'utilisateur créateur
    isPublic: false // visible par tous les utilisateurs si true
  }
]
```

Un événement créé via le formulaire d'ajout est envoyé au backend via
`POST http://localhost:8080/api/events` (`title`, `date`, `start`, `duration`, `isPublic`) ; le
backend répond avec l'événement complet (`id` et `ownerId` générés côté serveur), au même format
que ci-dessus.

Un événement modifié via la boîte de dialogue de détails est envoyé au backend via
`PUT http://localhost:8080/api/events/{id}` (même corps que `POST`, voir
[`EventService.updateEvent`](src/app/services/event.service.ts)) ; la requête échoue si
l'utilisateur courant n'est pas le propriétaire de l'événement.

Un événement supprimé via le bouton « Supprimer » de la boîte de dialogue de détails est envoyé au
backend via `DELETE http://localhost:8080/api/events/{id}` (sans corps, voir
[`EventService.deleteEvent`](src/app/services/event.service.ts)) ; la requête échoue de la même
façon si l'utilisateur courant n'est pas le propriétaire de l'événement.

___

## Output

Les événements du jour sont affichés dans un conteneur couvrant toute la fenêtre. Le haut du
conteneur représente 09h00, le bas représente 21h00.

Les événements sont représentés sous forme de `div` avec une couleur de fond et une bordure de 1px.

L'id de l'événement est présent dans le contenu de la `div` (ainsi que le titre et l'horaire), et
dans son attribut `id` (sous la forme `event-<id>`) afin d'être identifiable.

L'affichage est responsive : le repositionnement des événements répond aux événements `resize` de
la fenêtre.

___
## ⚠️ Dépendances ⚠️

Le sujet initial imposait React (ou un framework front équivalent) et interdisait toute librairie
non purement utilitaire (ex: lodash) ou non purement graphique/templating (ex: material UI).
Ce projet a été implémenté avec **Angular** + **Angular Material**, qui respecte cette contrainte.


![calendar version outlook](media-assets/calendar.png)
_la version Microsoft Outlook ..._

## ⚠️ Modalités de rendu ⚠️

* poussez sur une nouvelle branche git
* ouvrez une merge request vers Main
* notifiez votre interlocuteur par message que le kata est fini

# Motivation du kata & contexte

De plus en plus d’équipes de développement adoptent le paradigme **full-stack**, en demandant à tous leurs développeurs d’être en mesure de prendre en charge une tâche de front comme de back, selon les priorités du moment. 
 

Les profils full-stack ayant un background orienté backend auront souvent plus de difficultés à s’emparer des concepts bas-niveau du front, qu’ils contournent en se cantonnant à des affichages très simplistes & des composants déjà existants. 

 
L’objectif de ce kata : challenger la compréhension du front bas-niveau du candidat, en construisant **un composant complexe from-scratch**. 

# Specification [RFC2119](https://microformats.org/wiki/rfc-2119-fr) du kata

> Description précise & sans ambiguité sur les termes de ce qui est attendu

**1. Fonctionnalité du projet**
 * Le défilement des évènements `DOIT` commencer à l’ouverture de la page web et satisfaire autant que possible les contraintes du sujet
 * Le projet `DOIT` pouvoir être ouvert sur n’importe quel navigateur.
 * L'id d'un évènement `DOIT` être présent dans le contenu de sa div, ainsi que dans son attribut `id`.

**2. Démonstration du frontend craftsmanship**
* Le projet `NE DOIT PAS` utiliser d’imports de librairies autres que librairies nécessaires au fonctionnement du framework utilisé (ex React: “react”, “react-dom”, ...) 
* L’affichage `DOIT` être [responsive](https://www.usabilis.com/responsive-web-design-site-web-adaptatif/)
* Le projet `DEVRAIT` être implémenté en JS moderne [ES6](https://www.w3schools.com/js/js_es6.asp) 
* Le projet `PEUT` être implémenté en Typescript 
* Les informations `DEVRAIENT` être facilement lisibles et agréables à l’oeil 
