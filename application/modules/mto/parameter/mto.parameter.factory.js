(function() {
    'use strict'
    angular.module('rc.prime.mto').factory('MTOParameterService', MTOParameterService);
    MTOParameterService.$inject = [
        '$http',
        'application_configuration'
    ]

    function MTOParameterService($http, application_configuration) {
        let API = {};

        API.GetMTOParameter = getMTOParameter;
        API.InsertMTOParameter = insertMTOParameter;

        return {
            API
        };

        function getMTOParameter() {
            return $http.get(application_configuration.mtoService.url + '/api/mto/parameter/')
                .then((response) => {
                    return response;
                });
        };

        function insertMTOParameter(MTOParameterDetails) {
            return $http.post(application_configuration.mtoService.url + '/api/mto/parameter/', MTOParameterDetails);
        };

    };
})();