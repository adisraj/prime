'use strict';
class CloneMTOFactory {
    constructor($http, application_configuration) {
        this.endpoint = '/api';
        this.$http = $http;
        this.application_configuration = application_configuration;
    }
    FetchChoice(id) {
        return this.$http.get(this.application_configuration.mtoService.url + this.endpoint + '/mto/choice/' + id);
    }
    FetchMTO(id) {
        return this.$http.get(this.application_configuration.mtoService.url + this.endpoint + '/mto/' + id);
    }

    FetchMTOChoices(id) {
        return this.$http.get(this.application_configuration.mtoService.url + this.endpoint + '/mto/' + id + '/choices');
    }

    CloneChoice(id, MTOId) {
        return this.$http.post(this.application_configuration.mtoService.url + this.endpoint + "/mto/choice/" + id + '/clone?mto_id=' + MTOId, {});
    }

    CloneMTO(id) {
        return this.$http.post(this.application_configuration.mtoService.url + this.endpoint + "/mto/" + id + '/clone', {});
    }

    CloneUserDefinedData(from, to) {
        return this.$http.post(this.application_configuration.mtoService.url + this.endpoint + '/mto/choice/' + from + '/udd/clone', {
            "cloned_id": to
        });
    }

    CloneDrops(uuid, id, cloned_id) {
        return this.$http.post(this.application_configuration.dataLakeService.url + this.endpoint + "/lake/drop/entity/instance/" + id + "/uuid/" + uuid + "/clone?to_instance_id=" + cloned_id, {});
    }

    CloneHistory(uuid, id, cloned_id) {
        return this.$http.post(this.application_configuration.mtoService.url + this.endpoint + "/history/uuid/" + uuid + "/instance/" + id + "/clone?to_instance_id=" + cloned_id, {});
    }

}

angular
    .module('rc.prime.mto.clone')
    .factory('CloneMTOFactory', CloneMTOFactory)