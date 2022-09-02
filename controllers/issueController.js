module.exports = function (issueCollection) {
  const issueController = {};

  // Middleware that creates a new issue for the given project
  // Created document is stored in res.locals.issueDoc
  issueController.createNewIssue = async (req, res, next) => {
    const projectName = req.params.project;

    if (!projectName) {
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
      const issueDocInfo = await issueCollection.insertOne(
        {
          issue_title,
          issue_text,
          created_by,
          assigned_to,
          status_text,
          open: true,
          created_on: creationDate,
          updated_on: creationDate,
        },
        { new: true },
      );
      const issueDoc = await issueCollection.findOne({
        _id: issueDocInfo.insertedId,
      });
      console.log(issueDoc);
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
