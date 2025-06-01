(function() {
    'use strict'
    angular.module('rc.prime.location').factory('LocationParameterService', LocationParameterService);
    LocationParameterService.$inject = [
        '$http',
        'application_configuration'
    ]

    function LocationParameterService($http, application_configuration) {
        let API = {};

        API.GetLocationParameter = getLocationParameter;
        API.InsertLocationParameter = insertLocationParameter;

        return {
            API
        };

        function getLocationParameter() {
            return $http.get(application_configuration.locationService.url + '/api/location/parameter/')
                .then((response) => {
                    return response.data;
                });
        };

        function insertLocationParameter(LocationParameterDetails) {
            return $http.post(application_configuration.locationService.url + '/api/location/parameter/', LocationParameterDetails);
        };

    };
})();