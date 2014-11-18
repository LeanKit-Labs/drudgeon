var fsm = require( './fsm.js' );
var process = require( './process.js' );
var set = require( './set.js' );
var _ = require( 'lodash' );
var os = require( 'os' );

module.exports = function createStepper( platform, rawSteps, cwd ) {
	if( !_.isString( platform ) ) {
		cwd = rawSteps;
		rawSteps = platform;
		platform = os.platform();
	}
	var steps = set( platform, rawSteps );
	return fsm( process.start, steps, cwd );
};