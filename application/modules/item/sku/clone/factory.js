'use strict';
class Factory {
    constructor($http, application_configuration) {
        this.endpoint = '/api';
        this.$http = $http;
        this.application_configuration = application_configuration;
    }
    FetchSKU(id) {
        return this.$http.get(this.application_configuration.itemAndRetailService.url + this.endpoint + '/sku/' + id);
    }
    FetchItem(id) {
        return this.$http.get(this.application_configuration.itemAndRetailService.url + this.endpoint + '/item/' + id);
    }

    FetchItemSKUs(id) {
        return this.$http.get(this.application_configuration.itemAndRetailService.url + this.endpoint + '/item/' + id + '/sku');
    }

    CloneSKU(id, item_id) {
        return this.$http.post(this.application_configuration.itemAndRetailService.url + this.endpoint + "/sku/" + id + '/clone?item_id=' + item_id, {});
    }

    CloneSKUSet(id, clonedId) {
        return this.$http.post(this.application_configuration.itemAndRetailService.url + this.endpoint + "/sku/set/clone/" + id, { cloned_id: clonedId });
    }

    CloneItem(id) {
        return this.$http.post(this.application_configuration.itemAndRetailService.url + this.endpoint + "/item/" + id + '/clone', {});
    }

    CloneUserDefinedData(from, to, entryLevel) {
        return this.$http.post(this.application_configuration.itemAndRetailService.url + this.endpoint + '/udd/' + from + '/clone', {
            "entry_level": entryLevel,
            "cloned_id": to
        });
    }

    CloneDrops(uuid, id, cloned_id) {
        return this.$http.post(this.application_configuration.dataLakeService.url + this.endpoint + "/lake/drop/entity/instance/" + id + "/uuid/" + uuid + "/clone?to_instance_id=" + cloned_id, {});
    }

    CloneHistory(uuid, id, cloned_id) {
        return this.$http.post(this.application_configuration.itemAndRetailService.url + this.endpoint + "/history/uuid/" + uuid + "/instance/" + id + "/clone?to_instance_id=" + cloned_id, {});
    }

    CloneSKUHuntPath(id, cloned_id) {
        return this.$http.post(this.application_configuration.itemAndRetailService.url + this.endpoint + "/sku/" + id + "/huntpath/type/clone?to_sku_id=" + cloned_id, {});
    }

    CloneTags(uuid, id, cloned_id) {
        return this.$http.post(this.application_configuration.tagService.url + this.endpoint + "/tags/" + uuid + "/" + id + "/clone?to_instance_id=" + cloned_id, {});
    }
}

angular
    .module('rc.prime.item.clone')
    .factory('Factory', Factory)