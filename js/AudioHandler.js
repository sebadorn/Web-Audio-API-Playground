'use strict';


var AudioHandler = {


	analyser: null,
	audioCtx: null,
	source: null,

	_dataFrequency: null,
	_dataTimeDomain: null,

	FFT_SIZE: 256,


	/**
	 * Prepare to analyse the given audio data.
	 * @param {ArrayBuffer} audioData
	 */
	analyse: function( audioData ) {
		if( this.source ) {
			this.source.stop();
			this.source.disconnect();
		}

		this.source = this.audioCtx.createBufferSource();

		this.audioCtx.decodeAudioData( audioData, function( buffer ) {
			this.source.buffer = buffer;
			this.source.connect( this.analyser );

			var length = this.analyser.frequencyBinCount;
			this._dataTimeDomain = new Uint8Array( length );
			this._dataFrequency = new Uint8Array( length );

			this.source.start();
		}.bind( this ) );
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
			timeDomain: this._dataTimeDomain,
			frequency: this._dataFrequency
		};
	},


	/**
	 * Initialize.
	 */
	init: function() {
		var AudioContext = window.AudioContext || window.webkitAudioContext;
		this.audioCtx = new AudioContext();

		this.analyser = this.audioCtx.createAnalyser();
		this.analyser.connect( this.audioCtx.destination );
		this.analyser.fftSize = this.FFT_SIZE;
	},


	/**
	 * Load audio file data.
	 * @param {File} file
	 */
	loadFile: function( file ) {
		var fr = new FileReader();

		fr.addEventListener( 'load', function( ev ) {
			this.analyse( ev.target.result );
		}.bind( this ) );

		fr.readAsArrayBuffer( file );
	},


	/**
	 * Toggle audio playback.
	 * @return {String} The new state: "suspended" or "running".
	 */
	togglePlayback: function() {
		if( !this.source ) {
			return;
		}

		var state = null;

		if( this.audioCtx.state === 'running' ) {
			this.audioCtx.suspend();
			state = 'suspended';
		}
		else {
			this.audioCtx.resume();
			state = 'running';
		}

		return state;
	}


};
