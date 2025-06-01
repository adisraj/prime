"use strict";
class AttributeFactory {
  constructor($http, application_configuration) {
    this.endpoint = "/api";
    this.$http = $http;
    this.application_configuration = application_configuration;
  }
  FetchAttributes() {
    return this.$http
      .get(
        this.application_configuration.uddService.url +
          this.endpoint +
          "/attributes/"
      )
      .then(response => {
        let time =
          response.config.responseTimestamp - response.config.requestTimestamp;
        response.data.time_taken = time / 1000;
        return response;
      });
  }
  FetchAttributeById(id) {
    return this.$http.get(
      this.application_configuration.uddService.url +
        this.endpoint +
        "/attribute/" +
        id
    );
  }
  FetchFormats() {
    return this.$http.get(
      this.application_configuration.uddService.url +
        this.endpoint +
        "/attributes/formats/",
      {
        cache: false
      }
    );
  }
  FetchStatus() {
    return this.$http.get(
      this.application_configuration.uddService.url +
        this.endpoint +
        "/udd/status"
    );
  }
  FetchFilteredAttributes(filterData) {
    return this.$http.post(
      this.application_configuration.uddService.url +
        this.endpoint +
        "/attributes/filter",
      filterData
    );
  }
  CreateAttribute(attribute) {
    return this.$http.post(
      this.application_configuration.uddService.url +
        this.endpoint +
        "/attributes/",
      attribute
    );
  }
  UpdateAttribute(attribute) {
    return this.$http.put(
      this.application_configuration.uddService.url +
        this.endpoint +
        "/attribute/" +
        attribute.id,
      attribute
    );
  }
  DeleteAttribute(id) {
    return this.$http.delete(
      this.application_configuration.uddService.url +
        this.endpoint +
        "/attribute/" +
        id
    );
  }
  DeleteAttributeAndDependencies(id) {
    return this.$http.delete(
      this.application_configuration.uddService.url +
        this.endpoint +
        "/attribute/" +
        id + "/delete/dependencies"
    );  
  }
  FetchDimensionClasses(){
    return this.$http.get(
      this.application_configuration.uddService.url +
        this.endpoint +
        "/attribute/dimension/classes"
    );
  }
  FetchDimensionUnitsForClass(classId){
    return this.$http.get(
      this.application_configuration.uddService.url +
        this.endpoint +
        "/attribute/dimension/class/" + classId + "/units"
    );
  }
  FetchDimensionUnitAndClassByUnitID(unitId){
    return this.$http.get(
      this.application_configuration.uddService.url +
        this.endpoint +
        "/attribute/dimension/class/unit/" + unitId
    );
  }

  FetchAttributeValuesCount() {
    return this.$http.get(
      this.application_configuration.uddService.url +
        this.endpoint +
        "/attributes/values/count/",
      {
        cache: false
      }
    );
  }
}

angular
  .module("rc.prime.attributes")
  .factory("AttributeFactory", AttributeFactory);
