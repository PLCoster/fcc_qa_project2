'use strict';
const issueControllerSetup = require('../controllers/issueController');

const DB_NAME = process.env.DB_NAME;

module.exports = async function (app, dbClient) {
  const issuesCollection = await dbClient.db(DB_NAME).collection('issues');

  // Create TTL index to expire documents after X seconds
  // https://www.mongodb.com/docs/manual/tutorial/expire-data/
  issuesCollection.createIndex({ createdAt: 1 }, { expireAfterSeconds: 10 });

  // Set up issueController middleware with database connection
  const { createNewIssue } = issueControllerSetup(issuesCollection);

  app
    .route('/api/issues/:project')

    .get(function (req, res) {
      let project = req.params.project;
    })

    // POST route to handle creating a new issue for a project
    .post(createNewIssue, function (req, res) {
      return res.json(res.locals.issueDoc);
    })

    .put(function (req, res) {
      let project = req.params.project;
    })

    .delete(function (req, res) {
      let project = req.params.project;
    });
};
