/* jshint node: true */

var subject = require('../../index');
var assert  = require('../helpers/assert');

describe('Github Deployment Status | willDeploy hook', function() {
  var mockUi;

  beforeEach(function() {
    mockUi = {
      verbose: true,
      messages: [],
      write: function() { },
      writeLine: function(message) {
        this.messages.push(message);
      }
    };
  });

  describe('deploymentId is provided', function() {
    it('sets the deployment id on the context without making a request', function() {
      var instance = subject.createDeployPlugin({
        name: 'github-deployment-status'
      });

      var config = {
        org: 'foo',
        repo: 'bar',
        ref: 'baz',
        token: 'token',
        deploymentId: '9'
      };

      var context = {
        ui: mockUi,
        config: {
          'github-deployment-status': config
        },
        _fakeRequest: {
          request: function() {
            assert.ok(false);
          }
        }
      };

      instance.beforeHook(context);
      instance.configure(context);
      instance.setup(context);

      return assert.isFulfilled(instance.willDeploy(context))
        .then(function(result) {
          assert.equal(result['github-deployment-status'].deploymentId, '9');
        });
    });
  });

  describe('deploymentId is not provided', function() {
    it('creates a new deployment', function() {
      var instance = subject.createDeployPlugin({
        name: 'github-deployment-status'
      });

      var config = {
        org: 'foo',
        repo: 'bar',
        ref: 'baz',
        token: 'token'
      };

      var context = {
        ui: mockUi,
        config: {
          'github-deployment-status': config
        },
        _fakeRequest: {
          request: function(options) {
            this._options = options;

            return Promise.resolve({ id: '123' });
          }
        }
      };

      instance.beforeHook(context);
      instance.configure(context);
      instance.setup(context);

      return assert.isFulfilled(instance.willDeploy(context))
        .then(function(result) {
          var options = context['github-deployment-status']._client._options;
          assert.equal(options.uri,'https://api.github.com/repos/foo/bar/deployments');
          assert.equal(options.method, 'POST');
          assert.equal(options.json, true);
          assert.deepEqual(options.headers, { 'User-Agent': 'foo', 'Authorization': 'token token' });
          assert.deepEqual(options.body, {
            ref: 'baz',
            auto_merge: false,
            required_contexts: [],
            environment: 'production',
            description: 'Deploying'
          });
          assert.equal(result['github-deployment-status'].deploymentId, '123');
        });
    });

    it('rejects if an error occured creating deployment', function() {
      var instance = subject.createDeployPlugin({
        name: 'github-deployment-status'
      });

      var config = {
        org: 'foo',
        repo: 'bar',
        ref: 'baz'
      };

      var context = {
        ui: mockUi,
        config: {
          'github-deployment-status': config
        },
        _fakeRequest: {
          request: function() {
            return Promise.reject('BOOM');
          }
        }
      };

      instance.beforeHook(context);
      instance.configure(context);
      instance.setup(context);

      return assert.isFulfilled(instance.willDeploy(context))
        .then(function(result) {
          assert.match(mockUi.messages.pop(), /Error creating github deployment: BOOM/);
          assert.isNull(result['github-deployment-status'].deploymentId);
        });
    });
  });
});
