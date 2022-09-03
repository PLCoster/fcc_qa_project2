module.exports = function (issueCollection) {
  const issueController = {};

  issueController.getAllProjectIssues = async (req, res, next) => {
    const project_name = req.params.project;

    if (!project_name) {
      return res
        .status(400)
        .json({ error: 'require project name for issues in URL' });
    }

    // Get any filters if they are present:
    const issueFilters = ({
      issue_title,
      issue_text,
      created_by,
      assigned_to,
      status_text,
      open,
      created_on,
      updated_on,
    } = req.query);

    // Coerce non-string issue filters into the correct types:
    if (issueFilters.open) {
      if (!['true', 'false'].includes(issueFilters.open)) {
        return res.status(400).json({
          error: `Invalid value given for open filter: ${issueFilters.open}; must be true or false`,
        });
      }
      issueFilters.open = issueFilters.open === 'true' ? true : false;
    }
    if (issueFilters.created_on) {
      const givenValue = issueFilters.created_on;
      issueFilters.created_on = new Date(issueFilters.created_on);
      if (issueFilters.created_on.toString() === 'Invalid Date') {
        return res.status(400).json({
          error: `Invalid value given for created_on filter: ${givenValue}`,
        });
      }
    }
    if (issueFilters.updated_on) {
      const givenValue = issueFilters.updated_on;
      issueFilters.updated_on = new Date(issueFilters.updated_on);
      if (issueFilters.updated_on.toString() === 'Invalid Date') {
        return res.status(400).json({
          error: `Invalid value given for updated_on filter: ${givenValue}`,
        });
      }
    }

    const projectIssues = await issueCollection
      .find({ project_name, ...issueFilters })
      .sort({ updated_on: 1 })
      .toArray();

    res.locals.projectIssues = projectIssues;

    return next();
  };

  // Middleware that creates a new issue for the given project
  // Created document is stored in res.locals.issueDoc
  issueController.createNewIssue = async (req, res, next) => {
    const project_name = req.params.project;

    if (!project_name) {
      return res
        .status(400)
        .json({ error: 'require project name for issues in URL' });
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
      return res
        .status(400)
        .json({ error: 'required field(s) missing', missingFields });
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
