(function() {
    'use strict'
    angular.module('rc.prime.country.states').factory('CountryStatesService', CountryStatesService);
    CountryStatesService.$inject = [
        '$http',
        'application_configuration'
    ];

    function CountryStatesService($http, application_configuration) {
        let API = {};
        API.GetCountryStatesBycountryId = getCountryStatesBycountryId;
        API.InsertCountryStates = insertCountryStates;
        API.UpdateCountryStates = updateCountryStates;
        API.DeleteCountryStates = deleteCountryStates;
        API.GetCountryStatesById = getCountryStatesById;
        return {
            API
        };

        function getCountryStatesBycountryId(countryId) {
            return $http.get(application_configuration.entityService.url + '/api/region/country/' + countryId)
                .then((response) => {
                    let time = response.config.responseTimestamp - response.config.requestTimestamp;
                    response.data.time_taken = (time / 1000);
                    return response.data;
                });
        };

        function insertCountryStates(StatesDetails) {
            return $http.post(application_configuration.entityService.url + '/api/region/country/'+ StatesDetails.country_id, StatesDetails);
        };

        function updateCountryStates(StatesDetails) {
            return $http.put(application_configuration.entityService.url + '/api/region/' + StatesDetails.id, StatesDetails);
        };

        function deleteCountryStates(StatesDetails) {
            return $http.delete(application_configuration.entityService.url + '/api/region/' + StatesDetails.id, StatesDetails);
        };

        function getCountryStatesById(regionId) {
            return $http.get(application_configuration.entityService.url + '/api/region/' + regionId)
                .then(response => {
                    return response.data;
                });
        }
    }

})();