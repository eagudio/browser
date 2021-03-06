class Domain {
    private _schema: any;

    private _path: string;
    private _options: any;
    private _router: any;
    private _routes: any[] = [];
    private _services: any = {};
    private _events: any = {};

    
    constructor(path: string, schema: any) {
        this._schema = schema;
        
        this._path = path;

        this._options = schema.options;

        this.initServices(this._schema.services);
        this.initEvents(this._schema.events);
    }

    create(server: any) {
        return new Promise<void>((resolve, reject) => {
            var express = require('express');

            this._router = express.Router(this.getRouterOptions());
    
            this._router.use('/sf', express.static(__dirname));
    
            this.initStatic(this._schema.static);
    
            this.onInitialize().then(() => {
                this.initRoutes(this._schema.routes);
    
                server.use(this._path, this._router);

                resolve();
            }).catch((error: string) => {
                console.error("an error occurred during create domain: " + error);

                reject();
            });
        });
    }

    get router() {
        return this._router;
    }

    get options() {
        return this._options;
    }

    onInitialize() {
        return new Promise<void>(async (resolve, reject) => {
            var routeEvents: RouteEvent[] = this._events["initialize"];

            if(routeEvents) {
                var models = this.initModels();

                for(var i=0; i<routeEvents.length; i++) {
                    await routeEvents[i].handle(this, null, null, models).catch((error: string) => {
                        return reject(error);
                    });
                }
            }
        
            resolve();
        });
    }

    initStatic(staticSchema: any) {
        if(!staticSchema) {
            return;
        }

        for(var key in staticSchema) {
            var express = require('express');
            var path = require('path');

            this._router.use(key, express.static(path.join(__dirname, "../../../", staticSchema[key])));
        }
    }

    initRoutes(routesSchema: any) {
        if(!routesSchema) {
            return;
        }

        for(var key in routesSchema) {
            var route = new Route(this, this._services, this._schema.models, key, routesSchema[key]);

            this._routes.push(route);
        }
    }

    initModels() {
        var models: any = {};

        for(var key in this._schema.models) {
            var Model = this._schema.models[key];

            models[key] = new Model();
        }

        return models;
    }

    initServices(servicesSchema: any) {
        if(!servicesSchema) {
            return;
        }

        for(var key in servicesSchema) {
            var Service = servicesSchema[key].handler;

            var service = new Service(servicesSchema[key]);

            this._services[key] = service;
        }
    }

    initEvents(eventsSchema: any) {
        for(var key in eventsSchema) {
            this._events[key] = [];

            this._events[key] = this.makeRouteEvents(eventsSchema[key]);
        }
    }

    makeRouteEvents(routeEvents: any[]) {
        var events = [];
        
        for(var i=0; i<routeEvents.length; i++) {
            events.push(this.makeRouteEvent(routeEvents[i]));
        }

        return events;
    }

    makeRouteEvent(routeEvent: any) {
        var eventType = Object.keys(routeEvent)[0];

        if(eventType == "model") {
            return new ModelEvent(routeEvent[eventType]);
        }

        return new NullEvent(eventType);
    }

    getRouterOptions() {
        if(this._schema && this._schema.router) {
            return this._schema.router;
        }

        return;
    }
}