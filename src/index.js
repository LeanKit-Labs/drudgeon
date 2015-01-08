var fsm = require( './fsm.js' );
var process = require( './process.js' );
var set = require( './set.js' );
var _ = require( 'lodash' );
var os = require( 'os' );
var hostPlatform = os.platform();

function createStepper( platform, rawSteps, cwd ) {
	if( !_.isString( platform ) ) {
		cwd = rawSteps;
		rawSteps = platform;
		platform = hostPlatform;
	}
	var steps = set( platform, rawSteps );
	return fsm( process.start, steps, cwd );
}

var fn = createStepper;
fn.readSet = set.bind( undefined, hostPlatform );
module.exports = fn;