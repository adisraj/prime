(function() {
    'use strict'
    angular.module('rc.prime.country').factory('CountryService', CountryService);
    CountryService.$inject = [
        '$http',
        'application_configuration'
    ];

    function CountryService(
        $http,
        application_configuration
    ) {

        let API = {};
        let isCache = false;
        API.GetCountries = getCountries;
        API.InsertCountry = insertCountry;
        API.UpdateCountry = updateCountry;
        API.GetCountryById = getCountryById;

        return {
            API
        };

        function getCountries(cacheValue) {
            if (cacheValue !== undefined && cacheValue !== null) {
                isCache = cacheValue;
            }
            return $http.get(application_configuration.entityService.url + '/api/country', { cache: isCache })
                .then(function(response) {
                    let time = response.config.responseTimestamp - response.config.requestTimestamp;
                    response.data.time_taken = (time / 1000);
                    return response.data;
                });
        };

        function insertCountry(countryDetails) {
            isCache = false;
            return $http.post(application_configuration.entityService.url + '/api/country', countryDetails);
        };

        function updateCountry(countryDetails) {
            isCache = false;
            return $http.put(application_configuration.entityService.url + '/api/country/' + countryDetails.id, countryDetails);
        };

        function getCountryById(countryId) {
            return $http.get(application_configuration.entityService.url + '/api/country/' + countryId)
                .then(response => {
                    return response.data;
                });
        }

    }
})();