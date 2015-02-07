var _ = require( 'lodash' );
var machina = require( 'machina' );
var when = require( 'when' );
var path = require( 'path' );
var Monologue = require( 'monologue.js' )( _ );
var debug = require( 'debug' )( 'drudgeon' );

var LOCAL = '.' + path.sep;

function addStep( exec, step, name, workingPath, context ) {
	var succeeded = name + '-done';
	var failed = name + '-failed';
	var shell = {
		_onEnter: function() {
			context.emit( 'starting.' + name, name );
			var result = this._handlers( name );
			step.path = path.join( workingPath, step.path || '' );
			debug( 'Executing step "%s": "%s" with args "%s" at "%s"', name, step.command, step.arguments, step.path );
			exec( step )
				.progress( result.output )
				.then( result.success )
				.then( null, result.failure )
				.catch( result.failure );
		}.bind( context )
	};
	shell[ succeeded ] = function() {
		this.emit( 'finished.' + name, name );
		this._nextStep();
	}.bind( context );
	shell[ failed ] = function( err ) {
		this.emit( 'commands.failed', err );
	}.bind( context );
	context.states[ name ] = shell;
	context._steps.push( name );
}

function createMachine( exec, commandSet, workingPath ) {
	workingPath = workingPath || commandSet.path || LOCAL;

	var Machine = machina.Fsm.extend( {
		_steps: [],
		_index: 0,
		stepOutput: {},

		_aggregate: function( op ) {
			var list = this.stepOutput[ op ] = this.stepOutput[ op ] || [];
			return function( data ) {
				list.push( data.data );
				this.emit( op + '.output', data );
			}.bind( this );
		},

		_handler: function( ev ) {
			return function( result ) {
				this.handle( ev, result );
			}.bind( this );
		},

		_handlers: function( op ) {
			return {
				output: this._aggregate( op ),
				success: this._handler( op + '-done' ),
				failure: this._handler( op + '-failed' )
			};
		},

		_nextStep: function() {
			var currentStep = this._steps[ this._index ];
			if ( currentStep === _.last( this._steps ) ) {
				this.emit( 'commands.complete' );
			} else {
				var nextStep = this._steps[ ( ++this._index ) ];
				this.transition( nextStep );
			}
		},

		run: function() {
			return when.promise( function( resolve, reject, notify ) {
				var stream = this.on( '#.output', function( data, env ) {
					var x = { step: env.topic.split( '.' )[ 0 ] };
					x[ data.source ] = data.data;
					notify( x );
				} );
				this.on( 'commands.complete', function() {
					stream.unsubscribe();
					resolve( this.stepOutput );
				}.bind( this ) ).once();
				this.on( 'commands.failed', function( error ) {
					stream.unsubscribe();
					this.stepOutput.failedStep = this.state;
					reject( this.stepOutput );
				}.bind( this ) ).once();
				this.transition( this._steps[ 0 ] );
			}.bind( this ) );
		},

		initialState: 'init',
		states: {
			init: {
				_onEnter: function() {
					_.each( commandSet, function( step, name ) {
						addStep( exec, step, name, workingPath, this );
					}.bind( this ) );
				}
			}
		},
		initialize: function() {
			this.run = this.run.bind( this );
		}
	} );

	Monologue.mixin( Machine );
	var machine = new Machine();
	return machine;
}

module.exports = createMachine;
