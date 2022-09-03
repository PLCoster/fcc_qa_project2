'use strict';
const issueControllerSetup = require('../controllers/issueController');

const DB_NAME = process.env.DB_NAME;

const removeUnneededIssueFields = ({
  _id,
  project_name,
  issue_title,
  issue_text,
  created_by,
  assigned_to,
  status_text,
  open,
  created_on,
  updated_on,
}) => ({
  _id,
  project_name,
  issue_title,
  issue_text,
  created_by,
  assigned_to,
  status_text,
  open,
  created_on,
  updated_on,
});

module.exports = async function (app, dbClient) {
  const issuesCollection = await dbClient.db(DB_NAME).collection('issues');

  // Create TTL index to expire documents after X seconds
  // https://www.mongodb.com/docs/manual/tutorial/expire-data/
  issuesCollection.createIndex(
    { expireXSecondsFrom: 1 },
    { expireAfterSeconds: 86400 }, // Expire records after 1 day
  );

  // Set up issueController middleware with database connection
  const { getAllProjectIssues, createNewIssue, updateIssueByID } =
    issueControllerSetup(issuesCollection);

  app
    .route('/api/issues/:project')

    // GET route to return all issues for a project
    .get(getAllProjectIssues, function (req, res) {
      return res.json(
        res.locals.projectIssues.map((issue) =>
          removeUnneededIssueFields(issue),
        ),
      );
    })

    // POST route to handle creating a new issue for a project
    .post(createNewIssue, function (req, res) {
      // Return issue-related document fields:
      return res.json(removeUnneededIssueFields(res.locals.issueDoc));
    })

    .put(updateIssueByID, function (req, res) {
      const updateDoc = removeUnneededIssueFields(res.locals.updateDoc);
      updateDoc.result = 'successfully updated';
      return res.status(200).json(updateDoc);
    })

    .delete(function (req, res) {
      let project = req.params.project;
    });
};
