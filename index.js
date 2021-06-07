/* jshint node: true */
'use strict';

var BasePlugin = require('ember-cli-deploy-plugin');

module.exports = {
  name: 'ember-cli-deploy-github-deployment-status',

  createDeployPlugin: function(options) {
    var Plugin = BasePlugin.extend({
      name: options.name,

      requiredConfig: ['org', 'repo', 'ref'],

      defaultConfig: {
        token: null,
        task: 'deploy',
        autoMerge: false,
        requiredContexts: [],
        payload: null,
        environment: 'production',
        targetUrl: null,
        deploymentId: null
      },

      setup: function(context) {
        context[this.name] = context[this.name] || {};
        context[this.name]._client = context._fakeRequest || { request: require('request-promise') };
      },

      willDeploy: function(context) {
        var pluginName   = this.name;
        var token        = this.readConfig('token');
        var org          = this.readConfig('org');
        var repo         = this.readConfig('repo');
        var ref          = this.readConfig('ref');
        var environment  = this.readConfig('environment');
        var autoMerge    = this.readConfig('autoMerge');
        var contexts     = this.readConfig('requiredContexts');
        var payload      = this.readConfig('payload');

        var deploymentId = this.readConfig('deploymentId');
        var promise;

        if (deploymentId) {
          promise = Promise.resolve({ id: deploymentId });
        } else {
          var client = context[pluginName]._client;

          var body = {
            ref: ref,
            auto_merge: autoMerge,
            required_contexts: contexts,
            environment: environment,
            description: 'Deploying'
          };

          if (payload) {
            body.payload = payload;
          }

          var headers = {
            'User-Agent': org
          };

          if (token) {
            headers['Authorization'] = 'token ' + token;
          }

          var options = {
            method: 'POST',
            uri: 'https://api.github.com/repos/' + org + '/' + repo + '/deployments',
            headers: headers,
            body: body,
            json: true
          };

          promise = client.request(options);
        }

        return promise.then(function(data) {
          var response = {};
          response[pluginName] = { deploymentId: data.id };

          return response;
        }, function(reason) {
          this.log('Error creating github deployment: ' + reason, { verbose: true, color: 'yellow'});
          var response = {};
          response[pluginName] = { deploymentId: null };

          return response;
        }.bind(this));
      },

      didDeploy: function(context) {
        var pluginName = this.name;
        var id         = context[pluginName].deploymentId;

        var client = context[pluginName]._client;

        return this._updateDeployment.call(this, id, 'success', 'Deployed successfully', client);
      },

      didFail: function(context) {
        var pluginName  = this.name;
        var id          = context[pluginName].deploymentId;

        var client = context[pluginName]._client;

        return this._updateDeployment.call(this, id, 'failure', 'Deploy failed', client);
      },

      _updateDeployment: function(id, state, description, client) {
        var token       = this.readConfig('token');
        var org         = this.readConfig('org');
        var repo        = this.readConfig('repo');
        var targetUrl   = this.readConfig('targetUrl');

        if (id) {
          var body = { state: state, description: description };

          if (targetUrl) {
            body.target_url = targetUrl;
          }

          var headers = {
            'User-Agent': org
          };

          if (token) {
            headers['Authorization'] = 'token ' + token;
          }

          var options = {
            method: 'POST',
            uri: 'https://api.github.com/repos/' + org + '/' + repo + '/deployments/' + id + '/statuses',
            headers: headers,
            body: body,
            json: true
          };
          return client.request(options);
        }

        return Promise.resolve();
      }
    });

    return new Plugin();
  }
};
