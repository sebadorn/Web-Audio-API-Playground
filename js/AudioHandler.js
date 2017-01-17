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
			this.audioElement.type = file.type;
			this.audioElement.src = ev.target.result;

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
