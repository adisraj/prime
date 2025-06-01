'use strict';
class EntityFactory {
    constructor($http, application_configuration) {
        this.endpoint = '/api';
        this.$http = $http;
        this.application_configuration = application_configuration;
    }

    FetchEntities(isMasterData) {
        return this.$http.get(this.application_configuration.entityService.url + this.endpoint + '/entity/search/master_data-' + isMasterData);
    }
}

angular
    .module('rc.prime.entity')
    .factory('EntityFactory', EntityFactory)