'use strict';


var Visualizer = {


	_frameRequest: null,
	_lastUpdateFPS: 0, // [ms]
	_view: null,
	_viewBackground: null,
	_viewBars: null,
	_viewGraph: null,
	_viewInfo: null,

	renderer: null,
	ticker: null,

	_HEX_CHARMAP: '0123456789ABCDEF',

	FPS_UPDATE_INTERVAL: 1000, // [ms]


	/**
	 * Draw and render.
	 * @param {Number} time
	 */
	_draw: function( time ) {
		var V = Visualizer;

		if( V._frameRequest === null ) {
			return;
		}

		var data = AudioHandler.getVisualizationData();

		V._drawTimeDomain( data );
		var avgFreq = V._drawFrequency( data );

		var colorBg = V.rgbToHex( avgFreq * 0.5, 16, 32 );
		V._drawBackground( colorBg );

		V.renderer.render( V._view );
		V.ticker.update( time );

		if( Date.now() - V._lastUpdateFPS > V.FPS_UPDATE_INTERVAL ) {
			V._viewFPS.text = ~~V.ticker.FPS;
			V._lastUpdateFPS = Date.now();
		}

		V._frameRequest = requestAnimationFrame( V._draw );
	},


	/**
	 * Draw the background.
	 * @param {Number} color
	 */
	_drawBackground: function( color ) {
		this._viewBackground.clear();
		this._viewBackground.beginFill( color );
		this._viewBackground.drawRect( 0, 0, this.renderer.width, this.renderer.height );
		this._viewBackground.endFill();
	},


	/**
	 * Draw the audio frequency bars.
	 * @param  {Object} data Audio data.
	 * @return {Number}      The average frequency [0, 255].
	 */
	_drawFrequency: function( data ) {
		this._viewBars.clear();

		if( !data ) {
			return 0.0;
		}

		var bufferLen = data.frequency.length;
		var w = this.renderer.width / bufferLen;
		var avg = 0;
		var x = 0;

		for( var i = 0; i < bufferLen; i++ ) {
			var f = data.frequency[i];
			var percent = f * 0.00392156862745098; // f / 255.0
			var h = percent * this.renderer.height;
			var color = this.rgbToHex( f, 0, 0 );

			this._viewBars.beginFill( color );
			this._viewBars.drawRect( x, this.renderer.height - h, w, h );
			this._viewBars.endFill();

			x += w;
			avg += percent;
		}

		avg = avg * 255.0 / bufferLen;

		return avg;
	},


	/**
	 * Draw the time domain graph / waveform.
	 * @param {Object} data Audio data.
	 */
	_drawTimeDomain: function( data ) {
		this._viewGraph.clear();

		var maxWidth = 440;
		var maxHeight = 200;
		var x = ( this.renderer.width - maxWidth ) * 0.5;

		this._viewGraph.beginFill( 0x000000, 0.2 );
		this._viewGraph.drawRect( x, 0, maxWidth, maxHeight );
		this._viewGraph.endFill();

		this._viewGraph.lineStyle( 2, 0xFFFFFF );

		var bufferLen = data ? data.timeDomain.length : 0;

		if( bufferLen === 0 ) {
			this._viewGraph.moveTo( x, 0.5 * maxHeight );
			this._viewGraph.lineTo( x + maxWidth, 0.5 * maxHeight );
			return;
		}

		var w = maxWidth / ( bufferLen - 1 );

		this._viewGraph.moveTo( x, data.timeDomain[0] * 0.00392156862745098 * maxHeight );

		for( var i = 1; i < bufferLen; i++ ) {
			var v = data.timeDomain[i] * 0.00392156862745098;
			x += w;
			this._viewGraph.lineTo( x, v * maxHeight );
		}
	},


	/**
	 * Convert a decimal value to a hex string (two chars, no leading "0x").
	 * @param  {Number} x
	 * @return {String}
	 */
	decToHex: function( x ) {
		x = parseInt( x, 10 );

		if( isNaN( x ) ) {
			return '00';
		}

		x = ( x < 0 ) ? 0 : x;
		x = ( x > 255 ) ? 255 : x;

		var xMod = x & 15; // x % 16
		var first = this._HEX_CHARMAP.charAt( ( x - xMod ) * 0.0625 );
		var second = this._HEX_CHARMAP.charAt( xMod );

		return first + second;
	},


	/**
	 * Initialize.
	 */
	init: function() {
		var options = {
			view: document.getElementById( 'canvas' ),
			resolution: window.devicePixelRatio
		};

		this.renderer = PIXI.autoDetectRenderer( window.innerWidth, window.innerHeight, options );
		this.renderer.backgroundColor = 0x303030;

		this.ticker = PIXI.ticker.shared;
		this.ticker.autoStart = false;
		this.ticker.stop();

		this._view = new PIXI.Container();
		this._viewBackground = new PIXI.Graphics();
		this._viewBars = new PIXI.Graphics();

		this._viewGraph = new PIXI.Graphics();
		this._viewGraph.position.y = 60;

		this._viewInfo = new PIXI.Container();
		this._viewInfo.position.set( 10, 10 );

		this._viewFPS = new PIXI.Text( '', {
			fill: 0xFFFFFF,
			fontFamily: '"DejaVu Sans Mono", monospace',
			fontSize: 13
		} );

		this._viewInfo.addChild( this._viewFPS );

		this._view.interactive = false;
		this._view.interactiveChildren = false;

		this._view.addChild( this._viewBackground );
		this._view.addChild( this._viewBars );
		this._view.addChild( this._viewGraph );
		this._view.addChild( this._viewInfo );
	},


	/**
	 * Resize the renderer.
	 * @param {Number} w
	 * @param {Number} h
	 */
	resize: function( w, h ) {
		this.renderer.resize( w, h );
	},


	/**
	 * Convert RGB values to a hexadecimal value.
	 * @param  {Number} r
	 * @param  {Number} g
	 * @param  {Number} b
	 * @return {Number}
	 */
	rgbToHex: function( r, g, b ) {
		var str = '0x' + this.decToHex( r ) + this.decToHex( g ) + this.decToHex( b );

		return Number( str );
	},


	/**
	 * Start rendering.
	 */
	start: function() {
		if( this._frameRequest === null ) {
			this._frameRequest = requestAnimationFrame( this._draw );
		}
	},


	/**
	 * Stop rendering.
	 */
	stop: function() {
		cancelAnimationFrame( this._frameRequest );
		this._frameRequest = null;
	}


};
