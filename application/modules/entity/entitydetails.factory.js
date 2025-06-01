(function() {
    'use strict';

    angular
        .module('rc.prime.entity')
        .factory('EntityDetailsService', EntityDetailsService)

    EntityDetailsService.$$inject = [
        '$http',
        'application_configuration'
    ];

    function EntityDetailsService($http, application_configuration) {
        let API = {};
        API.GetEntityDetailsList = getEntityDetailsList;
        API.InsertEntityDetails = insertEntityDetails;
        API.UpdateEntityDetails = updateEntityDetails;
        API.DeleteEntityDetails = deleteEntityDetails;
        API.GetModel = getModel;
        API.UpdateModel = updateModel;

        return {
            API
        };

        function getEntityDetailsList() {
            return $http.get(application_configuration.entityService.url + '/api/entity/details')
                .then((response) => {
                    return response.data;
                });
        };

        function insertEntityDetails(details) {
            return $http.post(application_configuration.entityService.url + '/api/entity/details', details);
        };

        function updateEntityDetails(details) {
            return $http.put(application_configuration.entityService.url + '/api/entity/details/' + details.id, details);
        };

        function deleteEntityDetails(details) {
            return $http.delete(application_configuration.entityService.url + '/api/entity/details/' + details.id, details);
        };

        function getModel(model_name, microServiceName) {
            return $http.get(application_configuration[microServiceName + 'Service']['url'] + '/model/' + model_name);
        };

        function updateModel(model_name, microServiceName, value) {
            return $http.put(application_configuration[microServiceName + 'Service']['url'] + '/model/update/' + model_name, value);
        };
    }
})();