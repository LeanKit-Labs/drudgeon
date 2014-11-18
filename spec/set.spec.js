var should = require( 'should' );
var _ = require( 'lodash' );
var commandSet = require( '../src/set.js' );

var flat = {
	'one': 'gulp build',
	'two': './spec/:gulp test',
	'three': 'node ./src/index.js'
};

var simple = {
	'one': {
		cmd: 'gulp',
		args: [ 'build' ]
	},
	'two': {
		cmd: 'gulp',
		args: [ 'test' ]
	},
	'three': {
		cmd: 'node',
		args: [ './src/index.js' ]
	}
};

var verbose = {
	'one': {
		command: 	'gulp',
		arguments: 	[ 'build' ]
	},
	'two': {
		command: 	'gulp',
		arguments: 	[ 'test' ]
	},
	'three': {
		command: 	'node',
		arguments: 	[ './src/index.js' ]
	}
};

var repetitive = {
	platforms: {
		win32: {
			'one': {
				cmd: 'gulp',
				args: [ 'build' ]
			},
			'two': {
				cmd: 'gulp',
				args: [ 'test' ]
			},
			'three': {
				cmd: 'node.cmd',
				args: [ './src/index.js' ]
			}
		},
		'*': {
			'one': {
			cmd: 'gulp',
			args: [ 'build' ]
			},
			'two': {
				cmd: 'gulp',
				args: [ 'test' ]
			},
			'three': {
				cmd: 'node',
				args: [ './src/index.js' ]
			}
		}
	}
};

var filtered = {
	'one': {
		cmd: 'gulp',
		args: [ 'build' ]
	},
	'two': {
		cmd: 'gulp',
		args: [ 'test' ]
	},
	'three': {
		cmd: {
			win32: 'node.cmd',
			'*': 'node'
		},
		args: [ './src/index.js' ]
	}
}

var revised = {
	'one': 'gulp build',
	'two': 'gulp test',
	'three': 'node ./src/index.js',
	_revisions: {
		win32: {
			three: {
				cmd: 'node.cmd'
			}
		}
	}
};

var progressive = {
	'one': 'gulp build',
	'two': {
		win32: 'gulp win-test',
		'*': 'gulp test'
	},
	'three': {
		win32: {},
		'*': {
			cmd: 'nginx',
			args: [ 'reset' ]
		}
	},
	'four': {
		cmd: 'iis-reset',
		args: [ '--hard' ]
	},
	_revisions: {
		'darwin': {
			four: undefined
		}
	}
}

describe( 'Command Sets', function() {
	describe( 'when loading progressive step list', function() {
		describe( 'for darwin', function() {
			var set;
			before( function() {
				set = commandSet( 'darwin', progressive );
			} );

			it( 'should have correct number of steps', function() {
				_.keys( set ).length.should.equal( 3 );
			} );

			it( 'should parse to the correct representation', function() {
				set.should.eql( {
					'one': {
						path: './',
						command: 'gulp',
						arguments: [ 'build' ]
					},
					'two': {
						path: './',
						command: 'gulp',
						arguments: [ 'test' ]
					},
					'three': {
						path: './',
						command: 'nginx',
						arguments: [ 'reset' ]
					}
				} );
			} );
		} );
		describe( 'for win32', function() {
			var set;
			before( function() {
				set = commandSet( 'win32', progressive );
			} );

			it( 'should have correct number of steps', function() {
				_.keys( set ).length.should.equal( 3 );
			} );

			it( 'should parse to the correct representation', function() {
				set.should.eql( {
					'one': {
						path: './',
						command: 'gulp',
						arguments: [ 'build' ]
					},
					'two': {
						path: './',
						command: 'gulp',
						arguments: [ 'win-test' ]
					},
					'four': {
						path: './',
						command: 'iis-reset',
						arguments: [ '--hard' ]
					}
				} );
			} );
		} );
	} );

	describe( 'when loading revised step list', function() {
		describe( 'for darwin', function() {
			var set;
			before( function() {
				set = commandSet( 'darwin', revised );
			} );

			it( 'should have correct number of steps', function() {
				_.keys( set ).length.should.equal( 3 );
			} );

			it( 'should parse to the correct representation', function() {
				set.should.eql( {
					'one': {
						path: './',
						command: 'gulp',
						arguments: [ 'build' ]
					},
					'two': {
						path: './',
						command: 'gulp',
						arguments: [ 'test' ]
					},
					'three': {
						path: './',
						command: 'node',
						arguments: [ './src/index.js' ]
					}
				} );
			} );
		} );
		describe( 'for win32', function() {
			var set;
			before( function() {
				set = commandSet( 'win32', revised );
			} );

			it( 'should have correct number of steps', function() {
				_.keys( set ).length.should.equal( 3 );
			} );

			it( 'should parse to the correct representation', function() {
				set.should.eql( {
					'one': {
						path: './',
						command: 'gulp',
						arguments: [ 'build' ]
					},
					'two': {
						path: './',
						command: 'gulp',
						arguments: [ 'test' ]
					},
					'three': {
						path: './',
						command: 'node.cmd',
						arguments: [ './src/index.js' ]
					}
				} );
			} );
		} );
	} );

	describe( 'when loading filtered step list', function() {
		describe( 'for darwin', function() {
			var set;
			before( function() {
				set = commandSet( 'darwin', filtered );
			} );

			it( 'should have correct number of steps', function() {
				_.keys( set ).length.should.equal( 3 );
			} );

			it( 'should parse to the correct representation', function() {
				set.should.eql( {
					'one': {
						path: './',
						command: 'gulp',
						arguments: [ 'build' ]
					},
					'two': {
						path: './',
						command: 'gulp',
						arguments: [ 'test' ]
					},
					'three': {
						path: './',
						command: 'node',
						arguments: [ './src/index.js' ]
					}
				} );
			} );
		} );
		describe( 'for win32', function() {
			var set;
			before( function() {
				set = commandSet( 'win32', filtered );
			} );

			it( 'should have correct number of steps', function() {
				_.keys( set ).length.should.equal( 3 );
			} );

			it( 'should parse to the correct representation', function() {
				set.should.eql( {
					'one': {
						path: './',
						command: 'gulp',
						arguments: [ 'build' ]
					},
					'two': {
						path: './',
						command: 'gulp',
						arguments: [ 'test' ]
					},
					'three': {
						path: './',
						command: 'node.cmd',
						arguments: [ './src/index.js' ]
					}
				} );
			} );
		} );
	} );

	describe( 'when loading repetitive step list', function() {
		describe( 'for darwin', function() {
			var set;
			before( function() {
				set = commandSet( 'darwin', repetitive );
			} );

			it( 'should have correct number of steps', function() {
				_.keys( set ).length.should.equal( 3 );
			} );

			it( 'should parse to the correct representation', function() {
				set.should.eql( {
					'one': {
						path: './',
						command: 'gulp',
						arguments: [ 'build' ]
					},
					'two': {
						path: './',
						command: 'gulp',
						arguments: [ 'test' ]
					},
					'three': {
						path: './',
						command: 'node',
						arguments: [ './src/index.js' ]
					}
				} );
			} );
		} );
		describe( 'for win32', function() {
			var set;
			before( function() {
				set = commandSet( 'win32', repetitive );
			} );

			it( 'should have correct number of steps', function() {
				_.keys( set ).length.should.equal( 3 );
			} );

			it( 'should parse to the correct representation', function() {
				set.should.eql( {
					'one': {
						path: './',
						command: 'gulp',
						arguments: [ 'build' ]
					},
					'two': {
						path: './',
						command: 'gulp',
						arguments: [ 'test' ]
					},
					'three': {
						path: './',
						command: 'node.cmd',
						arguments: [ './src/index.js' ]
					}
				} );
			} );
		} );
	} );

	describe( 'when loading flat step list', function() {
		var set;
		before( function() {
			set = commandSet( 'darwin', flat );
		} );

		it( 'should have correct number of steps', function() {
			_.keys( set ).length.should.equal( 3 );
		} );

		it( 'should parse to the correct representation', function() {
			set.should.eql( {
				'one': {
					path: './',
					command: 'gulp',
					arguments: [ 'build' ]
				},
				'two': {
					path: './spec/',
					command: 'gulp',
					arguments: [ 'test' ]
				},
				'three': {
					path: './',
					command: 'node',
					arguments: [ './src/index.js' ]
				}
			} );
		} );
	} );

	describe( 'when loading verbose step list', function() {
		var set;
		before( function() {
			set = commandSet( 'darwin', verbose );
		} );

		it( 'should have correct number of steps', function() {
			_.keys( set ).length.should.equal( 3 );
		} );

		it( 'should parse to the correct representation', function() {
			set.should.eql( {
				'one': {
					path: './',
					command: 'gulp',
					arguments: [ 'build' ]
				},
				'two': {
					path: './',
					command: 'gulp',
					arguments: [ 'test' ]
				},
				'three': {
					path: './',
					command: 'node',
					arguments: [ './src/index.js' ]
				}
			} );
		} );
	} );

	describe( 'when loading simple step list', function() {
		var set;
		before( function() {
			set = commandSet( 'darwin', simple );
		} );

		it( 'should have correct number of steps', function() {
			_.keys( set ).length.should.equal( 3 );
		} );

		it( 'should parse to the correct representation', function() {
			set.should.eql( {
				'one': {
					path: './',
					command: 'gulp',
					arguments: [ 'build' ]
				},
				'two': {
					path: './',
					command: 'gulp',
					arguments: [ 'test' ]
				},
				'three': {
					path: './',
					command: 'node',
					arguments: [ './src/index.js' ]
				}
			} );
		} );
	} );
} );