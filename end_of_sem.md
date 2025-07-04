# End of Semester Requirements

The following checklists are what is required for your code to be considered acceptable at the end of the semester. The general purpose is to ensure that someone can run your code without encountering any errors and everything the next team needs will be easy to find. ***If your project cannot be run based on the information and files on GitHub, your final project grade will be greatly reduced and/or your team will receive an incomplete until the information needed to run your project is provided!***

One potential way to make it easy to track all of these tasks is to create issues for each of the required tasks ([see this page about GitHub issues](https://docs.github.com/en/issues/tracking-your-work-with-issues/quickstart#adding-a-task-list)). The first item in the [Project Structure/Files](#project-structurefiles) section would look something like this to automatically check the box when issue 3 is closed:

```markdown
- [ ] #3 Database Files
```

## Project Structure/Files

These requirements must be met (in the main branch of your project) by the time your final report is due.

- [X] The most up to date version of all frontend and backend code
- [X] Database Files
  - [X] If using docker: `docker-compose.yml` at top level for project database.
  - [X] Database Schema
    - If using Prisma: `schema.prisma` in a top level `prisma` folder
    - If using other database: A file with a descriptive name used to create your database schema (e.g. `schema.sql`)
- [ ] `.env.example` file containing NON-SENSITIVE environment variables (Auth0 Issuer, dev database url, etc). Sensitive environment variables should be replaced with example data such as `CLIENT_SECRET='EXAMPLE_CLIENT_SECRET'` so that future groups know that the environment variable is required.
- [X] Figma design files in a top level folder named `figma`.
- [ ] Any migration scripts, dev scripts, etc. (if any exist) belong in a top level `scripts` folder. If the project has separate frontend/backend folders, the `scripts` folder should be in the backend folder.
- [ ] Any other important files should be included in an appropriately named folder (such as `docs`, `documentation`, `notes`, etc.).

## Documentation

A README.md file at the top level containing the following:

- [ ] Conceptual overview - what is the project intended to accomplish?
  - Include a broad description of the different types of users/roles and what they do.
- [ ] Functional requirements (broken down by page) - what are the discrete operations the app needs to be capable of?
- [ ] Third party integrations and what they do in this project - HubSpot, Stripe, Auth0, etc.
- [ ] Tech Stack
  - Include frontend framework (React, Vue, Svelte, etc.)
  - Include backend framework (Express.js, etc.)
  - If you use a meta framework, where the frontend and backend are combined, then you do not need to differentiate between frontend and backend (Next, Nuxt, Sveltekit, etc.)
  - Database (PostgreSQL, MySQL, MongoDB, etc.)
  - Other important packages (UI plugins, database connectors like prisma)
  - Other tools used/needed (such as Postman)
- [ ] Deployment notes (if project is currently or in the process of being deployed) - is the partner running the application on their own servers or are they using something like AWS or Azure?
- [ ] Migration scripts - do we need to import any data from an existing system that the partner is using?
- [ ] ***Instructions for setting up the development environment!!!*** Assume that the needed software is already installed (Node.js, Docker, etc.).
  - How do you start your project?
  - How do you initialize the database?
  - How do you set up authentication?
  - Etc.

### Additional Documentation

In the repo's GitHub wiki, include the following:

- [X] List of user workflows (each different type of user)
- [X] Each workflow should have a corresponding wiki page, linked in the list, that either contains the workflow information or a TODO.
- [X] Each workflow should list the pages involved
- [X] List of user roles and what each role is able to do
- [X] Every third party integration should have its own page describing what parts of that service are used, how, and why

These should be high level - you should not be explaining every line of code.

## Examples
See [Comet Cupboard](https://github.com/UTDallasEPICS/Comet-Cupboard/wiki#shopping-functionality) and [Wellness Center](https://github.com/UTDallasEPICS/Wellness-Center-Older-Adults/wiki) for examples of what documentation can look like.
