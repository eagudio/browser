module SinglefinModule {
    export class Binding {
        private _proxyMap: any = {};

        bind(singlefin: Singlefin, page: Page, element: any, pageData: any, models: any) {
            if(!element) {
				return;
            }

            var dataProxy: DataProxy = singlefin.modelProxy;
            
            if(!dataProxy) {
				return;
            }

            ProxyHandlerMap.registerPage(page.path);
            
            this.watchHtmlElements(singlefin, page, element, models, dataProxy.data, pageData);
            this.updateHtmlElements(singlefin, page, element, models, dataProxy.data);
        }

        watchHtmlElements(singlefin: Singlefin, page: Page, element: any,  models: any, data: any, pageData: any) {
            this.watchHtmlElement(singlefin, page, element, models, data, pageData);

            var children = element.find("[model-value]");

            for(var i=0; i<children.length; i++) {
                var child = $(children[i]);

                this.watchHtmlElement(singlefin, page, child, models, data, pageData);
            }
        }

        watchHtmlElement(singlefin: Singlefin, page: Page, element: any, models: any, data: any, pageData: any) {
            var modelValue = element.attr("model-value");
            var valuePath = modelValue;
            var pageModels = page.models;
            var model = null;

            var hasModelValueEvent = element.attr("has-model-watching");

            if(typeof hasModelValueEvent !== typeof undefined && hasModelValueEvent !== false) {
                return;
            }

            element.attr("has-model-watching", "");

            if(pageModels) {
                if(pageModels[modelValue]) {
                    valuePath = pageModels[modelValue].binding;
                    model = pageModels[modelValue];
                }
            }

            if(models) {
                if(models[modelValue]) {
                    valuePath = models[modelValue].binding;
                    model = models[modelValue];
                }
            }

            if(valuePath) {
                var elementBinding: ElementBinding = this.makeBinding(element, "value");

                console.log(data);
                elementBinding.watch(singlefin, page, model, valuePath, data, pageData);
            }
        }

        updateHtmlElements(singlefin: Singlefin, page: Page, element: any, models: any, data: any) {
            if(!element) {
				return;
            }

            var hasModelValueEvent = element.attr("has-model-updating");

            if(typeof hasModelValueEvent !== typeof undefined && hasModelValueEvent !== false) {
                return;
            }

            element.attr("has-model-updating", "");

            var pageModels = page.models;
            
            element.each((i: number, item: any) => {
				$.each(item.attributes, (i: number, attribute: any) => {
					if(attribute.specified) {
						if(!attribute.name.startsWith("model-class") && attribute.name.startsWith("model-")) {
                            var onAttribute = attribute.name.split("model-");
                            var elementAttributeName = onAttribute[1];
                            var originalValuePath = attribute.value;
                            var valuePath = originalValuePath;

                            if(pageModels) {
                                if(pageModels[originalValuePath]) {
                                    valuePath = pageModels[originalValuePath].binding;
                                }
                            }
                
                            if(models) {
                                if(models[originalValuePath]) {
                                    valuePath = models[originalValuePath].binding;
                                }
                            }

                            if(valuePath) {
                                var proxyPath = Runtime.getParentPath(valuePath);
                                var object = Runtime.getParentInstance(data, valuePath);
                                var property = Runtime.getPropertyName(valuePath);

                                var proxyHandler = ProxyHandlerMap.newProxy(proxyPath, object);
                                Runtime.setProperty(proxyPath, data, proxyHandler.proxy);
                                console.log(data);

                                var elementBinding: ElementBinding = this.makeBinding(element, "value");
                                ProxyHandlerMap.addElementBinding(page.path, proxyPath, property, elementBinding);

                                /*var object = Runtime.getParentInstance(data, valuePath);

                                //WORK-AROUND: getMonth for Date object...
                                if(object && typeof object === 'object' && object !== null && typeof object.getMonth !== 'function') {
                                    console.log(valuePath);
                                    console.log(object);

                                    var elementBinding: ElementBinding = this.makeBinding(element, "value");
    
                                    //var bindingHandler = new BindingHandler(elementBinding, valuePath);

                                    var parentPath = Runtime.getParentPath(valuePath);

                                    var parentProxy = this._proxyMap[parentPath];
                                    
                                    //var modelProxy = this._proxyMap[valuePath];
                                    var value: any = Runtime.getProperty(data, valuePath);
                                    
                                    if(!parentProxy) {
                                        parentProxy = {};

                                        parentProxy.data = value;

                                        parentProxy.bindingHandler = new BindingHandler();
                                        
                                        parentProxy.proxy = new Proxy(object, parentProxy.bindingHandler);

                                        Runtime.setProperty(parentPath, data, parentProxy.proxy);
                                    }

                                    var propertyName = Runtime.getPropertyName(valuePath);

                                    parentProxy.bindingHandler.addElement(propertyName, elementBinding);
    
                                    elementBinding.update(parentProxy.data);
                                }*/
                            }
                        }
                    }
                });
            });

            var children = element.children();

			children.each((i: number, item: any) => {
				this.updateHtmlElements(singlefin, page, $(item), models, data);
			});
        }

        makeBinding(element: any, attributeName: string): ElementBinding {
            if(element.is('input')) {
                return new InputBinding(element, attributeName);
            }
            else if(element.is('textarea')) {
                return new TextareaBinding(element, attributeName);
            }

            return new ElementBinding(element, attributeName);
        }
    }
}





/*module SinglefinModule {
    export class Binding {
        private elementBinding: ElementBinding = new ElementBinding();
        private inputBinding: InputBinding = new InputBinding();
        private textareaBinding: TextareaBinding = new TextareaBinding();
        private checkboxBinding: CheckboxBinding = new CheckboxBinding();
        private radioBinding: RadioBinding = new RadioBinding();
        private selectBinding: SelectBinding = new SelectBinding();

        private _dataProxyHandlers: DataProxyHandler[] = [];
        

        bind(singlefin: Singlefin, page: Page, element: any, pageData: any, models: any) {
            if(!element) {
				return;
            }

            var dataProxy: DataProxy = singlefin.modelProxy;
            
            if(!dataProxy) {
				return;
            }
            
            dataProxy.addHandlers(page, this._dataProxyHandlers);
 
            this.in(singlefin, page, element, dataProxy, pageData, models);
            this.is(element, dataProxy);
            this.outClass(page, element, dataProxy);
            this.outAttribute(page, element, dataProxy, models);
        }

        in(singlefin: Singlefin, page: Page, element: any, dataProxy: DataProxy, pageData: any, models: any) {
            this.bindElements(singlefin, page, element, dataProxy, pageData, models);

            var children = element.find("[model-value]");

            for(var i=0; i<children.length; i++) {
                var child = $(children[i]);

                this.bindElements(singlefin, page, child, dataProxy, pageData, models);
            }
        }

        bindElements(singlefin: Singlefin, page: Page, element: any, dataProxy: DataProxy, pageData: any, models: any) {
            var modelKey = element.attr("model-value");
            var key = modelKey;
            var pageModels = page.models;
            var model = null;

            var hasModelValueEvent = element.attr("has-model-value-event");

            if(typeof hasModelValueEvent !== typeof undefined && hasModelValueEvent !== false) {
                return;
            }

            element.attr("has-model-value-event", "");

            if(pageModels) {
                if(pageModels[modelKey]) {
                    key = pageModels[modelKey].binding;
                    model = pageModels[modelKey];
                }
            }

            if(models) {
                if(models[modelKey]) {
                    key = models[modelKey].binding;
                    model = models[modelKey];
                }
            }

            this.elementBinding.in(element, element, dataProxy.proxy, key, pageData);
            this.inputBinding.in(singlefin, page, model, element, element, dataProxy, key);
            this.textareaBinding.in(element, element, dataProxy.proxy, key);
            this.checkboxBinding.in(element, element, dataProxy.proxy, key);
            this.radioBinding.in(element, element, dataProxy.proxy, key);
            this.selectBinding.in(element, element, dataProxy.proxy, key);
        }

        is(element: any, dataProxy: DataProxy) {
            var key = element.attr("is");

            this.elementBinding.is(element, element, dataProxy.proxy, key);
            this.inputBinding.is(element, element, dataProxy.proxy, key);
            this.textareaBinding.is(element, element, dataProxy.proxy, key);
            this.checkboxBinding.is(element, element, dataProxy.proxy, key);
            this.radioBinding.is(element, element, dataProxy.proxy, key);
            this.selectBinding.is(element, element, dataProxy.proxy, key);
            
            var children = element.find("[is]");

            for(var i=0; i<children.length; i++) {
                var child = $(children[i]);

                var key = child.attr("is");

                this.elementBinding.is(element, child, dataProxy.proxy, key);
                this.inputBinding.is(element, child, dataProxy.proxy, key);
                this.textareaBinding.is(element, child, dataProxy.proxy, key);
                this.checkboxBinding.is(element, child, dataProxy.proxy, key);
                this.radioBinding.is(element, child, dataProxy.proxy, key);
                this.selectBinding.is(element, child, dataProxy.proxy, key);
            }
        }

        outClass(page: Page, element: any, dataProxy: DataProxy) {
            var key = element.attr("model-class");
            
            this.elementBinding.outClass(this._dataProxyHandlers, page, element, element, dataProxy, key);
            
            var children = element.find("[model-class]");

            for(var i=0; i<children.length; i++) {
                var child = $(children[i]);

                var key = child.attr("model-class");

                this.elementBinding.outClass(this._dataProxyHandlers, page, element, child, dataProxy, key);
            }
        }

        outAttribute(page: Page, element: any, dataProxy: DataProxy, models: any) {
            if(!element) {
				return;
            }

            var pageModels = page.models;
            
            element.each((i: number, item: any) => {
				$.each(item.attributes, (i: number, attribute: any) => {
					if(attribute.specified) {
						if(!attribute.name.startsWith("model-class") && attribute.name.startsWith("model-")) {
                            var onAttribute = attribute.name.split("model-");
                            var elementAttributeName = onAttribute[1];
                            var originalValue = attribute.value;
                            var value = originalValue;

                            if(pageModels) {
                                if(pageModels[originalValue]) {
                                    value = pageModels[originalValue].binding;
                                }
                            }
                
                            if(models) {
                                if(models[originalValue]) {
                                    value = models[originalValue].binding;
                                }
                            }
                            
                            this.elementBinding.outAttribute(this._dataProxyHandlers, page, element, element, dataProxy, elementAttributeName, value);
                            this.inputBinding.outAttribute(this._dataProxyHandlers, page, element, element, dataProxy, elementAttributeName, value);
                            this.textareaBinding.outAttribute(this._dataProxyHandlers, page, element, element, dataProxy, elementAttributeName, value);
                            this.selectBinding.outAttribute(this._dataProxyHandlers, page, element, element, dataProxy, elementAttributeName, value);
                        }
                    }
                });
            });

            var children = element.children();

			children.each((i: number, item: any) => {
				this.outAttribute(page, $(item), dataProxy, models);
			});
        }
    }
}*/