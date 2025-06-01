function Services(
    $http,
    $q,
    application_configuration,
    EntityDataFactory) {
    var deferObject;
    var data_services = {
        Entity: {
            search: function(search_field, search_value) {
                var promise = $http({
                    method: 'GET',
                    headers: {
                        'prefix-id': "allow-data"
                    },
                    url: application_configuration.entityService.url + '/api/entity/search/' + search_field + '-' + search_value
                });

                var deferObject = deferObject || $q.defer();

                promise.then(
                    function(result) {
                        deferObject.resolve(result.data);
                    },
                    function(reason) {
                        deferObject.reject(reason);
                    });
                return deferObject.promise;
            },
            getEntityByUUID: function(_uuid) {
                var promise = $http({
                    method: 'GET',
                    headers: {
                        'prefix-id': "allow-data"
                    },
                    url: application_configuration.entityService.url + '/api/entity/uuid/' + _uuid
                });

                var deferObject = deferObject || $q.defer();

                promise.then(
                    function(answer) {
                        deferObject.resolve(answer.data.data[0]);
                    },
                    function(reason) {
                        deferObject.reject(reason);
                    });
                return deferObject.promise;
            },
            getPrefix: function(entity) {
                return $http({
                    method: 'GET',
                    headers: {
                        'prefix-id': "allow-data"
                    },
                    url: application_configuration.entityService.url + '/api/entity/search/entity-' + entity
                });
            },
            getAllPrefix: function() {
                return $http({
                    method: 'GET',
                    headers: {
                        'prefix-id': "allow-data"
                    },
                    url: application_configuration.entityService.url + '/api/entity'
                });
            },
            getPrefixByUUID: function(uuid) {
                return $http({
                    method: 'GET',
                    headers: {
                        'prefix-id': "allow-data"
                    },
                    url: application_configuration.entityService.url + '/api/entity/entityuuid/' + uuid
                });
            },
            getInstance: function(entity_id) {
                return EntityDataFactory.$entity(entity_id).Instance;
            },
        },
        EntityDetails: {
            search: function(search_field, search_value) {
                var promise = $http({
                    method: 'GET',
                    headers: {
                        'prefix-id': "allow-data"
                    },
                    url: application_configuration.entityService.url + '/api/entity/details/search/:' + search_field + '-:' + search_value
                });

                var deferObject = deferObject || $q.defer();

                promise.then(
                    function(answer) {
                        deferObject.resolve(answer.data.data[0]);
                    },
                    function(reason) {
                        deferObject.reject(reason);
                    });
                return deferObject.promise;
            },
            getInstance: function() {
                return EntityDataFactory.$entity_details().Instance;
            },
            getModel: function(model_name, microServiceName) {
                //var url = application_configuration.apiServer + '/model/' + model_name;
                var url = "";
                if (microServiceName !== undefined) {
                    url = application_configuration[microServiceName + 'Service']['url'] + '/model/' + model_name;
                }
                var promise = $http({
                    method: 'GET',
                    headers: {
                        'prefix-id': "allow-data"
                    },
                    url: url
                });

                var deferObject = deferObject || $q.defer();

                promise.then(
                    function(answer) {
                        deferObject.resolve(answer.data);
                    },
                    function(reason) {
                        deferObject.reject(reason);
                    });
                return deferObject.promise;
            },
            updateModel: function(model_name, value, microServiceName) {
                var promise = $http({
                    method: 'PUT',
                    data: value,
                    headers: {
                        'prefix-id': "allow-data"
                    },
                    url: application_configuration[microServiceName + 'Service']['url'] + '/model/update/' + model_name
                });

                var deferObject = deferObject || $q.defer();

                promise.then(
                    function(answer) {
                        deferObject.resolve(answer.data);
                    },
                    function(reason) {
                        deferObject.reject(reason);
                    });
                return deferObject.promise;
            }
        }
    };
    return data_services;
};

Services.$inject = [
    '$http',
    '$q',
    'application_configuration',
    'EntityDataFactory'
];

angular.module('rc.prime.entity').service('EntityDataService', Services);