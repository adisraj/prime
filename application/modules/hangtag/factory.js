'use strict';
class HangTagFactory {
    constructor($http, application_configuration) {
        this.endpoint = '/api/hang/tag';
        this.$http = $http;
        this.application_configuration = application_configuration;
    }
    FetchTemplates() {
        return this.$http.get(this.application_configuration.itemAndRetailService.url + this.endpoint + '/template');
    };
    GetDefaultTemplate() {
        return this.$http.get(this.application_configuration.itemAndRetailService.url + this.endpoint + '/template/default');
    }
    FetchDepartmentTemplates() {
        return this.$http.get(this.application_configuration.itemAndRetailService.url + this.endpoint + '/department/template');
    };
    SaveDepartmentTemplate(data) {
        return this.$http.post(this.application_configuration.itemAndRetailService.url + this.endpoint + '/department/template/', data);
    };
    /*
    UpdateTemplate(attribute) {
        return this.$http.put(this.application_configuration.uddService.url + this.endpoint + '/attribute/' + attribute.id, attribute);
    }
    DeleteTemplate(id) {
        return this.$http.delete(this.application_configuration.uddService.url + this.endpoint + '/attribute/' + id);
    }
    */
}

angular
    .module('rc.prime.tag')
    .factory('HangTagFactory', HangTagFactory)