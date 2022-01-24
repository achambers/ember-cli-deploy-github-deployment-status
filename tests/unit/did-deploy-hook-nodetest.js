/* jshint node: true */

var subject = require('../../index');
var assert  = require('../helpers/assert');

describe('Github Deployment Status | didDeploy hook', function() {
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

  it('updates the deployment status on success', function() {
    var instance = subject.createDeployPlugin({
      name: 'github-deployment-status'
    });

    var config = {
      org: 'foo',
      repo: 'bar',
      ref: 'baz',
      token: 'token',
      targetUrl: 'https://ember-cli-deploy.com'
    };

    var context = {
      ui: mockUi,
      config: {
        'github-deployment-status': config
      },
      'github-deployment-status': { deploymentId: '123' },
      _fakeRequest: {
        request: function(options) {
          this._options = options;

          return Promise.resolve({ data: { id: '123' } });
        }
      }
    };

    instance.beforeHook(context);
    instance.configure(context);
    instance.setup(context);

    return assert.isFulfilled(instance.didDeploy(context))
      .then(function() {
        var options = context['github-deployment-status']._client._options;
        assert.equal(options.url,'https://api.github.com/repos/foo/bar/deployments/123/statuses');
        assert.equal(options.method, 'post');
        assert.deepEqual(options.headers, { 'User-Agent': 'foo', 'Authorization': 'token token' });
        assert.deepEqual(options.data, {
          state: 'success',
          target_url: 'https://ember-cli-deploy.com',
          description: 'Deployed successfully'
        });
      });
  });

  it('doesn\'t attempt to update deployment if there was an error creating it', function() {
    var instance = subject.createDeployPlugin({
      name: 'github-deployment-status'
    });

    var config = {
      org: 'foo',
      repo: 'bar',
      ref: 'baz',
      token: 'token',
      targetUrl: 'https://ember-cli-deploy.com'
    };

    var context = {
      ui: mockUi,
      config: {
        'github-deployment-status': config
      },
      'github-deployment-status': { deploymentId: null },
      _fakeRequest: {
        request: function(options) {
          this._options = options;

          return Promise.resolve();
        }
      }
    };

    instance.beforeHook(context);
    instance.configure(context);
    instance.setup(context);

    return assert.isFulfilled(instance.didDeploy(context))
      .then(function() {
        assert.isUndefined(context['github-deployment-status']._client._options);
      });
  });
});
