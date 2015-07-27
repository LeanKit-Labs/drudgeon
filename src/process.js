var _ = require( 'lodash' );
var when = require( 'when' );
var exec = require( 'child_process' ).exec;
var spawn = require( 'win-spawn' );
var path = require( 'path' );

function startProcess( inherit, target ) {
	return when.promise( function( resolve, reject, notify ) {
		try {
			var errors = [];
			var config = {
				cwd: target.path || './',
				env: process.env
			};
			if( inherit ) {
				config.stdio = 'inherit';
			}
			var pid = spawn( target.command, target.arguments, config );
			if( !inherit ) {
				pid.stdout.setEncoding( 'utf8' );
				pid.stderr.setEncoding( 'utf8' );
				pid.stdout.on( 'data', function( data ) {
					notify( { source: 'stdout', data: data } );
				} );
			}
			pid.on( 'error', function( e ) {
				// the only known use case I've seen for this so far is due to
				// ENOENT on the command itself
				var error = new Error( 'Attempting to execute the command "' +
					target.command + '" at "' + ( target.path || path.resolve( './' ) ) + '" failed with "' + e.toString().replace( 'Error: ', '' ) + '"'
				);
				notify( { source: 'stderr', data: error.toString().replace( 'Error: ', '' ) } );
				reject( error );
			} );
			pid.on( 'close', function( code ) {
				if( code !== 0 ) { // || errors.length > 0
					reject( code );
				} else {
					resolve( code );
				}
			} );
			if( !inherit ) {
				pid.stderr.on( 'data', function( err ) {
					errors.push( err );
					notify( { source: 'stderr', data: err } );
				} );
			}
		} catch( e ) {
			reject( new Error( 'Failure failed failingly with ' + e.stack ) );
		}
	} );
}

module.exports = {
	start: startProcess
};
