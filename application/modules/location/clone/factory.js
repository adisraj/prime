'use strict';
class LocationCloneFactory {
    constructor($http, application_configuration) {
        this.endpoint = '/api';
        this.$http = $http;
        this.application_configuration = application_configuration;
    }
    FetchLocation(id) {
        return this.$http.get(this.application_configuration.locationService.url + this.endpoint + '/location/' + id);
    }

    ValidateWithSecondaryPassword(secondaryPassword) {
      return this.$http
        .post(
            this.application_configuration.locationService.url + "/api/udd/secondarypassword",
            { secondary_password: secondaryPassword }
        )
        .then(response => {
          return response.data;
        });
    }

    IsAllowedFeaturedPassword(feature) {
      return this.$http
        .get(this.application_configuration.locationService.url + "/api/udd/allowpassword/feature/" + feature)
        .then(response => {
          return response.data;
        });
    }
}

angular
    .module('rc.prime.location.clone')
    .factory('LocationCloneFactory', LocationCloneFactory)