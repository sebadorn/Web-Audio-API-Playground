'use strict';


var UIHandler = {


	ERR_MESSAGE_TIMEOUT: 8000, // [ms]


	/**
	 * Initialize Drag'n'Drop of files.
	 */
	_initDragAndDrop: function() {
		var overlayAudio = document.body.querySelector( '.overlay-audio-pause' );

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
			overlayAudio.style.display = 'none';
			AudioHandler.loadFile( file );
		}.bind( this ) );
	},


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
			var file = ev.target.files[0];
			var type = String( file.type ).split( '/' )[0];

			if( type !== 'audio' ) {
				this.showError( new Error( 'File type is: ' + file.type ) );
				return;
			}

			this.showFileInfo( file );
			overlayAudio.style.display = 'none';
			AudioHandler.loadFile( file );
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
