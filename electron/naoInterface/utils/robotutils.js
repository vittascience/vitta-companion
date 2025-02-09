

const io_v0_9 = require('socket.io-client-v0.9')
//var _socket = io_v0_9.connect('http://192.168.10.126', { resource: 'libs/qimessaging/1.0/socket.io', transports: ['xhr-polling'] });

function QiSession(host, resource) {
	/*! https://github.com/warpdesign/deferred-js / Copyright 2012 (C) Nicolas Ramz MIT Licensed */
	var Deferred = (function () {
		function isArray(arr) {
			return '[object Array]' === Object.prototype.toString.call(arr);
		}
		function foreach(arr, handler) {
			if (isArray(arr)) for (var i = 0; i < arr.length; i++) handler(arr[i]);
			else handler(arr);
		}
		function D(fn) {
			var status = 'pending',
				doneFuncs = [],
				failFuncs = [],
				progressFuncs = [],
				resultArgs = null,
				promise = {
					done: function () {
						for (var i = 0; i < arguments.length; i++)
							if (arguments[i])
								if (isArray(arguments[i])) for (var arr = arguments[i], j = 0; j < arr.length; j++) 'resolved' === status && arr[j].apply(this, resultArgs), doneFuncs.push(arr[j]);
								else 'resolved' === status && arguments[i].apply(this, resultArgs), doneFuncs.push(arguments[i]);
						return this;
					},
					fail: function () {
						for (var i = 0; i < arguments.length; i++)
							if (arguments[i])
								if (isArray(arguments[i])) for (var arr = arguments[i], j = 0; j < arr.length; j++) 'rejected' === status && arr[j].apply(this, resultArgs), failFuncs.push(arr[j]);
								else 'rejected' === status && arguments[i].apply(this, resultArgs), failFuncs.push(arguments[i]);
						return this;
					},
					always: function () {
						return this.done.apply(this, arguments).fail.apply(this, arguments);
					},
					progress: function () {
						for (var i = 0; i < arguments.length; i++)
							if (arguments[i])
								if (isArray(arguments[i])) for (var arr = arguments[i], j = 0; j < arr.length; j++) 'pending' === status && progressFuncs.push(arr[j]);
								else 'pending' === status && progressFuncs.push(arguments[i]);
						return this;
					},
					_then: function () {
						arguments.length > 1 && arguments[1] && this.fail(arguments[1]), arguments.length > 0 && arguments[0] && this.done(arguments[0]), arguments.length > 2 && arguments[2] && this.progress(arguments[2]);
					},
					promise: function (obj) {
						if (null == obj) return promise;
						for (var i in promise) obj[i] = promise[i];
						return obj;
					},
					state: function () {
						return status;
					},
					debug: function () {
						console.log('[debug]', doneFuncs, failFuncs, status);
					},
					isRejected: function () {
						return 'rejected' === status;
					},
					isResolved: function () {
						return 'resolved' === status;
					},
					then: function (done, fail) {
						return D(function (def) {
							foreach(done, function (func) {
								'function' == typeof func
									? deferred.done(function () {
											var returnval = func.apply(this, arguments);
											returnval && 'function' == typeof returnval ? returnval.promise()._then(def.resolve, def.reject, def.notify) : def.resolve(returnval);
									  })
									: deferred.done(def.resolve);
							}),
								foreach(fail, function (func) {
									'function' == typeof func
										? deferred.fail(function () {
												var returnval = func.apply(this, arguments);
												returnval && 'function' == typeof returnval ? returnval.promise()._then(def.resolve, def.reject, def.notify) : def.reject(returnval);
										  })
										: deferred.fail(def.reject);
								});
						}).promise();
					},
				},
				deferred = {
					resolveWith: function (context) {
						if ('pending' === status) {
							status = 'resolved';
							for (var args = (resultArgs = arguments.length > 1 ? arguments[1] : []), i = 0; i < doneFuncs.length; i++) doneFuncs[i].apply(context, args);
						}
						return this;
					},
					pipe: function () {
						return then(arguments);
					},
					rejectWith: function (context) {
						if ('pending' === status) {
							status = 'rejected';
							for (var args = (resultArgs = arguments.length > 1 ? arguments[1] : []), i = 0; i < failFuncs.length; i++) failFuncs[i].apply(context, args);
						}
						return this;
					},
					notifyWith: function (context) {
						if ('pending' === status) for (var args = (resultArgs = arguments.length > 1 ? arguments[1] : []), i = 0; i < progressFuncs.length; i++) progressFuncs[i].apply(context, args);
						return this;
					},
					resolve: function () {
						return this.resolveWith(this, arguments);
					},
					reject: function () {
						return this.rejectWith(this, arguments);
					},
					notify: function () {
						return this.notifyWith(this, arguments);
					},
				},
				obj = promise.promise(deferred);
			return fn && fn.apply(obj, [obj]), obj;
		}
		D.when = function () {
			if (arguments.length < 2) {
				var obj = arguments.length ? arguments[0] : void 0;
				return obj && 'function' == typeof obj.isResolved && 'function' == typeof obj.isRejected ? obj.promise() : D().resolve(obj).promise();
			}
			return (function (args) {
				for (var df = D(), size = args.length, done = 0, rp = new Array(size), i = 0; i < args.length; i++)
					!(function (j) {
						var obj = null;
						args[j].done
							? args[j]
									.done(function () {
										(rp[j] = arguments.length < 2 ? arguments[0] : arguments), ++done == size && df.resolve.apply(df, rp);
									})
									.fail(function () {
										df.reject(arguments);
									})
							: ((obj = args[j]),
							  (args[j] = new Deferred()),
							  args[j]
									.done(function () {
										(rp[j] = arguments.length < 2 ? arguments[0] : arguments), ++done == size && df.resolve.apply(df, rp);
									})
									.fail(function () {
										df.reject(arguments);
									})
									.resolve(obj));
					})(i);
				return df.promise();
			})(arguments);
		};
		return D;
	})();

	// if (host == undefined) host = window.location.host;
	// if (resource == undefined) resource = 'libs/qimessaging/1.0/socket.io';
	// if (host.substring(0, 7) != 'http://') host = 'http://' + host;
	var _socket = null;
	_socket = io_v0_9.connect(`http://${host}`, { resource: 'libs/qimessaging/1.0/socket.io', transports: ['xhr-polling'], reconnect: false, 'force new connection': true });
	var _dfd = new Array();
	var _sigs = new Array();
	var _idm = 0;

	_socket.on('reply', function (data) {
		// console.log("reply", data);
		var idm = data['idm'];

		if (data['result'] != null && data['result']['metaobject'] != undefined) {
			var o = new Object();
			o.__MetaObject = data['result']['metaobject'];
			var pyobj = data['result']['pyobject'];
			_sigs[pyobj] = new Array();

			var methods = o.__MetaObject['methods'];
			for (var i in methods) {
				var methodName = methods[i]['name'];
				o[methodName] = createMetaCall(pyobj, methodName);
			}

			var signals = o.__MetaObject['signals'];
			for (var i in signals) {
				var signalName = signals[i]['name'];
				o[signalName] = createMetaSignal(pyobj, signalName);
			}

			_dfd[idm].resolve(o);
		} else {
			if (_dfd[idm].__cbi != undefined) {
				var cbi = _dfd[idm].__cbi;
				_sigs[cbi['obj']][cbi['signal']][data['result']] = cbi['cb'];
			}
			_dfd[idm].resolve(data['result']);
		}
		delete _dfd[idm];
	});

	_socket.on('error', function (data) {
		if (data['idm'] != undefined) {
			_dfd[data['idm']].reject(data['result']);
			delete _dfd[data['idm']];
		}
	});

	_socket.on('signal', function (data) {
		var res = data['result'];
		var callback = _sigs[res['obj']][res['signal']][res['link']];
		if (callback != undefined) {
			callback.apply(this, res['data']);
		}
	});

	_socket.on('disconnect', function (data) {
		console.log('disconnected');
		try {
			for (var idm in _dfd) {
				_dfd[idm].reject('Call ' + idm + ' canceled: disconnected');
				delete _dfd[idm];
			}
		} catch (error) {
			console.error("Error disconnecting socket", error);
		}
	});

	_socket.on('connect', function (data) {
		console.log('connected');
	});

	function createMetaCall(obj, method, data) {
		return function () {
			var idm = ++_idm;
			var args = Array.prototype.slice.call(arguments, 0);
			_dfd[idm] = new Deferred();
			if (method == 'registerEvent') {
				_dfd[idm].__cbi = data;
			}
            // console.log('call', { idm: idm, params: { obj: obj, method: method, args: args } });
			_socket.emit('call', { idm: idm, params: { obj: obj, method: method, args: args } });

			return _dfd[idm].promise();
		};
	}

	function createMetaSignal(obj, signal) {
		var s = new Object();
		_sigs[obj][signal] = new Array();
		s.connect = function (cb) {
			return createMetaCall(obj, 'registerEvent', { obj: obj, signal: signal, cb: cb })(signal);
		};
		s.disconnect = function (l) {
			delete _sigs[obj][signal][l];
			return createMetaCall(obj, 'unregisterEvent')(signal, l);
		};
		return s;
	}

	this.service = createMetaCall('ServiceDirectory', 'service');
	// console.log("socket in robotUtils", _socket);
	this.socket = function () {
		return _socket;
	};
	this.disconnect = async function () {
		// console.log("test socket", _socket);
		try {
			
			console.log("Disconnecting socket...");

			await _socket.socket.disconnect();
			_socket.removeAllListeners('connect');
			_socket.removeAllListeners('disconnect');
			_socket.removeAllListeners('reply');
			_socket.removeAllListeners('error');
			_socket.removeAllListeners('signal');

			_socket = null;
			console.log("Socket reset successfully.");
			return;
		} catch (error) {
			console.error("Error disconnecting Nao", error);
		}
	};
}

/*
 * robotutils.qim1.js version 0.2
 *
 * A utility library for naoqi; requires jQuery.
 *
 * This library is a wrapper over qimessaging.js. Some advantages:
 *  - debugging and iterating are made easier by support for a
 *    ?robot=<my-robots-ip> query parameter in the URL, that allows
 *    you to open a local file and connect it to a remote robot.
 *  - there is some syntactic sugar over common calls that
 *    allows you to keep your logic simple without too much nesting
 *
 * You can of course directly use qimessaging.js instead.
 *
 * This uses qimessaging 1.0 (qimessaging 2 is not available on NAOqi
 * 2.1, which is on NAO)
 *
 * See the method documentations below for sample usage.
 *
 * Copyright Aldebaran Robotics
 * Authors: ekroeger@aldebaran.com, jjeannin@aldebaran.com
 */

class RobotUtilsNao {
    constructor() {
        this.session = null;
        this.robotIp = null;
        this.pendingConnectionCallbacks = [];
    }

    // Méthode publique pour obtenir les services Naoqi
    onServices(servicesCallback, errorCallback, host) {
        this.robotIp = host;
        this.connect((session) => {
            // const wantedServices = this.getParamNames(servicesCallback);
            const wantedServices = ["ALAudioRecorder", "ALDiagnosis", "ALLeds", "ALTextToSpeech", "ALAnimatedSpeech", "ALRobotPosture", "ALMotion", "ALSonar", "ALAutonomousLife", "ALBehaviorManager", "ALBattery", "ALVideoDevice", "ALMemory", "ALSystem"];
            let pendingServices = wantedServices.length;
            const services = new Array(wantedServices.length);
            
            wantedServices.forEach((serviceName, i) => {
                session.service(serviceName)
                    .done((service) => {
                        services[i] = service;
                        pendingServices -= 1;
                        if (pendingServices === 0) {
                            servicesCallback(...services);
                        }
                    })
                    .fail(() => {
                        const reason = `Failed getting a NaoQi Module: ${serviceName}`;
                        console.log(reason);
                        if (errorCallback) {
                            errorCallback(reason);
                        }
                    });
            });

            this.pendingConnectionCallbacks = [];
        }, errorCallback);
    }

    // Alias pour onServices quand il n'y a qu'un seul service
    onService(servicesCallback, errorCallback, host) {
        return this.onServices(servicesCallback, errorCallback, host);
    }

    // Connexion à la session Naoqi
    connect(connectedCallback, failureCallback) {
        if (this.session) {
            console.log("here we are");
        } else if (this.pendingConnectionCallbacks.length > 0) {
            console.log("here we fall");
            this.pendingConnectionCallbacks.push(connectedCallback);
            return;
        } else {
            this.pendingConnectionCallbacks.push(connectedCallback);
        }

        const robotlibs = this.robotIp ? `http://${this.robotIp}/libs/` : '/libs/';
        const qimAddress = this.robotIp ? `${this.robotIp}:80` : null;

        const onConnected = () => {
            this.pendingConnectionCallbacks.forEach(cb => cb(this.session));
        };

        const onDisconnected = () => {
            console.log("Disconnected from robot");
        };

        this.session = new QiSession(this.robotIp);

        this.session.socket().on('connect', onConnected);
        this.session.socket().on('disconnect', onDisconnected);
    }

    // Méthode pour s'abonner aux événements ALMemory
    subscribeToALMemoryEvent(ALMemory, event, eventCallback, subscribeDoneCallback) {
		const evt = new MemoryEventSubscription(event);

		ALMemory.subscriber(event).then((sub) => {
			evt.setSubscriber(sub);
			sub.signal.connect(eventCallback).then((id) => {
				evt.setId(id);
				if (subscribeDoneCallback) subscribeDoneCallback(id);
			});
		}, this.onALMemoryError);
        // });
        return evt;
    }

    // Fonction interne pour obtenir les paramètres d'une fonction
    getParamNames(func) {
        const fnStr = func.toString().replace(/((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg, '');
        const result = fnStr.slice(fnStr.indexOf('(') + 1, fnStr.indexOf(')')).match(/([^\s,]+)/g);
        return result === null ? [] : result;
    }

    // Fonction de gestion des erreurs ALMemory
    onALMemoryError(errMsg) {
        console.log("ALMemory error: " + errMsg);
    }
}

// Abonnement à ALMemory
class MemoryEventSubscription {
    constructor(event) {
        this._event = event;
        this._internalId = null;
        this._sub = null;
        this._unsubscribe = false;
    }

    setId(id) {
        this._internalId = id;
        if (this._unsubscribe) this.unsubscribe(this._unsubscribeCallback);
    }

    setSubscriber(sub) {
        this._sub = sub;
        if (this._unsubscribe) this.unsubscribe(this._unsubscribeCallback);
    }

    unsubscribe(unsubscribeDoneCallback) {
        if (this._internalId !== null && this._sub !== null) {
            this._sub.signal.disconnect(this._internalId).then(() => {
                if (unsubscribeDoneCallback) unsubscribeDoneCallback();
            }).fail(this.onALMemoryError);
        } else {
            this._unsubscribe = true;
            this._unsubscribeCallback = unsubscribeDoneCallback;
        }
    }
}

// Exporter une instance de la classe
// const RobotUtilsNao = new RobotUtils();
export default RobotUtilsNao;
