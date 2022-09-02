const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function () {
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
      .post('/api/issues/testProject')
      .send({
        issue_title,
        issue_text,
        created_by,
        assigned_to,
        status_text,
      })
      .then((res) => {
        console.log('IN PROMISE CHAIN');
        assert.equal(res.status, 200, 'POST response status should be 200');
        assert.equal(
          res.type,
          'application/json',
          'Response type should be application/json',
        );
        console.log(res.body);

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
});
