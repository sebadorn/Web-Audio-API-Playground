'use strict';


var UIHandler = {


	ERR_MESSAGE_TIMEOUT: 8000, // [ms]


	/**
	 * Initialize control buttons.
	 */
	_initControls: function() {
		var controlPlay = document.getElementById( 'control-play' );

		controlPlay.addEventListener( 'click', function( ev ) {
			var state = AudioHandler.togglePlayback();
			this.updateControls( state );
		}.bind( this ) );
	},


	/**
	 * Initialize Drag'n'Drop of files.
	 */
	_initDragAndDrop: function() {
		document.body.addEventListener( 'dragover', function( ev ) {
			ev.preventDefault();
		} );

		document.body.addEventListener( 'drop', function( ev ) {
			ev.preventDefault();

			var file = ev.dataTransfer.files[0];
			var type = String( file.type ).split( '/' )[0];

			if( type !== 'audio' ) {
				this.showError( new Error( 'File type is: ' + file.type ) );
				return;
			}

			this.showFileInfo( file );
			this.updateControls();
			AudioHandler.loadFile( file );
		}.bind( this ) );
	},


	/**
	 * Initialize the file select.
	 */
	_initFileSelect: function() {
		var trigger = document.getElementById( 'audio-select' );
		var input = document.getElementById( 'file-input-audio' );

		trigger.addEventListener( 'click', function( ev ) {
			var clickEvent = new MouseEvent( 'click' );
			input.dispatchEvent( clickEvent );
		} );

		input.addEventListener( 'change', function( ev ) {
			var file = ev.target.files[0];
			var type = String( file.type ).split( '/' )[0];

			if( type !== 'audio' ) {
				this.showError( new Error( 'File type is: ' + file.type ) );
				return;
			}

			this.showFileInfo( file );
			this.updateControls();
			AudioHandler.loadFile( file );
		}.bind( this ) );
	},


	/**
	 * Initialize keyboard event handling.
	 */
	_initKeyboardHandler: function() {
		document.body.addEventListener( 'keyup', function( ev ) {
			switch( ev.keyCode ) {
				case 32: // spacebar
					var state = AudioHandler.togglePlayback();
					this.updateControls( state );
					break;
			}
		}.bind( this ) );
	},


	/**
	 * Register event listeners.
	 */
	_registerEventListeners: function() {
		var overlayStop = document.body.querySelector( '.overlay-vis-pause' );

		window.addEventListener( 'resize', function() {
			Visualizer.resize( window.innerWidth, window.innerHeight );
		} );

		window.addEventListener( 'blur', function() {
			overlayStop.style.display = 'block';
			Visualizer.stop();
		} );

		window.addEventListener( 'focus', function() {
			overlayStop.style.display = 'none';
			Visualizer.start();
		} );
	},


	/**
	 * Initialize.
	 */
	init: function() {
		this._registerEventListeners();
		this._initKeyboardHandler();
		this._initFileSelect();
		this._initControls();
		this._initDragAndDrop();
	},


	/**
	 * Show an error message.
	 * @param {Error} err
	 */
	showError: function( err ) {
		var container = document.createElement( 'div' );
		container.className = 'overlay error';
		container.innerHTML = err.message;

		document.body.appendChild( container );

		container.addEventListener( 'click', function() {
			if( container.parentNode ) {
				container.parentNode.removeChild( container );
			}
		} );

		setTimeout( function() {
			if( container.parentNode ) {
				container.parentNode.removeChild( container );
			}
		}, UIHandler.ERR_MESSAGE_TIMEOUT );
	},


	/**
	 * Show and update the file info.
	 * @param {File} file
	 */
	showFileInfo: function( file ) {
		var overlayInfo = document.body.querySelector( '.overlay-info' );
		var overlayControls = document.body.querySelector( '.controls' );

		if( !file ) {
			overlayInfo.style.display = 'none';
			overlayControls.style.display = 'none';
			return;
		}

		var fileName = overlayInfo.querySelector( '.filename' );
		var fileType = overlayInfo.querySelector( '.filetype' );

		fileName.textContent = file.name;
		fileType.textContent = file.type;

		overlayInfo.style.display = 'block';
		overlayControls.style.display = 'block';
	},


	/**
	 * Update the controls.
	 * @param {String} state Audio context state.
	 */
	updateControls: function( state ) {
		state = state || AudioHandler.audioCtx.state;
		var controlPlay = document.getElementById( 'control-play' );

		if( state === 'running' ) {
			controlPlay.className = 'fa fa-pause';
		}
		else {
			controlPlay.className = 'fa fa-play';
		}
	}


};
