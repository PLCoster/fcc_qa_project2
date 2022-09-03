const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

// Generate a random project name to avoid clashing with any existing docs
const PROJECT_NAME = (function () {
  const available =
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const randomChars = [];
  for (let i = 0; i < 10; i += 1) {
    randomChars.push(available[Math.floor(Math.random() * available.length)]);
  }

  return 'testProject' + randomChars.join('');
})();

suite('Functional Tests', function () {
  // Allow server connection to db before starting tests
  this.beforeAll((done) => {
    setTimeout(() => done(), 3000);
  });

  test('A POST request to /api/issues/testProject with every issue field should return a complete issue object', (done) => {
    const issue_title = 'TEST ISSUE';
    const issue_text = 'Example of creating an issue with all fields completed';
    const created_by = 'Test Runner';
    const assigned_to = 'Test Assignee';
    const status_text = 'This is a TEST Issue';

    const creationTime = new Date(Date.now());

    const expectedResponse = {
      issue_title,
      issue_text,
      created_by,
      assigned_to,
      status_text,
      open: true,
    };
    chai
      .request(server)
      .post(`/api/issues/${PROJECT_NAME}`)
      .send({
        issue_title,
        issue_text,
        created_by,
        assigned_to,
        status_text,
      })
      .then((res) => {
        assert.equal(res.status, 200, 'POST response status should be 200');
        assert.equal(
          res.type,
          'application/json',
          'Response type should be application/json',
        );

        assert.include(
          res.body,
          expectedResponse,
          'Returned Issue JSON should contain all input properties and values, plus an "open" property with value of true',
        );

        // Check date / time properties exist on returned object
        assert.containsAllKeys(
          res.body,
          ['created_on', 'updated_on'],
          'Returned Issue JSON should have Date/Time properties',
        );

        // Check returned date/time is within 5s of creationTime
        assert.approximately(
          new Date(res.body.created_on) - creationTime,
          0,
          5000,
          'Returned created_on time should be within 5s',
        );

        assert.approximately(
          new Date(res.body.updated_on) - creationTime,
          0,
          5000,
          'Returned updated_on date should be within 5s',
        );
        done();
      })
      .catch((err) => {
        // Return error to mocha
        done(err);
      });
  });

  test('A POST request to /api/issues/testProject with required issue fields should return a complete issue object with default entries', (done) => {
    const issue_title = 'TEST ISSUE';
    const issue_text =
      'Example of creating an issue with only required fields completed';
    const created_by = 'Test Runner';

    const creationTime = new Date(Date.now());

    const expectedResponse = {
      issue_title,
      issue_text,
      created_by,
      assigned_to: '',
      status_text: '',
      open: true,
    };

    chai
      .request(server)
      .post(`/api/issues/${PROJECT_NAME}`)
      .send({
        issue_title,
        issue_text,
        created_by,
      })
      .then((res) => {
        assert.equal(res.status, 200, 'POST response status should be 200');
        assert.equal(
          res.type,
          'application/json',
          'Response type should be application/json',
        );

        assert.include(
          res.body,
          expectedResponse,
          'Returned Issue JSON should contain all input properties and values, plus an "open" property with value of true',
        );

        // Check date / time properties exist on returned object
        assert.containsAllKeys(
          res.body,
          ['created_on', 'updated_on'],
          'Returned Issue JSON should have Date/Time properties',
        );

        // Check returned date/time is within 5s of creationTime
        assert.approximately(
          new Date(res.body.created_on) - creationTime,
          0,
          5000,
          'Returned created_on time should be within 5s',
        );

        assert.approximately(
          new Date(res.body.updated_on) - creationTime,
          0,
          5000,
          'Returned updated_on date should be within 5s',
        );
        done();
      })
      .catch((err) => {
        // Return error to mocha
        done(err);
      });
  });

  test('A POST request to /api/issues/testProject missing required fields should return an error', (done) => {
    const missingFields = ['issue_title', 'issue_text', 'created_by'];
    const expectedResponse = {
      error: 'required field(s) missing',
      missingFields,
    };

    chai
      .request(server)
      .post(`/api/issues/${PROJECT_NAME}`)
      .send({})
      .then((res) => {
        assert.equal(res.status, 400, 'POST response status should be 400');
        assert.equal(
          res.type,
          'application/json',
          'Response type should be application/json',
        );

        assert.deepEqual(res.body, expectedResponse);
        done();
      })
      .catch((err) => {
        // Return error to mocha
        done(err);
      });
  });

  test('A GET request to /api/issues/testProject should return all the issues for that project', (done) => {
    chai
      .request(server)
      .get(`/api/issues/${PROJECT_NAME}`)
      .then((res) => {
        assert.equal(res.status, 200, 'GET response status should be 200');
        assert.equal(
          res.type,
          'application/json',
          'Response type should be application/json',
        );

        assert.isArray(res.body);
        // Should be two issues, from the previous two tests
        assert.equal(res.body.length, 2);
        done();
      })
      .catch((err) => {
        // Return error to mocha
        done(err);
      });
  });

  test('A GET request to /api/issues/testProject with a single filter field should return a filtered list of queries (issue_text)', (done) => {
    const issue_text = 'Example of creating an issue with all fields completed';
    chai
      .request(server)
      .get(`/api/issues/${PROJECT_NAME}?issue_text=${issue_text}`)
      .then((res) => {
        assert.equal(res.status, 200, 'GET response status should be 200');
        assert.equal(
          res.type,
          'application/json',
          'Response type should be application/json',
        );

        assert.isArray(res.body);
        // Should be a single issue
        assert.equal(res.body.length, 1);
        assert.equal(
          res.body[0].issue_text,
          issue_text,
          'Filtered issue should have matching issue_text property',
        );
        done();
      })
      .catch((err) => {
        // Return error to mocha
        done(err);
      });
  });

  test('A GET request to /api/issues/testProject with multiple filter fields should return a correctly filtered list of queries (issue_title, created_by, assigned_to, status_text)', (done) => {
    const issue_title = 'TEST ISSUE';
    const issue_text = 'Example of creating an issue with all fields completed';
    const created_by = 'Test Runner';
    const assigned_to = 'Test Assignee';
    const status_text = 'This is a TEST Issue';

    const expectedResponse = {
      issue_title,
      issue_text,
      created_by,
      assigned_to,
      status_text,
      open: true,
    };

    chai
      .request(server)
      .get(
        `/api/issues/${PROJECT_NAME}?issue_title=${issue_title}&created_by=${created_by}&assigned_to=${assigned_to}&status_text=${status_text}`,
      )
      .then((res) => {
        assert.equal(res.status, 200, 'GET response status should be 200');
        assert.equal(
          res.type,
          'application/json',
          'Response type should be application/json',
        );

        assert.isArray(res.body);
        // Should be a single issue
        assert.equal(res.body.length, 1);
        assert.include(
          res.body[0],
          expectedResponse,
          'Filtered issue should include all expected Response properties',
        );
        done();
      })
      .catch((err) => {
        // Return error to mocha
        done(err);
      });
  });

  test('A PUT request to /api/issues/testProject with one field to update should successfully update that field (open)', (done) => {
    const issue_title = 'TEST ISSUE';
    const issue_text = 'Example of creating an issue with all fields completed';
    const created_by = 'Test Runner';
    const assigned_to = 'Test Assignee';
    const status_text = 'This is a TEST Issue';

    const expectedPutResponse = {
      result: 'successfully updated',
      issue_title,
      issue_text,
      created_by,
      assigned_to,
      status_text,
      open: false,
    };

    let updateTimeStamp;

    // First get a valid issue id, so we can update it:
    chai
      .request(server)
      .get(
        `/api/issues/${PROJECT_NAME}?issue_title=${issue_title}&created_by=${created_by}&assigned_to=${assigned_to}&status_text=${status_text}`,
      )
      .then((getResult) => {
        assert.equal(
          getResult.status,
          200,
          'GET response status should be 200',
        );
        assert.isArray(getResult.body, 'GET response should be an array');
        assert.equal(
          getResult.body.length,
          1,
          'GET response should be a single issue',
        );

        const { _id, created_on } = getResult.body[0];
        expectedPutResponse._id = _id;
        expectedPutResponse.created_on = created_on;
        updateTimeStamp = new Date();

        // Perform update to the issue
        return chai
          .request(server)
          .put(`/api/issues/${PROJECT_NAME}`)
          .send({ _id, open: 'false' });
      })
      .then((putResult) => {
        assert.equal(
          putResult.status,
          200,
          'PUT response status should be 200',
        );
        assert.equal(
          putResult.type,
          'application/json',
          'Response type should be application/json',
        );

        assert.include(
          putResult.body,
          expectedPutResponse,
          'PUT response should have same fields and values as expected response',
        );

        // Update time for issue should be within 5s of time update sent
        assert.approximately(
          new Date(putResult.body.updated_on) - updateTimeStamp,
          0,
          5000,
          'Returned updated_on date should be within 5s',
        );
        done();
      })
      .catch((err) => {
        // Return error to mocha
        done(err);
      });
  });

  test('A PUT request to /api/issues/testProject with multiple fields to update should successfully update all fields (assigned_to, status_text)', (done) => {
    const issue_title = 'TEST ISSUE';
    const issue_text =
      'Example of creating an issue with only required fields completed';
    const created_by = 'Test Runner';
    const assigned_to = 'Updated To: Test Assignee';
    const status_text = 'Updated Status Text';

    const expectedPutResponse = {
      result: 'successfully updated',
      issue_title,
      issue_text,
      created_by,
      assigned_to,
      status_text,
      open: true,
    };

    let updateTimeStamp;

    // First get a valid issue id, so we can update it:
    // Get created issue with two empty fields
    chai
      .request(server)
      .get(
        `/api/issues/${PROJECT_NAME}?issue_text=${issue_text}&assigned_to=&status_text=`,
      )
      .then((getResult) => {
        assert.equal(
          getResult.status,
          200,
          'GET response status should be 200',
        );
        assert.isArray(getResult.body, 'GET response should be an array');
        assert.equal(
          getResult.body.length,
          1,
          'GET response should be a single issue',
        );

        const { _id, created_on } = getResult.body[0];
        expectedPutResponse._id = _id;
        expectedPutResponse.created_on = created_on;
        updateTimeStamp = new Date();

        // Perform update to the issue
        return chai
          .request(server)
          .put(`/api/issues/${PROJECT_NAME}`)
          .send({ _id, assigned_to, status_text });
      })
      .then((putResult) => {
        assert.equal(
          putResult.status,
          200,
          'PUT response status should be 200',
        );
        assert.equal(
          putResult.type,
          'application/json',
          'Response type should be application/json',
        );

        assert.include(
          putResult.body,
          expectedPutResponse,
          'PUT response should have same fields and values as expected response',
        );

        // Update time for issue should be within 5s of time update sent
        assert.approximately(
          new Date(putResult.body.updated_on) - updateTimeStamp,
          0,
          5000,
          'Returned updated_on date should be within 5s',
        );
        done();
      })
      .catch((err) => {
        // Return error to mocha
        done(err);
      });
  });

  test('A PUT request to /api/issues/testProject with no _id should result in an error JSON being returned', (done) => {
    const expectedPutResponse = { error: 'missing _id' };

    const assigned_to = 'THIS SHOULD NOT UPDATE';
    const status_text = 'THIS SHOULD NOT UPDATE';

    // Attempt to update without _id
    chai
      .request(server)
      .put(`/api/issues/${PROJECT_NAME}`)
      .send({ assigned_to, status_text })
      .then((putResult) => {
        assert.equal(
          putResult.status,
          200,
          'PUT response status should be 200',
        );
        assert.equal(
          putResult.type,
          'application/json',
          'Response type should be application/json',
        );

        assert.include(
          putResult.body,
          expectedPutResponse,
          'PUT response should have same fields and values as expected response',
        );

        // Make sure no updates occur:
        return chai.request(server).get(`/api/issues/${PROJECT_NAME}`);
      })
      .then((getResult) => {
        assert.equal(
          getResult.status,
          200,
          'GET response status should be 200',
        );
        assert.isArray(getResult.body, 'Result body should be an array');
        assert.equal(getResult.body.length, 2, 'Two issues should still exist');

        getResult.body.forEach((issue) => {
          // No Issues should have the updated fields
          assert.notEqual(issue.assigned_to, assigned_to);
          assert.notEqual(issue.staus_text, status_text);
        });
        done();
      })
      .catch((err) => {
        // Return error to mocha
        done(err);
      });
  });

  test('A PUT request to /api/issues/testProject with a valid _id but no update fields should result in an error JSON being returned', (done) => {
    const expectedPutResponse = { error: 'missing _id' };

    const assigned_to = 'THIS SHOULD NOT UPDATE';
    const status_text = 'THIS SHOULD NOT UPDATE';

    // Attempt to update without _id
    chai
      .request(server)
      .put(`/api/issues/${PROJECT_NAME}`)
      .send({ assigned_to, status_text })
      .then((putResult) => {
        assert.equal(
          putResult.status,
          200,
          'PUT response status should be 200',
        );
        assert.equal(
          putResult.type,
          'application/json',
          'Response type should be application/json',
        );

        assert.include(
          putResult.body,
          expectedPutResponse,
          'PUT response should have same fields and values as expected response',
        );
        done();
      })
      .catch((err) => {
        // Return error to mocha
        done(err);
      });
  });

  test('A PUT request to /api/issues/testProject with an invalid _id should result in an error JSON being returned', (done) => {
    const _id = 123; // Invalid id
    const expectedPutResponse = { error: 'could not update', _id };

    const assigned_to = 'THIS SHOULD NOT UPDATE';
    const status_text = 'THIS SHOULD NOT UPDATE';

    // Attempt to update without _id
    chai
      .request(server)
      .put(`/api/issues/${PROJECT_NAME}`)
      .send({ _id, assigned_to, status_text })
      .then((putResult) => {
        assert.equal(
          putResult.status,
          200,
          'PUT response status should be 200',
        );
        assert.equal(
          putResult.type,
          'application/json',
          'Response type should be application/json',
        );

        assert.include(
          putResult.body,
          expectedPutResponse,
          'PUT response should have same fields and values as expected response',
        );
        // Make sure no updates occur:
        return chai.request(server).get(`/api/issues/${PROJECT_NAME}`);
      })
      .then((getResult) => {
        assert.equal(
          getResult.status,
          200,
          'GET response status should be 200',
        );
        assert.isArray(getResult.body, 'Result body should be an array');
        assert.equal(getResult.body.length, 2, 'Two issues should still exist');

        getResult.body.forEach((issue) => {
          // No Issues should have the updated fields
          assert.notEqual(issue.assigned_to, assigned_to);
          assert.notEqual(issue.staus_text, status_text);
        });
        done();
      });
  });

  // !!! TO DO:
  // PUT ROUTE TESTS
  // DELETE ROUTE TESTS
});
