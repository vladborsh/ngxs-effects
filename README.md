# Ngxs-Effects

[![Build Status](https://travis-ci.com/vladborsh/ngxs-effects.svg?branch=master)](https://travis-ci.com/vladborsh/ngxs-effects)
[![Coverage Status](https://coveralls.io/repos/github/vladborsh/ngxs-effects/badge.svg?branch=master)](https://coveralls.io/github/vladborsh/ngxs-effects?branch=master)

## Goal of ngxs-effects

The main goal is to gracefully separate the effects logic from the definition of the repository itself. Creating effects should be easy without worrying about managing your subscriptions and unsubscribes. Just mark how you would like to react to certain events in your store. We will do the rest for you.

## Quick links

* 🚀 Watch [live demo](https://stackblitz.com/github/vladborsh/ngxs-effects-demo?file=src%2Fapp%2Fcustomer%2Fcustomer-effects%2Fcustomer-effects.service.ts) 
* 📖 Check our [documentation](https://github.com/vladborsh/ngxs-effects#quick-start)
* 🐞 Report [issues](https://github.com/vladborsh/ngxs-effects/issues/new/choose)

## Features

* Separated effects from ngxs store definition
* Application-wide effect / feature-wide effects
* Application-lifetime effects / feature-lifetime effects
* Decorators for for effects logic and effects initialization and termination
* Custom error handlers
* Limit lifetime effects

## Installation

```
npm i -S ngxs-effects
```

## Quick start

First, define your storage. This is a common repository like you used to create

```typescript
@State<Record<string, PonyInterface>>({
    name: 'state',
})
@Injectable()
class PonyState {
    @Action(AddPony)
    addPony(context: StateContext<Record<string, PonyInterface>>, {payload}: AddPony): void {
        context.setState({ ...context.getState(), [payload.id]: payload });
    }

    @Action(RemovePony)
    removePony(context: StateContext<Record<string, PonyInterface>>, {payload}: RemovePony): void {
        context.setState({ ...context.getState(), [payload.id]: null });
    }
}
```

Next, we create a separate service dealing with effects. Suppose we would like to output to the console what was transmitted in one of the actions. To do this, we need to mark one of the methods as a decorator `@Effect`

```typescript
@Injectable()
class PonyEffectsService {
    @Effect(AddPony)
    logAddPony({payload}: AddPony): void {
        console.log(payload)
    }
}
```

Next, add a core effects module to the imports of our root module. And also declare which service is used to process effects.

```typescript
@NgModule({
    imports: [
        // ...
        NgxsEffectsModule,
        NgxsEffectsModule.forFeature(PonyEffectsService),
    ],
    // ...
})
export class AppModule {}
```

And it's all! Now we have a dedicated effects service

But what if we add handling actions that should return observable. For example, we want to send a request to the server. It is easy! Just return it from the method marked by the decorator

```typescript
@Injectable()
class PonyEffectsService {
    constructor(private httpClient: HttpClient) {}

    @Effect(AddPony)
    notifyAboutNewPony$({payload}: AddPony): Observable<PonyInterface> {
        return this.httpClient.post<PonyInterface>('my/api/pony', { body: payload })
    }
}
```

## Start effects

By default, effects begin to listen to actions from the moment they are declared in the NgxsEffectsModule module. But suppose we would like to start wiretapping at a specific point in time. For example, when the repository appears in our place lazily in a lazily loaded module or component. In this case, it would be convenient for us to start processing actions along with calling a certain method in the effects service

We can achieve this behavior using a decorator `@EffectsStart`

```typescript
@Injectable()
class PonyEffectsService {
    constructor(private httpClient: HttpClient) {}

    @EffectsStart()
    onStart(): void {
        console.log('PonyEffects started...');
    }

    @Effect(AddPony)
    notifyAboutNewPony$({payload}: AddPony): Observable<PonyInterface> {
        return this.httpClient.post<PonyInterface>('my/api/pony', { body: payload })
    }
}
```

Now in the lazily loaded component we will determine when the effects begin

```typescript
@Component({
    selector: 'app-pony-list',
    templateUrl: './pony-list.component.html',
    styleUrls: ['./pony-list.component.sass'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PonyListComponent implements OnInit {
    constructor(private ponyEffectsService: PonyEffectsService) {}

    ngOnInit(): void {
        this.ponyEffectsService.onStart();
    }
}
```

Now processing for events in this service will work only with the moment this component appears. In addition, we can now transfer the definition of our effects for features to the module of this component

```typescript
@NgModule({
    imports: [
        // ...
        NgxsEffectsModule.forFeature(PonyEffectsService),
    ],
    declarations: [
        PonyListComponent,
    ]
})
export class PonyListModule {}
```

It is important to note that with repeated appearances of this component we will not duplicate the processing of this effect

## Terminate effects

Now that we know when the effect sampling begins, we would like to complete it at a certain moment, for example, when the component disappears from view

We can achieve this behavior using a decorator `@EffectsTerminate`

```typescript
@Injectable()
class PonyEffectsService {
    constructor(private httpClient: HttpClient) {}

    @EffectsStart()
    onStart(): void {
        console.log('PonyEffects started...');
    }

    @Effect(AddPony)
    notifyAboutNewPony$({payload}: AddPony): Observable<PonyInterface> {
        return this.httpClient.post<PonyInterface>('my/api/pony', { body: payload })
    }

    @EffectsTerminate()
    onTerminate(): void {
        console.log('PonyEffects terminated...');
    }
}
```

Now in the lazily loaded component we will determine when the effects begin

```typescript
@Component({
    selector: 'app-pony-list',
    templateUrl: './pony-list.component.html',
    styleUrls: ['./pony-list.component.sass'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PonyListComponent implements OnInit, OnDestroy {
    constructor(private ponyEffectsService: PonyEffectsService) {}

    ngOnInit(): void {
        this.ponyEffectsService.onStart();
    }

    ngOnDestroy(): void {
        this.ponyEffectsService.onTerminate();
    }
}
```

## Error handling

Periodically, effects can lead to errors. An error that can happen during the operation of the effect will stop the processing of actions on the method where it occurred. Other effects in the same service continue to work. Шn order to correctly handle these errors in the same class where the effect is declared, we need a special tool

For that reasons you can use ```EffectsCatchError```

```typescript
@Injectable()
class PonyEffectsService {

    // ...

    @EffectsCatchError()
    onTerminate(): void {
        console.log('PonyEffects terminated...');
    }
}
```

## Global error handling

In order to catch errors occurring in all the effects services you can define your ```EFFECTS_ERROR_HANDLER```

First you need to implement ```EffectErrorHandlerInterface```

```typescript
@Injectable({
    providedIn: 'root',
})
class CustomEffectErrorHandler implements EffectErrorHandlerInterface {
    onError(error: Error): void {
        console.log(error);
    }
}
```

Next uoy need to provide this services with ```EFFECTS_ERROR_HANDLER``` token

```typescript
@NgModule({
    providers: [
        // ...
        { provide: EFFECTS_ERROR_HANDLER, useExisting: CustomEffectErrorHandler }
    ],
    // ...
})
export class AppModule {}
```

## Contributing and development

### Start

Install project

```bash
git clone https://github.com/vladborsh/ngxs-effects.git
npm i
npm run build
```

### Development server

Run `npm run start` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

### Build

Run `npm run build` to build the project. The build artifacts will be stored in the `dist/` directory

### Running unit tests

Run `npm run test` to execute the unit tests via [Karma](https://karma-runner.github.io).
