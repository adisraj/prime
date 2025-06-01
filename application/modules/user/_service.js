function Services(
    $http,
    $q,
    application_configuration,
    UserDataFactory
) {

    var deferObject;
    var data_services = {
        $user: {
            search: function(search_field, search_value) {
                var promise = $http({
                    method: 'GET',
                    headers: {
                        'prefix-id': 'allow-data'
                    },
                    url: application_configuration.apiServer + '/api/user/search/' + search_field + '-' + search_value
                });

                var deferObject = deferObject || $q.defer();

                promise.then(function(result) {
                    deferObject.resolve(result.data);
                }, function(error) {
                    deferObject.reject(error);
                });
                return deferObject.promise;
            },
            getLoginAttempts: function() {
                var promise = $http({
                    method: 'GET',
                    headers: {
                        'prefix-id': "allow-data"
                    },
                    url: application_configuration.apiServer + '/api/user/loginattempts'
                });

                var deferObject = deferObject || $q.defer();

                promise.then(function(result) {
                    deferObject.resolve(result.data);
                }, function(error) {
                    deferObject.reject(error);
                });
                return deferObject.promise;
            },
            searchDateformat: function(search_field, search_value) {
                var promise = $http({
                    method: 'GET',
                    headers: {
                        'prefix-id': "allow-data"
                    },
                    url: application_configuration.apiServer + '/api/userpreference/date/search/' + search_field + '-' + search_value
                });

                var deferObject = deferObject || $q.defer();

                promise.then(function(result) {
                    deferObject.resolve(result.data);
                }, function(error) {
                    deferObject.reject(error);
                });
                return deferObject.promise;
            },
            getDefaultTimeFormat: function() {
                var promise = $http({
                    method: 'GET',
                    headers: {
                        'prefix-id': "allow-data"
                    },
                    url: application_configuration.apiServer + '/api/userpreference/time'
                });

                var deferObject = deferObject || $q.defer();

                promise.then(function(result) {
                    deferObject.resolve(result.data);
                }, function(error) {
                    deferObject.reject(error);
                });
                return deferObject.promise;
            },
            createUserTimePreference: function(data) {
                var promise = $http({
                    method: 'POST',
                    headers: {
                        'prefix-id': "allow-data"
                    },
                    url: application_configuration.apiServer + '/api/userpreference/time/',
                    data: data
                });

                var deferObject = deferObject || $q.defer();

                promise.then(function(result) {
                    deferObject.resolve(result.data);
                }, function(error) {
                    deferObject.reject(error);
                });
                return deferObject.promise;
            },
            getDefaultDateFormat: function() {
                var promise = $http({
                    method: 'GET',
                    headers: {
                        'prefix-id': "allow-data"
                    },
                    url: application_configuration.apiServer + '/api/userpreference/date'
                });

                var deferObject = deferObject || $q.defer();

                promise.then(function(result) {
                    deferObject.resolve(result.data);
                }, function(error) {
                    deferObject.reject(error);
                });
                return deferObject.promise;
            },
            createUserDatePreference: function(data) {
                var promise = $http({
                    method: 'POST',
                    headers: {
                        'prefix-id': "allow-data"
                    },
                    url: application_configuration.apiServer + '/api/userpreference/date/',
                    data: data
                });

                var deferObject = deferObject || $q.defer();

                promise.then(function(result) {
                    deferObject.resolve(result.data);
                }, function(error) {
                    deferObject.reject(error);
                });
                return deferObject.promise;
            },
            getUserTimeFormat: function() {
                var promise = $http({
                    method: 'GET',
                    headers: {
                        'prefix-id': "allow-data"
                    },
                    url: application_configuration.apiServer + '/api/userpreference/user/time'
                });
                var deferObject = deferObject || $q.defer();
                promise.then(function(result) {
                    deferObject.resolve(result.data);
                }, function(error) {
                    deferObject.reject(error);
                });
                return deferObject.promise;
            },
            getUserDateFormat: function() {
                var promise = $http({
                    method: 'GET',
                    headers: {
                        'prefix-id': "allow-data"
                    },
                    url: application_configuration.apiServer + '/api/userpreference/user/date'
                });
                var deferObject = deferObject || $q.defer();
                promise.then(function(result) {
                    deferObject.resolve(result.data);
                }, function(error) {
                    deferObject.reject(error);
                });
                return deferObject.promise;
            },
            getUserDetail: function() {
                var promise = $http({
                    method: 'GET',
                    headers: {
                        'prefix-id': "allow-data"
                    },
                    url: application_configuration.apiServer + '/api/user/userId/1'
                });

                var deferObject = deferObject || $q.defer();

                promise.then(function(result) {
                    deferObject.resolve(result.data);
                }, function(error) {
                    deferObject.reject(error);
                });
                return deferObject.promise;
            },
            verifyPassword: function(data) {
                var promise = $http({
                    method: 'POST',
                    headers: {
                        'prefix-id': "allow-data"
                    },
                    url: application_configuration.apiServer + '/api/user/passwordreset/',
                    data: data
                });

                var deferObject = deferObject || $q.defer();

                promise.then(function(result) {
                    deferObject.resolve(result.data);
                }, function(error) {
                    deferObject.reject(error);
                });
                return deferObject.promise;
            },
            resetPassword: function(data) {
                var promise = $http({
                    method: 'PUT',
                    headers: {
                        'prefix-id': "allow-data"
                    },
                    url: application_configuration.apiServer + '/api/user/passwordreset/',
                    data: data
                });

                var deferObject = deferObject || $q.defer();

                promise.then(function(result) {
                    deferObject.resolve(result.data);
                }, function(error) {
                    deferObject.reject(error);
                });
                return deferObject.promise;
            },
            recoverPasswordOptions: function(data) {
                var promise = $http({
                    method: 'PUT',
                    headers: {
                        'prefix-id': "allow-data"
                    },
                    url: application_configuration.apiServer + '/api/user/recoveryoptions',
                    data: data
                });

                var deferObject = deferObject || $q.defer();

                promise.then(function(result) {
                    deferObject.resolve(result.data);
                }, function(error) {
                    deferObject.reject(error);
                });
                return deferObject.promise;
            },
            getRecoveryOptions: function() {
                var promise = $http({
                    method: 'GET',
                    headers: {
                        'prefix-id': "allow-data"
                    },
                    url: application_configuration.apiServer + '/api/user/recoveryoptions'
                });

                var deferObject = deferObject || $q.defer();

                promise.then(function(result) {
                    deferObject.resolve(result.data);
                }, function(error) {
                    deferObject.reject(error);
                });
                return deferObject.promise;
            },
            register: function(userDetails) {
                var promise = $http({
                    method: 'POST',
                    headers: {
                        'prefix-id': "allow-data"
                    },
                    url: application_configuration.apiServer + '/user/register/',
                    data: data
                });

                var deferObject = deferObject || $q.defer();

                promise.then(function(result) {
                    deferObject.resolve(result.data);
                }, function(error) {
                    deferObject.reject(error);
                });
                return deferObject.promise;
            },
            logout: function() {
                var promise = $http({
                    method: 'GET',
                    headers: {
                        'prefix-id': "allow-data"
                    },
                    url: application_configuration.apiServer + '/api/user/logout'
                });

                var deferObject = deferObject || $q.defer();

                promise.then(function(result) {
                    deferObject.resolve(result.data);
                }, function(error) {
                    deferObject.reject(error);
                });
                return deferObject.promise;
            },
            userprofile: function(id) {
                var promise = $http({
                    method: 'GET',
                    headers: {
                        'prefix-id': "allow-data"
                    },
                    url: application_configuration.apiServer + '/api/user/details/user/' + id
                });

                var deferObject = deferObject || $q.defer();

                promise.then(function(result) {
                    deferObject.resolve(result.data);
                }, function(error) {
                    deferObject.reject(error);
                });
                return deferObject.promise;
            },
            activesession: function() {
                var promise = $http({
                    method: 'GET',
                    headers: {
                        'prefix-id': "allow-data"
                    },
                    url: application_configuration.apiServer + '/api/user/activesessions'
                });

                var deferObject = deferObject || $q.defer();

                promise.then(function(result) {
                    deferObject.resolve(result.data);
                }, function(error) {
                    deferObject.reject(error);
                });
                return deferObject.promise;
            },
            session: function() {
                var promise = $http({
                    method: 'GET',
                    headers: {
                        'prefix-id': "allow-data"
                    },
                    url: application_configuration.apiServer + '/session'
                });

                var deferObject = deferObject || $q.defer();

                promise.then(function(result) {
                    deferObject.resolve(result.data);
                }, function(error) {
                    deferObject.reject(error);
                });
                return deferObject.promise;
            },
            getInstance: function(entity_id) {
                return UserDataFactory.$user(entity_id).Instance;
            },
            updateUser: function(data) {
                var promise = $http({
                    method: 'PUT',
                    headers: {
                        'prefix-id': "allow-data"
                    },
                    url: application_configuration.apiServer + '/api/user/details/' + data.id,
                    data: data
                });

                var deferObject = deferObject || $q.defer();

                promise.then(function(result) {
                    deferObject.resolve(result.data);
                }, function(error) {
                    deferObject.reject(error);
                });
                return deferObject.promise;
            },
            getUserDetails: function(userid) {
                return $http({
                    method: 'GET',
                    url: application_configuration.apiServer + '/api/user/details/' + userid
                });
            },
            getUserDetailsById: function(userid) {
                return $http({
                    method: 'GET',
                    url: application_configuration.apiServer + '/api/user/userId/' + userid
                });
            },
            getUserDetailsModel: function() {
                return {
                    "model": {
                        "id": {
                            "title": "ID",
                            "show": false,
                            "edit": false
                        },
                        "user_id": {
                            "title": "User",
                            "show": true,
                            "edit": false,
                            "view_value": "name",
                            "ui_component": "input-text",
                            "rules": {
                                "create_validation_rules": "required|not_null|integer",
                                "update_validation_rules": "not_null|integer"
                            }
                        },
                        "designation": {
                            "title": "Designation",
                            "show": true,
                            "edit": true,
                            "view_value": "designation",
                            "ui_component": "input-text",
                            "rules": {
                                "create_validation_rules": "required|not_null|string",
                                "update_validation_rules": "not_null|string"
                            }
                        },
                        "dob": {
                            "title": "Date Of Birth",
                            "show": true,
                            "edit": true,
                            "view_value": "dob",
                            "ui_component": "input-text",
                            "rules": {
                                "create_validation_rules": "required|not_null|date",
                                "update_validation_rules": "not_null|date"
                            }
                        },
                        "phone_office": {
                            "title": "Phone Office",
                            "show": true,
                            "edit": true,
                            "view_value": "phone_office",
                            "ui_component": "input-text",
                            "rules": {
                                "create_validation_rules": "required",
                                "update_validation_rules": "not_null"
                            }
                        },
                        "phone_residence": {
                            "title": "Phone Residence",
                            "show": true,
                            "edit": true,
                            "view_value": "phone_residence",
                            "ui_component": "input-text",
                            "rules": {
                                "create_validation_rules": "not_null",
                                "update_validation_rules": "not_null"
                            }
                        },
                        "phone_mobile": {
                            "title": "Mobile",
                            "show": true,
                            "edit": true,
                            "view_value": "phone_mobile",
                            "ui_component": "input-text",
                            "rules": {
                                "create_validation_rules": "not_null",
                                "update_validation_rules": "not_null"
                            }
                        },
                        "email_id_business": {
                            "title": "Email ID Business",
                            "show": true,
                            "edit": true,
                            "view_value": "email_id_business",
                            "ui_component": "input-text",
                            "rules": {
                                "create_validation_rules": "required|not_null|string",
                                "update_validation_rules": "not_null|string"
                            }
                        },
                        "email_id_personal": {
                            "title": "Email ID Personal",
                            "show": true,
                            "edit": true,
                            "view_value": "email_id_personal",
                            "ui_component": "input-text",
                            "rules": {
                                "create_validation_rules": "not_null|string",
                                "update_validation_rules": "not_null|string"
                            }
                        },
                        "primary_address": {
                            "title": "Primary Address",
                            "show": true,
                            "edit": true,
                            "view_value": "primary_address",
                            "ui_component": "input-text",
                            "rules": {
                                "create_validation_rules": "required|not_null|string",
                                "update_validation_rules": "not_null|string"
                            }
                        },
                        "secondary_address": {
                            "title": "Seconadary Address",
                            "show": true,
                            "edit": true,
                            "view_value": "secondary_address",
                            "ui_component": "input-text",
                            "rules": {
                                "create_validation_rules": "not_null|string",
                                "update_validation_rules": "not_null|string"
                            }
                        }
                    }
                }
            },
            userPreference: {
                getUserPreference: function(userid) {
                    return $http({
                        method: 'GET',
                        url: application_configuration.apiServer + '/api/userpreference/userId/' + userid
                    });
                },
                setUserPreference: function(data) {
                    return $http({
                        method: 'PUT',
                        headers: {
                            'Content-type': 'application/json'
                        },
                        url: application_configuration.apiServer + '/api/userpreference/userId/' + data.user_id,
                        data: angular.toJson(data)
                    })
                }
            }
        }
    }
    return data_services;
}

Services.$inject = [
    '$http',
    '$q',
    'application_configuration',
    'UserDataFactory'
]

angular.module('rc.prime.user')
    .service('UserDataService', Services);