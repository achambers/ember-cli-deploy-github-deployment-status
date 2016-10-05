/* jshint node: true */

var subject = require('../../index');
var assert  = require('../helpers/assert');

var Promise = require('ember-cli/lib/ext/promise');

describe('Github Deployment Status | didFail hook', function() {
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

  it('updates the deploment status on failure', function() {
    var instance = subject.createDeployPlugin({
      name: 'github-deployment-status'
    });

    var config = {
      org: 'foo',
      repo: 'bar',
      ref: 'baz',
      token: 'token',
      targetUrl: 'https://support.kayakostage.net'
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

          return Promise.resolve();
        }
      }
    };

    instance.beforeHook(context);
    instance.configure(context);
    instance.setup(context);

    return assert.isFulfilled(instance.didFail(context))
      .then(function() {
        var options = context['github-deployment-status']._client._options;
        assert.equal(options.uri,'https://api.github.com/repos/foo/bar/deployments/123/statuses');
        assert.equal(options.method, 'POST');
        assert.equal(options.json, true);
        assert.deepEqual(options.qs, { access_token: 'token' });
        assert.deepEqual(options.headers, { 'User-Agent': 'foo' });
        assert.deepEqual(options.body, {
          state: 'failure',
          target_url: 'https://support.kayakostage.net',
          description: 'Deploy failed'
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
      targetUrl: 'https://support.kayakostage.net'
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

    return assert.isFulfilled(instance.didFail(context))
      .then(function() {
        assert.isUndefined(context['github-deployment-status']._client._options);
      });
  });
});
