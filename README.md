# Free Code Camp: Quality Assurance Project 2 - Issue Tracker

## Issue Tracker

The aim of this project was to build a small web app with functionality similar to: https://issue-tracker.freecodecamp.rocks

The project was built using the following technologies:

- **HTML**
- **JavaScript** with **[Node.js](https://nodejs.org/en/) / [NPM](https://www.npmjs.com/)** for package management.
- **[Express](https://expressjs.com/)** web framework to build the web API.
- **[mongodb](https://www.npmjs.com/package/mongodb)** for interacting with a **[MongoDB Atlas](https://www.mongodb.com/atlas/database)** database.
- **[Bootstrap](https://getbootstrap.com/)** for styling with some custom **CSS**.
- **[FontAwesome](https://fontawesome.com/)** for icons.
- **[Mocha](https://mochajs.org/)** test framework with **[Chai](https://www.chaijs.com/)** assertions for testing.
- **[nodemon](https://nodemon.io/)** for automatic restarting of server during development.

### Project Requirements:

- **User Story #1:** You can send a `POST` request to `/api/issues/{projectname}` with form data containing the required fields `issue_title`, `issue_text`, `created_by`, and optionally `assigned_to` and `status_text`.

- **User Story #2:** The `POST` request to `/api/issues/{projectname}` will return the created object, and must include all of the submitted fields. Excluded optional fields will be returned as empty strings. Additionally, include `created_on` (date/time), `updated_on` (date/time), `open` (boolean, true for open - default value, false for closed), and `_id`.

- **User Story #3:** If you send a `POST` request to `/api/issues/{projectname}` without the required fields, returned will be the error `{ error: 'required field(s) missing' }`

- **User Story #4:** You can send a `GET` request to `/api/issues/{projectname}` for an array of all issues for that specific `projectname`, with all the fields present for each issue.

- **User Story #5:** You can send a `GET` request to `/api/issues/{projectname}` and filter the request by also passing along any field and value as a URL query (ie. `/api/issues/{project}?open=false`). You can pass one or more field/value pairs at once.

- **User Story #6:** You can send a `PUT` request to `/api/issues/{projectname}` with an `_id` and one or more fields to update. On success, the `updated_on` field should be updated, and returned should be `{ result: 'successfully updated', '_id': _id }`.

- **User Story #7:** When the `PUT` request sent to `/api/issues/{projectname}` does not include an `_id`, the return value is `{ error: 'missing _id' }`.

- **User Story #8:** When the `PUT` request sent to `/api/issues/{projectname}` does not include update fields, the return value is `{ error: 'no update field(s) sent', '_id': _id }`. On any other error, the return value is `{ error: 'could not update', '_id': _id }`.

- **User Story #9:** You can send a `DELETE` request to `/api/issues/{projectname}` with an `_id` to delete an issue. If no `_id` is sent, the return value is `{ error: 'missing _id' }`. On success, the return value is `{ result: 'successfully deleted', '_id': _id }`. On failure, the return value is `{ error: 'could not delete', '_id': _id }`.

- ## **User Story #10:** All 14 of the following functional tests are complete and passing for the `/api/issues/{projectname}` routes:
  - Create an issue with every field: `POST` request to `/api/issues/{project}`
  - Create an issue with only required fields: `POST` request to `/api/issues/{project}`
  - Create an issue with missing required fields: `POST` request to `/api/issues/{project}`
  - View issues on a project: `GET` request to `/api/issues/{project}`
  - View issues on a project with one filter: `GET` request to `/api/issues/{project}`
  - View issues on a project with multiple filters: `GET` request to `/api/issues/{project}`
  - Update one field on an issue: `PUT` request to `/api/issues/{project}`
  - Update multiple fields on an issue: `PUT` request to `/api/issues/{project}`
  - Update an issue with missing `_id`: `PUT` request to `/api/issues/{project}`
  - Update an issue with no fields to update: `PUT` request to `/api/issues/{project}`
  - Update an issue with an invalid `_id`: `PUT` request to `/api/issues/{project}`
  - Delete an issue: `DELETE` request to `/api/issues/{project}`
  - Delete an issue with an invalid `_id`: `DELETE` request to `/api/issues/{project}`
  - Delete an issue with missing `_id`: DELETE request to `/api/issues/{project}`

### Project Writeup:

The second Free Code Camp: Quality Assurance Project is a simple Issue Tracking App and API. Users can:

- View a Project's Issues by visiting `/<PROJECT>` in browser, where `PROJECT` is the name of the PROJECT. Alternatively a JSON array of all of a Project's Issues can be received by sending a GET request to `/api/issues/<PROJECT>`. The returned array of Issues can be filtered by adding query parameters for the desired values of the Issue fields

  - `_id` - 24 hexadecimal characters of desired Issue `_id`
  - `issue_title`, `issue_text`, `created_by`, `assigned_to`, `status_text` - string
  - `open` - string, must be 'true' or 'false'
  - `created_on`, `updated_on` - date, can be
    numeric (ms) or date string e.g. "2022-09-04T21:28:44.998Z"

- Create a new Issue for a Project by submitting the form on the app home page, or by sending a POST request to `/api/issues/<PROJECT>` with a body containing url encoded fields of:

  - Required Fields: `issue_title`, `issue_text`, `created_by`
  - Optional Fields: `assigned_to`, `status_text`

- Update a specific Issue for a Project by submitting the form on the app home page, or by sending a PUT request to `/api/issues/<PROJECT>` with a body containing url encoded fields of:

  - Required Fields: `_id` and at least one of the following optional fields to be updated:
  - Optional Fields: `issue_title`,
    `issue_text`, `created_by`,
    `assigned_to`, `status_text`,
    `open` (open must be 'false' in order to close
    Issue)

- Delete a specific Issue for a Project by submitting the form on the app home page, or by sending a DELETE request to `/api/issues/<PROJECT>`, with a body consisting of a urlencoded field of `_id` corresponding to the `_id` of the Issue to be deleted.

Created Issues are stored in a MongoDB database, and expire after 24hrs for Demo purposes.

A test suite has been written for the app:

- `tests/2_functional-tests.js` contains functional tests of the application routes (GET, POST, PUT and DELETE requests to `/api/issues/:project`).

### Project Files:

- `server.js` - the main entry point of the application, an express web server handling the routes defined in the specification.

- `/routes/api.js` - contains the major API routes for the express web app.

- `/controllers/issueController.js` - contains the `issueController` middleware object, with methods to carry out the Create, Read, Update Delete operations on Issues as requested.

- `public/` - contains static files for the web app (stylesheet, logo, favicons etc), served by express using `express.static()`.

- `views/` - contains the html page(s) for the web app:

  - `index.html`, which is served by express on `GET` requests to `/`.
  - `issues.html`, which is served by express on `GET` requests to `/<PROJECT>`

- `tests/` - contains the test suite for the application.

### Usage:

Requires Node.js / NPM in order to install required packages. After downloading the repo, install required dependencies with:

`npm install`

To run the app locally, a valid MongoDB database URI and a database name are required to be entered as environmental variables (`MONGO_URI`, `DB_NAME`), which can be done via a `.env` file (see sample.env). One possible MongoDB service is **[MongoDB Atlas](https://www.mongodb.com/atlas/database)**.

A development mode (with auto server restart on file save), can be started with:

`npm run dev`

The application can then be viewed at `http://localhost:3000/` in the browser.

To start the server without auto-restart on file save:

`npm start`

# Issue Tracker BoilerPlate

The initial boilerplate for this app can be found at https://github.com/freeCodeCamp/boilerplate-project-issuetracker/

Instructions for building the project can be found at https://www.freecodecamp.org/learn/quality-assurance/quality-assurance-projects/issue-tracker
