# Bhojpur Wealth - Data Management Engine

The `Bhojpur Wealth` is an artificial intelligence enabled wealth management system
applied within the [Bhojpur.NET Platform](https://github.com/bhojpur/platform/)
ecosystem for delivering distributed `applications` or `services`. The application
empowers individuals or companies to keep track of stocks, ETFs or cryptocurrencies
and make solid, data-driven investment decisions.

## Pre-requisites

You need to install the following software on target server.

- [Node.js](https://nodejs.org/) runtime engine and [Nx](https://nx.dev/) build system
- [Yarn](https://yarnpkg.com/) framework
- [Typescript](https://www.typescriptlang.org/) framework
- [Bootstrap](https://getbootstrap.com/), [Angular](https://angular.io/), and
  [Storybook](https://storybook.js.org/) framework for the User Interface development
- [NestJS](https://nestjs.com/) framework for building enterprise grade application
- [PostgreSQL](https://www.postgresql.org/) relational database engine
- [Redis](https://redis.io/) for in-memory data caching
- [Prisma](https://www.prisma.io/) Javascript *object relationship mapping* (ORM)

## Simple Installation

Firstly, you need to setup a local database (e.g. `PostgreSQL` and `Redis`).

The default currency applied by the system is `INR`.

### Database Setup

Prior to starting the server, your database instance must be up and running.

```bash
yarn database:setup
```

### Server-side Web Application

To start the server application, simply issue the following command in a Terminal window

```bash
yarn start:server
```

### Client-side Web Application

To start the client application, simply issue the following command in a Terminal window

```bash
yarn start:client
```

### Storybook Environment

To start the storybook, simply issue the following command in a new Terminal window

```bash
yarn start:storybook
```

then, open `http://localhost:4400/` URL in your web-browser

## Build Source Code

Firstly, you need to install `Node.js` runtime engine, `Yarn`, and `Prisma` frameworks.
So, issue the following commands in a new Termainal window.

```bash
npm install -g prisma
yarn install
```

then, build the source code by issuing followinf commands

```bash
yarm build:all
```
