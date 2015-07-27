var should = require( 'should' ); // jshint ignore: line
var path = require( 'path' );
var fsm = require( '../src/fsm.js' );
var set = require( '../src/set.js' );
var start = require( '../src/process.js' ).start.bind( undefined, false );

var LOCAL = '.' + path.sep;

describe( 'Error handling', function() {

	describe( 'With invalid command', function() {
		var error,
			output = [];
		before( function( done ) {
			var steps = set( 'darwin', {
				'bad': './:derp terp'
			} );
			var machine = fsm( start, steps );
			machine.run()
				.progress( function( l ) {
					output.push( l.stdout || l.stderr );
				} )
				.then( null, function( err ) {
					error = err;
					done();
				} );
		} );

		it( 'should capture error', function() {
			error.bad.should.eql( [ 'Attempting to execute the command "derp" at "' + LOCAL + '" failed with "spawn derp ENOENT"' ] );
		} );
	} );
} );
