(function () {
    'use strict'
    angular.module('rc.prime.title').factory('TitleService', TitleService);
    TitleService.$inject = [
        '$http',
        'application_configuration'
    ];

    function TitleService($http, application_configuration) {
        let API = {};
        let isCache = false;
        API.GetTitles = getTitles;
        API.InsertTitle = insertTitle;
        API.UpdateTitle = updateTitle;
        API.DeleteTitle = deleteTitle;
        API.DiscoverTitle = discoverTitle;

        return {
            API
        };

        function getTitles(cacheValue) {
            if (cacheValue !== undefined && cacheValue !== null) {
                isCache = cacheValue;
            }

            return $http.get(application_configuration.entityService.url + '/api/title', {
                    cache: isCache
                })
                .then(function (response) {
                    let time = response.config.responseTimestamp - response.config.requestTimestamp;
                    response.data.time_taken = (time / 1000);
                    return response.data;
                });
        };

        function insertTitle(titleDetails) {
            isCache = false;
            return $http.post(application_configuration.entityService.url + '/api/title', titleDetails);
        };

        function updateTitle(titleDetails) {
            isCache = false;
            return $http.put(application_configuration.entityService.url + '/api/title/' + titleDetails.id, titleDetails);
        };

        function deleteTitle(titleDetails) {
            isCache = false;
            return $http.delete(application_configuration.entityService.url + '/api/title/' + titleDetails.id, titleDetails);
        };

        function discoverTitle(titleData) {
            return $http.post(application_configuration.entityService.url + '/api/title/discover', titleData);
        }


    }
})();