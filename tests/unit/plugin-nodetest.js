/* jshint node: true */

var subject = require('../../index');
var assert  = require('../helpers/assert');

describe('Github Deployment Status plugin', function() {
  it('has a name', function() {
    var instance = subject.createDeployPlugin({
      name: 'foo'
    });

    assert.equal(instance.name, 'foo');
  });

  it('implements the correct hooks', function() {
    var plugin = subject.createDeployPlugin({
      name: 'foo'
    });

    assert.isDefined(plugin.setup);
    assert.isFunction(plugin.setup);

    assert.isDefined(plugin.willDeploy);
    assert.isFunction(plugin.willDeploy);

    assert.isDefined(plugin.didDeploy);
    assert.isFunction(plugin.didDeploy);

    assert.isDefined(plugin.didFail);
    assert.isFunction(plugin.didFail);
  });
});
