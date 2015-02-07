var should = require( 'should' ); // jshint ignore: line
var _ = require( 'lodash' );
var fsm = require( '../src/fsm.js' );
var when = require( 'when' );
var set = require( '../src/set.js' );
// var path = require( 'path' );

// var SEP = path.sep;
// var OTHER = path.sep === '/' ? '\\' : '/';

function createStep( msgs, code ) { // jshint ignore: line
	return function() {
		return when.promise( function( resolve, reject, notify ) {
			process.nextTick( function() {
				_.each( msgs, function( m ) {
					notify( {
						source: 'stdout',
						data: m
					} );
				} );
				if ( code ) {
					reject( code );
				} else {
					resolve( code );
				}
			} );
		} );
	};
}

describe( 'FSM', function() {
	describe( 'with steps', function() {
		var simple = {
			'one': './a/:one 1',
			'two': './b/:two 2',
			'three': './c/:three 3',
		};
		var steps = set( 'darwin', simple );

		describe( 'when all steps succeed', function() {
			var output = [];
			var starting = [];
			var finished = [];
			var execStub;
			var machine;
			var outcome;
			var responses = {
				//jshint ignore : start
				'{"path":"a/","command":"one","arguments":["1"]}': createStep( [ "running a!" ], 0 ),
				'{"path":"b/","command":"two","arguments":["2"]}': createStep( [ "running b!" ], 0 ),
				'{"path":"c/","command":"three","arguments":["3"]}': createStep( [ "running c!", "c - part 2" ], 0 ),
				// these lines are for windows because lol, windows paths
				'{"path":"a\\\\","command":"one","arguments":["1"]}': createStep( [ "running a!" ], 0 ),
				'{"path":"b\\\\","command":"two","arguments":["2"]}': createStep( [ "running b!" ], 0 ),
				'{"path":"c\\\\","command":"three","arguments":["3"]}': createStep( [ "running c!", "c - part 2" ], 0 ),
				//jshint ignore : end
			};

			before( function( done ) {
				execStub = function( x ) {
					var key = JSON.stringify( x );
					return responses[ key ]();
				};
				machine = fsm( execStub, steps );
				machine.on( 'starting.#', function( env ) {
					starting.push( env );
				} );
				machine.on( 'finished.#', function( env ) {
					finished.push( env );
				} );
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
					one: [ 'running a!' ],
					two: [ 'running b!' ],
					three: [ 'running c!', 'c - part 2' ],
				} );
			} );

			it( 'should capture output as it occurs', function() {
				output.should.eql( [
					'running a!',
					'running b!',
					'running c!',
					'c - part 2',
				] );
			} );

			it( 'should get starting and finished events for all steps', function() {
				starting.should.eql( [ 'one', 'two', 'three' ] );
				finished.should.eql( [ 'one', 'two', 'three' ] );
			} );
		} );

		describe( 'when a step fails', function() {
			var output = [];
			var starting = [];
			var finished = [];
			var execStub;
			var machine;
			var outcome;
			var responses = {
				//jshint ignore : start
				'{"path":"a/","command":"one","arguments":["1"]}': createStep( [ "running a!" ], 0 ),
				'{"path":"b/","command":"two","arguments":["2"]}': createStep( [ "running b!" ], 1 ),
				'{"path":"c/","command":"three","arguments":["3"]}': createStep( [ "running c!", "c - part 2" ], 0 ),
				// these lines are for windows because lol, windows paths
				'{"path":"a\\\\","command":"one","arguments":["1"]}': createStep( [ "running a!" ], 0 ),
				'{"path":"b\\\\","command":"two","arguments":["2"]}': createStep( [ "running b!" ], 1 ),
				'{"path":"c\\\\","command":"three","arguments":["3"]}': createStep( [ "running c!", "c - part 2" ], 0 ),
				// jshint ignore : end
			};

			before( function( done ) {
				execStub = function( x ) {
					var key = JSON.stringify( x );
					return responses[ key ]();
				};
				machine = fsm( execStub, steps );
				machine.on( 'starting.#', function( env ) {
					starting.push( env );
				} );
				machine.on( 'finished.#', function( env ) {
					finished.push( env );
				} );
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
					failedStep: 'two',
					one: [ 'running a!' ],
					two: [ 'running b!' ]
				} );
			} );

			it( 'should capture output as it occurs', function() {
				output.should.eql( [
					'running a!',
					'running b!'
				] );
			} );

			it( 'should get starting and finished events for successful steps', function() {
				starting.should.eql( [ 'one', 'two' ] );
				finished.should.eql( [ 'one' ] );
			} );
		} );
	} );
} );
