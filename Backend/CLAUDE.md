# CLAUDE.md

Consignes de développement pour ce backend Java 25 / Spring Boot. Pour le contexte projet et le
choix d'architecture (hexagonale), voir [README.md](README.md).

## TDD — non négociable

Tout code métier (domaine, use cases) est écrit en **Test-Driven Development** :

1. **Red** — écrire un test qui échoue, exprimant le comportement attendu avant toute
   implémentation.
2. **Green** — écrire le minimum de code pour faire passer ce test.
3. **Refactor** — nettoyer (nommage, duplication, structure) une fois le test au vert, sans jamais
   casser le vert.

Règles pratiques :

- Jamais de code de production sans test qui le précède, pour le `domain` et l'`application`.
- Un test = un comportement (nommage `should_xxx_when_yyy` ou équivalent explicite).
- Le `domain` se teste **sans contexte Spring, sans mock lourd, sans I/O** : ce sont des tests
  Java purs, rapides.
- Les adaptateurs (`infrastructure`) se testent avec des tests d'intégration ciblés (slice tests
  Spring : `@WebMvcTest` pour le web, tests dédiés pour la persistance), qui vérifient le contrat
  du port, pas l'implémentation.
- Mockito uniquement aux frontières (pour substituer un port dans un test de use case), jamais
  pour mocker le domaine lui-même.
- Style Mockito : `@ExtendWith(MockitoExtension.class)` + champs `@Mock`, plutôt que des appels
  manuels à `mock(...)`, pour les tests d'use case (moins de boilerplate, détection des stubs
  inutilisés par Mockito).
- Un bug corrigé commence par un test qui le reproduit.

## Principes SOLID

Ce projet applique strictement les 5 principes SOLID (cf.
[SOLID-Principles-Design-Patterns](https://github.com/ozidan13/SOLID-Principles-Design-Patterns)
pour la théorie illustrée). Application concrète dans notre architecture hexagonale :

- **S — Single Responsibility** : une classe = une seule raison de changer. Un use case
  (`CreateEvent`, `ListEventsForDay`) fait une seule chose ; la validation, le mapping DTO et la
  persistance restent dans des classes séparées.
- **O — Open/Closed** : le domaine s'étend par ajout (nouvelle implémentation de port, nouvelle
  stratégie) plutôt que par modification de code existant. Une nouvelle règle métier ne doit pas
  nécessiter de réécrire un use case existant, mais de le composer/étendre.
- **L — Liskov Substitution** : toute implémentation d'un port (`EventRepository` en mémoire, en
  JPA, ...) doit être interchangeable sans changer le comportement attendu par le use case qui la
  consomme. Les tests de contrat sur les ports garantissent ça.
- **I — Interface Segregation** : les ports restent étroits et spécifiques à un besoin (ex. :
  `EventRepository.findByDate` plutôt qu'une interface fourre-tout). Pas d'interface avec des
  méthodes que certains adaptateurs n'implémentent pas vraiment.
- **D — Dependency Inversion** : c'est le cœur de l'hexagonal. Le `domain` ne dépend de rien ;
  `application` dépend d'abstractions (`port.in`, `port.out`) ; `infrastructure` dépend de
  `domain`/`application`, jamais l'inverse. Spring ne fait qu'injecter les implémentations
  concrètes dans ces abstractions.

## Design patterns pertinents

Pas de pattern pour le principe du pattern — seulement ceux qui répondent à un besoin réel du
projet :

- **Ports & Adapters (Hexagonal)** est en soi une application architecturale du DIP et du pattern
  *Adapter* : chaque adaptateur (`infrastructure.in.web`, `infrastructure.out.persistence`)
  adapte un port du domaine à une technologie concrète.
- **Repository** : le port `EventRepository` (out) abstrait la persistance derrière une interface
  définie par le domaine, pas par la techno de stockage.
- **Builder** : pour construire un `Event` valide (titre optionnel, validation de date/heure/
  durée), préférer un builder ou un factory method statique à un constructeur télescopique.
- **Strategy** : si plusieurs façons de calculer/valider quelque chose coexistent (ex. : règles de
  chevauchement, stratégies de génération d'id), les encapsuler derrière une interface plutôt que
  des `if/else` en cascade.
- **Singleton** : ne jamais l'implémenter à la main — laisser Spring gérer le scope singleton des
  beans via l'injection de dépendances.

## Bonnes pratiques de code (niveau senior)

### Nommage

- **Classes / interfaces** : `PascalCase`, noms métier explicites (`EventRepository`,
  `CreateEvent`), jamais de préfixe `I` sur les interfaces.
- **Méthodes** : `camelCase`, verbe d'action qui décrit ce qui est fait (`createEvent`,
  `findByDate`), pas de noms génériques (`handle`, `process`, `doStuff`).
- **Variables** : `camelCase`, nom qui révèle l'intention (`eventStart` plutôt que `es` ou `tmp`),
  pas d'abréviations non standard. Les exceptions courantes et sans ambiguïté (`id`, `dto`, `i`
  dans une boucle très locale) restent acceptables.
- **Constantes** : `static final` en `UPPER_SNAKE_CASE` (`DAY_START_HOUR`, `DAY_END_HOUR`) —
  jamais de nombre ou chaîne magique répétée dans le code.
- **Booléens** : préfixe `is`/`has`/`can` (`isOverlapping`, `hasTitle`).
- **Collections** : nom au pluriel (`events`), jamais de suffixe type `eventList`.
- **Packages** : tout en minuscules, sans underscore, au singulier (`domain.model`, pas
  `domain.models`).

### Style et lisibilité

- Méthodes courtes, un seul niveau d'abstraction par méthode ; extraire plutôt qu'imbriquer.
- Guard clauses (retour anticipé) plutôt que des `if` imbriqués sur plusieurs niveaux.
- Pas de commentaire qui répète ce que le code dit déjà ; un commentaire n'est justifié que pour
  une raison non évidente (contrainte métier cachée, contournement volontaire).
- Imports explicites, jamais de wildcard (`import java.util.*`).

### Immutabilité et null-safety

- `final` par défaut sur les champs, paramètres et variables locales qui ne sont pas réassignés.
- Une méthode ne retourne jamais `null` : `Optional<T>` pour une absence de résultat en retour de
  méthode (jamais en paramètre ni en champ de classe), collection vide plutôt que `null`.
- Les objets du domaine sont immuables par défaut ; toute modification produit une nouvelle
  instance plutôt que de muter l'existante.

### Exceptions

- Exceptions métier dédiées (unchecked, étendant `RuntimeException`), avec un message explicite
  sur la règle violée (ex. : `InvalidEventDurationException`).
- Fail-fast : valider les invariants dès la construction (constructeur/factory), pas plus tard.
- Ne jamais avaler une exception silencieusement (`catch` vide) ni catcher `Exception` de façon
  générique dans le code métier.

### Injection de dépendances

- Injection **par constructeur uniquement**, jamais `@Autowired` sur un champ. Les dépendances
  injectées sont `private final`.
- Une classe ne connaît que les abstractions (ports) dont elle a besoin, pas le conteneur Spring.

### Logging

- SLF4J partout, jamais de `System.out.println`.
- Logs paramétrés (`log.info("Event {} created for {}", id, date)`), pas de concaténation de
  chaînes.
- Niveau adapté (`debug` pour le détail technique, `info` pour les événements métier notables,
  `warn`/`error` réservés aux situations anormales) ; ne jamais logguer puis relancer la même
  exception (choisir l'un ou l'autre).

### API et DTOs

- Ne jamais exposer une entité de persistance directement dans l'API REST : toujours un DTO dédié
  (`infrastructure.in.web`) avec un mapping explicite vers/depuis le domaine.
- Validation des entrées à la frontière (Bean Validation sur les DTOs), les invariants métier plus
  profonds restent vérifiés dans le domaine.

## Conventions Java 25

- Préférer les **records** pour les objets immuables (value objects du domaine, DTOs d'entrée/
  sortie de l'API).
- Utiliser le **pattern matching** (`switch` sur types scellés, `instanceof` pattern) plutôt que
  des chaînes de `if/instanceof`.
- Les **sealed interfaces/classes** sont bienvenues pour modéliser des variantes fermées du
  domaine (ex. : résultats de validation).
- Lombok reste limité à ce qui réduit du bruit réel (`@Getter`, `@Builder` sur des classes qui ne
  peuvent pas être des records) — ne pas l'utiliser pour contourner l'immutabilité.

## Commandes

```bash
./mvnw test              # tests (à lancer avant tout commit)
./mvnw spring-boot:run   # démarrage local (http://localhost:8080)
./mvnw package           # build du jar
```

## Documentation — mettre à jour le README après chaque gros changement

[README.md](README.md) doit rester le reflet exact du code. Mettre à jour la section concernée
**dans le même commit** dès que l'un de ces changements arrive :

- nouvel endpoint, endpoint supprimé, ou changement de contrat (requête/réponse JSON, codes
  d'erreur) → section « API » ;
- nouvelle règle d'authentification, cookie, claim JWT, ou compte de démonstration seedé →
  section « Authentification » ;
- changement de package/couche dans l'architecture hexagonale (nouveau port, nouvel adaptateur,
  déplacement de classe entre `domain`/`application`/`infrastructure`) → section « Structure de
  packages » ;
- nouvelle dépendance Maven notable, changement de version Java/Spring Boot, nouvelle commande
  `mvnw` → sections « Stack technique » / « Commandes » ;
- changement de migration Liquibase qui modifie le schéma ou les données de seed → mentionner
  l'impact si le comportement décrit dans le README change (ex. nouveaux comptes seedés).

Si le changement modifie aussi ce que le Frontend doit savoir (contrat d'API, port, CORS), mettre
à jour également le `README.md` racine (voir [sa section Documentation](../CLAUDE.md)).
