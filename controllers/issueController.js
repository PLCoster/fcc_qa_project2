module.exports = function (issueCollection) {
  const issueController = {};

  // Middleware that creates a new issue for the given project
  // Created document is stored in res.locals.issueDoc
  issueController.createNewIssue = async (req, res, next) => {
    const project_name = req.params.project;

    if (!project_name) {
      return res.json({ error: 'require project name for issues in URL' });
    }

    const { issue_title, issue_text, created_by, assigned_to, status_text } =
      req.body;

    const requiredFields = [issue_title, issue_text, created_by];

    // If any required field is missing, return an error
    if (requiredFields.some((field) => field === undefined)) {
      const missingFields = ['issue_title', 'issue_text', 'created_by'].reduce(
        (accum, fieldName) => {
          if (req.body[fieldName] === undefined) {
            accum.push(fieldName);
          }
          return accum;
        },
        [],
      );
      return res.json({ error: 'required field(s) missing', missingFields });
    }

    // No fields are missing, create a new DB document
    try {
      const creationDate = new Date();

      // Create Document in DB
      const issueDocInfo = await issueCollection.insertOne({
        project_name,
        issue_title,
        issue_text,
        created_by,
        assigned_to: assigned_to === undefined ? '' : assigned_to,
        status_text: status_text === undefined ? '' : status_text,
        open: true,
        created_on: creationDate,
        updated_on: creationDate,
        expireXSecondsFrom: creationDate,
      });

      // Get created document (can't seem to be done in a single step...)
      const issueDoc = await issueCollection.findOne({
        _id: issueDocInfo.insertedId,
      });

      res.locals.issueDoc = issueDoc;
      return next();
    } catch (err) {
      console.error(
        'Error in issueController.createNewIssue when trying to create a new Issue: ',
        err,
      );
      return next(err);
    }
  };

  return issueController;
};
