var express = require('express');
methods = require('methods');
lingo = require('lingo');
multipart = require('connect-multiparty');
app = express.application;
en = lingo.en;

var orderedActions = ['validate', 'index', 'search', 'new', 'patch', 'create', 'upload', 'show', 'edit', 'update', 'destroys', 'destroy'];


module.exports = Resource;

function Resource(name, actions, app) {
    this.name = name;
    this.app = app;
    this.routes = {};
    actions = actions || {};
    this.base = actions.base || '/';
    if ('/' != this.base[this.base.length - 1]) this.base += '/';
    this.format = actions.format;
    this.id = actions.id || this.defaultId;
    this.id = _.replaceAll(this.id, '-', '');
    this.param = ':' + this.id;

    for (var i = 0; i < orderedActions.length; ++i) {
        var key = orderedActions[i];
        if (actions[key]) this.mapDefaultAction(key, actions[key]);
    }

    if (actions.load) this.load(actions.load);
};

Resource.prototype.load = function (fn) {
    var self = this, id = this.id;

    this.loadFunction = fn;
    this.app.param(this.id, function (req, res, next) {
        function callback(err, obj) {
            if (err) return next(err);
            // route handler
            if (null == obj) return res.send(404);
            req[id] = obj;
            next();
        };

        // Maintain backward compatibility
        if (2 == fn.length) {
            fn(req.params[id], callback);
        } else {
            fn(req, req.params[id], callback);
        }
    });

    return this;
};

Resource.prototype.__defineGetter__('defaultId', function () {
    return this.name ? en.singularize(this.name.split('/').pop().replace('-', '')) : 'id';
});

Resource.prototype.map = function (method, path, fn) {
    var self = this, orig = path;

    if (method instanceof Resource) return this.add(method);
    if ('function' == typeof path) fn = path, path = '';
    if ('object' == typeof path) fn = path, path = '';
    if ('/' == path[0]) path = path.substr(1);
    else path = path ? this.param + '/' + path : this.param;
    method = method.toLowerCase();

    var route = this.base + (this.name || '');
    if (this.name && path) route += '/';
    route += path;
    route += '.:format?';


    (this.routes[method] = this.routes[method] || {})[route] = {method: method, path: route, orig: orig, fn: fn};

    this.app[method](route, function (req, res, next) {
        req.format = req.params.format || req.format || self.format;
        if (req.format) res.type(req.format);
        if ('object' == typeof fn) {
            if (fn[req.format]) {
                fn[req.format](req, res, next);
            } else {
                res.format(fn);
            }
        } else {
            fn(req, res, next);
        }
    });

    return this;
};


Resource.prototype.add = function (resource) {
    var app = this.app, routes, route;

    resource.base = this.base + (this.name ? this.name + '/' : '') + this.param + '/';

    for (var method in resource.routes) {
        routes = resource.routes[method];
        for (var key in routes) {
            route = routes[key];
            delete routes[key];
            if (method == 'del') method = 'delete';
            app.routes[method].forEach(function (route, i) {
                if (route.path == key) {
                    app.routes[method].splice(i, 1);
                }
            })
            resource.map(route.method, route.orig, route.fn);
        }
    }

    return this;
};


Resource.prototype.mapDefaultAction = function (key, fn) {
    switch (key) {
        case 'validate':
            this.get('/validate', fn);
            break;
        case 'index':
            this.get('/', fn);
            break;
        case 'search':
            this.get('/search', fn);
            break;
        case 'new':
            this.get('/new', fn);
            break;
        case 'create':
            this.post('/', fn);
            break;
        case 'upload':
            this.post('/upload', fn);
            break;
        case 'show':
            this.get(fn);
            break;
        case 'edit':
            this.get('edit', fn);
            break;
        case 'update':
            this.put(fn);
            break;
        case 'patch':
            this.patch(fn);
            break;
        case 'destroy':
            this.delete(fn);
            break;
        case 'destroys':
            this.delete('/all', fn);
            break;
    }
};

methods.concat(['del', 'all']).forEach(function (method) {
    Resource.prototype[method] = function (path, fn) {
        if ('function' == typeof path || 'object' == typeof path) fn = path, path = '';
        this.map(method, path, fn);
        return this;
    }
});

app.resource = function (name, actions, opts) {
    var options = actions || {};
    if ('object' == typeof name) actions = name, name = null;
    if (options.id) actions.id = options.id.replace('-', '');
    this.resources = this.resources || {};
    if (!actions) return this.resources[name] || new Resource(name, null, this);
    for (var key in opts) options[key] = opts[key];
    var res = this.resources[_.replaceAll(name, '-', '')] = new Resource(name, actions, this);
    return res;
};
