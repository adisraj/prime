(function() {
    'use strict'
    angular.module('rc.prime.authorisation').factory('MFAService', MFAService);
    MFAService.$inject = [
        '$http',
        'application_configuration'
    ]

    function MFAService($http, application_configuration) {
        let API = {};

        API.GetQRCode = getQRCode;
        API.RefreshMFA = refreshMFA;
        API.RefreshMFAByUser = refreshMFAByUser;
        API.VerifyQRCode = verifyQRCode;

        return {
            API
        };

        function getQRCode() {
            return $http.get(application_configuration.apiServer + '/api/user/mfa/code')
                .then((response) => {
                    return response.data;
                });
        };

        function refreshMFA() {
            return $http.post(application_configuration.apiServer + '/api/user/mfa/refresh')
        };


        function refreshMFAByUser(user_id) {
            return $http.post(application_configuration.apiServer + '/api/user/mfa/refresh/user/' + user_id)
        };

        function verifyQRCode(mfatoken) {
            return $http.post(application_configuration.apiServer + '/api/user/mfa/configure/verify?mfatoken=' + mfatoken)
                .then((response) => {
                    return response.data;
                });
        };
    };
})();