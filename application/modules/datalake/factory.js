"use strict";
(function () {
  angular
    .module("rc.prime.datalake")
    .factory("DataLakeAPIService", DataLakeAPIService);
  DataLakeAPIService.$inject = [
    "$http",
    "common",
    "application_configuration",
    "$q"
  ];

  function DataLakeAPIService($http, common, application_configuration, $q) {
    var API = {};
    API.GetDropsByUuid = getDropsByUuid;
    API.GetDropsByUuidAndInstance = getDropsByUuidAndInstance;
    API.GetDropsByUuidInstanceAndStream = getDropsByUuidInstanceAndStream;
    API.GetEntities = getEntities;
    API.GetLakesByUuid = getLakesByUuid;
    API.GetStreamsByLake = getStreamsByLake;
    API.GetLakeStreamLink = getLakeStreamLink;
    API.GetUploadDropUrl = getUploadDropUrl;
    API.UploadDrop = uploadDrop;
    API.GetUploadCorporateDropUrl = getUploadCorporateDropUrl;
    API.DeleteCorporateDrop = deleteCorporateDrop;
    API.CheckFileType = checkFileType;
    API.UploadFile = uploadFile;
    API.DownloadDrop = downloadDrop;
    API.UpdateDrop = updateDrop;
    API.DownloadCorporateDrop = downloadCorporateDrop;
    API.DeleteDrop = deleteDrop;
    API.UpdateDetails = updateDetails;
    API.GetDownloadUrl = getDownloadUrl;
    API.GetImageDownloadUrl = getImageDownloadUrl;
    API.GetDropInfoByParams = getDropInfoByParams;
    API.GetDataLakeDownloadUrl = getDataLakeDownloadUrl;
    API.LearnImageProperties = learnImageProperties;
    API.GetDropsByIds = getDropsByIds;

    return {
      API
    };

    function getDropsByUuidInstanceAndStream(uuid, instance_id, streamName) {
      return $http
        .get(
          application_configuration.dataLakeService.url +
          "/api/lake/drop/entity/link?uuid=" +
          uuid +
          "&instance_id=" +
          instance_id +
          "&stream=" +
          streamName
        )
        .then(response => {
          return response.data.data;
        });
    }

    function getDropsByUuidAndInstance(uuid, instance_id) {
      return $http
        .get(
          application_configuration.dataLakeService.url +
          "/api/lake/drop/entity/instance/" +
          instance_id +
          "/uuid/" +
          uuid
        )
        .then(response => {
          return response.data.data;
        });
    }

    function getStreamsByLake(lake_id) {
      return $http
        .get(
          application_configuration.dataLakeService.url +
          "/api/lake/streams/lake/" +
          lake_id,
          { cache: true }
        )
        .then(response => {
          return response.data.data;
        });
    }

    function getLakeStreamLink(lake_id, stream_id) {
      return $http
        .get(
          application_configuration.dataLakeService.url +
          "/api/lake/streams/lake/" +
          lake_id +
          "/stream/" +
          stream_id
        )
        .then(response => {
          return response.data.data;
        });
    }

    function getLakesByUuid(uuid) {
      return $http
        .get(
          application_configuration.dataLakeService.url +
          "/api/lake/entities/uuid/" +
          uuid,
          { cache: true }
        )
        .then(response => {
          return response.data.data;
        });
    }

    function getUploadDropUrl(drop) {
      return application_configuration.dataLakeService.url + "/api/lake/drop";
    }

    function uploadDrop(drop) {
      return $http
        .post(
          application_configuration.dataLakeService.url + "/api/lake/drop",
          drop
        )
        .then(response => {
          return response;
        });
    }

    function getUploadCorporateDropUrl(drop) {
      return application_configuration.dataLakeService.url + "/api/lake/corproatedrop";
    }

    function deleteCorporateDrop(drop) {
      return $http
        .put(
          application_configuration.dataLakeService.url +
          "/api/lake/corproatedrop/remove/" + drop.id + "?uuid=" +
          drop.uuid,
          drop
        )
        .then(response => {
          return response;
        });
    }

    function checkFileType(drop) {
      return $http
        .post(
          application_configuration.dataLakeService.url + "/api/lake/check-file",
          drop
        )
        .then(response => {
          return response;
        });
    }

    function deleteDrop(drop) {
      return $http
        .post(
          application_configuration.dataLakeService.url +
          "/api/lake/drop/remove?uuid=" +
          drop.uuid,
          drop
        )
        .then(response => {
          return response;
        });
    }

    function getDownloadUrl(url, uuid) {
      let token = common.SessionMemory.API.Get("user.token");
      let session = common.SessionMemory.API.Get("user.session");
      return (
        application_configuration.dataLakeService.url +
        "/api/lake/drop/download/" +
        url +
        "?uuid= " +
        uuid +
        "&token=" +
        token +
        "&session_id=" +
        session
      );
    }

    function getImageDownloadUrl(url, size, uuid) {
      let token = common.SessionMemory.API.Get("user.token");
      let session = common.SessionMemory.API.Get("user.session");
      let file;
      size ? (file = url + "_" + size) : (file = url);
      return (
        application_configuration.dataLakeService.url +
        "/api/lake/drop/download/" +
        file +
        "?uuid= " +
        uuid +
        "&token=" +
        token +
        "&session_id=" +
        session
      );
    }

    function getDropInfoByParams(query) {
      return $http
        .get(
          application_configuration.dataLakeService.url +
          "/api/lake/drop/entity/link",
          { params: query }
        )
        .then(response => {
          return response.data;
        });
    }

    function getDataLakeDownloadUrl(id, query) {
      let token = common.SessionMemory.API.Get("user.token");
      let session = common.SessionMemory.API.Get("user.session");
      return (
        application_configuration.dataLakeService.url +
        "/api/lake/drop/download/" +
        id +
        "?uuid=" +
        query.uuid +
        "&token=" +
        token +
        "&session_id=" +
        session
      );
    }

    function downloadDrop(file, uuid) {
      return $http({
        method: "GET",
        url:
          application_configuration.dataLakeService.url +
          "/api/lake/drop/download/" +
          file +
          "?uuid=" +
          uuid,
        responseType: "arraybuffer"
      });
    }

    function updateDrop(drop){
      return $http
        .post(
          application_configuration.dataLakeService.url +
          "/api/lake/update",
          drop
        )
        .then(response => {
          return response;
        });
    }

    function downloadCorporateDrop(file, uuid) {
      return $http({
        method: "GET",
        url:
          application_configuration.dataLakeService.url +
          "/api/lake/corporatedrop/download/" +
          file +
          "?uuid=" +
          uuid,
        responseType: "arraybuffer"
      });
    }

    function getDropsByUuid(uuid) {
      return $http
        .get(
          application_configuration.dataLakeService.url +
          "/api/lake/drop/entity?uuid=" +
          uuid +
          "&stream=cover_image"
        )
        .then(response => {
          return response.data;
        });
    }

    function getEntities() {
      return $http
        .get(application_configuration.dataLakeService.url + "/meta/count/")
        .then(response => {
          return response.data;
        });
    }

    function uploadFile() {
      return application_configuration.dataLakeService.url + "/meta/create";
    }

    function updateDetails(drop) {
      return $http
        .put(
          application_configuration.dataLakeService.url +
          "/api/lake/drop/" +
          drop.drop_id +
          "?uuid=" +
          drop.uuid,
          drop
        )
        .then(response => {
          return response;
        });
    }

    /**Learn Images API  */
    function learnImageProperties(drop_id) {
      return $http
        .get(
          application_configuration.dataLakeService.url +
          "/api/ml/learn/image/" +
          drop_id
        )
        .then(response => {
          return response;
        });
    }

    function getDropsByIds(dropIds) {
      return $http.get(`${application_configuration.dataLakeService.url}/api/lake/drops/in?drop_ids=${dropIds}`)
        .then(response => {
          return response.data;
        });
    }
  }
})();
