(function() {
    'use strict'
    angular.module('rc.prime.individual').factory('IndividualService', IndividualService);
    IndividualService.$inject = [
        '$http',
        'application_configuration'
    ];

    function IndividualService($http, application_configuration) {
        let API = {};
        API.GetIndividuals = getIndividuals;
        API.InsertIndividual = insertIndividual;
        API.UpdateIndividual = updateIndividual;
        API.DeleteIndividual = deleteIndividual;
        API.DiscoverIndividual = discoverIndividual;
        API.GetIndividual = getIndividual;

        return {
            API
        };

        function getIndividuals() {
            return $http.get(application_configuration.entityService.url + '/api/individual')
                .then(function(response) {
                    let time = response.config.responseTimestamp - response.config.requestTimestamp;
                    response.data.time_taken = (time / 1000);
                    return response.data;
                });
        };

        function insertIndividual(individualDetails) {
            return $http.post(application_configuration.entityService.url + '/api/individual', individualDetails);
        };

        function updateIndividual(individualDetails) {
            return $http.put(application_configuration.entityService.url + '/api/individual/' + individualDetails.id, individualDetails);
        };

        function deleteIndividual(individualDetails) {
            return $http.delete(application_configuration.entityService.url + '/api/individual/' + individualDetails.id, individualDetails);
        };

        function discoverIndividual(individual) {
            return $http.post(application_configuration.entityService.url + '/api/individual/discover', individual);
        };

        function getIndividual(id) {
            return $http.get(application_configuration.entityService.url + '/api/individual/' + id);
        };
    }
})();