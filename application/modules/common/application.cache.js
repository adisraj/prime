(function() {
    'use strict';
    angular.module('calculus.application').factory('ApplicationCache', ApplicationCache);

    ApplicationCache.$inject = ['$http', '$q', 'CacheFactory', 'Logger'];

    function ApplicationCache($http, $q, CacheFactory, Logger) {
        let logger = Logger.getInstance('Application.Cache');
        let cache = {};
        let property = {};
        let options = {};

        return {

            createCache: function(name, options) {
                if (!cache[name]) {
                    cache[name] = CacheFactory(name, options);
                }
                return cache[name];
            },
            getCache: function(name) {
                return cache[name];
            },
            setOptions: function(name, options) {

            },
            getAPIData: function(url) {
                return $http.get(url)
                    .then((response) => {
                        return response.data;
                    });
            }
        }
    }

})();

(function() {
    'use strict';

    angular
        .module('calculus')
        .provider('applicationCacheProvider', applicationCacheProvider)

    function applicationCacheProvider() {
        var configValue = false;
        this.setConfigValue = function(value) {
            configValue = value;
        };

        this.$get = applicationCacheProviderFactory;

        applicationCacheProviderFactory.$inject = ['$http'];

        function applicationCacheProviderFactory($http) {
            var service = {
                getData: getData
            };

            return service;


            function getData(url) {
                $http.get(url)
                    .then((response) => {
                        console.log(response);

                    });
            }
        }
    }
})();


/* This provider is used for showing popover message
 * This provider is injected in directive.js for rc-popover directive
 */
(function(){
    'use strict';

    angular
        .module('calculus')
        .provider('$popover', $popover)

    function $popover() {
        var defaults = this.defaults = {
            trigger: "click",
            placement: "bottom"
          }
          
          this.$get = function() {
            function factory(config) {
              var poppy = {};
              
              var options = angular.extend({}, defaults, config);
              
              poppy.options = options;
              
              return poppy;
            }
            return factory;
          }
    }
})();