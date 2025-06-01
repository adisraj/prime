function UserDataFactory($http, application_configuration) {
    return {
        getLoginAttempts: function() {
            return $http({
                method: 'GET',
                headers: {
                    'prefix-id': "allow-data"
                },
                url: application_configuration.apiServer + '/api/user/loginattempts'
            });
        },
        verifyPassword: function(data) {
            var c = $http({
                method: 'POST',
                headers: {
                    'prefix-id': "allow-data"
                },
                url: application_configuration.apiServer + '/api/user/passwordreset/',
                data: data
            });
            return c;
        },
        resetPassword: function(data) {
            var c = $http({
                method: 'PUT',
                headers: {
                    'prefix-id': "allow-data"
                },
                url: application_configuration.apiServer + '/api/user/passwordreset/',
                data: data
            });
            return c;
        },
        recoverPasswordOptions: function(data) {
            return $http({
                method: 'PUT',
                headers: {
                    'prefix-id': "allow-data"
                },
                url: application_configuration.apiServer + '/api/user/recoveryoptions',
                data: data
            })
        },
        getAllStatusByName: function(entity) {
            return $http({
                method: 'GET',
                headers: {
                    'prefix-id': "allow-data"
                },
                url: application_configuration.apiServer + '/api/status/entityname/' + entity
            });
        },
        saveUser: function(data) {
            return $http({
                method: 'POST',
                headers: {
                    'prefix-id': "allow-data"
                },
                url: application_configuration.apiServer + '/user/register/',
                data: data
            });
        },
        checkusername: function(name) {
            return $http({
                method: 'GET',
                headers: {
                    'prefix-id': "allow-data"
                },
                url: application_configuration.apiServer + '/user/checkusername/' + name
            });
        },
        passwordRecoveryData: function() {
            return $http({
                method: 'GET',
                headers: {
                    'prefix-id': "allow-data"
                },
                url: application_configuration.apiServer + '/api/user/recoveryoptions'
            });
        },
        logout: function() {
            return $http({
                method: 'GET',
                headers: {
                    'prefix-id': "allow-data"
                },
                url: application_configuration.apiServer + '/api/user/logout'
            });
        },
        session: function() {
            return $http({
                method: 'GET',
                headers: {
                    'prefix-id': "allow-data"
                },
                url: application_configuration.apiServer + '/session'
            });
        },
        getUserDetailsByUserId: function(userid) {
            return $http({
                method: 'GET',
                headers: {
                    'prefix-id': "allow-data"
                },
                url: application_configuration.apiServer + '/api/user/userId/' + userid
            });
        },
        userPreference: {
            getUserPreference: function() {
                return $http({
                    method: 'GET',
                    url: application_configuration.apiServer + '/api/userpreference'
                });
            },
            setUserPreference: function(data) {
                return $http({
                    method: 'PUT',
                    headers: {
                        'Content-type': 'application/json'
                    },
                    url: application_configuration.apiServer + '/api/userpreference/' + data.id,
                    data: angular.toJson(data)
                })
            }
        },
    }
}
UserDataFactory.$inject = [
    '$http',
    'application_configuration'
]
angular.module('rc.prime.user').factory('UserDataFactory', UserDataFactory);