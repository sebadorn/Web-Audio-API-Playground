'use strict';


var AudioHandler = {


	analyser: null,
	audioCtx: null,
	audioElement: null,
	source: null,

	_dataFrequency: null,
	_dataTimeDomain: null,

	FFT_SIZE: 256,

	PLAYBACK_STATE: {
		PLAYING: 1,
		PAUSED: 2
	},


	/**
	 * Prepare to analyse the given audio data.
	 * @param {ArrayBuffer} audioData
	 */
	analyse: function( audioElement ) {
		if( this.source ) {
			this.source.disconnect();
		}

		this.source = this.audioCtx.createMediaElementSource( audioElement );
		this.source.connect( this.analyser );

		var length = this.analyser.frequencyBinCount;
		this._dataTimeDomain = new Uint8Array( length );
		this._dataFrequency = new Uint8Array( length );

		audioElement.play();
	},


	/**
	 * @see http://stackoverflow.com/a/32549481/915570
	 * @param  {String} dataURI
	 * @return {Blob}
	 */
	dataURItoBlob: function( dataURI ) {
		// Split the input to get the mime-type
		// and the data itself.
		var cutPos = dataURI.indexOf( ',' ) + 1;
		var header = dataURI.substr( 0, cutPos );
		var data = dataURI.substr( cutPos );

		// First part contains data:audio/x;base64
		// from which we only need audio/x.
		var type = header.split( ':' )[1].split( ';' )[0];

		// Second part is the data itself and we decode it.
		var byteString = atob( data );
		var byteStringLen = byteString.length;

		// Create ArrayBuffer with the byte
		// string and set the length to it.
		var ab = new ArrayBuffer( byteStringLen );

		// Create a typed array out of the array buffer representing
		// each character from as a 8-bit unsigned integer.
		var intArray = new Uint8Array( ab );

		for ( var i = 0; i < byteStringLen; i++ ) {
			intArray[i] = byteString.charCodeAt( i );
		}

		return new Blob( [intArray], { type: type } );
	},


	/**
	 * Get the analysed audio data for visualization.
	 * @return {Object}
	 */
	getVisualizationData: function() {
		if( !this.analyser || !this._dataTimeDomain ) {
			return null;
		}

		this.analyser.getByteTimeDomainData( this._dataTimeDomain );
		this.analyser.getByteFrequencyData( this._dataFrequency );

		return {
			frequency: this._dataFrequency,
			timeDomain: this._dataTimeDomain,
			trackCurrentTime: this.audioElement.currentTime,
			trackDuration: this.audioElement.duration
		};
	},


	/**
	 * Initialize.
	 */
	init: function() {
		this.audioElement = document.getElementById( 'audio-element' );

		var AudioContext = window.AudioContext || window.webkitAudioContext;
		this.audioCtx = new AudioContext();

		this.analyser = this.audioCtx.createAnalyser();
		this.analyser.connect( this.audioCtx.destination );
		this.analyser.fftSize = this.FFT_SIZE;
	},


	/**
	 * Check if the given mime type indicates a playable file.
	 * The mime type may be wrong, though.
	 * @param  {String}  mimeType
	 * @return {Boolean}
	 */
	isPlayableMimeType: function( mimeType ) {
		var type = String( mimeType ).split( '/' )[0];

		return ( type === 'audio' || type === 'video' );
	},


	/**
	 * Jump to a certain track progress.
	 * @param {Number} progress
	 */
	jumpToProgress: function( progress ) {
		this.audioElement.currentTime = progress * this.audioElement.duration;
	},


	/**
	 * Load audio file data.
	 * @param {File} file
	 */
	loadFile: function( file ) {
		var fr = new FileReader();

		fr.addEventListener( 'load', function( ev ) {
			// In Firefox just doing:
			//   this.audioElement.src = ev.target.result;
			// is enough. But Chrome first complains about CORS, then
			// after setting crossOrigin="anonymous" complains about
			// not finding a valid source. I finally found this solution.
			// @see http://stackoverflow.com/a/32549481/915570

			var audioBlob = this.dataURItoBlob( ev.target.result );
			this.audioElement = new Audio();
			this.audioElement.src = URL.createObjectURL( audioBlob );

			this.analyse( this.audioElement );
		}.bind( this ) );

		fr.readAsDataURL( file );
	},


	/**
	 * Toggle audio playback.
	 * @return {AudioHandler.PLAYBACK_STATE} The new state.
	 */
	togglePlayback: function() {
		if( !this.source ) {
			return;
		}

		var state = null;

		if( this.audioElement.paused ) {
			this.audioElement.play();
			state = this.PLAYBACK_STATE.PLAYING;
		}
		else {
			this.audioElement.pause();
			state = this.PLAYBACK_STATE.PAUSED;
		}

		return state;
	}


};
