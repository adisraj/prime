calculus.service("CrudService", [
  "$q",
  function($q) {
    var table = {};
    var crudApp = {
      getTableRef: function(_tableRef, response, returnvalue) {
        table = _tableRef.getTable(response, returnvalue);
        return table;
      },
      refetchTable: function() {},
      saveItem: function(_saveRef, _apiRef, data, returnMethod) {
        var deferred = $q.defer();

        _saveRef(new _apiRef(), data, "returnMethod").then(
          function(response) {
            if (response.status == 201) {
              deferred.resolve(response);
            }
          },
          function(error) {
            deferred.reject(error);
          }
        );
        return deferred.promise;
      },
      updateItem: function(_updateRef, _apiRef, data, returnMethod) {
        var deferred = $q.defer();

        _updateRef(new _apiRef(), data, "returnMethod").then(
          function(response) {
            deferred.resolve(response);
          },
          function(error) {
            deferred.reject(error);
          }
        );
        return deferred.promise;
      },
      deleteItem: function(_delRef, _apiRef, data, index, returnMethod) {
        var deferred = $q.defer();
        _delRef(new _apiRef(), data, "returnMethod").then(
          function(response) {
            if (response.status == 200) {
              table.data.splice(index, 1);
              deferred.resolve(response);
            }
          },
          function(error) {
            deferred.reject(error);
          }
        );
        return deferred.promise;
      },
      clear: function(argument) {}
    };
    return crudApp;
  }
]);
calculus.service("SessionService", [
  "$http",
  "application_configuration",
  "$window",
  "$q",
  function($http, application_configuration, $window, $q) {
    this.isLoggedIn = function() {
      var d = $q.defer();
      $http
        .get(application_configuration.authenticationServer + "/session")
        .success(function(data, status) {
          if (data.status == 200) {
            $window.sessionStorage.token = data.token;
            $window.sessionStorage.name = data.username;
            $window.sessionStorage.userid = data.current_user_id;
          }
          d.resolve(data);
        })
        .error(function(error) {});
      return d.promise;
    };
    return {
      isLoggedIn: this.isLoggedIn,
      setLogin: false
    };
  }
]);

calculus
  .service("UserAccessAllPermissionsService", [
    "$q",
    "API",
    "AuthorizationDataFactory",
    function($q, API, AuthorizationDataFactory) {
      var AuthAPI = AuthorizationDataFactory.AuthAPI("");
      Array.prototype.getQueryCommaSeparatedStrings = function() {
        var len = this.length;
        var queryString = "";
        var i = 0;
        _.each(this, function(sItem) {
          i++;
          queryString += "'" + sItem + "'";

          if (len > 1 && i !== len) {
            queryString += ",";
          }
        });
        return queryString;
      };
      var self = this;
      this.getAllUserRolesPermissionsByPrefixes = function(prefixes) {
        var defer = $q.defer();
        AuthAPI.UserRolesPermissionsByPrefixes.query(
          {
            prefixes: prefixes
          },
          function(response) {
            this.accessRulesMap = {};
            _.each(response.data, function(userPermObj) {
              if (this.accessRulesMap[userPermObj.prefix] === undefined) {
                this.accessRulesMap[userPermObj.prefix] = {};
                this.accessRulesMap[userPermObj.prefix][
                  userPermObj.permission
                ] = {
                  value: 1
                };
                this.accessRulesMap[userPermObj.prefix]["prefixId"] =
                  userPermObj.entity_id;
                this.accessRulesMap[userPermObj.prefix]["name"] =
                  userPermObj.entity;
              } else {
                this.accessRulesMap[userPermObj.prefix][
                  userPermObj.permission
                ] = {
                  value: 1
                };
                this.accessRulesMap[userPermObj.prefix]["prefixId"] =
                  userPermObj.entity_id;
                this.accessRulesMap[userPermObj.prefix]["name"] =
                  userPermObj.entity;
              }
            });
            defer.resolve(this.accessRulesMap);
          },
          function(error) {}
        );
        return defer.promise;
      };
      this.getAllUserRolesPermissionsByUUIDs = function(uuids) {
        var defer = $q.defer();
        AuthAPI.UserRolesPermissionsByUUIDs.query(
          {
            uuids: uuids
          },
          function(response) {
            this.accessRulesMap = {};
            for (var i = 0; i < response.data.length; i++) {
              var userPermObj = response.data[i];
              if (this.accessRulesMap[userPermObj.uuid] === undefined) {
                this.accessRulesMap[userPermObj.uuid] = {};
                this.accessRulesMap[userPermObj.uuid][
                  userPermObj.permission
                ] = {
                  value: 1
                };
                this.accessRulesMap[userPermObj.uuid]["prefixId"] =
                  userPermObj.entity_id;
                this.accessRulesMap[userPermObj.uuid]["name"] =
                  userPermObj.entity;
              } else {
                this.accessRulesMap[userPermObj.uuid][
                  userPermObj.permission
                ] = {
                  value: 1
                };
                this.accessRulesMap[userPermObj.uuid]["prefixId"] =
                  userPermObj.entity_id;
                this.accessRulesMap[userPermObj.uuid]["name"] =
                  userPermObj.entity;
              }
            }
            defer.resolve(this.accessRulesMap);
          },
          function(error) {}
        );
        return defer.promise;
      };
      return {
        getAllPermissions: this.getAllUserRolesPermissionsByPrefixes,
        getAllPermissionsByUUIDs: this.getAllUserRolesPermissionsByUUIDs
      };
    }
  ])

  // =========================================================================
  // Header Messages and Notifications list Data
  // =========================================================================

  .service("messageService", [
    "$resource",
    function($resource) {
      this.getMessage = function(img, user, text) {
        var gmList = $resource("data/messages-notifications.json");

        return gmList.get({
          img: img,
          user: user,
          text: text
        });
      };
    }
  ])

  .service("scrollService", function() {
    var ss = {};
    ss.malihuScroll = function scrollBar(selector, theme, mousewheelaxis) {
      $(selector).mCustomScrollbar({
        theme: theme,
        scrollInertia: 100,
        axis: "yx",
        mouseWheel: {
          enable: true,
          axis: mousewheelaxis,
          preventDefault: true
        }
      });
    };

    return ss;
  })

  //==============================================
  // BOOTSTRAP GROWL
  //==============================================

  .service("growlService", function() {
    var gs = {};
    gs.growl = function(message, type) {
      $.growl(
        {
          message: message
        },
        {
          type: type,
          allow_dismiss: false,
          label: "Cancel",
          className: "btn-xs btn-inverse",
          placement: {
            from: "top",
            align: "right"
          },
          delay: 2500,
          animate: {
            enter: "animated bounceIn",
            exit: "animated bounceOut"
          },
          offset: {
            x: 20,
            y: 85
          }
        }
      );
    };

    return gs;
  })

  .factory("programNumber", [
    "program_number",
    "application_configuration",
    function(program_number, application_configuration) {
      return {
        setProgramNumber: function(parm, scope) {
          if (parm == undefined) {
            scope.mactrl.program_number = "NA";
            return;
          }
          for (key in program_number.program_number_list) {
            if (parm.indexOf(key) > -1) {
              scope.mactrl.program_number =
                application_configuration.appShortName +
                "-" +
                program_number.program_number_list[key];
              break;
            } else {
              scope.mactrl.program_number = "NA";
            }
          }
        }
      };
    }
  ])

  .service("GroupByService", function() {
    let data = {};
    return {
      setData: function(tableName, key, value, viewValue, altTitle) {
        if (data[tableName] === undefined) {
          data[tableName] = {};
          data[tableName][key] = {
            value: value,
            view_value: viewValue,
            alt_title: altTitle
          };
        } else {
          data[tableName][key] = {
            value: value,
            view_value: viewValue,
            alt_title: altTitle
          };
        }
      },
      getData: function(tableName) {
        return data[tableName];
      }
    };
  })

  .service("viewDataChangeService", function() {
    var viewData = {};
    var mapData = {};
    return {
      setViewData: function(res) {
        viewData = res.data;
        _.each(res.data, function(record) {
          mapData[record.id] = record;
        });
      },
      checkSameData: function(data) {
        var sameData = true;
        let notEntered = true;
        var forbidList = [
          "genericList",
          "updated_dt",
          "updated_by",
          "created_dt",
          "created_by"
        ];
        //viewData - Previous Data
        // data - New Data

        angular.forEach(viewData.data, function(value, key) {
          if (parseInt(value.id) == parseInt(data.id)) {
            notEntered = false;
            for (var colName in value) {
              if (forbidList.indexOf(colName) > -1) {
                continue;
              }
              if (data[colName] == undefined) {
                sameData = false;
              } else {
                let viewSource =
                  value[colName] !== null ? value[colName].toString() : null;
                let pageSource =
                  data[colName] !== null ? data[colName].toString() : null;
                if (parseInt(pageSource) == 1) {
                  pageSource = "true";
                } else if (parseInt(pageSource) == 0) {
                  pageSource = "false";
                }
                if (parseInt(viewSource) == 1) {
                  viewSource = "true";
                } else if (parseInt(viewSource) == 0) {
                  viewSource = "false";
                }
                if (pageSource != viewSource) {
                  sameData = false;
                }
              }
            }
          }
        });
        if (notEntered) {
          return false;
        } else {
          return sameData;
        }
      },
      getViewData: function() {
        return viewData;
      },
      getOriginalRecord: function(id) {
        return mapData[id];
      }
    };
  });

function schemaWithValidationService(EntityDataService, $q) {
  this.entityName = null;
  return {
    setEntityName: function(name) {
      this.entityName = name;
    },
    getModel: function(entityName, microServiceName) {
      this.entityName = entityName;
      var deferObject = deferObject || $q.defer();
      EntityDataService.EntityDetails.getModel(
        entityName,
        microServiceName
      ).then(res => {
        deferObject.resolve(res);
      });
      return deferObject.promise;
    },
    getUpdateConstraints: function(model) {
      var updateConstraints = {};
      _.map(model, function(value, key) {
        if (value.rules !== undefined && value.rules !== null) {
          if (value.rules.create_validation_rules !== undefined) {
            var rule = value.rules.create_validation_rules.split("|");
            _.each(rule, function(r, index) {
              if (index == 0) {
                updateConstraints[key] = {};
              }
              if (r == "required") {
                updateConstraints[key][r] = {
                  message: "The " + model[key]["title"] + " is required !"
                };
              } else if (r == "string") {
                updateConstraints[key]["string"] = {
                  message: "" + model[key]["title"] + " must be string"
                };
              } else if (r.indexOf(":") !== -1) {
                var nrule = r.split(":");
                if (
                  nrule[0] == "min" ||
                  nrule[0] == "max" ||
                  nrule[0] == "minimum" ||
                  nrule[0] == "maximum"
                ) {
                  if (updateConstraints[key]["size"] == undefined) {
                    updateConstraints[key]["size"] = {};
                    updateConstraints[key]["size"][nrule[0]] = parseInt(
                      nrule[1]
                    );
                    updateConstraints[key]["size"]["message"] = "Length ( " + r;
                  } else {
                    updateConstraints[key]["size"][nrule[0]] = parseInt(
                      nrule[1]
                    );
                    updateConstraints[key]["size"]["message"] +=
                      " & " + r + ") chars";
                  }
                } else if (nrule[0] == "regex") {
                  updateConstraints[key]["pattern"] = {
                    value: nrule[1],
                    message: "" + model[key]["title"] + value.message
                  };
                }
              } else if (r == "integer") {
                updateConstraints[key]["digits"] = {
                  integer: 10,
                  message:
                    model[key]["title"] +
                    " should be integer number upto (10 digits)"
                };
              } else if (r == "numeric") {
                updateConstraints[key]["digits"] = {
                  integer: 10,
                  fraction: 2,
                  message: "" + model[key]["title"] + " should be numeric"
                };
              } else if (r == "numeric") {
                updateConstraints[key]["digits"] = {
                  integer: 10,
                  fraction: 2,
                  message: "" + model[key]["title"] + " should be numeric"
                };
              } else if (r == "boolean") {
                updateConstraints[key]["boolean"] = {
                  message: "" + model[key]["title"] + " should be boolean"
                };
              } else if (r == "date" && value.validation == "future") {
                updateConstraints[key]["nextEffectiveDate"] = {
                  message:
                    "" +
                    model[key]["title"] +
                    " should be current date or future date"
                };
              } else if (r == "date" && value.validation == "past") {
                updateConstraints[key]["effectiveDate"] = {
                  message:
                    "" +
                    model[key]["title"] +
                    " should be current date or past date"
                };
              }
            });
          }
        }
      });
      var obj = {};
      obj[this.entityName.toUpperCase()] = updateConstraints;
      return obj;
    }
  };
}

schemaWithValidationService.$inject = ["EntityDataService", "$q"];
calculus.service("schemaWithValidationService", schemaWithValidationService);

function loadDynamicTableService() {
  this.default_group_by_flag = "";
  return {
    setValue: function(flag) {
      this.default_group_by_flag = flag;
    },
    getTableData: function(response, returnValue) {
      if (
        returnValue !== "" &&
        returnValue !== "NONE" &&
        returnValue !== null
      ) {
      } else {
        if (
          returnValue !== "NONE" &&
          returnValue !== "" &&
          returnValue !== null
        ) {
        } else {
          returnValue = "";
        }
      }
      return {
        result: response,
        returnValue: returnValue
      };
    }
  };
}

loadDynamicTableService.$inject = [];
calculus.service("loadDynamicTableService", loadDynamicTableService);

/**
 *  Service for creating dynamic columns
 */
function generateDynamicTableColumnsService() {
  return {
    getTableColumns: function(
      model,
      supportActions,
      alterTitles,
      drillTo,
      metadata
    ) {
      var cols = [];

      var dropdownList = [{ prefix: "", name: "Group By None" }];
      _.map(model, function(value, key) {
        var title = "";
        var class_name = "";
        var alt_title = "";
        if (alterTitles.hasOwnProperty(key)) {
          title = alterTitles[key];
          alt_title = title;
        } else {
          title = value.title;
        }
        var field = key;
        if (value.ngModel !== undefined) {
          field = value.ngModel;
        }
        var sortable = field;
        if (value.is_view_value == true || value.view_value !== undefined) {
          sortable = value.view_value;
        }

        var column = {
          title: title,
          alt_title: alt_title,
          field: field,
          sortable: key,
          show: value.show,
          edit: value.edit,
          class: class_name,
          ui_component: value.ui_component,
          view_value: value.view_value,
          is_view_value: value.is_view_value,
          sortable: sortable,
          options: value.options,
          groupable: { prefix: sortable, name: title },
          error: key + "_error"
        };
        if (value.ui_component) {
          if (value.title !== "ID") {
            dropdownList.push({ prefix: sortable, name: title });
          }
          cols.push(column);
        }
      });
      _.map(drillTo, function(value, key) {
        var _obj = {
          title: value.title,
          field: key,
          show: value.show,
          ui_component: "drill-to",
          class: "iconcolumnwidthCompany"
        };
        if (value.headerTemplateURL !== undefined) {
          _obj.headerTemplateURL = value.headerTemplateURL;
        }
        if (value.seq !== undefined && value.seq !== null) {
          cols.splice(value.seq, 0, _obj);
        } else {
          cols.push(_obj);
        }
      });
      var _meta_data = {
        title: "  Data Lake ",
        field: "drillToMetaData",
        show: true,
        ui_component: "meta-data",
        class: "iconcolumnwidthCompany"
      };
      cols.push(_meta_data);

      return { cols: cols, dropdownList: dropdownList };
    }
  };
}

generateDynamicTableColumnsService.$inject = [];
calculus.service(
  "generateDynamicTableColumnsService",
  generateDynamicTableColumnsService
);

/** Load Models and Set validation  */
calculus.service("loadAllModelsService", function(
  $q,
  schemaWithValidationService
) {
  return function(models, microServiceName) {
    var promises = [];
    angular.forEach(models, function(modelName) {
      var deffered = $q.defer();
      schemaWithValidationService.getModel(modelName, microServiceName).then(
        res => {
          deffered.resolve({ model: res.model, name: modelName });
        },
        error => {
          deffered.reject();
        }
      );
      promises.push(deffered.promise);
    });
    return $q.all(promises);
  };
});

calculus.service("HierarchyValuesTreePathService", [
  "HierarchyValueService",
  "$q",
  function(HierarchyValueService, $q) {
    return {
      map: "",
      initHierarchyValueMap: function() {
        var hierarachyValuesMap = {};
        var deferred = $q.defer();
        HierarchyValueService.API.GetHierarchyValues().then(
          function(res) {
            _.each(res, function(hierarchyValue) {
              hierarachyValuesMap[hierarchyValue.id] = hierarchyValue;
            });
            deferred.resolve(hierarachyValuesMap);
          },
          function(error) {
            deferred.reject(error);
          }
        );
        return deferred.promise;
      },
      getMap: function() {
        this.map = this.initHierarchyValueMap();
        return this.map;
      },
      getTreePath: function(map, actualHierValId, path) {
        if (path == null || path === "" || path == "null") {
          path = map[actualHierValId]["short_description"];
        } else {
          var ids = path.split(">");
          path = "";
          ids.push("" + actualHierValId);
          var i = 0;
          _.each(ids, function(hId) {
            i++;
            if (map[hId]) {
              if (ids.length === i && hId !== "null" && hId !== "") {
                path += map[hId]["short_description"];
              } else if (hId !== "null" && hId !== "") {
                path += map[hId]["short_description"] + ">";
              }
            }
          });
        }
        return path;
      }
    };
  }
]);
