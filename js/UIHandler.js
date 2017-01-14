'use strict';


var UIHandler = {


	/**
	 * Initialize the file select.
	 */
	_initFileSelect: function() {
		var overlayAudio = document.body.querySelector( '.overlay-audio-pause' );
		var trigger = document.getElementById( 'audio-select' );
		var input = document.getElementById( 'file-input-audio' );

		trigger.addEventListener( 'click', function( ev ) {
			var clickEvent = new MouseEvent( 'click' );
			input.dispatchEvent( clickEvent );
		} );

		input.addEventListener( 'change', function( ev ) {
			this.showFileInfo( ev.target.files[0] );
			overlayAudio.style.display = 'none';
			AudioHandler.loadFile( ev.target.files[0] );
		}.bind( this ) );
	},


	/**
	 * Initialize keyboard event handling.
	 */
	_initKeyboardHandler: function() {
		var overlayAudio = document.body.querySelector( '.overlay-audio-pause' );

		document.body.addEventListener( 'keyup', function( ev ) {
			switch( ev.keyCode ) {
				case 32: // spacebar
					var state = AudioHandler.togglePlayback();
					overlayAudio.style.display = ( state === 'running' ) ? 'none' : 'block';
					break;
			}
		} );
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
	},


	/**
	 * Show and update the file info.
	 * @param {File} file
	 */
	showFileInfo: function( file ) {
		var overlay = document.body.querySelector( '.overlay-info' );

		if( !file ) {
			overlay.style.display = 'none';
			return;
		}

		var fileName = overlay.querySelector( '.filename' );
		var fileType = overlay.querySelector( '.filetype' );

		fileName.textContent = file.name;
		fileType.textContent = file.type;

		overlay.style.display = 'block';
	}


};
