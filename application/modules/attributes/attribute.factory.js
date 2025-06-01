(function() {
    'use strict'
    angular.module('rc.prime.attributes').factory('AttributeService', AttributeService);
    AttributeService.$inject = [
        '$http',
        '$q',
        'application_configuration',
        'ApplicationCache'
    ]

    function AttributeService($http, $q, application_configuration, ApplicationCache) {
        let API = {};
        let object = {};
        let apiCache = {};
        API.DeleteAttribute = deleteAttribute;
        API.GetAttributes = getAttributes;
        API.GetAttributeByEntityId = getAttributeByEntityId;
        API.GetAttributeById = getAttributeById;
        API.GetAttributeCount = getAttributeCount;
        API.GetAttributeFormat = getAttributeFormat;
        API.GetVariable = getVariable;
        API.InsertAttribute = insertAttribute;
        API.SearchAttribute = searchAttribute;
        API.StoreVariable = storeVariable;
        API.UpdateAttribute = updateAttribute;

        return {
            API
        };

        function getCache() {
            if (ApplicationCache.getCache('AttributeCache')) {
                return ApplicationCache.getCache('AttributeCache');
            }
        }

        function getAttributes() {
            apiCache = getCache();
            var deferred = $q.defer();
            object['GetAttributes'] = application_configuration.uddService.url + '/api/attributes';
            if (!apiCache.get(object['GetAttributes'])) {
                return $http.get(object['GetAttributes'])
                    .then((response) => {
                        let time = response.config.responseTimestamp - response.config.requestTimestamp;
                        response.data.time_taken = (time / 1000);
                        apiCache.put(object['GetAttributes'], JSON.stringify(response.data));
                        return response.data;
                    });
            } else {
                deferred.resolve(JSON.parse(apiCache.get(object['GetAttributes'])));
            }
            return deferred.promise;
        };

        function getAttributeById(id) {
            apiCache = getCache();
            object['GetAttributeById'] = application_configuration.uddService.url + '/api/attribute/' + id;
            return $http.get(object['GetAttributeById'], { cache: apiCache })
                .then((response) => {
                    if (apiCache) {
                        apiCache.put(object['GetAttributeById']);
                    }
                    return response.data;
                });
        };

        function insertAttribute(attributeDetails) {
            return $http.post(application_configuration.uddService.url + '/api/attributes', attributeDetails)
                .then((response) => {
                    return response;
                });
        };

        function searchAttribute(search_field, search_values, apiCache) {
            return $http.get(application_configuration.uddService.url + '/api/attributes/search?field=' + search_field + '&values=' + search_values, { cache: apiCache });
        };

        function storeVariable(key, value) {
            object[key] = value;
        };

        function getVariable(key) {
            return object[key];
        };

        function updateAttribute(attributeDetails) {
            return $http.put(application_configuration.uddService.url + '/api/attribute/' + attributeDetails.id, attributeDetails);
        };

        function deleteAttribute(attributeDetails) {
            return $http.delete(application_configuration.uddService.url + '/api/attribute/' + attributeDetails.id, attributeDetails);
        };

        function getAttributeByEntityId(entity_id) {
            return $http.get(application_configuration.uddService.url + '/api/entity/' + entity_id + '/attributes')
                .then((response) => {
                    return response.data;
                });
        };
        function getAttributeCount() {
            apiCache = getCache();
            return $http.get(application_configuration.uddService.url + '/api/attributes/count', { cache: apiCache });
        };

        function getAttributeFormat() {
            apiCache = getCache();
            return $http.get(application_configuration.uddService.url + '/api/attributes/formats', { cache: apiCache })
                .then((response) => {
                    return response.data;
                });
        };

    };
})();