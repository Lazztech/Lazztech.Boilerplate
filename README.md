# Lazztech.Template

This repository serves as a jumping off point for rapid 3 tier web application development. It incorporates over a decade of software engineering and consulting experience to propel project success by providing an established, opinionated, and proven platform to rapidly develop for many of the most common type of greenfield development efforts.

**It starts off from a freshly generated NestJS project which provides the following:**
- Boiler plate application inspired by Spring and Angular 
  - Module based dependency injection
  - example controller
  - example service
  - example jest unit test suite 
  - example e2e integration testing
  - linting
  - formatting
- CLI for generating controllers, services, tests, etc: https://docs.nestjs.com/cli/overview
- Preconfigured npm scripts

**From there support for the following is added:**
- Dotenv configuration: https://docs.nestjs.com/techniques/configuration
- Environment variable configuration validation: https://docs.nestjs.com/techniques/configuration#schema-validation
- MVC Server Side Rendering: https://docs.nestjs.com/techniques/mvc
  - HTMX for dynamic UI interactions
  - Tailwind and DasyUI for styling
  - Manifest.json and JS Service Worker for Progressive Web App support
    - Support for Web Push Notifications: https://developer.mozilla.org/en-US/docs/Web/API/Push_API
- MikroOrm: https://docs.nestjs.com/recipes/mikroorm
  - Configuration based us of either Postgres or SQlite
  - Migrations
- A custom file service module
  - Configuration based us of either local disk or s3 based file storage
- Multi user support
  - User ORM entity
  - JWT Based Authentication
  - User password management and reset
- Dockerfile and Docker Compose script
- Github Actions Continous Integration Pipeline
- VSCode Recommended Extensions

## Development Dependencies

Development tools:
- brew
  - https://brew.sh/
  - postgres
- docker
- node version manager
  - https://github.com/nvm-sh/nvm

```bash
# use nvm to install node from the .nvmrc file
$ nvm install
# set the in use node version from the .nvmrc file's verision
$ nvm use
# install node dependencies
$ npm install

# if you run into an issue installing sharp on apple M1 see the link below:
# https://github.com/lovell/sharp/issues/2460#issuecomment-751491241 
```

<!-- ```bash
# Apple M1 support & troubleshooting resources: 
# https://github.com/nvm-sh/nvm#macos-troubleshooting
# https://www.reddit.com/r/node/comments/lp9xlk/mac_mini_m1_issues_with_node_js_15/

# open x86 shell with rosetta
$ arch -x86_64 zsh
# install node version manager & use the version from the .nvmrc file
$ nvm install
# Now check that the architecture is correct:
$ node -p process.arch
x64
# It is now safe to return to the arm64 zsh process:
$ exit
# We're back to a native shell:
$ arch
arm64
# set the in use node version from the .nvmrc file's verision
$ nvm use
# verify that the despite running in an arm shell node architecture returns x86
$ node -p process.arch
x64
# install node dependencies
$ npm install
``` -->

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Postgres
A local instance of postgres running in a docker container for testing against a prod DB replica.
Pgadmin is not required, but recommend for ease of use. Alternatively the database-client VSCode extension may be used.
- https://marketplace.visualstudio.com/items?itemName=cweijan.vscode-database-client2

Create database dump and import to local database
```bash
# prepare gitignored data folder if it's not already present
$ mkdir ./data

# dump database
$ pg_dump -h <host> -p <port> -U <username> -Fc <database> > ./data/db.dump

# start postgres
$ docker run --name lazztech_postgres -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=Password123 -e POSTGRES_DB=postgres -p 5432:5432 postgres

# copy dump file to the docker container
$ docker cp ./data/db.dump lazztech_postgres:/var/lib/postgresql/data/db.dump

# shell into container
$ docker exec -it lazztech_postgres bash

# restore it from within
$ pg_restore -U postgres -d postgres --no-owner -1 /var/lib/postgresql/data/db.dump

# cleanup
$ docker stop lazztech_postgres
$ docker rm lazztech_postgres
```

In your .env or .env.local file configure these enviroment varaibles for postgres

```bash
# Postgres
DATABASE_TYPE=postgres
DATABASE_SCHEMA=postgres
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASS=Password123
DATABASE_SSL=false
```

```yml
# docker-compose.yml
version: '3.8'
services:
  db:
    container_name: lazztech_postgres
    image: postgres
    restart: always
    ports:
      - '5432:5432'
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=Password123
      - POSTGRES_DB=postgres
    volumes:
      - /<Your_Volume_Directory>
  pgadmin:
    container_name: pgadmin4
    image: dpage/pgadmin4
    restart: always
    environment:
      - PGADMIN_DEFAULT_EMAIL=admin@admin.com
      - PGADMIN_DEFAULT_PASSWORD=root
    ports:
      - '5050:80'
```

## Migrations
Custom scripts have been added to streamline and simplify handling migrations with two database contexts.
```bash
# each script comes in sqlite | postgres | all variations
# scripts ending with "all" perform the action on both databases
# Note: due to configuration differences, run build before generating sqlite migrations!

# create a migration generated from the entity schema
$ npm run migration:generate:<sqlite|postgres|all>

# create a blank migration
$ npm run migration:create:<sqlite|postgres|all>

# apply migrations
$ npm run migration:up:<sqlite|postgres|all>

# revert most recently applied migration
$ npm run migration:down:<sqlite|postgres|all>

# lists pending queries to executed based on the entity schema
$ npm run migration:log:all

# displays what migrations have been applied to the databases
$ npm run migration:show:all
```

## Web Push Notifications

```bash
# generate public and private vapid keys
$ npx web-push generate-vapid-keys
```


## Scripts

```bash
# test, build & push container, deploy dev and deploy stage
# note: the buildTagAndPushDocker.sh uses docker buildx for m1 support to cross compile to x86
$ ./scripts/preCommit.sh && ./scripts/buildTagAndPushDocker.sh && ./scripts/deployToDev.sh && ./scripts/deployToStage.sh
```
## Configuration

| Parameter | Function | Optional | Example |
| ----------- | ----------- | ----------- | ----------- |
| APP_NAME | Used when sending emails to call out the name of the service | ❌ | Lazztech Template |
| ACCESS_TOKEN_SECRET | Used for jwt tokens | ❌ |
| PUBLIC_VAPID_KEY | Used for web push notifications | ✅ |
| PRIVATE_VAPID_KEY | Used for web push notifications | ✅ |
| FIREBASE_SERVER_KEY | Used for push notifications | ❌ |
| PUSH_NOTIFICATION_ENDPOINT | Used for triggering push notifications via http | ❌ |
| EMAIL_TRANSPORT | Used for emailing users | ✅ | 'gmail' or 'mailgun' defaults to gmail |
| EMAIL_API_KEY | Used for emailing users | required for mailgun |
| EMAIL_DOMAIN | Used for emailing users | required for mailgun |
| EMAIL_FROM_ADDRESS | Used for emailing users | ❌ |
| EMAIL_PASSWORD | Used for emailing users | ✅ when transport is mailgun |
| DATABASE_TYPE | Used for selecting sqlite or postgres | Defaults to sqlite ✅ | 'sqlite' or 'postgres' |
| DATABASE_HOST | Used for connecting to database | Optional depending on database type ✅ |
| DATABASE_PORT | Used for connecting to database | Optional depending on database type ✅ |
| DATABASE_USER | Used for connecting to database | Optional depending on database type ✅ |
| DATABASE_PASS | Used for connecting to database | Optional depending on database type ✅ |
| DATABASE_SCHEMA | Used for connecting to database | Optional depending on database type ✅ |
| DATABASE_SSL | To configure whether to use SSL for database | Optional depending on database type ✅ |
| FILE_STORAGE_TYPE | For selecting local or S3 compatible storage configuration | Defaults to local ✅ | Select 'local' or 'object' |
| OBJECT_STORAGE_ACCESS_KEY_ID | Used for S3 compatible object file storage | Optional depending on file storage type ✅ |
| OBJECT_STORAGE_SECRET_ACCESS_KEY | Used for S3 compatible object file storage | Optional depending on file storage type ✅ |
| OBJECT_STORAGE_ENDPOINT | Used for S3 compatible object file storage | Optional depending on file storage type ✅ |

## Stay in touch

- Website - [https://lazz.tech/](https://lazz.tech/)

## License
MIT
