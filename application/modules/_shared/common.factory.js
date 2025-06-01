var calculus = angular.module('calculus', []);
calculus.factory('UserPreferencesService', function() {
    var user_preferences = {};
    return {
        get: function(name) {
            return user_preferences[name];
        },
        set: function(name, value) {
            user_preferences[name] = value;
        }
    };
});
calculus.factory('ApplicationPreferencesService', function() {
    var application_preferences = {};
    return {
        get: function(name) {
            return application_preferences[name];
        },
        set: function(name, value) {
            application_preferences[name] = value;
        }
    };
});