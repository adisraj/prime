(() => {
  "use strict";
  angular.module("rc.prime.templatesku").factory("TemplateSkuService", TemplateSkuService);
  TemplateSkuService.$inject = ["$http", "application_configuration"];

  function TemplateSkuService($http, application_configuration) {
    const baseUrl = `${application_configuration.templateSkuService.url}/api/template`
    let API = {};

    API.FetchTemplateSkus = fetchTemplateSkus;
    API.InsertTemplateSku = insertTemplateSku;
    API.UpdateTemplateSkuById = updateTemplateSkuById;
    API.DeleteTemplateSku = deleteTemplateSku;
    API.FetchTemplateSkuParametersByTemplateSku = fetchTemplateSkuParametersByTemplateSku;
    API.InsertTemplateSkuParameterByTemplateSku = insertTemplateSkuParameterByTemplateSku;
    API.UpdateTemplateSkuParameterByTemplateSku = updateTemplateSkuParameterByTemplateSku;
    API.DeleteTemplateSkuParameterByTemplateSku = deleteTemplateSkuParameterByTemplateSku;
    API.FetchTemplateSkuParameterChoicesByParameter = fetchTemplateSkuParameterChoicesByParameter;
    API.FetchTemplateSkuPackagesByTemplateSku = fetchTemplateSkuPackagesByTemplateSku;
    API.FetchTemplateSkuOptionsByTemplateSku = fetchTemplateSkuOptionsByTemplateSku;
    API.FetchLinkedParametersForOption = fetchLinkedParametersForOption;
    API.FetchTemplateSkuOptionChoicesByParameter = fetchTemplateSkuOptionChoicesByParameter;
    API.InsertTemplateOptionChoice = insertTemplateOptionChoice;
    API.UpdateTemplateOptionChoice = updateTemplateOptionChoice;
    API.DeleteTemplateOptionChoice = deleteTemplateOptionChoice;
    API.CreateTemplateOpion = createTemplateOpion;
    API.UpdateTemplateOpion = updateTemplateOpion;
    API.DeleteTemplateOpion = deleteTemplateOpion;
    API.CreateTemplatePackage = createTemplatePackage;
    API.UpdateTemplatePackage = updateTemplatePackage;
    API.DeleteTemplatePackage = deleteTemplatePackage;
    API.CreateTemplateParameterChoice = createTemplateParameterChoice;
    API.UpdateTemplateParameterChoice = updateTemplateParameterChoice;
    API.DeleteTemplateParameterChoice = deleteTemplateParameterChoice;

    API.GetOptionParameters = getOptionParameters;

    return { API };

    function fetchTemplateSkus() {
      return $http
        .get(baseUrl)
        .then(response => {
          return response.data;
        });
    }

    function insertTemplateSku(data) {
      return $http
        .post(`${baseUrl}`, data)
        .then(response => {
          return response.data;
        });
    }

    function updateTemplateSkuById(data) {
      return $http
        .put(`${baseUrl}/${data.id}`, data)
        .then(response => {
          return response.data;
        });
    }

    function deleteTemplateSku(data) {
      return $http
        .delete(`${baseUrl}/${data.id}`, data)
        .then(response => {
          return response.data;
        });
    }

    function fetchTemplateSkuParametersByTemplateSku(id) {
      return $http
        .get(`${baseUrl}/parameter/by/template/${id}`)
        .then(response => {
          return response.data;
        });
    }

    function insertTemplateSkuParameterByTemplateSku(data) {
      return $http
        .post(`${baseUrl}/parameter`,data)
        .then(response => {
          return response.data;
        });
    }

    function updateTemplateSkuParameterByTemplateSku(data){
      return $http
        .put(`${baseUrl}/parameter/${data.id}`,data)
        .then(response => {
          return response.data;
        });
    }

    function deleteTemplateSkuParameterByTemplateSku(data){
      return $http
        .delete(`${baseUrl}/parameter/${data.id}`,data)
        .then(response => {
          return response.data;
        });
    }

    function fetchTemplateSkuParameterChoicesByParameter(id) {
      return $http
        .get(`${baseUrl}/parameter/choice/by/parameter/${id}`)
        .then(response => {
          return response.data;
        });
    }

    function fetchTemplateSkuPackagesByTemplateSku(id) {
      return $http
        .get(`${baseUrl}/package/by/template/${id}`)
        .then(response => {
          return response.data;
        });
    }

    function fetchTemplateSkuOptionsByTemplateSku(id) {
      return $http
        .get(`${baseUrl}/options/by/template/${id}`)
        .then(response => {
          return response.data;
        });
    }

    function fetchLinkedParametersForOption(id) {
      return  $http
      .get(`${baseUrl}/options/${id}/parameters`)
      .then(response => {
        return response.data;
      });
    }

    function fetchTemplateSkuOptionChoicesByParameter(id) {
      return $http
        .get(`${baseUrl}/options/choices/by/option/${id}`)
        .then(response => {
          return response.data;
        });
    }

    function insertTemplateOptionChoice(data) {
      return $http
        .post(`${baseUrl}/options/choices`,data)
        .then(response => {
          return response.data;
        });
    }

    function updateTemplateOptionChoice(data) {
      return $http
        .put(`${baseUrl}/options/choices/${data.id}`,data)
        .then(response => {
          return response.data;
        });
    }

    function deleteTemplateOptionChoice(data) {
      return $http
        .delete(`${baseUrl}/options/choices/${data.id}`,data)
        .then(response => {
          return response.data;
        });
    }

    function createTemplateOpion(data) {
      return $http
        .post(`${baseUrl}/options`, data)
        .then(response => {
          return response.data;
        });
    }

    function updateTemplateOpion(data) {
      return $http
        .put(`${baseUrl}/options/${data.id}`, data)
        .then(response => {
          return response.data;
        });
    }

    function deleteTemplateOpion(id) {
      return $http
        .delete(`${baseUrl}/options/${id}`)
        .then(response => {
          return response.data;
        });
    }

    function createTemplatePackage(data) {
      return $http
        .post(`${baseUrl}/package`, data)
        .then(response => {
          return response.data;
        });
    }

    function updateTemplatePackage(data) {
      return $http
        .put(`${baseUrl}/package/${data.id}`, data)
        .then(response => {
          return response.data;
        });
    }

    function deleteTemplatePackage(id) {
      return $http
        .delete(`${baseUrl}/package/${id}`)
        .then(response => {
          return response.data;
        });
    }

    function createTemplateParameterChoice(data) {
      return $http
        .post(`${baseUrl}/parameter/choice`, data)
        .then(response => {
          return response.data;
        });
    }

    function updateTemplateParameterChoice(data) {
      return $http
        .put(`${baseUrl}/parameter/choice/${data.id}`, data)
        .then(response => {
          return response.data;
        });
    }

    function deleteTemplateParameterChoice(id) {
      return $http
        .delete(`${baseUrl}/parameter/choice/${id}`)
        .then(response => {
          return response.data;
        });
    }

    function getOptionParameters(optionId) {
      return $http
      .get(`${baseUrl}/options/${optionId}/parameters`)
      .then(response => {
        return response.data;
      });
    }
  }
})();
