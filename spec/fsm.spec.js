var should = require( 'should' );
var _ = require( 'lodash' );
var fsm = require( '../src/fsm.js' );
var when = require( 'when' );
var set = require( '../src/set.js' );

describe( 'FSM', function() {
	describe( 'with steps', function() {
		var simple = {
			'one': './a/:one 1',
			'two': './b/:two 2',
			'three': './c/:three 3',
		}
		var steps = set( 'darwin', simple );
		function createStep( msgs, code ) {
			return function() {
				return when.promise( function( resolve, reject, notify ) {
					process.nextTick( function() {
						_.each( msgs, function( m ) {
							notify( { source: 'stdout', data: m } );
						} );
						if( code ) {
							reject( code );
						} else {
							resolve( code );
						}
					} );
				} );
			}
		}

		describe( 'when all steps succeed', function() {
			var output = [];
			var execStub;
			var machine;
			var outcome;
			var responses = {
				'{"path":"a/","command":"one","arguments":["1"]}': 
					createStep( [ "running a!" ], 0 ),
				'{"path":"b/","command":"two","arguments":["2"]}':
					createStep( [ "running b!" ], 0 ),
				'{"path":"c/","command":"three","arguments":["3"]}':
					createStep( [ "running c!", "c - part 2" ], 0 ),
			};

			before( function( done ) {
				execStub = function( x ) {
					var key = JSON.stringify( x );
					return responses[ key ]();
				}
				machine = fsm( execStub, steps );
				machine.run()
					.progress( function( l ) {
						output.push( l.stdout );
					} )
					.then( function( result ) {
						outcome = result;
						done();
					} );
			} );

			it( 'should return collected output', function() {
				outcome.should.eql( {
					one: [ "running a!" ],
					two: [ "running b!" ],
					three: [ "running c!", "c - part 2" ],
				} );
			} );

			it( 'should capture output as it occurs', function() {
				output.should.eql( [
					"running a!",
					"running b!",
					"running c!",
					"c - part 2",
				] );
			} );
		} );

		describe( 'when a step fails', function() {
			var output = [];
			var execStub;
			var machine;
			var outcome;
			var responses = {
				'{"path":"a/","command":"one","arguments":["1"]}': 
					createStep( [ "running a!" ], 0 ),
				'{"path":"b/","command":"two","arguments":["2"]}':
					createStep( [ "running b!" ], 1 ),
				'{"path":"c/","command":"three","arguments":["3"]}':
					createStep( [ "running c!", "c - part 2" ], 0 ),
			};

			before( function( done ) {
				execStub = function( x ) {
					var key = JSON.stringify( x );
					return responses[ key ]();
				}
				machine = fsm( execStub, steps );
				machine.run()
					.progress( function( l ) {
						output.push( l.stdout );
					} )
					.then( null, function( result ) {
						outcome = result;
						done();
					} );
			} );

			it( 'should return collected output', function() {
				outcome.should.eql( {
					one: [ "running a!" ],
					two: [ "running b!" ]
				} );
			} );

			it( 'should capture output as it occurs', function() {
				output.should.eql( [
					"running a!",
					"running b!"
				] );
			} );
		} )
	} );
} );