(function() {
  "use strict";
  angular
    .module("rc.prime.template")
    .factory("TemplateService", TemplateService);
  TemplateService.$inject = ["$http", "application_configuration"];

  function TemplateService($http, application_configuration) {
    let API = {};

    API.AddNodeToTab = addNodeToTab;
    API.BookmarkTemplateItem = bookmarkTemplateItem;
    API.CreateTemplate = createTemplate;
    API.CreateTemplateTab = createTemplateTab;
    API.UpdateToolbarTabById = updateToolbarTabById;
    API.DeleteTemplate = deleteTemplate;
    API.DeleteTemplateTab = deleteTemplateTab;
    API.GetTemplates = getTemplates;
    API.GetTemplateTabsByTemplateId = getTemplateTabsByTemplateId;
    API.GetNodes = getNodes;
    API.GetTabItemsByTabId = getTabItemsByTabId;
    API.RemoveBookmarkedItemFromTemplate = removeBookmarkedItemFromTemplate;
    API.UpdateTemplate = updateTemplate;
    API.InsertTabItem = insertTabItem;
    API.RemoveTabItem = removeTabItem;
    API.UpdateTemplateLocation = updateTemplateLocation;

    return {
      API
    };

    function createTemplate(template_details) {
      return $http.post(
        application_configuration.itemAndRetailService.url +
          "/api/toolbar/template",
        template_details
      );
    }

    function createTemplateTab(template_id, tab_details) {
      return $http.post(
        application_configuration.itemAndRetailService.url +
          "/api/toolbar/template/" +
          template_id +
          "/tab",
        tab_details
      );
    }

    function updateToolbarTabById(data) {
      return $http.put(
        application_configuration.itemAndRetailService.url +
          "/api/toolbar/template/tab/" +
          data.id,
        data
      );
    }

    function addNodeToTab(tab_id, nodes) {
      return $http.post(
        application_configuration.itemAndRetailService.url +
          "/api/toolbar/template/tab/" +
          tab_id +
          "/add/nodes",
        nodes
      );
    }

    function getTemplates() {
      return $http
        .get(
          application_configuration.itemAndRetailService.url +
            "/api/toolbar/template"
        )
        .then(response => {
          let time =
            response.config.responseTimestamp -
            response.config.requestTimestamp;
          response.data.time_taken = time / 1000;
          return response.data;
        });
    }

    function getTemplateTabsByTemplateId(template_id) {
      return $http
        .get(
          application_configuration.itemAndRetailService.url +
            "/api/toolbar/template/" +
            template_id +
            "/fetch/tabs"
        )
        .then(response => {
          return response.data;
        });
    }

    function getTabItemsByTabId(tab_id) {
      return $http
        .get(
          application_configuration.itemAndRetailService.url +
            "/api/toolbar/template/tab/" +
            tab_id +
            "/items"
        )
        .then(response => {
          return response.data;
        });
    }

    function getNodes() {
      return $http
        .get(
          application_configuration.uddService.url +
            "/api/hierarchy/pehierarchy/treeview"
        )
        .then(response => {
          return response.data;
        });
    }

    function bookmarkTemplateItem(node_id, template_id, display_name) {
      let object = {
        display_name: display_name
      };
      return $http.post(
        application_configuration.itemAndRetailService.url +
          "/api/template/" +
          template_id +
          "/add/node/" +
          node_id,
        object
      );
    }

    function removeBookmarkedItemFromTemplate(node_id, template_id) {
      return $http.post(
        application_configuration.itemAndRetailService.url +
          "/api/template/" +
          template_id +
          "/remove/node/" +
          node_id
      );
    }

    function updateTemplate(template_details) {
      return $http.put(
        application_configuration.itemAndRetailService.url +
          "/api/toolbar/template/" +
          template_details.id,
        template_details
      );
    }

    function updateTemplateLocation(details) {
      return $http.put(
        application_configuration.itemAndRetailService.url +
          "/api/toolbar/template/" +
          details.id +
          "/location/" +
          details.location_id,
        details
      );
    }

    function deleteTemplate(template_id) {
      return $http.delete(
        application_configuration.itemAndRetailService.url +
          "/api/toolbar/template/" +
          template_id
      );
    }

    function deleteTemplateTab(tab_id) {
      return $http.delete(
        application_configuration.itemAndRetailService.url +
          "/api/toolbar/template/tab/" +
          tab_id
      );
    }

    function insertTabItem(data) {
      return $http.post(
        application_configuration.itemAndRetailService.url +
          "/api/toolbar/template/tab/" +
          data.tab_id +
          "/add/nodes",
        data
      );
    }

    function removeTabItem(tab_id, node_id) {
      return $http.post(
        application_configuration.itemAndRetailService.url +
          "/api/toolbar/template/tab/" +
          tab_id +
          "/remove/node/" +
          node_id
      );
    }
  }
})();
