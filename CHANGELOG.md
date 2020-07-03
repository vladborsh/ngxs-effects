# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [3.0.0](https://github.com/vladborsh/ngxs-effects/compare/v2.1.1...v3.0.0) (2020-07-03)


### ⚠ BREAKING CHANGES

* **api:** for root modules required NgxsEffectsModule.forRoot() call in imports instead of
just importing NgxsEffectsModule

### Features

* **api:** separated module exporting for feature and root ([7aac1ce](https://github.com/vladborsh/ngxs-effects/commit/7aac1ce0153b39411c29a56432db07277865f321))

### [2.1.1](https://github.com/vladborsh/ngxs-effects/compare/v2.1.0...v2.1.1) (2020-06-30)


### Bug Fixes

* **glob:** pluralize library name, filter name, paths in cli conf ([b1401b0](https://github.com/vladborsh/ngxs-effects/commit/b1401b095ef5471b336bb4b051da164fd9f4c832)), closes [#5](https://github.com/vladborsh/ngxs-effects/issues/5)

## [2.1.0](https://github.com/vladborsh/ngxs-effects/compare/v2.0.1...v2.1.0) (2020-06-12)


### Features

* **api:** ability to handle multiple action by single decorator ([2a831c6](https://github.com/vladborsh/ngxs-effects/commit/2a831c64f70acc77ad61f72d602e1709972eb41d)), closes [#1](https://github.com/vladborsh/ngxs-effects/issues/1)

### [2.0.1](https://github.com/vladborsh/ngxs-effects/compare/v2.0.0...v2.0.1) (2020-06-12)


### Bug Fixes

* secure access to metadata by private symbols ([9f25193](https://github.com/vladborsh/ngxs-effects/commit/9f2519302c568bb4ef504547260d25c83bb05cb1))

## [2.0.0](https://github.com/vladborsh/ngxs-effects/compare/v1.0.3...v2.0.0) (2020-06-05)


### Features

* **global:** ivy compatibility ([7305b4e](https://github.com/vladborsh/ngxs-effects/commit/7305b4e55ccaed63550f57c5d66d81adb8a8e44e)), closes [#2](https://github.com/vladborsh/ngxs-effects/issues/2)

### [1.0.3](https://github.com/vladborsh/ngxs-effects/compare/v1.0.2...v1.0.3) (2020-06-05)


### Bug Fixes

* **public api:** effect catch error export ([3a13cf1](https://github.com/vladborsh/ngxs-effects/commit/3a13cf1e46cb13c03a84262abf5dad8342f316e0))

### [1.0.2](https://github.com/vladborsh/ngxs-effects/compare/v1.0.1...v1.0.2) (2020-05-12)

### [1.0.1](https://github.com/vladborsh/ngxs-effects/compare/v1.0.0...v1.0.1) (2020-04-26)

## [1.0.0](https://github.com/vladborsh/ngxs-effects/compare/v0.0.3...v1.0.0) (2020-04-24)


### Features

* **decorators:** effect error catch decorator ([5e4edf4](https://github.com/vladborsh/ngxs-effects/commit/5e4edf4ba44447e9ac49a47cb4f2f1e9ca8e6f58))

### [0.0.3](https://github.com/vladborsh/ngxs-effects/compare/v0.0.2...v0.0.3) (2020-04-22)

### 0.0.2 (2020-04-22)


### Features

* error handling ([f6e48d5](https://github.com/vladborsh/ngxs-effects/commit/f6e48d55ac1e1eac93b3081b02131bf97b1ecd2c))

# 0.0.1 (2020-04-21)

### Features

* effect decorator 
* effects start decorator 
* effects terminate decorator 
* error handling ([f6e48d5](https://github.com/vladborsh/ngxs-effects/commit/f6e48d55ac1e1eac93b3081b02131bf97b1ecd2c))
