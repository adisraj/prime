(function() {
    'use strict';

    angular
        .module('calculus')
        .factory('PreferenceService', PreferenceService)

    PreferenceService.$inject = ['$http', 'application_configuration'];

    function PreferenceService($http, application_configuration) {
        let API = {};
        API.GetPreferencesByUserId = getPreferencesByUserId;
        API.GetAllPreferences = getAllPreferences;
        API.GetAllOptions = getAllOptions;
        API.UpdatePreference = updatePreference;
        API.ResetPreferencesToDefault = resetPreferencesToDefault;

        return {
            API
        };

        function getPreferencesByUserId(userId) {
            return $http.get(application_configuration.apiServer + '/api/preferences/user/' + userId)
                .then(response => {
                    return response.data;
                });
        };

        function getAllPreferences() {
            return $http.get(application_configuration.apiServer + '/api/preferences/')
                .then(response => {
                    return response.data;
                });
        };

        function getAllOptions() {
            return $http.get(application_configuration.apiServer + '/api/preferences/options')
                .then(response => {
                    return response.data;
                });
        };

        function updatePreference(preferenceDetails) {
            return $http.put(application_configuration.apiServer + '/api/preferences/user/' + preferenceDetails.user_id + '/preference/' + preferenceDetails.preference_id, preferenceDetails);
        };

        function resetPreferencesToDefault(userId) {
            return $http.delete(application_configuration.apiServer + '/api/preferences/user/' + userId);
        };
    }
})();