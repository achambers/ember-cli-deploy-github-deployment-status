/* jshint node: true */

var subject = require('../../index');
var assert  = require('../helpers/assert');

describe('Github Deployment Status | configure hook', function() {
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

  describe('required config', function() {
    var config;

    beforeEach(function() {
      config = {
        org: 'foo',
        repo: 'bar',
        ref: 'baz'
      };
    });

    ['org', 'repo', 'ref'].forEach(function(prop) {
      it('warns about missing ' + prop, function() {
        var instance = subject.createDeployPlugin({
          name: 'github-deployment-status'
        });

        delete config[prop];

        var context = {
          ui: mockUi,
          config: {
            'github-deployment-status': config
          }
        };

        instance.beforeHook(context);

        assert.throws(function(){
          instance.configure(context);
        });

        var s = 'Missing required config: \`' + prop + '\`';
        assert.match(mockUi.messages.pop(), new RegExp(s));
      });
    });
  });

  describe('default config', function() {
    var config;

    beforeEach(function() {
      config = {
        org: 'foo',
        repo: 'bar',
        ref: 'baz'
      };
    });

    ['token', 'payload', 'targetUrl', 'deploymentId'].forEach(function(prop) {
      it('provides default ' + prop, function() {
        var instance = subject.createDeployPlugin({
          name: 'github-deployment-status'
        });

        var context = {
          ui: mockUi,
          config: {
            'github-deployment-status': config
          }
        };

        instance.beforeHook(context);
        instance.configure(context);

        assert.isNull(instance.readConfig(prop));
      });
    });

    it('provides default task', function() {
      var instance = subject.createDeployPlugin({
        name: 'github-deployment-status'
      });

      var context = {
        ui: mockUi,
        config: {
          'github-deployment-status': config
        }
      };

      instance.beforeHook(context);
      instance.configure(context);

      assert.equal(instance.readConfig('task'), 'deploy');
    });

    it('provides default autoMerge', function() {
      var instance = subject.createDeployPlugin({
        name: 'github-deployment-status'
      });

      var context = {
        ui: mockUi,
        config: {
          'github-deployment-status': config
        }
      };

      instance.beforeHook(context);
      instance.configure(context);

      assert.equal(instance.readConfig('autoMerge'), false);
    });

    it('provides default requiredContexts', function() {
      var instance = subject.createDeployPlugin({
        name: 'github-deployment-status'
      });

      var context = {
        ui: mockUi,
        config: {
          'github-deployment-status': config
        }
      };

      instance.beforeHook(context);
      instance.configure(context);

      assert.deepEqual(instance.readConfig('requiredContexts'), []);
    });

    it('provides default environment', function() {
      var instance = subject.createDeployPlugin({
        name: 'github-deployment-status'
      });

      var context = {
        ui: mockUi,
        config: {
          'github-deployment-status': config
        }
      };

      instance.beforeHook(context);
      instance.configure(context);

      assert.equal(instance.readConfig('environment'), 'production');
    });
  });
});
