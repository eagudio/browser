"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
/*!
 * Browser JavaScript Library v0.0.1
 * https://github.com/eagudio/browser
 *
 * Includes jquery.js
 * http://jquery.com/
 *
 * Includes require.js
 * http://requirejs.com/
 *
 * Released under the MIT license
 * https://github.com/eagudio/browser/blob/master/LICENSE
 *
 * Date: 2020-05-21T15:59Z
 */
var BrowserModule;
(function (BrowserModule) {
    class Browser {
        constructor() {
            this._home = "__body";
            this._body = "__body";
            this._instances = [];
            this._styles = [];
            this._pages = {
                __body: {
                    container: "__body",
                    view: null,
                    controllers: [],
                    models: {},
                    events: [],
                    htmlElement: $("body")
                }
            };
            this._surrogates = {};
            this._handlers = {};
            this._defaultLanguage = "it-IT";
            this._resources = {
                "it-IT": {}
            };
        }
        init(config, onInit) {
            try {
                var params = this.getUrlParams(window.location.href);
                var configLoader = new BrowserModule.ConfigLoader();
                configLoader.load(config, this);
                this.loadInstances().then(() => {
                    var _homepage = config.homepage;
                    if (params) {
                        if (params.page) {
                            this._home = params.page;
                            _homepage = this._home;
                        }
                    }
                    this.open(_homepage).then(() => {
                        onInit();
                    });
                }, () => {
                });
            }
            catch (ex) {
                console.error("an error occurred during init browser: " + ex);
            }
        }
        open(pageName, parameters) {
            return new Promise((resolve) => {
                var _pageName = this._body + "/" + pageName;
                var browserHandler = new BrowserModule.BrowserHandler(this);
                if (_pageName == this.body) {
                    return resolve(this._pages[_pageName]);
                }
                var page = this.pages[_pageName];
                if (!page) {
                    console.error("an error occurred during open page '" + pageName + "': page not found");
                    return resolve();
                }
                browserHandler.draw(page, parameters).then(() => {
                    resolve(page);
                }, (error) => {
                    console.error("an error occurred during open page '" + pageName + "'");
                    resolve();
                });
            });
        }
        refresh(pageName, parameters) {
            return new Promise((resolve) => {
                var _pageName = this._body + "/" + pageName;
                var browserHandler = new BrowserModule.BrowserHandler(this);
                if (_pageName == this.body) {
                    return resolve(this._pages[_pageName]);
                }
                var page = this.pages[_pageName];
                if (!page) {
                    console.error("an error occurred during refresh page '" + pageName + "': page not found");
                    return resolve();
                }
                browserHandler.draw(page, parameters).then(() => {
                    resolve(page);
                }, (error) => {
                    console.error("an error occurred during refresh page '" + pageName + "'");
                    resolve();
                });
            });
        }
        nextGroupStep(pageName, parameters) {
            return new Promise((resolve) => {
                var _pageName = this._body + "/" + pageName;
                var browserHandler = new BrowserModule.BrowserHandler(this);
                if (_pageName == this.body) {
                    return resolve(this._pages[_pageName]);
                }
                var page = this.pages[_pageName];
                if (!page) {
                    console.error("an error occurred during next step of page '" + pageName + "': page not found");
                    return resolve();
                }
                browserHandler.nextStep(page, parameters).then(() => {
                    resolve(page);
                }, (error) => {
                    console.error("an error occurred during next step of page '" + pageName + "'");
                    resolve();
                });
            });
        }
        previousGroupStep(pageName, parameters) {
            return new Promise((resolve) => {
                var _pageName = this._body + "/" + pageName;
                var browserHandler = new BrowserModule.BrowserHandler(this);
                if (_pageName == this.body) {
                    return resolve(this._pages[_pageName]);
                }
                var page = this.pages[_pageName];
                if (!page) {
                    console.error("an error occurred during next step of page '" + pageName + "': page not found");
                    return resolve();
                }
                browserHandler.previousStep(page, parameters).then(() => {
                    resolve(page);
                }, (error) => {
                    console.error("an error occurred during next step of page '" + pageName + "'");
                    resolve();
                });
            });
        }
        openGroupStep() {
            //TODO: open group step from index...
        }
        resetGroup() {
            //TODO: reset group index...
        }
        close(pageName, parameters) {
            return new Promise((resolve) => {
                var _pageName = this._body + "/" + pageName;
                var page = this.pages[_pageName];
                if (!page) {
                    page = this._surrogates[_pageName];
                    if (!page) {
                        console.error("an error occured during close page: page '" + pageName + "' not found");
                        return resolve();
                    }
                }
                var browserHandler = new BrowserModule.BrowserHandler(this);
                browserHandler.close(page, parameters).then(() => {
                    resolve();
                }, (error) => {
                    console.error("an error occurred during close page '" + pageName + "'");
                    resolve();
                });
            });
        }
        trigger(event, data) {
            var paths = [];
            if (this._handlers[event]) {
                paths = this._handlers[event];
            }
            for (var h = 0; h < paths.length; h++) {
                var handlerPage = this.pages[paths[h]];
                var eventObject = {
                    browser: {
                        event: "event",
                        handler: event,
                        data: data,
                        path: paths[h],
                        page: handlerPage
                    }
                };
                if (handlerPage.controller && handlerPage.controller[event]) {
                    handlerPage.controller[event](eventObject);
                }
            }
        }
        getURLPath() {
            var path = window.location.href;
            var paths = path.split("/");
            if (paths.length > 2) {
                var basePath = "/";
                for (var i = 3; i < paths.length; i++) {
                    var qualifyPaths = paths[i].split("?");
                    basePath += qualifyPaths[0];
                }
                return basePath;
            }
            return "/";
        }
        get instances() {
            return this._instances;
        }
        set resources(_resources) {
            this._resources = _resources;
        }
        get resources() {
            return this._resources;
        }
        get defaultResources() {
            return this._resources[this._defaultLanguage];
        }
        set styles(_styles) {
            this._styles = _styles;
        }
        get styles() {
            return this._styles;
        }
        get body() {
            return this._body;
        }
        get pages() {
            return this._pages;
        }
        get surrogates() {
            return this._surrogates;
        }
        get handlers() {
            return this._handlers;
        }
        addPage(pageName, disabled, action, pagePath, container, view, controllers, models, replace, append, group, unwind, key, events, parameters) {
            if (view) {
                this._instances.push("text!" + view);
            }
            if (controllers) {
                for (var i = 0; i < controllers.length; i++) {
                    this._instances.push(controllers[i]);
                }
                ;
            }
            if (models) {
                for (var modelKey in models) {
                    this._instances.push(models[modelKey]);
                }
            }
            var bodyRegexp = new RegExp("^(" + this.body + "/)");
            var pathContainer = container.replace(bodyRegexp, "");
            this._pages[pagePath] = new BrowserModule.Page(pageName, disabled, action, container, pathContainer + "/" + pageName, view ? "text!" + view : undefined, controllers, models, replace, append, group, unwind, key, events, parameters);
        }
        loadInstances() {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                var loader = new BrowserModule.Loader();
                loader.load(this._instances).then(() => {
                    try {
                        for (var i = 0; i < this._styles.length; i++) {
                            $('head').append(`<link rel="stylesheet" href="` + this._styles[i] + `.css" type="text/css" />`);
                        }
                        for (var key in this._resources) {
                            this._resources[key] = loader.getInstance(this._resources[key]);
                        }
                        for (var key in this._pages) {
                            if (this._pages[key].view) {
                                this._pages[key].view = loader.getInstance(this._pages[key].view);
                            }
                            var controllers = [];
                            if (this._pages[key].controllers && Array.isArray(this._pages[key].controllers)) {
                                controllers = this._pages[key].controllers.map((controller) => {
                                    return loader.getInstance(controller);
                                });
                            }
                            this._pages[key].controllers = controllers;
                            var models = null;
                            if (this._pages[key].models) {
                                models = {};
                                for (var modelKey in this._pages[key].models) {
                                    models[modelKey] = loader.getInstance(this._pages[key].models[modelKey]);
                                }
                            }
                            this._pages[key].models = models;
                        }
                        resolve();
                    }
                    catch (ex) {
                        console.error("load instances error: " + ex);
                        reject("load instances error: " + ex);
                    }
                }, (error) => {
                    console.error("load instances error");
                    reject("load instances error");
                });
            }));
        }
        getUrlParams(url) {
            var queryString = url.split("?");
            var query = "";
            if (queryString.length < 2) {
                return null;
            }
            query = queryString[1];
            var vars = query.split("&");
            var queryObject = {};
            for (var i = 0; i < vars.length; i++) {
                var pair = vars[i].split("=");
                var key = decodeURIComponent(pair[0]);
                var value = decodeURIComponent(pair[1]);
                if (typeof queryObject[key] === "undefined") {
                    queryObject[key] = decodeURIComponent(value);
                }
                else if (typeof queryObject[key] === "string") {
                    var arr = [queryObject[key], decodeURIComponent(value)];
                    queryObject[key] = arr;
                }
                else {
                    queryObject[key].push(decodeURIComponent(value));
                }
            }
            return queryObject;
        }
    }
    BrowserModule.Browser = Browser;
})(BrowserModule || (BrowserModule = {}));
window.browser = window.browser || new BrowserModule.Browser();
window.$b = window.$b || window.browser || new BrowserModule.Browser();
var BrowserModule;
(function (BrowserModule) {
    class BrowserHandler {
        constructor(_browser) {
            this._browser = _browser;
        }
        draw(page, parameters) {
            return new Promise((resolve, reject) => {
                this.drawBody(parameters).then(() => {
                    this.drawContainer(page, page.container, parameters).then((htmlContainerElement) => {
                        this.loadController(page, parameters).then((viewParameters) => {
                            page.htmlElement = this.renderView(page, viewParameters);
                            this.addEventsHandlers(page, page.htmlElement, viewParameters);
                            this.drawItems(page, viewParameters).then(() => {
                                this.addHtmlElement(htmlContainerElement, page);
                                this.showPage(page, viewParameters);
                                resolve(page.htmlElement);
                            }, (ex) => {
                                if (ex) {
                                    console.error("draw error");
                                    reject("draw error");
                                }
                                else {
                                    resolve($(``));
                                }
                            });
                        }, (ex) => {
                            if (ex) {
                                console.error("draw error");
                                reject("draw error");
                            }
                            else {
                                resolve($(``));
                            }
                        });
                    }, (ex) => {
                        if (ex) {
                            console.error("draw error");
                            reject("draw error");
                        }
                        else {
                            resolve($(``));
                        }
                    });
                }, (ex) => {
                    if (ex) {
                        console.error("draw error: " + ex);
                        reject("draw error: " + ex);
                    }
                    else {
                        resolve($(``));
                    }
                });
            });
        }
        redraw(page, parameters) {
            return new Promise((resolve, reject) => {
                this.drawContainer(page, page.container, parameters).then((htmlContainerElement) => {
                    this.reloadController(page, parameters).then((viewParameters) => {
                        var previousPageHtmlElement = page.htmlElement;
                        page.htmlElement = this.renderView(page, viewParameters);
                        this.addEventsHandlers(page, page.htmlElement, viewParameters);
                        this.drawItems(page, viewParameters).then(() => {
                            previousPageHtmlElement.replaceWith(page.htmlElement);
                            resolve(page.htmlElement);
                        }, (ex) => {
                            if (ex) {
                                console.error("redraw error");
                                reject("redraw error");
                            }
                            else {
                                resolve($(``));
                            }
                        });
                    }, (ex) => {
                        if (ex) {
                            console.error("redraw error");
                            reject("redraw error");
                        }
                        else {
                            resolve($(``));
                        }
                    });
                }, (ex) => {
                    if (ex) {
                        console.error("redraw error");
                        reject("redraw error");
                    }
                    else {
                        resolve($(``));
                    }
                });
            });
        }
        nextStep(page, parameters) {
            page.groupIndex = page.groupIndex + 1;
            if (page.groupIndex >= page.group.length) {
                page.groupIndex = page.group.length - 1;
            }
            return this.redraw(page, parameters);
        }
        previousStep(page, parameters) {
            page.groupIndex = page.groupIndex - 1;
            if (page.groupIndex < 0) {
                page.groupIndex = 0;
            }
            return this.redraw(page, parameters);
        }
        drawBody(parameters) {
            var body = this._browser.pages[this._browser.body];
            if (body.htmlElement) {
                return Promise.resolve(body.htmlElement);
            }
            return new Promise((resolve, reject) => {
                this.loadController(body, parameters).then((viewParameters) => __awaiter(this, void 0, void 0, function* () {
                    body.htmlElement = this.renderView(body, viewParameters);
                    resolve(body.htmlElement);
                }), (ex) => {
                    if (ex) {
                        console.error("draw body error");
                        reject("draw body error");
                    }
                    else {
                        resolve($(``));
                    }
                });
            });
        }
        drawContainer(page, containerName, parameters) {
            var container = this._browser.pages[containerName];
            if (!container) {
                console.error("container page '" + containerName + "' not found");
                return Promise.reject("container page '" + containerName + "' not found");
            }
            if (!container.htmlElement) {
                return this.drawParent(page, containerName, parameters);
            }
            return Promise.resolve(container.htmlElement);
        }
        drawItems(parentPage, parameters) {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                this.drawChildren(parentPage, parentPage.replace, parameters).then(() => {
                    return this.drawChildren(parentPage, parentPage.append, parameters);
                }, () => {
                    console.error("replace items error");
                    reject("replace items error");
                }).then(() => {
                    return this.drawChildren(parentPage, parentPage.group, parameters);
                }, () => {
                    console.error("append items error");
                    reject("append items error");
                }).then(() => {
                    return this.drawChildren(parentPage, parentPage.unwind, parameters);
                }, () => {
                    console.error("group items error");
                    reject("group items error");
                }).then(() => {
                    resolve();
                }, () => {
                    console.error("unwind items error");
                    reject("unwind items error");
                });
            }));
        }
        drawParent(page, pageName, parameters) {
            return new Promise((resolve, reject) => {
                if (pageName == this._browser.body) {
                    return resolve(this._browser.pages.__body.htmlElement);
                }
                var parentPage = this._browser.pages[pageName];
                if (!parentPage) {
                    console.error("page not found");
                    return reject("page not found");
                }
                this.drawContainer(page, parentPage.container, parameters).then((htmlContainerElement) => {
                    if (!page.models) {
                        page.models = parentPage.models;
                    }
                    this.loadController(parentPage, parameters).then((viewParameters) => __awaiter(this, void 0, void 0, function* () {
                        parentPage.htmlElement = this.renderView(parentPage, viewParameters);
                        this.addEventsHandlers(parentPage, htmlContainerElement, viewParameters);
                        this.addHtmlElement(htmlContainerElement, parentPage);
                        resolve(parentPage.htmlElement);
                    }), (ex) => {
                        if (ex) {
                            console.error("draw parent error");
                            reject("draw parent error");
                        }
                        else {
                            resolve($(``));
                        }
                    });
                });
            });
        }
        drawChildren(parent, children, parameters) {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                if (!children) {
                    return resolve();
                }
                for (var i = 0; i < children.length; i++) {
                    var childPageName = children[i];
                    var childPage = this._browser.pages[childPageName];
                    if (!childPage.models) {
                        childPage.models = parent.models;
                    }
                    if (childPage.action == "group") {
                        if (parent.groupIndex != i) {
                            continue;
                        }
                    }
                    if (childPage.disabled == true) {
                        continue;
                    }
                    yield this.loadController(childPage, parameters).then((viewParameters) => __awaiter(this, void 0, void 0, function* () {
                        if (childPage.action == "unwind") {
                            yield this.unwind(parent, childPageName, childPage, viewParameters).then(() => __awaiter(this, void 0, void 0, function* () {
                            }), (ex) => {
                                if (ex) {
                                    console.error("draw children error");
                                    return reject("draw children error");
                                }
                            });
                        }
                        else {
                            childPage.htmlElement = this.renderView(childPage, viewParameters);
                            this.addEventsHandlers(childPage, childPage.htmlElement, viewParameters);
                            this.addHtmlElement(parent.htmlElement, childPage);
                            yield this.drawItems(childPage, viewParameters).then(() => __awaiter(this, void 0, void 0, function* () {
                            }), (ex) => {
                                if (ex) {
                                    console.error("draw children error");
                                    return reject("draw children error");
                                }
                            });
                        }
                    }), (ex) => {
                        if (ex) {
                            console.error("draw children error");
                            return reject("draw children error");
                        }
                    });
                }
                resolve();
            }));
        }
        unwind(parent, pageName, page, parameters) {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                if (!Array.isArray(parameters)) {
                    console.error("unwind error page '" + pageName + "': controller must return an array");
                    return reject("unwind error page '" + pageName + "': controller must return an array");
                }
                //TODO: rimuovere i surrogati per liberare memoria e gli eventi!?
                for (var i = 0; i < parameters.length; i++) {
                    var surrogate = this.addSurrogate(pageName + "/" + page.name + "#" + i, page.name + "#" + i, page);
                    yield this.resolveUnwindItem(surrogate, parameters[i]).then((viewParameters) => __awaiter(this, void 0, void 0, function* () {
                        surrogate.htmlElement = this.renderView(page, viewParameters);
                        this.addEventsHandlers(surrogate, surrogate.htmlElement, viewParameters);
                        yield this.drawItems(surrogate, viewParameters).then(() => __awaiter(this, void 0, void 0, function* () {
                            this.addHtmlElement(parent.htmlElement, surrogate);
                        }), (ex) => {
                            if (ex) {
                                console.error("unwind error");
                                return reject("unwind error");
                            }
                        });
                    }), (ex) => {
                        if (ex) {
                            console.error("unwind error");
                            return reject("unwind error");
                        }
                    });
                }
                resolve();
            }));
        }
        addSurrogate(path, name, page) {
            var bodyRegexp = new RegExp("^(" + this._browser.body + "/)");
            var container = page.container.replace(bodyRegexp, "");
            var surrogate = {
                name: name,
                action: page.action,
                path: container + "/" + name,
                container: page.container,
                view: page.view,
                controllers: page.controllers,
                models: page.models,
                parameters: page.parameters,
                key: page.key,
                events: page.events,
                htmlElement: null,
                replace: this.createSurrogates(path, page.replace),
                append: this.createSurrogates(path, page.append),
                unwind: this.createSurrogates(path, page.unwind)
            };
            this._browser.pages[path] = surrogate;
            return surrogate;
        }
        createSurrogates(path, pagesPath) {
            var surrogates = [];
            for (var i = 0; i < pagesPath.length; i++) {
                var page = this._browser.pages[pagesPath[i]];
                surrogates.push(path + "/" + page.name);
                this.addSurrogate(path + "/" + page.name, page.name, page);
            }
            return surrogates;
        }
        removeSurrogates(prefixPagePath) {
            for (var key in this._browser.surrogates) {
                if (key.startsWith(prefixPagePath)) {
                    delete this._browser.surrogates[key];
                }
            }
        }
        loadController(page, parameters) {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                if (!page.controllers) {
                    return resolve(parameters);
                }
                var result = parameters;
                for (var i = 0; i < page.controllers.length; i++) {
                    yield page.controllers[i].load(page, result).then((_result) => __awaiter(this, void 0, void 0, function* () {
                        result = _result;
                    }), (ex) => {
                        if (ex) {
                            console.error("load controller error: " + ex);
                        }
                        reject(ex);
                    });
                }
                resolve(result);
            }));
        }
        reloadController(page, parameters) {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                if (!page.controllers) {
                    return resolve(parameters);
                }
                var result = parameters;
                for (var i = 0; i < page.controllers.length; i++) {
                    if (page.controllers[i].reload) {
                        yield page.controllers[i].reload(page, result).then((_result) => __awaiter(this, void 0, void 0, function* () {
                            result = _result;
                        }), (ex) => {
                            console.error("reload controller error: " + ex);
                            reject("reload controller error: " + ex);
                        });
                    }
                }
                resolve(result);
            }));
        }
        renderView(page, viewParameters) {
            if (page.view) {
                var html = this.resolveMarkup(page.view, {
                    data: viewParameters,
                    parameters: page.parameters,
                    resources: this._browser.defaultResources
                });
                return $(html);
            }
            return $();
        }
        showPage(page, parameters) {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                if (!page.controllers) {
                    return resolve(parameters);
                }
                var result = parameters;
                for (var i = 0; i < page.controllers.length; i++) {
                    if (page.controllers[i].show) {
                        yield page.controllers[i].show(page, result).then((_result) => __awaiter(this, void 0, void 0, function* () {
                            result = _result;
                        }), (ex) => {
                            if (ex) {
                                console.error("show page error: " + ex);
                            }
                            reject(ex);
                        });
                    }
                }
                resolve(result);
            }));
        }
        resolveMarkup(markup, context) {
            try {
                var markupRegex = /[<][%]([a-zA-z0-9.,;:\+\-\*><=!?|&"'(){}\/\s]{1,})[%][>]/m;
                var str = markup;
                var match = markupRegex.exec(str);
                while (match) {
                    var result = null;
                    var code = "(() => {" +
                        "result = " + match[1] + ";" +
                        "})()";
                    eval(code);
                    str = str.replace(match[0], result);
                    match = markupRegex.exec(str);
                }
                return str;
            }
            catch (ex) {
                console.error("resolve markup error: " + ex);
                return markup;
            }
        }
        resolveUnwindItem(page, parameters) {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                if (!page.controllers) {
                    return resolve(parameters);
                }
                var result = parameters;
                for (var i = 0; i < page.controllers.length; i++) {
                    if (page.controllers[i].unwind) {
                        yield page.controllers[i].unwind(page, result).then((_result) => __awaiter(this, void 0, void 0, function* () {
                            result = _result;
                        }), (ex) => {
                            console.error("resolve unwind item error: " + ex);
                            reject("resolve unwind item error: " + ex);
                        });
                    }
                }
                resolve(result);
            }));
        }
        addHtmlElement(container, page) {
            var pageName = page.name.split('#')[0];
            var browserTag = container.find("browser[" + pageName + "]");
            if (browserTag.length > 0) {
                //browserTag.parent().append(page.htmlElement);
                browserTag.before(page.htmlElement);
                return;
            }
            if (page.action == "replace") {
                container.html(page.htmlElement);
            }
            else if (page.action == "append") {
                container.append(page.htmlElement);
            }
            else if (page.action == "group") {
                container.html(page.htmlElement);
            }
            else if (page.action == "unwind") {
                container.append(page.htmlElement);
            }
        }
        addEventsHandlers(page, element, parameters) {
            if (!element) {
                return;
            }
            element.each((i, item) => {
                $.each(item.attributes, (i, attribute) => {
                    if (attribute.specified) {
                        if (attribute.name.startsWith("browser-")) {
                            var browserAttribute = attribute.name.split("browser-");
                            var event = browserAttribute[1];
                            var handlerList = [];
                            if (attribute.value) {
                                handlerList = attribute.value.split(",");
                            }
                            for (var n = 0; n < handlerList.length; n++) {
                                var handler = handlerList[n];
                                var paths = [];
                                if (this._browser.handlers[handler]) {
                                    paths = this._browser.handlers[handler];
                                }
                                for (var p = 0; p < paths.length; p++) {
                                    var handlerPage = this._browser.pages[paths[p]];
                                    for (var c = 0; c < handlerPage.controllers.length; c++) {
                                        if (handlerPage.controllers[c][handler]) {
                                            this.addEventHandler(handlerPage, page, paths[p], element, event, handlerPage.controllers[c][handler], parameters);
                                        }
                                    }
                                }
                            }
                        }
                        if (attribute.name == "href") {
                            if (attribute.value.startsWith("browser#")) {
                                var href = attribute.value;
                                var markup = href.split("#");
                                if (markup.length > 0) {
                                    var path = markup[1];
                                    element.on("click", (event) => {
                                        event.preventDefault();
                                        this._browser.open(path);
                                        return false;
                                    });
                                }
                            }
                        }
                    }
                });
            });
            var children = element.children();
            children.each((i, item) => {
                this.addEventsHandlers(page, $(item), parameters);
            });
        }
        addEventHandler(handlerPage, page, path, htmlElement, event, handler, data) {
            htmlElement.on(event, {
                event: event,
                handler: handler,
                data: data,
                path: path,
                page: page,
                target: handlerPage,
                htmlElement: htmlElement
            }, (event) => {
                var browserEventObject = event.data;
                //TODO: workaround: per gli elementi surrogati di unwind non si ha sempre disponibile l'htmlElement perchè in realtà viene passato l'oggetto originale (non il surrogato)
                browserEventObject.target = browserEventObject.target.htmlElement ? browserEventObject.target.htmlElement : browserEventObject.htmlElement;
                event.browser = browserEventObject;
                event.data = null;
                browserEventObject.handler(event);
            });
        }
        close(page, parameters) {
            return new Promise((resolve, reject) => {
                this.closeItems(page, parameters).then(() => {
                    this.closeController(page, parameters).then(() => {
                        if (page.disabled == true) {
                            page.htmlElement.remove();
                        }
                        resolve();
                    }, (ex) => {
                        console.error("close error");
                        reject("close error");
                    });
                }, (ex) => {
                    console.error("close error");
                    reject("close error");
                });
            });
        }
        closeController(page, parameters) {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                if (!page.controllers) {
                    return resolve(parameters);
                }
                var result = parameters;
                for (var i = 0; i < page.controllers.length; i++) {
                    if (page.controllers[i].close) {
                        yield page.controllers[i].close(page).then((_result) => {
                            result = _result;
                        }, (ex) => {
                            console.error("close controller error: " + ex);
                            return reject("close controller error" + ex);
                        });
                    }
                }
                resolve(result);
            }));
        }
        closeItems(page, parameters) {
            return new Promise((resolve, reject) => {
                this.closeChildren(page.replace, parameters).then(() => {
                    this.closeChildren(page.append, parameters).then(() => {
                        this.closeChildren(page.unwind, parameters).then(() => {
                            resolve();
                        }, (ex) => {
                            if (ex) {
                                console.error("close itmes error");
                                reject("close itmes error");
                            }
                            else {
                                resolve();
                            }
                        });
                    }, (ex) => {
                        if (ex) {
                            console.error("close itmes error");
                            reject("close itmes error");
                        }
                        else {
                            resolve();
                        }
                    });
                }, (ex) => {
                    if (ex) {
                        console.error("close itmes error");
                        reject("close itmes error");
                    }
                    else {
                        resolve();
                    }
                });
            });
        }
        closeChildren(children, parameters) {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                if (!children) {
                    return resolve();
                }
                for (var i = 0; i < children.length; i++) {
                    var childName = children[i];
                    var page = this._browser.pages[childName];
                    if (!page) {
                        page = this._browser.surrogates[childName];
                        if (!page) {
                            console.error("close children error: page '" + childName + "' not found");
                            return resolve();
                        }
                    }
                    yield this.closeItems(page, parameters).then(() => __awaiter(this, void 0, void 0, function* () {
                        this.closeController(page, parameters).then(() => {
                        }, (ex) => {
                            console.error("close children error");
                        });
                    }), (ex) => {
                        console.error("close children error");
                    });
                }
                resolve();
            }));
        }
    }
    BrowserModule.BrowserHandler = BrowserHandler;
})(BrowserModule || (BrowserModule = {}));
var BrowserModule;
(function (BrowserModule) {
    class ConfigLoader {
        load(config, browser) {
            var resources = config.resources;
            var styles = config.styles;
            var schema = config.schema;
            if (!schema) {
                throw "schema cannot be null or undefined";
            }
            if (!schema.body) {
                throw "schema body missing";
            }
            this.processResources(resources, browser);
            browser.styles = styles;
            var body = schema.body;
            if (body.view) {
                browser.pages.__body.htmlElement = null;
                browser.pages.__body.view = "text!" + body.view;
                browser.instances.push(browser.pages.__body.view);
            }
            if (body.controllers && Array.isArray(body.controllers)) {
                browser.pages.__body.controllers = body.controllers;
                for (var i = 0; i < body.controllers.length; i++) {
                    browser.instances.push(body.controllers[i]);
                }
            }
            if (body.models) {
                browser.pages.__body.models = body.models;
                for (var modelKey in body.models) {
                    browser.instances.push(body.models[modelKey]);
                }
            }
            browser.pages.__body.events = body.events;
            this.addHandlers(browser.body, browser);
            this.processSchema("append", browser.body, body.append, browser);
            this.processSchema("replace", browser.body, body.replace, browser);
            this.processSchema("group", browser.body, body.group, browser);
            this.processSchema("unwind", browser.body, body.unwind, browser);
        }
        processResources(resources, browser) {
            browser.resources = resources;
            for (var key in resources) {
                browser.instances.push(resources[key]);
            }
        }
        addHandlers(pagePath, browser) {
            var _page = browser.pages[pagePath];
            if (_page.events) {
                for (var h = 0; h < _page.events.length; h++) {
                    if (!browser.handlers[_page.events[h]]) {
                        browser.handlers[_page.events[h]] = [];
                    }
                    browser.handlers[_page.events[h]].push(pagePath);
                }
            }
        }
        processSchema(action, containerName, schema, browser) {
            if (!action) {
                return;
            }
            if (!containerName) {
                throw "container missed";
            }
            if (schema == null) {
                return;
            }
            for (var i = 0; i < schema.length; i++) {
                var pageName = Object.keys(schema[i])[0];
                var page = schema[i][pageName];
                var disabled = pageName.startsWith("!");
                if (disabled == true) {
                    pageName = pageName.substring(1);
                }
                var pagePath = containerName + "/" + pageName;
                var replaceChildren = this.processChildrenSchema(pagePath, page.replace);
                var appendChildren = this.processChildrenSchema(pagePath, page.append);
                var groupChildren = this.processChildrenSchema(pagePath, page.group);
                var unwindChildren = this.processChildrenSchema(pagePath, page.unwind);
                browser.addPage(pageName, disabled, action, pagePath, containerName, page.view, page.controllers, page.models, replaceChildren, appendChildren, groupChildren, unwindChildren, page.key, page.events, page.parameters);
                this.processSchema("replace", pagePath, page.replace, browser);
                this.processSchema("append", pagePath, page.append, browser);
                this.processSchema("group", pagePath, page.group, browser);
                this.processSchema("unwind", pagePath, page.unwind, browser);
                this.addHandlers(pagePath, browser);
            }
        }
        processChildrenSchema(parentPagePath, childrenSchema) {
            var children = [];
            if (!childrenSchema) {
                return children;
            }
            for (var i = 0; i < childrenSchema.length; i++) {
                var childPageName = Object.keys(childrenSchema[i])[0];
                var disabled = childPageName.startsWith("!");
                if (disabled == true) {
                    childPageName = childPageName.substring(1);
                }
                var childPagePath = parentPagePath + "/" + childPageName;
                children.push(childPagePath);
            }
            return children;
        }
    }
    BrowserModule.ConfigLoader = ConfigLoader;
})(BrowserModule || (BrowserModule = {}));
var BrowserModule;
(function (BrowserModule) {
    class Loader {
        load(paths) {
            return new Promise((resolve, reject) => {
                require(paths, function () {
                    resolve();
                }, function (error) {
                    console.error("load module error: " + error);
                    reject("load module error: " + error);
                });
            });
        }
        getInstance(path) {
            return require(path);
        }
    }
    BrowserModule.Loader = Loader;
})(BrowserModule || (BrowserModule = {}));
var BrowserModule;
(function (BrowserModule) {
    class Page {
        constructor(name, disabled, action, container, path, view, controllers, models, replace, append, group, unwind, key, events, parameters) {
            this._disabled = false;
            this._groupIndex = 0;
            this._name = name;
            this._disabled = disabled;
            this._action = action;
            this._container = container;
            this._path = path;
            this._view = view;
            this._controllers = controllers,
                this._models = models,
                this._replace = replace,
                this._append = append,
                this._group = group,
                this._unwind = unwind,
                this._key = key,
                this._events = events,
                this._parameters = parameters;
        }
        get name() {
            return this._name;
        }
        set name(value) {
            this._name = value;
        }
        get disabled() {
            return this._disabled;
        }
        set disabled(value) {
            this._disabled = value;
        }
        get action() {
            return this._action;
        }
        set action(value) {
            this._action = value;
        }
        get container() {
            return this._container;
        }
        set container(value) {
            this._container = value;
        }
        get path() {
            return this._path;
        }
        set path(value) {
            this._path = value;
        }
        get view() {
            return this._view;
        }
        set view(value) {
            this._view = value;
        }
        get controllers() {
            return this._controllers;
        }
        set controllers(value) {
            this._controllers = value;
        }
        get models() {
            return this._models;
        }
        set models(value) {
            this._models = value;
        }
        get replace() {
            return this._replace;
        }
        set replace(value) {
            this._replace = value;
        }
        get append() {
            return this._append;
        }
        set append(value) {
            this._append = value;
        }
        get group() {
            return this._group;
        }
        set group(value) {
            this._group = value;
        }
        get unwind() {
            return this._unwind;
        }
        set unwind(value) {
            this._unwind = value;
        }
        get key() {
            return this._key;
        }
        set key(value) {
            this._key = value;
        }
        get events() {
            return this._events;
        }
        set events(value) {
            this._events = value;
        }
        get parameters() {
            return this._parameters;
        }
        set parameters(value) {
            this._parameters = value;
        }
        get htmlElement() {
            return this._htmlElement;
        }
        set htmlElement(value) {
            this._htmlElement = value;
        }
        get groupIndex() {
            return this._groupIndex;
        }
        set groupIndex(value) {
            this._groupIndex = value;
        }
    }
    BrowserModule.Page = Page;
})(BrowserModule || (BrowserModule = {}));
//# sourceMappingURL=browser.js.map