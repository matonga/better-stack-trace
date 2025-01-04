function cleanup (stack) {
	return stack.replace (/^    at .*\/better-stack-trace\.js:[0-9]+:[0-9]+\)\n/gm, '');
}

const _setTimeout = global.setTimeout;
global.setTimeout = function setTimeout (callback, delay = 1, ...args) {
	let context = { };
	Error.captureStackTrace (context);
	return _setTimeout ((...args) => {
		try {
			callback (...args);
		} catch (error) {
			error.stack = cleanup (error.stack + '\nCaused by: setTimeout\n' + context.stack.split ('\n').slice (1).join ('\n'));
			throw error;
		}
	}, delay, ...args);
};

const _setInterval = global.setInterval;
global.setInterval = function setInterval (callback, delay = 1, ...args) {
	let context = { };
	Error.captureStackTrace (context);
	return _setInterval ((...args) => {
		try {
			callback (...args);
		} catch (error) {
			error.stack = cleanup (error.stack + '\nCaused by: setInterval\n' + context.stack.split ('\n').slice (1).join ('\n'));
			throw error;
		}
	}, delay, ...args);
};

const _setImmediate = global.setImmediate;
global.setImmediate = function setImmediate (callback, ...args) {
	let context = { };
	Error.captureStackTrace (context);
	return _setImmediate ((...args) => {
		try {
			callback (...args);
		} catch (error) {
			error.stack = cleanup (error.stack + '\nCaused by: setImmediate\n' + context.stack.split ('\n').slice (1).join ('\n'));
			throw error;
		}
	}, ...args);
};

const { EventEmitter } = require ('events');
const _addListener = EventEmitter.prototype.addListener;
const _removeListener = EventEmitter.prototype.removeListener;
EventEmitter.prototype.addListener = function (eventName, listener) {
	let context = { };
	Error.captureStackTrace (context);
	let betterListener = (...args) => {
		try {
			listener.call (this, ...args);
		} catch (error) {
			error.stack = cleanup (error.stack + '\nCaused by: addListener\n' + context.stack.split ('\n').slice (1).join ('\n'));
			throw error;
		}
	};
	if (!this._betterListenerMap) {
		this._betterListenerMap = { };
	}
	if (!(eventName in this._betterListenerMap)) {
		this._betterListenerMap[eventName] = [ ];
	}
	this._betterListenerMap[eventName].push ({ listener, betterListener });
	return _addListener.call (this, eventName, betterListener);
};
EventEmitter.prototype.on = EventEmitter.prototype.addListener;
EventEmitter.prototype.removeListener = function (eventName, listener) {
	let entry = this._betterListenerMap?.[eventName]?.find (entry => entry.listener == listener);
	if (!entry) {
		return this;
	}
	return _removeListener.call (this, eventName, entry.betterListener);
};
EventEmitter.prototype.off = EventEmitter.prototype.removeListener;
