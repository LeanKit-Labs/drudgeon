var should = require( 'should' ); // jshint ignore: line
var _ = require( 'lodash' );
var fsm = require( '../src/fsm.js' );
var when = require( 'when' );
var set = require( '../src/set.js' );
var start = require( '../src/process.js' ).start;

describe( 'Error handling', function() {

	describe( 'With invalid command', function() {
		var error, output = [];
		before( function( done ) {
			var steps = set( 'darwin', {
				'bad': './:derp terp'
			} );
			var machine = fsm( start, steps );
			machine.run()
				.progress( function ( l ) {
					output.push( l.stdout || l.stderr );
				} )
				.then( null, function ( err ) {
					error = err;
					done();
				} );
		} );

		it( 'should capture error', function() {
			error.bad.should.eql( [ 'Attempting to execute the command "derp" at "./" failed with "spawn ENOENT"' ] );
		} );
	} );
} );