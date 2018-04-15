
```typescript
 export const exerciseModule = module('exercisesModule')
    .import('persistence', persistenceModule)
    .import('auth', authModule)
    .import('score', scoreModule)
    .declare('createExerciseService', c => new CreateExerciseService(
        c.persistence.connection,
        c.persistence.exerciseRepository,
        c.persistence.tagRepository))
    .declare('createExerciseResolver', c => new CreateExerciseResolver(
        c.createExerciseService,
        c.auth.authorizationService
    ))
    .declare('exerciseMusicScoreResolver', c => new ExerciseMusicScoreResolver(
        c.persistence.musicScoreRepository,
        c.score.musicScoreBuilder,
        c.auth.authorizationService
    ))
    .declare('exercisePracticeMethodsResolver', c => new ExercisePracticeMethodsResolver(
        c.persistence.practiceMethodRepository,
        c.auth.authorizationService))
    .declare('exerciseTagsResolver', c => new ExerciseTagsResolver(
        c.persistence.tagRepository,
        c.auth.authorizationService))
    .declare('updateExerciseService', c => new UpdateExerciseService(
        c.persistence.connection,
        c.persistence.exerciseRepository,
        c.persistence.musicScoreRepository,
        c.persistence.removeMusicScoreService))
    .declare('updateExerciseResolver', c => new UpdateExerciseResolver(
        c.updateExerciseService,
        c.auth.authorizationService
    ))
    .declare('ExerciseResolver', c => new ExerciseResolver(c.persistence.connection, c.auth.authorizationService))
    .declare('AllExercisesResolver', c => new AllExercisesResolver(c.auth.authorizationService, c.persistence.exerciseRepository));

```

alternatively we could do something like that 

```typescript
 export const exerciseModule = module('exercisesModule')
    // .import('persistence', persistenceModule)
    // .import('auth', authModule)
    // .import('score', scoreModule)
    .declare('createExerciseService', c => new CreateExerciseService(
        c.import(persistenceModule,'connection'),
        c.import(persistenceModule, 'exerciseRepositor'),
        c.import(persistenceModule,'tagRepository'))
    .declare('createExerciseResolver', c => new CreateExerciseResolver(
        c.get('createExerciseService'),
        c.import(authModule,'authorizationService')
    ))
    .declare('exerciseMusicScoreResolver', c => new ExerciseMusicScoreResolver(
        c.persistence.musicScoreRepository,
        c.score.musicScoreBuilder,
        c.auth.authorizationService
    ))
    .declare('exercisePracticeMethodsResolver', c => new ExercisePracticeMethodsResolver(
        c.persistence.practiceMethodRepository,
        c.auth.authorizationService))
    .declare('exerciseTagsResolver', c => new ExerciseTagsResolver(
        c.persistence.tagRepository,
        c.auth.authorizationService))
    .declare('updateExerciseService', c => new UpdateExerciseService(
        c.persistence.connection,
        c.persistence.exerciseRepository,
        c.persistence.musicScoreRepository,
        c.persistence.removeMusicScoreService))
    .declare('updateExerciseResolver', c => new UpdateExerciseResolver(
        c.updateExerciseService,
        c.auth.authorizationService
    ))
    .declare('ExerciseResolver', c => new ExerciseResolver(c.persistence.connection, c.auth.authorizationService))
    .declare('AllExercisesResolver', c => new AllExercisesResolver(c.auth.authorizationService, c.persistence.exerciseRepository));

```

V3 


```typescript

 export const exerciseModule = module('exercisesModule')
   
    .declare('createExerciseService', CreateExerciseService,[
        c.import(persistenceModule,'connection'),
        c.import(persistenceModule, 'exerciseRepositor'),
        c.import(persistenceModule,'tagRepository')
    ])
    .declare('createExerciseResolver', c => new CreateExerciseResolver(
        c.get('createExerciseService'),
        c.import(authModule,'authorizationService')
    ))
    .declare('exerciseMusicScoreResolver', c => new ExerciseMusicScoreResolver(
        c.persistence.musicScoreRepository,
        c.score.musicScoreBuilder,
        c.auth.authorizationService
    ))
    .declare('exercisePracticeMethodsResolver', c => new ExercisePracticeMethodsResolver(
        c.persistence.practiceMethodRepository,
        c.auth.authorizationService))
    .declare('exerciseTagsResolver', c => new ExerciseTagsResolver(
        c.persistence.tagRepository,
        c.auth.authorizationService))
    .declare('updateExerciseService', c => new UpdateExerciseService(
        c.persistence.connection,
        c.persistence.exerciseRepository,
        c.persistence.musicScoreRepository,
        c.persistence.removeMusicScoreService))
    .declare('updateExerciseResolver', c => new UpdateExerciseResolver(
        c.updateExerciseService,
        c.auth.authorizationService
    ))
    .declare('ExerciseResolver', c => new ExerciseResolver(c.persistence.connection, c.auth.authorizationService))
    .declare('AllExercisesResolver', c => new AllExercisesResolver(c.auth.authorizationService, c.persistence.exerciseRepository));

```