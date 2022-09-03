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
});
