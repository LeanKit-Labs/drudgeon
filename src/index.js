var fsm = require( './fsm.js' );
var processMod = require( './process.js' );
var set = require( './set.js' );
var _ = require( 'lodash' );
var os = require( 'os' );
var hostPlatform = os.platform();

function createStepper( rawSteps, config ) {
	config = config || {};
	var platform = config.platform || os.platform;
	var relativePath = config.relativePath || process.cwd();
	var inherit = config.inheritIO || false;
	var start = require( './process' ).start.bind( undefined, inherit );
	var steps = set( platform, rawSteps );
	return fsm( start, steps, relativePath );
}

var fn = createStepper;
fn.readSet = set.bind( undefined, hostPlatform );
module.exports = fn;
