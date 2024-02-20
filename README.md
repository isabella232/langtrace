# ![](./images/banner-light.png#gh-light-mode-only) ![](./images/banner-dark.png#gh-dark-mode-only)

> [!CAUTION] 
> 🚧 🏗️ This project is currently is under active development  🚧 🏗️

## Overview

LangTrace is a tool that allows users to ingest, view, and analyze data sent from Langchain for each run.

It is built using NextJS, Node.js, Typescript and MongoDB.

## Getting Started

- [Prerequisites](#prerequisites)
- [Configuration](#configuration)
- [Running Services Individually](#running-services-individually)
    * [UI](#ui)
    * [Servers](#servers)
        + [Ingest Server](#ingest-server)
        + [Langtrace API](#langtrace-api)
- [Running Services with Docker Compose](#running-services-with-docker-compose)

### Prerequisites
- Node.js (tested on 20)
- MongoDB (currently depends on MongDB Atlas)
- Langchain application (see [Langchain Configuration](#langchain-configuration))
- Docker & Docker Compose (optional - for running with Docker

### Configuration
- In ./ui copy .env.example to .env and set the values
- In ./server copy .env.example to .env and set the values

#### Langchain Configuration

> Note: LangTrace is currently configured to use the `langsmith` project. This will be configurable in the future.

Lanchain piggybacks of the setup for Langsmith you need to setup the application in a similar way to Langsmith

- Add Langsmith dependency to your Langchain app
  - `yarn add @langsmith/langsmith`
- Add the following VARs to your Langchain app
  - `LANGCHAIN_TRACING_V2` - set to `true`
  - `LANGCHAIN_ENDPOINT` - the URL of your LangTrace API
  - `LANGCHAIN_PROJECT` - the name of your project


### Running Services Individually

Each service in this project can be run individually using npm.

#### UI

Navigate to the UI service directory:

```bash
cd ui
```

Install the dependencies:

```bash
npm install
```

Start the service:

```bash
npm start
```
#### Servers

Both servers are within the `server` directory. You will need to start both servers in order to run the application. There are two entry points for the servers.

```bash
cd server
```

Install the dependencies:

```bash
npm install
```

##### Ingest Server

Make sure you have navigated to the folder and installed the dependencies as described above.

Start server:

```bash
npm run start:ingestor
```

##### Langtrace API

Make sure you have navigated to the folder and installed the dependencies as described above.

Start server:

```bash
npm run start:langtrace
```

### Running Services with Docker Compose

You can also run all services together using Docker Compose:

```bash
docker-compose up --build
```

This will start all services in their own Docker containers. They will be able to communicate with each other.
