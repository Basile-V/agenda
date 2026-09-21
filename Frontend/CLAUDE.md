# CLAUDE.md

Guide de contexte et de bonnes pratiques pour travailler sur ce projet Angular.

## Le projet

Ce dossier (`Frontend/`) contient une application Angular 22 (standalone, sans NgModule) de
visualisation/planification d'événements sur un calendrier journalier, avec Angular
Material pour l'UI.

- **Domaine** : affichage d'événements (`EventRaw`/`ParsedEvent`) sur une grille horaire
  (`DAY_START_HOUR` → `DAY_END_HOUR`, voir [event.model.ts](src/app/models/event.model.ts)),
  calcul de layout (chevauchements, colonnes) via [layout.utils.ts](src/app/utils/layout.utils.ts),
  et création de tâches via un formulaire dans une `mat-dialog`.
- **Données** : chargées auprès du backend Spring Boot (`../Backend/`) via
  [event.service.ts](src/app/services/event.service.ts) (`GET /api/events?date=...`,
  `POST /api/events`, sur `http://localhost:8080`).

### Stack

- Angular 22.1 (standalone components, pas de `NgModule`)
- Angular Material 22 + Angular CDK
- RxJS 7.8
- SCSS (style par défaut du schematic, voir `angular.json`)
- Formatage : Prettier via `prettier-eslint` (config dans
  [.prettierrc](.prettierrc) — `singleQuote`, `printWidth: 100`,
  parser `angular` pour les `*.html`)
- Tests : Karma + Jasmine via le builder `@angular/build:karma`
- TypeScript en mode `strict` complet (`strictTemplates`, `strictInjectionParameters`,
  `strictInputAccessModifiers`, `noImplicitReturns`, `noUncheckedIndexedAccess` non activé,
  `noPropertyAccessFromIndexSignature`, `noImplicitOverride`)

### Architecture

```
src/app/
  component/         # composants organisés en atomic design (voir ci-dessous)
    atoms/
      button/
      icon/
    molecules/
      calendar-header/
      event/
      time-slot/
    organisms/
      calendar/
      create-task/
  models/            # interfaces + constantes du domaine, fonctions pures de parsing
  services/          # accès aux données (HttpClient), décorés avec @Service()
  utils/             # fonctions pures, sans état, sans dépendance Angular (layout, calculs)
  app.config.ts       # providers globaux (router, http, animations)
  app.routes.ts       # routes (vide pour l'instant, app mono-écran)
```

Tout composant/service/pipe est **standalone** : pas de `NgModule`, les dépendances
sont déclarées dans `imports: [...]` du décorateur `@Component`.

## Atomic design appliqué à ce projet

Le dossier `component/` est organisé en `atoms/`, `molecules/`, `organisms/` :

- **Atoms** (`component/atoms/`) : composants purement présentationnels, sans logique
  métier, réutilisables partout — `button`, `icon`. Ils ne connaissent ni `EventService`
  ni le modèle `ParsedEvent`.
- **Molecules** (`component/molecules/`) : composants d'affichage qui composent des atoms
  ou portent un peu de logique locale sans appel service — `calendar-header` (compose
  `button` + `icon`, état local via `signal`), `event` (rendu d'un `LayoutEvent`),
  `time-slot` (rendu d'une heure de la grille).
- **Organisms** (`component/organisms/`) : blocs fonctionnels connectés, qui injectent
  des services et orchestrent l'état — `calendar` (charge les événements via
  `EventService`, ouvre le dialog) et `create-task` (formulaire réactif dans une
  `mat-dialog`).
- **Templates/Pages** : composition des organisms pour un écran (`app.component`
  aujourd'hui ; à extraire en pages dédiées si des routes apparaissent).

Règles à respecter pour que l'atomic design reste cohérent :

- Un atom ne dépend jamais d'un service ou du domaine métier — seulement d'`@Input`/`@Output`
  (ou `input()`/`output()`) et d'Angular Material si besoin.
- Une molecule peut composer des atoms mais ne fait pas d'appel HTTP.
- Seuls les organisms (ou des services dédiés) injectent des services (`inject()` ou
  constructeur) et orchestrent l'état.
- Un composant qui commence à avoir à la fois de la logique métier ET des sous-composants
  purement visuels est un signal pour extraire des atoms/molecules.
- Avant de créer un nouveau composant, vérifier qu'un atom/molecule existant ne peut pas
  être réutilisé plutôt que dupliqué.

## Bonnes pratiques Angular (senior front-end)

### Components

- Toujours `standalone` (implicite en Angular 22, ne pas ajouter `standalone: true`,
  c'est la valeur par défaut).
- Ne pas déclarer `changeDetection: ChangeDetectionStrategy.OnPush` : c'est la stratégie par
  défaut depuis Angular 22, la répéter est du bruit. Ne mettre `changeDetection` que pour
  opter explicitement pour `ChangeDetectionStrategy.Eager` (ex-`Default`), avec une raison
  documentée.
- Écrire **tous les modificateurs d'accès** (`public`/`private`/`protected`, + `readonly` quand
  c'est pertinent) sur chaque membre de classe (champs, méthodes, accesseurs), y compris
  `public`, pour ne pas dépendre du niveau implicite. Exception : `constructor`.
- Préférer les **signal inputs/outputs** (`input()`, `input.required()`, `output()`)
  aux décorateurs `@Input()`/`@Output()` pour tout nouveau code — meilleure inférence
  de type, compatible `OnPush` par construction, pas besoin de `ngOnChanges`.
- Utiliser `inject()` plutôt que l'injection par constructeur pour les nouveaux
  composants/services, c'est le style recommandé en Angular moderne (plus lisible avec
  l'héritage, les guards fonctionnels, etc.).
- Templates : utiliser la nouvelle syntaxe de control flow (`@if`, `@for` avec `track`,
  `@switch`) plutôt que `*ngIf`/`*ngFor`/`*ngSwitch`. Ne jamais oublier `track` sur `@for`.
- Un composant = une responsabilité. Extraire dès qu'un template dépasse ~100-150 lignes
  ou qu'un `.ts` mélange plusieurs préoccupations (état UI + appels service + calculs).
- Pas de logique métier dans le template (pas de `.filter()`/`.map()` inline complexes) :
  déplacer dans le `.ts` (idéalement un `computed()`) ou un pipe pur.

### State & reactivity

- Préférer `signal()`/`computed()` à la gestion d'état impérative via des champs de classe +
  `ChangeDetectorRef.detectChanges()`. Une valeur dérivée d'autres signaux est un `computed()`,
  jamais un `effect()` qui fait un `set()` sur un autre signal.
- Réserver `effect()` aux effets de bord (DOM, log, stockage) ; ne pas s'en servir pour
  synchroniser de l'état.
- Le chargement de données dépendant de signaux (ex. l'événement d'une date sélectionnée) se fait
  avec `rxResource()` (ou `resource()`), lu via `.value()`/`.isLoading()`/`.error()`, plutôt qu'avec
  un `effect()` + `subscribe()` + `signal.set()`.
- RxJS reste pertinent pour les flux asynchrones (HTTP, événements DOM) ; convertir en
  signal avec `toSignal()` dès que la valeur doit être lue dans un template ou un `computed`.
- Toujours désabonner (`takeUntilDestroyed()` ou `async` pipe) — jamais de `subscribe()`
  sans gestion du cycle de vie dans un composant qui peut être détruit. Cela vaut aussi pour
  `MatDialogRef.afterClosed()` et les appels HTTP déclenchés depuis un handler.
- Une seule source d'écoute par événement : pour la taille d'un élément, `ResizeObserver` (avec
  `disconnect()` au destroy) **ou** `@HostListener('window:resize')`, jamais les deux.
- Pour dimensionner/positionner, préférer CSS (pourcentages, grid, flex, `calc()`) aux calculs en
  pixels faits en TypeScript à partir de `clientWidth`/`clientHeight`.

### Services & data access

- `@Service()` (Angular 22) pour les services applicatifs, à la place de
  `@Injectable({ providedIn: 'root' })` : il est fourni à la racine automatiquement. Injection
  via `inject()` uniquement (règle lint `prefer-inject`), jamais par constructeur.
- Les services renvoient des types du domaine (`models/`), jamais des DTOs bruts non
  typés — voir le pattern `EventRaw` → `ParsedEvent` dans `EventService`.
- Les fonctions de calcul pur (parsing, layout) vont dans `utils/`, testées
  indépendamment d'Angular (pas d'injection, pas de `TestBed`).

### Formulaires

- Reactive Forms (`FormGroup`/`FormControl` typés) plutôt que Template-driven Forms.
- Valider via `Validators` + affichage conditionnel des erreurs avec `@if` +
  `hasError('required')`, en s'appuyant sur `touched`/`dirty` (voir
  [create-task.component.ts](src/app/component/organisms/create-task/create-task.component.ts)).
- `form.markAllAsTouched()` au moment du submit pour révéler toutes les erreurs même sur
  les champs jamais visités.

### Angular Material

- Rester cohérent sur `appearance` des `mat-form-field` dans toute l'app (choisir
  `fill` ou `outline` et s'y tenir, ne pas mélanger).
- Importer uniquement les modules Material réellement utilisés dans chaque composant
  standalone (`imports: [MatIconModule]`, pas de barrel imports).

### TypeScript

- Ne pas relâcher le mode `strict` déjà activé. Pas de `any` explicite dans le code
  applicatif (les `as any` restants dans les `*.spec.ts` servent uniquement à lire la
  forme brute de données de test, pas à contourner du typage métier).
- Typer les retours de fonctions publiques/exportées.
- Préférer `interface` pour les modèles de données, `type` pour les unions/alias.

### Tests

- Un test unitaire par fonction pure dans `utils/` et `models/` (déjà en place pour
  `layout.utils` et `event.model`).
- Tester les services avec `HttpClientTestingModule`/`provideHttpClientTesting()`, sans
  appel réseau réel.
- Pour les composants, privilégier les tests de comportement (rendu conditionnel, sortie
  d'événements) plutôt que les détails d'implémentation.

### Style & organisation générale

- SCSS colocalisé avec chaque composant (`*.component.scss`), pas de styles globaux
  au-delà de `styles.scss` (thème, resets).
- Nommage des fichiers : `kebab-case`, suffixe `.component.ts`/`.service.ts`/`.model.ts`
  cohérent avec les conventions Angular CLI déjà en place.
- Pas de commentaires qui décrivent ce que fait le code (le nommage doit suffire) ; un
  commentaire seulement pour expliquer un choix non évident (ex. `// 'HH:MM'` dans
  `event.model.ts` précise un format non déductible du type).
- Ne pas introduire de nouvelle librairie de state management (NgRx, Akita...) sans
  besoin explicite : l'app est encore petite, `signal`/services suffisent.

## Qualité de code

- ESLint est configuré ([eslint.config.js](eslint.config.js)) avec `@angular-eslint`/
  `typescript-eslint` (`tsRecommended`, `templateRecommended`, `templateAccessibility`) ;
  lancer `npm run lint` avant de pousser : il doit rester à **0 erreur** (imports inutilisés,
  préfixe de sélecteur `app-`, pas de `any` explicite, y compris dans les `*.spec.ts`).
- Formatage : Prettier via `prettier-eslint`, config dans [.prettierrc](.prettierrc).

Tous les composants utilisent des signal inputs (`input()`/`input.required()`) plutôt que
`@Input()`, avec la détection de changements par défaut (`OnPush`) — à conserver comme standard
pour tout nouveau composant.

## Documentation — mettre à jour le README après chaque gros changement

[README.md](README.md) doit rester le reflet exact de l'application. Mettre à jour la section
concernée **dans le même commit** dès que l'un de ces changements arrive :

- nouvelle fonctionnalité visible (nouvel écran, nouveau composant organism, nouvelle règle de
  layout/chevauchement) → sections « Sujet » / « Output » ;
- changement du contrat consommé auprès du backend (forme d'`EventRaw`, nouvel endpoint appelé,
  changement d'URL/port) → section « Input » ;
- nouvelle dépendance notable (Angular Material, une lib), changement de version Angular,
  nouvelle commande npm → sections « Stack technique » / commandes ;
- changement de structure de dossiers (`component/`, `models/`, `services/`, `utils/`) →
  vérifier aussi la cohérence avec l'arborescence décrite plus haut dans ce fichier.

Si le changement modifie aussi ce que le Backend doit savoir, ou le contrat d'API partagé, mettre
à jour également le `README.md` racine (voir [sa section Documentation](../CLAUDE.md)).
