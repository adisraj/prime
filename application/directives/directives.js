compareTo = () => {
  return {
    require: "ngModel",
    scope: {
      otherModelValue: "=compareTo"
    },
    link: (scope, element, attributes, ngModel) => {
      ngModel.$validators.compareTo = function (modelValue) {
        return modelValue == scope.otherModelValue;
      };

      scope.$watch("otherModelValue", () => {
        ngModel.$validate();
      });
    }
  };
};

calculus.directive("compareTo", compareTo);

calculus.directive("limitToMax", () => {
  return {
    link: (scope, element, attributes) => {
      element.on("keydown keyup", e => {
        if (
          Number(element.val()) > Number(attributes.max) &&
          e.keyCode != 46 && // delete
          e.keyCode != 8 // backspace
        ) {
          // e.preventDefault();
          element.val(attributes.max);
        }
      });
    }
  };
});

calculus.directive("allowOnlyNumbers", () => {
  return {
    restrict: "A",
    link: (scope, elm, attrs, ctrl) => {
      elm.on("keydown", event => {
        if (event.which == 64 || event.which == 16) {
          // to allow numbers
          return false;
        } else if (event.which >= 48 && event.which <= 57) {
          // to allow numbers
          return true;
        } else if (event.which >= 96 && event.which <= 105) {
          // to allow numpad number
          return true;
        } else if ([8, 13, 27, 37, 38, 39, 40].indexOf(event.which) > -1) {
          // to allow backspace, enter, escape, arrows
          return true;
        } else {
          event.preventDefault();
          // to stop others
          return false;
        }
      });
    }
  };
});

/**
 * Right Click Directive
 */

calculus.directive("ngRightClick", $parse => {
  return (scope, element, attrs) => {
    var fn = $parse(attrs.ngRightClick);
    element.bind("contextmenu", event => {
      scope.$apply(() => {
        event.preventDefault();
        fn(scope, {
          $event: event
        });
      });
    });
  };
});

calculus.directive("displayGroupHeader", () => {
  var groupHeaderController = [
    "$scope",
    $scope => {
      $scope.$on("collapseAll", (event, args) => { });
    }
  ];
  return {
    restrict: "A",
    template: "{{groupHeaderName}}",
    controller: groupHeaderController,
    scope: {
      selectedvalue: "=",
      values: "=",
      setGroupHeader: "@"
    },
    link: (scope, element, attrs) => {
      scope.$watch("selectedvalue", newVal => {
        var firstRecord = scope.values;
        scope.groupHeaderName = firstRecord[scope.selectedvalue];
        if (
          scope.groupHeaderName === 1 ||
          scope.groupHeaderName === true ||
          scope.groupHeaderName === "true"
        ) {
          scope.groupHeaderName = "Yes";
        } else if (
          scope.groupHeaderName === 0 ||
          scope.groupHeaderName === false ||
          scope.groupHeaderName === "false"
        ) {
          scope.groupHeaderName = "No";
        }
      });
    }
  };
});

calculus.directive("hideShowColumns", $window => {
  return {
    restrict: "A",
    scope: {
      hideShowInput: "=",
      tableName: "@?",
      colsLocalStorageName: "=",
      imageName: "@"
    },
    templateUrl: "template/app-specific/hideshowcolumns.html",
    link: (scope, element, attrs) => {
      scope.move = (col, currentIdx, direction) => {
        var value = 0;
        if (direction == "down") {
          value = 1;
        } else {
          value = -1;
        }
        var newPosition = currentIdx + value;
        if (newPosition >= scope.hideShowInput.length || newPosition < 0) {
          return;
        }
        var temp = scope.hideShowInput[currentIdx];

        scope.hideShowInput[currentIdx] = scope.hideShowInput[newPosition];
        scope.hideShowInput[newPosition] = temp;
        $window.localStorage.setItem(
          scope.colsLocalStorageName,
          JSON.stringify(scope.hideShowInput)
        );
      };

      function toTitleCase(str) {
        if (typeof str !== "function") {
          return str.replace(/\w\S*/g, txt => {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
          });
        } else {
          return str();
        }
      }

      scope.$watchGroup(["hideShowInput"], newVal => {
        var toBeRemoved = [];
        angular.forEach(scope.hideShowInput, (value, key) => {
          value.title = toTitleCase(value.title);
          value.title = value.title.replace(/iso/i, "ISO");
          value.title = value.title.replace(/id/i, "ID");
          value.title = value.title.replace(/sku/i, "SKU");
          value.title = value.title.replace(/udd/i, "UDD");
          if (value.title.toUpperCase() == "ID") {
            value.show = false;
          }

          if (value.ui_component === undefined) {
            toBeRemoved.push(key);
          }
        });
        for (var j = toBeRemoved.length - 1; j >= 0; j--) {
          scope.hideShowInput.splice(toBeRemoved[j], 1);
        }
      });
    }
  };
});

calculus.directive("autoComplete", function ($filter, $timeout) {
  return function (scope, iElement, iAttrs) {
    iElement.autocomplete({
      source: function (request, response) {
        //term has the data typed by the user
        var params = request.term;
        var data = scope[iAttrs.uiItems];
        //key value is for sending the key value from the html page
        var key = iAttrs.uiKey;
        if (data) {
          var obj = {};
          obj[key] = params;
          var result = $filter("filter")(data, obj);
          angular.forEach(result, function (item) {
            item["value"] = item[key];
          });
        }
        if (iAttrs.uiArrayLength !== undefined) {
          scope[iAttrs.uiArrayLength] = result.length;
        }
        response(result);
      },
      minLength: 0,
      select: function (event, ui) {
        //force a digest cycle to update the views
        scope.$apply(function () {
          /*uiValue : This will send the id to the html page.
                      This id is used for save and update purpose*/
          scope[iAttrs.uiValue] = ui.item.id;
        });
      }
    });
  };
});

calculus.directive("errorvalue", function () {
  return {
    restrict: "A",
    replace: true,
    scope: {
      errorvalue: "="
    },
    link: function (scope, element, attr) {
      scope.$watch("errorvalue", function (newValue) {
        $(element)
          .parent("div")
          .find(".errormsgfont")
          .html("");
        $(element).css("border", "");
        $(element).attr("title", "");
        if (newValue != undefined && newValue.length > 0) {
          $(element).css("border", "1px solid #f6675d");
          $(element).attr("title", newValue);
          $(element)
            .parent("div")
            .append("<span class='errormsgfont'>" + newValue + "</span>");
        }
      });
    }
  };
});

calculus.directive("errorvaluechosen", function ($timeout) {
  scope = {
    errorvaluechosen: "="
  };
  /* linker for the directive */
  function linker(scope, element, attr) {
    scope.$watch("errorvaluechosen", function (newValue) {
      $(element)
        .closest(".fg-line")
        .parent("div")
        .find("p")
        .html("");
      $(element).css("border", "");
      $(element).attr("title", "");
      if (newValue != undefined && newValue.length > 0) {
        $(element).css("border", "1px solid red");
        $(element).attr("title", newValue);
        $(element)
          .closest(".fg-line")
          .parent("div")
          .append(
          '<p style="margin-bottom:0px;"><span class="errorMessage">' +
          newValue +
          "</span></p>"
          );
        //$('.errorMessages').append('<li><span style="color:red;">' + newValue + '</span></li><br/>');
      }
    });
  }
  // return the directive
  return {
    name: "errorvaluechosen",
    scope: scope,
    restrict: "A",
    link: linker
  };
});

calculus.directive("autoFocus", function ($timeout) {
  return {
    restrict: "AC",
    link: function (_scope, _element) {
      $timeout(function () {
        _element[0].focus();
      }, 0);
    }
  };
});

calculus.directive("recentHistory", function () {
  return {
    restrict: "E",
    scope: {
      entityuddid: "=",
      instanceid: "=",
      microservice: "=",
      showtext: "@",
      tabIndexValue: "="
    },
    replace: false,
    /*template: "<div style='padding: 10px 0px 0px 10px; text-align: center;'><a data-ng-click='loadHistory();' style='margin:2px 0px 2px 2px;color:inherit;cursor:pointer;'><img class='p-r-5' src='../../img/update_history.svg' style='height:25px;'></img>View update history</a></div>",*/
    templateUrl: "template/app-specific/history.html",
    controller: function ($scope, ChangeHistoryService) {
      var self = this;
      $scope.showHistory = function () {
        $scope.showhistory = true;
        $scope.$emit("toggleHistory", {
          history: true
        });
      };

      $scope.$on("toggleHistory", function (e, args) {
        $scope.showhistory = args.history;
      });

      $scope.closeShowHistory = function () {
        $scope.showhistory = false;
        $scope.$emit("toggleHistory", {
          history: false
        });
      };
      $scope.$watch("instanceid", function (n, o) {
        ChangeHistoryService.get_change_history(
          $scope.microservice,
          $scope.entityuddid,
          $scope.instanceid
        ).then(
          function (response) {
            $scope.historyList = response.data;
          },
          function (error) { }
          );
      });
    }
  };
});

//Directive to update display sequence and move rows up/down
calculus.directive("moveUpDownRows", function () {
  return {
    restrict: "E",
    scope: {
      filterValues: "=",
      apiInstanceDisplayValues: "=",
      displaySequence: "=",
      instanceId: "=",
      update: "=",
      length: "=",
      loadColumnFn: "&",
      typeUddTable: "=",
      updateInfoFn: "&"
    },
    templateUrl: "template/move_up_down_rows.html",
    controller: $scope => {
      $scope.fist = false;
      $scope.last = false;
      ///set up and down arrows to first and last record in the list
      if ($scope.displaySequence == 1) {
        $scope.first = true;
      } else if (
        $scope.displaySequence ==
        $scope.filterValues[$scope.length - 1].display_sequence
      ) {
        $scope.last = true;
      }

      ///function called on arrow clicked to move row up/down
      $scope.updateDisplaySequence = function (
        apiInstance,
        movement,
        valuesData,
        instanceId,
        reloadMethod
      ) {
        ///Find index position of the instance in array by instance id
        let pos = valuesData.findIndex(instance => instance.id === instanceId);

        //set field to be show in message in UI
        let fieldToUpdate;
        valuesData[pos].display_sequence
          ? (fieldToUpdate = "Display sequence")
          : (fieldToUpdate = "Priority");
        $scope.updateInfoFn({
          data: {
            message: "Updating " + fieldToUpdate + " ..."
          }
        }); //function call to show message in UI on click of up/down arrow

        let firstValue = null,
          nextValue = null;
        let temp = null;

        if (movement === "Down") {
          //if down arrow clicked then prepare object to updated
          temp = null;
          firstValue = valuesData[pos];
          nextValue = valuesData[pos + 1];
          let tempDispSeq = nextValue.display_sequence || nextValue.priority;

          //if priority field is present then update priority else update display sequence
          !firstValue.display_sequence
            ? (nextValue.priority = firstValue.priority)
            : (nextValue.display_sequence = firstValue.display_sequence);
          !nextValue.display_sequence && nextValue.priority
            ? (firstValue.priority = tempDispSeq)
            : (firstValue.display_sequence = tempDispSeq);
        } else {
          //if up arrow clicked then prepare object to updated
          firstValue = valuesData[pos - 1];
          nextValue = valuesData[pos];
          let tempDispSeq = nextValue.display_sequence || nextValue.priority;

          //if priority field is present then update priority else update display sequence
          !firstValue.display_sequence
            ? (nextValue.priority = firstValue.priority)
            : (nextValue.display_sequence = firstValue.display_sequence);
          !nextValue.display_sequence && nextValue.priority
            ? (firstValue.priority = tempDispSeq)
            : (firstValue.display_sequence = tempDispSeq);
        }

        //set arrows column to false to reload
        $scope.loadColumnFn({
          flag: false
        });
        //Update API is called
        apiInstance(firstValue)
          .then(response => {
            apiInstance(nextValue)
              .then(result => {
                if (movement === "Down") {
                  valuesData[pos + 1] = firstValue;
                  valuesData[pos] = nextValue;
                } else {
                  valuesData[pos] = firstValue;
                  valuesData[pos - 1] = nextValue;
                }
                $scope.loadColumnFn({
                  flag: true
                }); //set arrows column to true to reload

                //function call to show message in UI when updated successfully
                $scope.updateInfoFn({
                  data: {
                    success: true,
                    message: fieldToUpdate + " updated successfully!"
                  }
                });
              })
              .catch(error => {
                $scope.loadColumnFn({
                  flag: true
                }); //set arrows column to true to reload
                //if update sequence request fails, then show error message in UI.
                $scope.updateInfoFn({
                  data: {
                    error: true,
                    message:
                    "Unable to update " +
                    fieldToUpdate +
                    ". Please contact Administrator."
                  }
                });
              });
          })
          .catch(error => {
            $scope.loadColumnFn({
              flag: true
            }); //set arrows column to true to reload
            //if update sequence request fails, then show error message in UI.
            $scope.updateInfoFn({
              data: {
                error: true,
                message:
                "Unable to update " +
                fieldToUpdate +
                ". Please contact Administrator."
              }
            });
          });
      };
    },
    replace: true
  };
});

calculus.directive("keybinding", function () {
  return {
    restrict: "E",
    scope: {
      invoke: "&"
    },
    link: function (scope, el, attr) {
      Mousetrap.bind(attr.on, function (e) {
        scope.invoke();
        scope.$apply();
        if (e.preventDefault) {
          e.preventDefault();
        } else {
          // internet explorer
          e.returnValue = false;
        }
      });
    }
  };
});

calculus.directive("moveRecord", [
  "$document",
  function ($document) {
    return {
      restrict: "A",
      controller: function ($scope) {
        $scope.$watch("setinstance.data", function (o, n) {
          $scope.setinstance.data = o;
        });
        var totalpage = Math.round(
          $scope.setinstance.total() / $scope.setinstance.count()
        );
        if (
          $scope.setinstance.total() % $scope.setinstance.count() > 0 &&
          $scope.setinstance.total() % $scope.setinstance.count() < 5
        ) {
          totalpage = totalpage + 1;
        }
        $scope.nextrec = function (entity, indexvalue) {
          var details = {};
          if (
            indexvalue === $scope.setinstance.data.length - 1 &&
            $scope.setinstance.page() <= totalpage
          ) {
            if ($scope.setinstance.page() < totalpage) {
              $scope.setinstance.page($scope.setinstance.page() + 1);
            } else if (
              indexvalue === $scope.setinstance.data.length - 1 &&
              $scope.setinstance.page() === totalpage
            ) {
              $scope.setinstance.page(1);
            }
            indexvalue = ++indexvalue % $scope.setinstance.data.length;
            details = $scope.setinstance.data[indexvalue];
          } else {
            indexvalue = ++indexvalue;
            details = $scope.setinstance.data[indexvalue];
          }
          $scope.$parent.setNextOrPrevRecord(entity, details, indexvalue);
        };
        $scope.previousrec = function (entity, indexvalue) {
          var details = {};
          if (indexvalue <= 0 && $scope.setinstance.page() >= 1) {
            if (indexvalue == 0) {
              $scope.setinstance.page($scope.setinstance.page() - 1);
            } else if (indexvalue == 0 && $scope.setinstance.page() == 1) {
              $scope.setinstance.page(totalpage);
            }
            indexvalue = $scope.setinstance.data.length - 1;
            details = $scope.setinstance.data[indexvalue];
          } else {
            indexvalue = --indexvalue;
            details = $scope.setinstance.data[indexvalue];
          }
          $scope.$parent.setNextOrPrevRecord(entity, details, indexvalue);
        };
      }
    };
  }
]);

//  calculus.directive('arrowSelector', ['$document', function($document) {
//      return {
//          restrict: 'A',
//          link: function(scope, elem, attrs) {
//              /**
//               *  document need to unbind when state changes
//               */
//              scope.$on('$destroy', function() {
//                  $document.off('keydown', null);
//              });
//              var elemFocus = false;
//              elem.on('mouseenter', function() {
//                  elemFocus = true;
//              });
//              elem.on('mouseleave', function() {
//                  elemFocus = false;
//              });
//              $document.bind('keydown', function(e) {
//                  if (elemFocus) {
//                      if (e.keyCode == 38) { //Up arrow key
//                          if (scope.selectedRow == 0) {
//                              if (scope.setinstance.page() !== 1) {
//                                  scope.setinstance.page(scope.setinstance.page() - 1);
//                                  scope.selectedRow = scope.setinstance.count();
//                                  e.preventDefault();
//                                  return;
//                              } else {
//                                  return;
//                              }
//                          }
//                          scope.selectedRow--;
//                          scope.$apply();
//                          e.preventDefault();
//                      }
//                      if (e.keyCode == 40) { //Down arrow key
//                          var totalpage = Math.round(scope.setinstance.total() / scope.setinstance.count());
//                          if ((scope.setinstance.total() % scope.setinstance.count()) > 0 && (scope.setinstance.total() % scope.setinstance.count()) < 5) {
//                              totalpage = totalpage + 1;
//                          }
//                          if (scope.setinstance.page() === totalpage) {
//                              if (scope.selectedRow == scope.setinstance.data.length - 1) {
//                                  return;
//                              }
//                          } else {
//                              if (scope.selectedRow == scope.setinstance.data.length - 1) {
//                                  scope.setinstance.page(scope.setinstance.page() + 1);
//                                  scope.selectedRow = 0;
//                                  scope.$apply();
//                                  e.preventDefault();
//                                  return;
//                              }
//                          }
//                          scope.selectedRow++;
//                          scope.$apply();
//                          e.preventDefault();
//                      }
//                      if (e.keyCode == 13) { //Enter Key
//                          scope.dblClickAction(scope.selectedEntity, scope.setinstance.data[scope.selectedRow]);
//                          scope.$apply();
//                          e.preventDefault();
//                      }
//                      if (e.keyCode == 37) { //Left arrow Key
//                          if (scope.setinstance.page() === 1) {
//                              return;
//                          } else {
//                              scope.setinstance.page(scope.setinstance.page() - 1);
//                              scope.$apply();
//                              e.preventDefault();
//                          }
//                      }
//                      if (e.keyCode == 39) { //Right arrow Key
//                          var totalpage = Math.round(scope.setinstance.total() / scope.setinstance.count());
//                          if ((scope.setinstance.total() % scope.setinstance.count()) > 0 && (scope.setinstance.total() % scope.setinstance.count()) < 5) {
//                              totalpage = totalpage + 1;
//                          }
//                          if (scope.setinstance.page() === totalpage) {
//                              return;
//                          } else {
//                              scope.setinstance.page(scope.setinstance.page() + 1);
//                              scope.$apply();
//                              e.preventDefault();
//                          }
//                      }
//                  }
//              });
//          }
//      };
//  }]);

/*
 * Directive to enable double tap for the touch devices
 */
calculus.directive("iosDblclick", function () {
  const DblClickInterval = 300; //milliseconds

  var firstClickTime;
  var waitingSecondClick = false;

  return {
    restrict: "A",
    link: function (scope, element, attrs) {
      element.bind("click", function (e) {
        if (!waitingSecondClick) {
          firstClickTime = new Date().getTime();
          waitingSecondClick = true;

          setTimeout(function () {
            waitingSecondClick = false;
          }, DblClickInterval);
        } else {
          waitingSecondClick = false;

          var time = new Date().getTime();
          if (time - firstClickTime < DblClickInterval) {
            scope.$apply(attrs.iosDblclick);
          }
        }
      });
    }
  };
});

calculus.directive("td11", [
  "GroupByService",
  function (GroupByService) {
    return {
      restrict: "E",
      link: function (scope, element, attrs) {
        if (attrs.tableName != undefined) {
          if (
            attrs.sortable
              .substring(1, attrs.sortable.length - 1)
              .toUpperCase() == "ID"
          ) {
          } else {
            GroupByService.setData(
              attrs.tableName,
              attrs.sortable,
              attrs.titleText,
              attrs.viewValue,
              attrs.altTitle
            );
          }
        }
      }
    };
  }
]);

calculus.directive("dateOb", function () {
  return {
    require: "ngModel",
    restrict: "A",
    link: function (scope, element, attrs, ngModel) {
      element.on("focus", function (ev) {
        /*tainerCtrl.setFocused(true);

                     // Error text should not appear before user interaction with the field.
                     // So we need to check on focus also
                     ngModelCtrl.$setTouched();
                     if (isErrorGetter()) containerCtrl.setInvalid(true);*/
      });
      // view --> model (change date to string)
      ngModel.$parsers.push(function (viewValue) {
        if (viewValue !== null) {
          viewValue.setHours("12");
          viewValue.setMinutes("00");
          viewValue.setSeconds("00");
          return viewValue.toISOString();
        }
      });
      // model --> view (change string to date)
      ngModel.$formatters.push(function (modelValue) {
        let presentDate = new Date(modelValue);
        presentDate.setHours("12");
        presentDate.setMinutes("00");
        presentDate.setSeconds("00");
        return presentDate;
      });
    }
  };
});

calculus.directive("hierarchyTreeView", function () {
  return {
    // restrict to an element (A = attribute, C = class, M = comment)
    // or any combination like 'EACM' or 'EC'
    restrict: "E",
    scope: {
      primaryHierarchyId: "=",
      path: "=",
      primaryHierarchyValueId: "=",
      directiveEndFn: "&",
      tabIndexValue: "=",
      elementFor: "=",
      formHeader: "@",
      placeHolder: "@",
      treeViewFn: "&",
      resetElement: "&",
      clearPath: "=",
      disableIds: "=?"
    },
    templateUrl: "application/modules/hierarchy/hierarchytreeview.html",
    controller: ($scope, HierarchyValueService, ngDialog, common) => {
      function treeify(list, idAttr, parentAttr, childrenAttr) {
        $scope.isItemType = false;
        $scope.formData = {};
        if (!idAttr) {
          idAttr = "id";
        }
        if (!parentAttr) {
          parentAttr = "parent_id";
        }
        if (!childrenAttr) {
          childrenAttr = "children";
        }
        var treeList = [];
        var lookup = {};
        list.forEach(obj => {
          if ($scope.disableIds && $scope.disableIds.length > 0) {
            $scope.isItemType = true;
            if ($scope.disableIds.includes(obj.id)) {
              obj["isDisabled"] = true;
            } else {
              obj["isDisabled"] = false;
            }
          }
          obj["expanded"] = true;
          lookup[obj[idAttr]] = obj;
          obj[childrenAttr] = [];
        });
        list.forEach(obj => {
          if (obj[parentAttr] !== null && lookup[obj[parentAttr]]) {
            lookup[obj[parentAttr]][childrenAttr].push(obj);
          } else {
            treeList.push(obj);
          }
        });
        $scope.lookupTable = lookup;
        return treeList;
      }

      if (
        $scope.hierarchyTree &&
        angular.isObject($scope.hierarchyTree.currentNode)
      ) {
        var path = $scope.hierarchyTree.currentNode.tree_path;
        $scope.selectedHierarchyProperty[$scope.id] = {
          path_name: path,
          property_id: newObj.id
        };

        $scope.setPropertyFn({
          directiveData: {
            selectedHierarchyProperty: $scope.selectedHierarchyProperty
          }
        });
      }

      function showPath() {
        HierarchyValueService.API.SearchHierarchyValue(
          "hierarchy_id",
          $scope.primaryHierarchyId
        ).then(res => {
          $scope.hierarchyValuesArray = res;
          var list = treeify(res);
          $scope.hierarchyList = list;
          //Check if the lookuptable map has value for given hierarchy value id
          if (
            $scope.lookupTable &&
            $scope.lookupTable[$scope.primaryHierarchyValueId] !== undefined
          ) {
            if (Object.keys($scope.lookupTable).length > 0) {
              var path =
                $scope.lookupTable[$scope.primaryHierarchyValueId]["tree_path"];
            }
            if (path === null || path === "" || path === "null") {
              path =
                $scope.lookupTable[$scope.primaryHierarchyValueId][
                "short_description"
                ];
            } else {
              var ids = path.split(">");
              path = "";
              ids.push("" + $scope.primaryHierarchyValueId);
              var i = 0;
              _.each(ids, hId => {
                i++;
                if (ids.length === i && hId !== "null" && hId !== "") {
                  path += $scope.lookupTable[hId]["short_description"];
                } else if (hId !== "null" && hId !== "") {
                  path +=
                    $scope.lookupTable[hId]["short_description"] +
                    "<span class='zmdi zmdi-long-arrow-right c-red m-l-5 m-r-5' style='padding-top: 2px;'></span>";
                }
              });
            }
            $scope.path_name = path;
            $scope.selectedHierarchyProperty = {};
            $scope.selectedHierarchyProperty[$scope.primaryHierarchyId] = {
              path_name: path,
              property_id: $scope.primaryHierarchyValueId
            };

            $scope.directiveEndFn({
              directiveData: {
                hierarchyValueData:
                $scope.lookupTable[$scope.primaryHierarchyValueId],
                formData: $scope.formData,
                path_name: $scope.path_name
              }
            });
          }
        });
      }
      showPath();

      $scope.searchHierarchyValue = searchValue => {
        $scope.searchResults = 0;
        let isFirstElement = true;
        let scrollElement = document.getElementById("hierarchyTreeViewScroll");
        let elementId = "tree" + $scope.primaryHierarchyId;
        let divElement = document.getElementById(elementId);
        let spanTag = document
          .getElementById(elementId)
          .getElementsByTagName("span");
        for (let i = 0; i < spanTag.length; i++) {
          if (searchValue) {
            if (
              spanTag[i].innerText
                .toLowerCase()
                .includes(searchValue.toLowerCase())
            ) {
              $scope.searchResults = $scope.searchResults + 1;
              spanTag[i].setAttribute("md-highlight-text", searchValue);
              spanTag[i].classList.add("highlight");
              if (isFirstElement) {
                // This is to scroll to the postion of first search result
                isFirstElement = false;
                let rect = spanTag[i].getBoundingClientRect();
                scrollElement.scrollTop += (rect.top - 250);
              }
            } else {
              spanTag[i].classList.remove("highlight");
            }
          } else {
            spanTag[i].classList.remove("highlight");
          }
        }
      };

      /*
       * Function to reset selected hierarchy values in hierarchy values pop up
       */
      $scope.resetSelectedHierarchy = () => {
        $scope.primaryHierarchyValueId = null;
        if ($scope.hierarchyTree.currentNode) {
          $scope.hierarchyTree.currentNode.selected = undefined;
          $scope.hierarchyTree.currentNode = undefined;
        }
        $scope.selectedHierarchyProperty = undefined;
        $scope.path_name = undefined;
        $scope.original_property = undefined;
        $scope.isReset = true;
        $scope.primaryHierarchyValueId = undefined;
        $scope.directiveEndFn({
          directiveData: {
            hierarchyValueData: {},
            formData: {},
            path_name: $scope.path_name
          }
        });

        $scope.treeViewFn({
          flagData: {
            currentFlag: false,
            primaryHierarchyId: $scope.primaryHierarchyId,
            selectedHierarchyValue: $scope.selectedHierarchyProperty,
            isReset: true
          }
        });
      };

      $scope.clickToHierarchyViewOpen = function (flag) {
        $scope.treeSearchQuery = undefined;
        $scope.searchHierarchyValue();
        $scope.newObject = {};
        if (flag == 1) {
          $scope.treeview = true;
          if (!$scope.isReset) {
            $scope.treeViewFn({
              flagData: {
                currentFlag: true,
                primaryHierarchyId: $scope.primaryHierarchyId
              }
            });
          }
          $scope.original_property = $scope.selectedHierarchyProperty;
          if (
            $scope.primaryHierarchyValueId &&
            $scope.lookupTable &&
            $scope.lookupTable[$scope.primaryHierarchyValueId] !== undefined
          ) {
            $scope.lookupTable[$scope.primaryHierarchyValueId]["selected"] =
              "selected";
            $scope.hierarchyTree.currentNode =
              $scope.lookupTable[$scope.primaryHierarchyValueId];
          }
          $scope.hierarchyTree.doubleClick = false;
          $scope.$watch("hierarchyTree.doubleClick", function (newObj, oldObj) {
            if (newObj === true) {
              $("#hierarchyTreeSideBar" + $scope.primaryHierarchyId).modal(
                "hide"
              );
              $scope.selectedHierarchyProperty =
                $scope.selectedHierarchyTreePath;
              $scope.treeViewFn({
                flagData: {
                  currentFlag: false,
                  primaryHierarchyId: $scope.primaryHierarchyId,
                  selectedHierarchyValue: $scope.selectedHierarchyProperty
                }
              });
              $scope.isReset = false;
            }
          });
          $scope.$watch(
            "hierarchyTree.currentNode",
            function (newObj, oldObj) {
              $scope.newObject = newObj;
              if (
                $scope.hierarchyTree &&
                angular.isObject($scope.hierarchyTree.currentNode)
              ) {
                var path = $scope.hierarchyTree.currentNode.tree_path;
                if (
                  (path == null || path === "" || path == "null") &&
                  newObj &&
                  newObj.id
                ) {
                  path = $scope.lookupTable[newObj.id]["short_description"];
                } else {
                  var ids =
                    $scope.hierarchyTree.currentNode.tree_path !== ""
                      ? $scope.hierarchyTree.currentNode.tree_path.split(">")
                      : [];
                  newObj ? ids.push("" + newObj.id) : "";
                  path = "";
                  var i = 0;
                  _.each(ids, function (hId) {
                    i++;
                    if (ids.length === i && hId !== "null" && hId !== "") {
                      path += $scope.lookupTable[hId]["short_description"];
                    } else if (hId !== "null" && hId !== "") {
                      path +=
                        $scope.lookupTable[hId]["short_description"] +
                        "<span class='zmdi zmdi-long-arrow-right c-red m-l-5 m-r-5' style='padding-top: 2px;'></span>";
                    }
                  });
                }
                $scope.path_name = path;
                $scope.selectedHierarchyProperty = {};
                $scope.selectedHierarchyTreePath = {};
                if ($scope.hierarchyTree.doubleClick === false) {
                  $scope.selectedHierarchyTreePath[
                    $scope.primaryHierarchyId
                  ] = {
                      path_name: path,
                      property_id: newObj ? newObj.id : null
                    };
                } else {
                  $scope.selectedHierarchyProperty[
                    $scope.primaryHierarchyId
                  ] = {
                      path_name: path,
                      property_id: newObj ? newObj.id : null
                    };
                  $("#hierarchyTreeSideBar" + $scope.primaryHierarchyId).modal(
                    "hide"
                  );
                  $scope.treeViewFn({
                    flagData: {
                      currentFlag: false,
                      primaryHierarchyId: $scope.primaryHierarchyId,
                      selectedHierarchyValue: $scope.selectedHierarchyProperty
                    }
                  });
                }
                $scope.directiveEndFn({
                  directiveData: {
                    hierarchyValueData:
                    newObj && newObj.id ? $scope.lookupTable[newObj.id] : {},
                    formData: $scope.formData,
                    path_name: $scope.path_name
                  }
                });
                $scope.isReset = false;
              }
            },
            false
          );
          $("#hierarchyTreeSideBar" + $scope.primaryHierarchyId).modal("show");
        } else if (flag === -1) {
          $("#hierarchyTreeSideBar" + $scope.primaryHierarchyId).modal("hide");
          if (
            $scope.original_property === undefined ||
            $scope.original_property === null
          ) {
            $scope.primaryHierarchyValueId = null;
          } else if (
            $scope.selectedHierarchyProperty !== undefined &&
            Object.keys($scope.original_property).length > 0
          ) {
            $scope.selectedHierarchyProperty[$scope.primaryHierarchyId] = {
              path_name:
              $scope.original_property[$scope.primaryHierarchyId].path_name,
              property_id:
              $scope.original_property[$scope.primaryHierarchyId].property_id
            };
            $("#hierarchyTreeSideBar" + $scope.primaryHierarchyId).modal(
              "hide"
            );
            $scope.directiveEndFn({
              directiveData: {
                formData: $scope.formData,
                path_name:
                $scope.original_property[$scope.primaryHierarchyId].path_name,
                selectedHierarchyValue: $scope.original_property
              }
            });
          } else {
            $scope.primaryHierarchyValueId = null;
          }
        } else {
          if ($scope.isReset === false) {
            if ($scope.selectedHierarchyProperty !== undefined) {
              $scope.selectedHierarchyProperty[$scope.primaryHierarchyId] = {
                path_name: $scope.path_name,
                property_id: $scope.newObject.id
              };
              $("#hierarchyTreeSideBar" + $scope.primaryHierarchyId).modal(
                "hide"
              );
            } else {
              $("#hierarchyTreeSideBar" + $scope.primaryHierarchyId).modal(
                "hide"
              );
            }

            $scope.treeViewFn({
              flagData: {
                currentFlag: false,
                primaryHierarchyId: $scope.primaryHierarchyId,
                selectedHierarchyValue: $scope.selectedHierarchyProperty
              }
            });
            $("#hierarchyTreeSideBar" + $scope.primaryHierarchyId).modal(
              "hide"
            );
          } else {
            $scope.isReset = false;
            $("#hierarchyTreeSideBar" + $scope.primaryHierarchyId).modal(
              "hide"
            );
          }
        }
      };

      $scope.$watch("clearPath", function (newVal, oldVal) {
        if (newVal) {
          $scope.selectedHierarchyProperty = {};
          $scope.path_name = undefined;
          if ($scope.hierarchyTree && $scope.hierarchyTree.currentNode) {
            $scope.hierarchyTree.currentNode = undefined;
          }
        }
        $scope.clearPath = false;
      });
    }
  };
});

calculus.directive("autoScroll", ($document, $timeout, $location) => {
  return {
    restrict: "A",
    link: (scope, element, attrs) => {
      scope.okSaveScroll = true;
      scope.scrollPos = {};

      $document.bind("scroll", () => {
        if (scope.okSaveScroll) {
          scope.scrollPos[$location.path()] = $(window).scrollTop();
        }
      });

      scope.scrollClear = path => {
        scope.scrollPos[path] = 0;
      };

      scope.$on("$locationChangeSuccess", route => {
        $timeout(() => {
          // if (
          //   route &&
          //   route.current &&
          //   route.current.$route.templateUrl.indexOf("dataEntry") > 0
          // ) {
          //   //Does the actual prevention of routing
          //   route.current = lastRoute;
          // }
          $(window).scrollTop(
            scope.scrollPos[$location.path()]
              ? scope.scrollPos[$location.path()]
              : 0
          );
          scope.okSaveScroll = true;
        }, 0);
      });

      scope.$on("$locationChangeStart", event => {
        scope.okSaveScroll = false;
      });
    }
  };
});

calculus.directive("treepathToDescpath", function () {
  return {
    // restrict to an element (A = attribute, C = class, M = comment)
    // or any combination like 'EACM' or 'EC'
    restrict: "E",
    scope: {
      hierarchyId: "=",
      hierarchyValueId: "=",
      path: "=",
      data: "="
    },
    template: '<div ng-bind-html="path_name"></div>',
    controller: function ($scope, HierarchyValueService, ngDialog) {
      function treeify(list, idAttr, parentAttr, childrenAttr) {
        if (!idAttr) {
          idAttr = "id";
        }
        if (!parentAttr) {
          parentAttr = "parent_id";
        }
        if (!childrenAttr) {
          childrenAttr = "children";
        }
        var treeList = [];
        var lookup = {};
        list.forEach(obj => {
          if ($scope.disableIds && $scope.disableIds.length > 0) {
            $scope.isItemType = true;
            if ($scope.disableIds.includes(obj.id)) {
              obj["isDisabled"] = true;
            } else {
              obj["isDisabled"] = false;
            }
          }
          obj["expanded"] = true;
          lookup[obj[idAttr]] = obj;
          obj[childrenAttr] = [];
        });
        list.forEach(obj => {
          if (obj[parentAttr] !== null && lookup[obj[parentAttr]]) {
            lookup[obj[parentAttr]][childrenAttr].push(obj);
          } else {
            treeList.push(obj);
          }
        });
        $scope.lookupTable = lookup;
        return treeList;
      }

      function showPath() {
        if (
          $scope.data[$scope.hierarchyId] == null ||
          $scope.data[$scope.hierarchyId] == undefined
        ) {
          HierarchyValueService.API.SearchHierarchyValue(
            "hierarchy_id",
            $scope.hierarchyId
          ).then(res => {
            $scope.data[$scope.hierarchyId] = res.data;
            var list = treeify($scope.data[$scope.hierarchyId]);
            $scope.hierarchyList = list;

            var ids = $scope.path.split(">");
            ids.push("" + $scope.hierarchyValueId);
            var path_name = "";
            var i = 0;
            _.each(ids, function (hId) {
              i++;
              if (ids.length === i && hId !== "null" && hId !== "") {
                path_name += $scope.lookupTable[hId]["short_description"];
              } else if (hId !== "null" && hId !== "") {
                path_name +=
                  $scope.lookupTable[hId]["short_description"] +
                  ' <i class="zmdi zmdi-arrow-right" ></i> ';
              }
              $scope.path_name = path_name;
            });
          });
        } else {
          var list = treeify($scope.data[$scope.hierarchyId]);
          $scope.hierarchyList = list;

          var ids = $scope.path.split(">");
          ids.push("" + $scope.hierarchyValueId);
          var path_name = "";
          var i = 0;
          _.each(ids, function (hId) {
            i++;
            if (ids.length === i && hId !== "null" && hId !== "") {
              path_name += $scope.lookupTable[hId]["short_description"];
            } else if (hId !== "null" && hId !== "") {
              path_name +=
                $scope.lookupTable[hId]["short_description"] +
                ' <i class="zmdi zmdi-arrow-right" ></i> ';
            }
            $scope.path_name = path_name;
          });
        }
      }
      showPath();
    }
  };
});

calculus.directive("lvhSearchClose", function () {
  return {
    restrict: "C",
    link: function (scope, elem, attrs) {
      elem.on("click", function (event) {
        scope.searchresult.term = "";
        scope.$apply();
      });
    }
  };
});

calculus.directive("myTable", function () {
  return {
    restrict: "E",
    link: function (scope, element, attrs) {
      var html = "<table>";
      angular.forEach(scope[attrs.rows], function (row, index) {
        html +=
          '<tr><td class="col-md-2">' + row.option_list_name + "</td></tr>";
        if ("subrows" in row) {
          angular.forEach(row.subrows, function (subrow, index) {
            html +=
              '<tr><td class="col-md-2">' +
              subrow.mto_description +
              "</td></tr>";
          });
        }
      });
      html += "</table>";
      element.replaceWith(html);
    }
  };
});

/*
 * rcpTableHeader is to be removed after all the module is calling rcpModuleHeader and rcpTableGroupHeader
 */
calculus.directive("rcpTableHeader", function () {
  return {
    restrict: "E",
    scope: {
      moduleName: "@",
      rcpTable: "=",
      createNewFn: "&",
      reloadFn: "&",
      backFn: "&",
      hasParent: "="
    },
    templateUrl: "template/app-specific/tableHeader.html",
    link: function (scope, element, attr) {
      scope.createNewFn = scope.createNewFn;
      scope.reloadFn = scope.reloadFn;
      scope.$watch("searchresult.term", function (n, o) {
        if (scope.searchresult !== undefined) {
          scope.$parent.searchresult.term = scope.searchresult.term;
        }
      });
    }
  };
});
/*
 * end of rcpTableHeader directive
 */

calculus.directive("rcpModuleHeader", function () {
  return {
    restrict: "E",
    scope: {
      moduleName: "@",
      buttonName: "@",
      svgImage: "@",
      createNewFn: "&",
      reloadFn: "&",
      backFn: "&",
      hasParent: "=",
      typeParameter: "@",
      openParameterFn: "&",
      createRule: "=",
      tempFlag: "=",
      disableActions: "="
    },
    templateUrl: "template/app-specific/moduleHeader.html",
    link: function (scope, element, attr) {
      scope.createNewFn = scope.createNewFn;
      scope.reloadFn = scope.reloadFn;
      scope.sidebarToggle = {
        right: false
      };
      scope.toggle = function () {
        scope.sidebarToggle.right = !scope.sidebarToggle.right;
      };
      scope.$watch("searchresult.term", function (n, o) {
        if (scope.searchresult !== undefined) {
          scope.$parent.searchresult.term = scope.searchresult.term;
        }
      });
    }
  };
});

calculus.directive("rcpSuccessForm", function () {
  return {
    restrict: "E",
    scope: {
      successTick: "@",
      closeFn: "&",
      createNewFn: "&",
      viewValuesFn: "&",
      configureUddFn: "&",
      updateSuccess: "=",
      saveSuccess: "=",
      cloneSuccess: "=",
      uploadSuccess: "=",
      transferSuccess: "=",
      deleteSuccess: "=",
      configureSuccess: "=",
      viewValuesOption: "=",
      configureUddFlag: "=",
      configureUddEntityId: "="
    },
    templateUrl: "template/app-specific/successpage.html",
    link: function (scope, element, attr) {
      scope.closeFn = scope.closeFn;
    }
  };
});

calculus.directive("rcpFormHeader", function () {
  return {
    restrict: "E",
    scope: {
      moduleLabel: "@",
      newForm: "=",
      saveFn: "&",
      closeFn: "&",
      updateFn: "&",
      deleteFn: "&",
      enableButton: "="
    },
    templateUrl: "template/app-specific/formHeader.html",
    link: function (scope, element, attr) {
      scope.saveFn = scope.saveFn;
      scope.closeFn = scope.closeFn;
      scope.updateFn = scope.updateFn;
    }
  };
});

calculus.directive("rcpEditFormBtns", function () {
  return {
    restrict: "E",
    scope: {
      newForm: "=",
      saveFn: "&",
      saveBtnError: "=",
      saveBtnText: "=",
      updateFn: "&",
      updateBtnError: "=",
      updateBtnText: "=",
      tabIndexValue: "=",
      confirmFn: "&",
      accessPermissions: "=",
      deleteFn: "&",
      confirmDelete: "=",
      enableButton: "=",
      updateSuccess: "=",
      entityId: "=",
      disableActions: "=",
      configureUddFn: "&",
      configureUddFlag: "=",
      configureUddEntityId: "="
    },
    templateUrl: "template/app-specific/editformbtns.html",
    link: function (scope, element, attr) {
      scope.saveFn = scope.saveFn;
      scope.updateFn = scope.updateFn;
    },
    controller: function ($scope, $timeout) {
      $scope.showdeleteconfirm = false;
      $scope.deleteconfirm = function () {
        $scope.showdeleteconfirm = true;
      };
    }
  };
});

calculus.directive("rcpDeleteForm", function () {
  return {
    restrict: "E",
    scope: {
      closeFn: "&",
      deleteFn: "&",
      imageName: "@",
      isProcessing: "=",
      tabIndexValue: "="
    },
    templateUrl: "template/app-specific/deleteconfirmpage.html",
    link: function (scope, element, attr) {
      scope.closeFn = scope.closeFn;
      scope.svgImageUrl = "./img/sidebar-icons/" + scope.imageName;
    },
    controller: function ($scope) {
      $scope.ca = "";
      $scope.simpleAnimation = function () {
        angular.element("#zoomEntrancesdel").addClass("fadeIn");
      };
    }
  };
});

calculus.directive("rcpMaintConfirmForm", function () {
  return {
    restrict: "E",
    scope: {
      publishFn: "&",
      closeFn: "&",
      deleteFn: "&",
      refineFn: "&",
      continueFn: "&",
      confirmDel: "&",
      confirmDelete: "=",
      opdone: "=",
      isUpdate: "=",
      isFormValid: "=",
      page: "=",
      moduleName: "="
    },
    templateUrl: "template/app-specific/maintenanceconfirm.html",
    link: function (scope, element, attr) {
      scope.closeFn = scope.closeFn;
    }
  };
});

calculus.directive("rcpMaintenanceControl", function () {
  return {
    restrict: "E",
    scope: {
      createForm: "=",
      configureScreen: "=",
      previewAndPublish: "=",
      showErrorDetails: "=",
      showErrorDetailsData: "=",
      itemSetForm: "=",
      locationAddressForm: "=",
      itemSubType: "=",
      isSetScreen: "=",
      isAddressScreen: "=",
      opdone: "=",
      isUpdate: "=",
      isInvalid: "=",
      moduleName: "=",
      publishFn: "&",
      closeFn: "&",
      deleteFn: "&",
      isConfigureInvalid: "=",
      disableActions: "="
    },
    templateUrl: "template/app-specific/maintenance_controls.html",
    link: function (scope, element, attr) {
      scope.closeFn = scope.closeFn;
      scope.$watch("opdone", function (n, o) { });
      scope.continueFn = function (screen) {
        if (scope.configureScreen === undefined) {
          scope.createForm = false;
          scope.previewAndPublish = true;
          scope.back = false;
        } else if (screen === "createForm") {
          scope.createForm = false;
          scope.configureScreen = true;
          scope.back = true;
          scope.$emit("initUserDefinedData", {
            a: 10
          });
        } else if (screen === "configureScreen") {
          if (scope.itemSubType == "Set") {
            scope.configureScreen = false;
            scope.itemSetForm = true;
            scope.isSetScreen = true;
            scope.back = true;
          } else if (scope.moduleName === "Location") {
            scope.configureScreen = false;
            scope.locationAddressForm = true;
            scope.isAddressScreen = true;
            scope.back = true;
          } else if (scope.itemSubType == "Item") {
            scope.configureScreen = false;
            scope.previewAndPublish = true;
            scope.back = true;
          } else {
            scope.configureScreen = false;
            scope.previewAndPublish = true;
            scope.back = true;
          }
        } else if (screen === "itemSetForm") {
          scope.itemSetForm = false;
          scope.previewAndPublish = true;
        } else if (screen === "locationAddressForm") {
          scope.locationAddressForm = false;
          scope.previewAndPublish = true;
          scope.back = true;
        }
      };
      scope.backFn = function (screen) {
        if (scope.configureScreen === undefined) {
          scope.back = false;
          scope.refineFn();
        } else if (screen === "configureScreen") {
          scope.createForm = true;
          scope.configureScreen = false;
        } else if (screen === "itemSetForm") {
          scope.configureScreen = true;
          scope.itemSetForm = false;
          scope.isSetScreen = false;
        } else if (screen === "locationAddressForm") {
          scope.configureScreen = true;
          scope.locationAddressForm = false;
          scope.isAddressScreen = false;
        } else {
          if (scope.itemSubType == "Set") {
            scope.itemSetForm = true;
            scope.isSetScreen = true;
            scope.previewAndPublish = false;
          } else if (scope.moduleName == "Location") {
            scope.locationAddressForm = true;
            scope.isAddressScreen = true;
            scope.previewAndPublish = false;
          } else if (scope.moduleName == "MTO") {
            scope.createForm = true;
            scope.previewAndPublish = false;
          } else {
            scope.configureScreen = true;
            scope.previewAndPublish = false;
          }
        }
      };
      scope.refineFn = function () {
        scope.createForm = true;
        scope.configureScreen = false;
        scope.itemSetForm = false;
        scope.isSetScreen = false;
        scope.isAddressScreen = false;
        scope.previewAndPublish = false;
      };
      scope.confirmDelete = false;
      scope.confirmDel = function () {
        scope.confirmDelete = !scope.confirmDelete;
      };
    }
  };
});

calculus.directive("rcpTableGroupHeader", [
  "GroupByService",
  function (GroupByService) {
    var groupByController = [
      "$scope",
      function ($scope) {
        $scope.broadcastValue = function () {
          $scope.$broadcast("collapseAll", {
            value: $scope.collapseAll
          });
        };

        $scope.collapsesettings = function (data) {
          if (data === null || data === "") {
            $scope.uncollapseAll();
          } else {
            $scope.collapseAll();
          }
          $scope.$parent.loadNgTableData(null, data, $scope.rcpTableName, true);
        };
        $scope.collapseAll = function () {
          if ($scope.rcpTable.data !== undefined) {
            $scope.rcpTable.data.forEach(function (value, key) {
              value.hideRows = true;
            });
          }
        };
        $scope.uncollapseAll = function () {
          if ($scope.rcpTable.data !== undefined) {
            $scope.rcpTable.data.forEach(function (value, key) {
              value.hideRows = false;
            });
          }
        };
      }
    ];
    return {
      restrict: "E",
      controller: groupByController,
      scope: {
        dropdownList: "=",
        rcpTable: "=",
        rcpTableName: "@",
        rcpGroupByDropdownList: "=",
        loadNgTableData: "&",
        reloadFn: "&",
        columns: "=",
        colsLocalStorageName: "@",
        returnValue: "="
      },
      templateUrl: "template/app-specific/tableGroupHeader.html",
      link: function (scope, element, attr, ngModel) {
        scope.svgImageUrl = "application/modules/" + scope.imageName;
        scope.$watch("rcpTable", function (newVal, oldVal) {
          scope.rcpTable = scope.rcpTable;
        });
        scope.$watch("searchresult.term", function (n, o) {
          if (scope.searchresult !== undefined) {
            scope.$parent.searchresult.term = scope.searchresult.term;
          }
        });
      }
    };
  }
]);

calculus.directive("usersglclick", [
  "$parse",
  function ($parse) {
    return {
      restrict: "A",
      link: function (scope, element, attr) {
        var fn = $parse(attr["usersglclick"]);
        var delay = 300,
          clicks = 0,
          timer = null;
        element.on("click", function (event) {
          clicks++; //count clicks
          if (clicks === 1) {
            timer = setTimeout(function () {
              scope.$apply(function () {
                fn(scope, {
                  $event: event
                });
              });
              clicks = 0; //after action performed, reset counter
            }, delay);
          } else {
            clearTimeout(timer); //prevent single-click action
            clicks = 0; //after action performed, reset counter
          }
        });
      }
    };
  }
]);

// **

calculus.directive("clickOutside", [
  "$document",
  "$parse",
  "$timeout",
  clickOutside
]);

/**
 * @ngdoc directive
 * @name angular-click-outside.directive:clickOutside
 * @description Directive to add click outside capabilities to DOM elements
 * @requires $document
 * @requires $parse
 * @requires $timeout
 **/
function clickOutside($document, $parse, $timeout) {
  return {
    restrict: "A",
    link: function ($scope, elem, attr) {
      // postpone linking to next digest to allow for unique id generation
      $timeout(function () {
        var classList =
          attr.outsideIfNot !== undefined
            ? attr.outsideIfNot.split(/[ ,]+/)
            : [],
          fn;

        function eventHandler(e) {
          var i, element, r, id, classNames, l;

          // check if our element already hidden and abort if so
          if (angular.element(elem).hasClass("ng-hide")) {
            return;
          }

          // if there is no click target, no point going on
          if (!e || !e.target) {
            return;
          }

          // loop through the available elements, looking for classes in the class list that might match and so will eat
          for (element = e.target; element; element = element.parentNode) {
            /*if (element === $document) {
                             return;
                         }*/

            // check if the element is the same element the directive is attached to and exit if so (props @CosticaPuntaru)
            if (element === elem[0]) {
              return;
            }

            // now we have done the initial checks, start gathering id's and classes
            (id = element.id),
              (classNames = element.className),
              (l = classList.length);

            // Unwrap SVGAnimatedString classes
            if (classNames && classNames.baseVal !== undefined) {
              classNames = classNames.baseVal;
            }

            // if there are no class names on the element clicked, skip the check
            if (classNames || id) {
              // loop through the elements id's and classnames looking for exceptions
              for (i = 0; i < l; i++) {
                //prepare regex for class word matching
                r = new RegExp("\\b" + classList[i] + "\\b");

                // check for exact matches on id's or classes, but only if they exist in the first place
                if (
                  (id !== undefined && id === classList[i]) ||
                  (classNames && r.test(classNames))
                ) {
                  // now let's exit out as it is an element that has been defined as being ignored for clicking outside
                  return;
                }
              }
            }
          }
          // if we have got this far, then we are good to go with processing the command passed in via the click-outside attribute
          $timeout(function () {
            fn = $parse(attr["clickOutside"]);
            fn($scope, {
              event: e
            });
          });
        }

        // if the devices has a touchscreen, listen for this event
        if (_hasTouch()) {
          $document.on("touchstart", eventHandler);
        }

        // still listen for the click event even if there is touch to cater for touchscreen laptops
        $document.on("click", eventHandler);

        // when the scope is destroyed, clean up the documents event handlers as we don't want it hanging around
        $scope.$on("$destroy", function () {
          if (_hasTouch()) {
            $document.off("touchstart", eventHandler);
          }

          $document.off("click", eventHandler);
        });

        /**
         * @description Private function to attempt to figure out if we are on a touch device
         * @private
         **/
        function _hasTouch() {
          // works on most browsers, IE10/11 and Surface
          return "ontouchstart" in window || navigator.maxTouchPoints;
        }
      });
    }
  };
}

/*** Directive for Staging */

calculus.directive("stagingComponent", function () {
  return {
    restrict: "E",
    scope: {
      entity: "=",
      createForm: "=",
      configureScreen: "=",
      previewAndPublish: "=",
      isUpdate: "=",
      isConfigureScreen: "=",
      isSetScreen: "=",
      isAddressScreen: "=",
      showLocationScreen: "=",
      showSetScreen: "=",
      itemSetForm: "="
    },
    templateUrl: "template/app-specific/staging_component.html",
    link: function (scope, element, attr) { }
  };
});

calculus.directive("hierarchyTreeViewSelect", function () {
  return {
    // restrict to an element (A = attribute, C = class, M = comment)
    // or any combination like 'EACM' or 'EC'
    restrict: "E",
    scope: {
      id: "=",
      valueId: "=",
      props: "=",
      selectedHierarchyProperty: "=",
      setPropertyFn: "&",
      formHeader: "@",
      placeHolder: "@",
      uddValue: "=",
      disableIds: "=?"
    },
    templateUrl: "application/modules/hierarchy/hierarchytreeviewselect.html",
    controller: function ($scope) {
      function treeify(list, idAttr, parentAttr, childrenAttr) {
        if (!idAttr) {
          idAttr = "id";
        }
        if (!parentAttr) {
          parentAttr = "parent_id";
        }
        if (!childrenAttr) {
          childrenAttr = "children";
        }
        var treeList = [];
        var lookup = {};
        list.forEach(function (obj) {
          if ($scope.disableIds && $scope.disableIds.length > 0) {
            $scope.isItemType = true;
            if ($scope.disableIds.includes(obj.id)) {
              obj["isDisabled"] = true;
            } else {
              obj["isDisabled"] = false;
            }
          }
          obj["expanded"] = true;
          lookup[obj[idAttr]] = obj;
          obj[childrenAttr] = [];
        });
        list.forEach(function (obj) {
          if (
            obj[parentAttr] !== null &&
            lookup[obj[parentAttr]] !== undefined
          ) {
            lookup[obj[parentAttr]][childrenAttr].push(obj);
          } else {
            treeList.push(obj);
          }
        });
        $scope.lookupTable = lookup;
        return treeList;
      }

      function showPath() {
        var list = treeify($scope.props);
        $scope.hierarchyList = list;
        if ($scope.valueId && $scope.lookupTable[$scope.valueId]) {
          var path = $scope.lookupTable[$scope.valueId]["tree_path"];
          if (path == null || path === "" || path == "null") {
            path = $scope.lookupTable[$scope.valueId]["short_description"];
          } else {
            var ids = path.split(">");
            path = "";
            ids.push("" + $scope.valueId);
            var i = 0;
            _.each(ids, function (hId) {
              i++;
              if (ids.length === i && hId !== "null" && hId !== "") {
                path += $scope.lookupTable[hId]["short_description"];
              } else if (hId !== "null" && hId !== "") {
                path +=
                  $scope.lookupTable[hId]["short_description"] +
                  "<span class='zmdi zmdi-long-arrow-right c-red m-l-5 m-r-5' style='padding-top: 2px;'></span>";
              }
            });
          }
        } else {
          $scope.uddVal = $scope.uddValue;
          path = $scope.uddValue;
        }

        $scope.selectedHierarchyProperty[$scope.id] = {
          path_name: path,
          property_id: $scope.valueId
        };
      }

      showPath();

      // Function to highlight the searched text in hierarchy tree view
      $scope.searchHierarchyValue = searchValue => {
        $scope.searchResults = 0;
        let elementId = "tree" + $scope.id;
        let isFirstElement = true;
        let scrollElement = document.getElementById("hierarchyTreeViewSelectScroll");
        let divElement = document.getElementById(elementId);
        let spanTag = document
          .getElementById(elementId)
          .getElementsByTagName("span");
        for (let i = 0; i < spanTag.length; i++) {
          if (searchValue) {
            if (
              spanTag[i].innerText
                .toLowerCase()
                .includes(searchValue.toLowerCase())
            ) {
              $scope.searchResults = $scope.searchResults + 1;
              spanTag[i].setAttribute("md-highlight-text", searchValue);
              spanTag[i].classList.add("highlight");
              if (isFirstElement) {
                // This is to scroll to the postion of first search result
                isFirstElement = false;
                let rect = spanTag[i].getBoundingClientRect();
                scrollElement.scrollTop += (rect.top - 250);
              }
            } else {
              spanTag[i].classList.remove("highlight");
            }
          } else {
            spanTag[i].classList.remove("highlight");
          }
        }
      };

      $scope.uddnewObj = {};
      $scope.clickToHierarchyViewOpen = function (flag) {
        if (flag == 1) {
          $("#hierarchyTreeSideBar" + $scope.id).modal("show");
          $scope.hierarchyTree.doubleClick = false;
          $scope.original_udd_property = $scope.selectedHierarchyProperty;
          $scope.selectedHierarchyTreeProperty = {};
          if (
            $scope.selectedHierarchyProperty[$scope.id] &&
            $scope.lookupTable[
            $scope.selectedHierarchyProperty[$scope.id]["property_id"]
            ] !== undefined
          ) {
            $scope.lookupTable[
              $scope.selectedHierarchyProperty[$scope.id]["property_id"]
            ]["selected"] = "selected";
            $scope.hierarchyTree.currentNode =
              $scope.lookupTable[
              $scope.selectedHierarchyProperty[$scope.id]["property_id"]
              ];
          }

          // $scope.hierarchyTree.doubleClick = false;
          $scope.$watch("hierarchyTree.doubleClick", function (newObj, oldObj) {
            if (newObj === true) {
              $scope.isReset = false;
              $("#hierarchyTreeSideBar" + $scope.id).modal("hide");
              $scope.setPropertyFn({
                directiveData: {
                  selectedHierarchyProperty: $scope.selectedHierarchyProperty
                }
              });
            }
          });
          $scope.$watch(
            "hierarchyTree.currentNode",
            function (newObj, oldObj) {
              $scope.uddnewObj = newObj;
              if (
                $scope.hierarchyTree &&
                angular.isObject($scope.hierarchyTree.currentNode)
              ) {
                var path = $scope.hierarchyTree.currentNode.tree_path;
                if (path == null || path === "" || path == "null") {
                  path = $scope.lookupTable[newObj.id]["short_description"];
                } else {
                  var ids = $scope.hierarchyTree.currentNode.tree_path.split(
                    ">"
                  );
                  ids.push("" + newObj.id);
                  path = "";
                  var i = 0;
                  _.each(ids, function (hId) {
                    i++;
                    if (ids.length === i && hId !== "null" && hId !== "") {
                      path += $scope.lookupTable[hId]["short_description"];
                    } else if (hId !== "null" && hId !== "") {
                      path +=
                        $scope.lookupTable[hId]["short_description"] +
                        "<span class='zmdi zmdi-long-arrow-right c-red m-l-5 m-r-5' style='padding-top: 2px;'></span>";
                    }
                  });
                }
                $scope.tracedPath = path;
                $scope.selectedHierarchyTreeProperty = {};
                if ($scope.hierarchyTree.doubleClick === false) {
                  $scope.selectedHierarchyTreeProperty[$scope.id] = {
                    path_name: path,
                    property_id: newObj.id
                  };
                } else {
                  $scope.selectedHierarchyProperty[$scope.id] = {
                    path_name: path,
                    property_id: newObj.id
                  };
                  $("#hierarchyTreeSideBar" + $scope.id).modal("hide");
                }

                $scope.setPropertyFn({
                  directiveData: {
                    selectedHierarchyProperty: $scope.selectedHierarchyProperty
                  }
                });
              }
            },
            false
          );
        } else if (flag === -1) {
          $("#hierarchyTreeSideBar" + $scope.id).modal("hide");
          if (
            $scope.selectedHierarchyProperty !== undefined &&
            $scope.original_udd_property
          ) {
            $scope.selectedHierarchyProperty[$scope.id] = {
              path_name: $scope.original_udd_property[property_id].path_name,
              property_id: $scope.original_udd_property[property_id].property_id
            };
            $("#hierarchyTreeSideBar" + $scope.id).modal("hide");
            $scope.setPropertyFn({
              directiveData: {
                selectedHierarchyProperty: $scope.selectedHierarchyProperty
              }
            });
          } else {
            $scope.primaryHierarchyValueId = null;
          }
        } else {
          $("#hierarchyTreeSideBar" + $scope.id).modal("hide");
          if ($scope.uddnewObj !== undefined) {
            $scope.selectedHierarchyProperty[$scope.id] = {
              path_name: $scope.tracedPath,
              property_id: $scope.uddnewObj.id
            };
          } else {
            $scope.selectedHierarchyProperty[$scope.id] = {
              path_name: undefined,
              property_id: undefined
            };
          }
        }
      };

      $scope.resetSelectedHierarchy = () => {
        $scope.hierarchyList = _.filter($scope.hierarchyList, hierarchy => {
          hierarchy.selected = undefined;
          hierarchy.children = _.filter(hierarchy.children, child => {
            child.selected = undefined;
            return child;
          });
          return hierarchy;
        });
        $scope.hierarchyTree.currentNode = undefined;
        $scope.uddnewObj = undefined;
        $scope.tracedPath = undefined;
        $scope.selectedHierarchyProperty[$scope.id] = {};
        $scope.selectedHierarchyTreeProperty[$scope.id] = {};
        $scope.isReset = true;
        $scope.setPropertyFn({
          directiveData: {
            selectedHierarchyProperty: $scope.selectedHierarchyProperty
          }
        });
      };
    }
  };
});

calculus.directive("checkImage", $http => {
  return {
    restrict: "A",
    scope: {
      imageName: "@"
    },
    link: (scope, element, attrs) => {
      attrs.$observe("ngSrc", ngSrc => {
        if (ngSrc === undefined) {
          element.attr("src", "./img/sidebar-icons/" + scope.imageName);
          element.addClass("placeholder-image");
        } else {
          element.removeClass("placeholder-image");
        }
      });
    }
  };
});

calculus.directive("checkTemplateImage", $http => {
  return {
    restrict: "A",
    scope: {
      imageName: "@"
    },
    link: (scope, element, attrs) => {
      attrs.$observe("ngSrc", ngSrc => {
        if (ngSrc === undefined) {
          element.removeAttr("ng-src");
          element.attr("src", "./img/sidebar-icons/" + scope.imageName);
          element.addClass("placeholder-image");
        } else {
          element.removeClass("placeholder-image");
        }
      });
    }
  };
});

calculus.directive("nextfocus", [
  () => {
    return {
      restrict: "A",
      link: (scope, elem, attrs) => {
        elem.bind("keydown", e => {
          var code = e.keyCode || e.which;
          if (code === 13) {
            try {
              if (attrs.enterindex !== undefined) {
                var currentTabeIndex = attrs.enterindex;
                var nextTabIndex = parseInt(currentTabeIndex) + 1;
                var elems = document.querySelectorAll("[enterindex]");
                for (var i = 0, len = elems.length; i < len; i++) {
                  var el = angular.element(elems[i]);
                  var idx = parseInt(el.attr("enterindex"));
                  if (idx === nextTabIndex) {
                    elems[i].focus();
                    break;
                  }
                }
              }
            } catch (e) {
              console.log("Focus error: " + e);
            }
          }
        });
      }
    };
  }
]);

calculus.directive("autoFocus", $timeout => {
  return {
    restrict: "AC",
    link: (_scope, _element) => {
      $timeout(() => {
        _element[0].focus();
      }, 0);
    }
  };
});

calculus.directive("dExpandCollapse", () => {
  return {
    restrict: "EA",
    link: (scope, element, attrs) => {
      //on initialization of group by, set group header expand/collapse icon
      scope.initGroupHeader = (el, g) => {
        if (g.expanded) {
          $(document.getElementById(el))
            .addClass("zmdi-minus")
            .removeClass("zmdi-plus");
        } else if (!g.expanded) {
          $(document.getElementById(el)).addClass("zmdi-plus");
        }
      };

      scope.toggleCollapse = $event => {
        ///Toggle list group by data list
        if ($($event.target).hasClass("card-group-header")) {
          $(
            $($event.target.parentElement.parentElement.children).slice(1)
          ).slideToggle("300", () => { });
        } else {
          $(
            $(
              $event.target.parentElement.parentElement.parentElement.children
            ).slice(1)
          ).slideToggle("300", () => { });
        }

        ///Toggle plus and minus sign on toggel of group by header
        if (
          $($($event.currentTarget).find("div.inline-block")).hasClass(
            "zmdi-plus"
          )
        ) {
          $($event.currentTarget)
            .find("div.inline-block")
            .addClass("zmdi-minus")
            .removeClass("zmdi-plus");
        } else {
          $($event.currentTarget)
            .find("div.inline-block")
            .addClass("zmdi-plus")
            .removeClass("zmdi-minus");
        }
      };
      ///Function to Collapse and uncollapse all the groups same time
      scope.toggleCollapseAll = toggle => {
        if (toggle === 1) {
          $(element)
            .find(".expand-collapse-me")
            .slideDown("300", () => {
              $(element)
                .find("span")
                .toggleClass("dropdowntoggled");
              $(element)
                .find("div.inline-block")
                .toggleClass("zmdi-plus", $(this).is(":hidden"));
            });
        } else {
          $(element)
            .find(".expand-collapse-me")
            .slideUp("300", () => {
              $(element)
                .find("span")
                .toggleClass("dropdowntoggled");
              $(element)
                .find("div.inline-block")
                .toggleClass("zmdi-plus", $(this).is(":hidden"));
            });
        }
      };
    }
  };
});

/*
 * This directive is used in angularTreeView.js for selecting a hierarchy on single click
 */
calculus.directive("singleClick", [
  "$parse",
  $parse => {
    return {
      restrict: "A",
      link: (scope, element, attr) => {
        var fn = $parse(attr["singleClick"]);
        var delay = 300,
          clicks = 0,
          timer = null;
        element.on("click", event => {
          clicks++; //count clicks
          if (clicks === 1) {
            timer = setTimeout(() => {
              scope.$apply(() => {
                fn(scope, {
                  $event: event
                });
              });
              clicks = 0; //after action performed, reset counter
            }, delay);
          } else {
            clearTimeout(timer); //prevent single-click action
            clicks = 0; //after action performed, reset counter
          }
        });
      }
    };
  }
]);

calculus.directive("datalakeButton", () => {
  return {
    restrict: "EA",
    replace: true,
    scope: {
      eventHandler: "&ngClick"
    },
    templateUrl: "application/templates/datalake-button.html"
  };
});

calculus.directive("onlyInteger", () => {
  return {
    restrict: "A",
    link: (scope, element, attrs) => {
      element.on("keypress", event => {
        if (!isIntegerChar()) event.preventDefault();

        function isIntegerChar() {
          return /[0-9]/.test(String.fromCharCode(event.which));
        }
      });
    }
  };
});
calculus.directive("onlyIntegerThree", () => {
  return {
    restrict: "A",
    link: (scope, element, attrs) => {
      element.on("keypress", event => {
        if (!isIntegerChar()) event.preventDefault();

        function isIntegerChar() {
          // Get the current value in the input field
          let value = element.val();

          // Check if adding the current key press would result in a number less than 300
          let proposedValue = value.slice(0, event.target.selectionStart) + String.fromCharCode(event.which) + value.slice(event.target.selectionEnd);
          if (parseInt(proposedValue) > 300) {
            return false;
          }

          // Only allow digits 0-9 and ensure it doesn't start with 0 (unless it's '0')
          return /^[0-9]*$/.test(proposedValue) || proposedValue === '0';
        }
      });
    }
  };
});

calculus.directive("decimalNumbers", () => {
  return {
    restrict: "A",
    link: (scope, element, attrs) => {
      element.on("keypress", event => {
        // If not integer do not allow
        if (!isIntegerChar() && !isDot()) event.preventDefault();
        // If entered key is "." and the old string has "." already then don't allow again
        if (isDot() && element.context.value.split(".").length > 1)
          event.preventDefault();

        function isIntegerChar() {
          return /[0-9]/.test(String.fromCharCode(event.which));
        }

        function isDot() {
          return /[.]/.test(String.fromCharCode(event.which));
        }
      });
    }
  };
});

calculus.directive("moveNextOnMaxlength", () => {
  return {
    restrict: "A",
    link: ($scope, element) => {
      element.on("input", e => {
        if (element.val().length == element.attr("maxlength")) {
          var $nextElement = element.next();
          if ($nextElement.length) {
            $nextElement[0].focus();
          }
        }
      });
    }
  };
});

calculus.directive("rcPopover", [
  "$popover",
  $popover => {
    return {
      restrict: "AE",
      scope: {
        popoverTitle: "@",
        popoverContent: "@",
        popoverTrigger: "@",
        popoverPlacement: "@",
        myPopover: "="
      },
      link: (scope, element, attr) => {
        var options;
        if (
          angular.isDefined(scope.myPopover) &&
          angular.isObject(scope.myPopover)
        ) {
          options = $popover(scope.myPopover).options;
          element.popover(options);
        } else {
          options = {
            title: attr.popoverTitle || "",
            content: attr.popoverContent || "",
            trigger: attr.popoverTrigger || "click",
            placement: attr.popoverPlacement || "right"
          };
          element.popover($popover(options).options);
        }
      }
    };
  }
]);

calculus.directive("rcOnEnter", () => {
  return (scope, element, attrs) => {
    element.bind("keydown keypress", event => {
      if (event.which === 13) {
        scope.$apply(function () {
          scope.$eval(attrs.rcOnEnter);
        });
        event.preventDefault();
      }
    });
  };
});

// Directive to highlight the Quick Search when use has typed something
calculus.directive("indicateQuickSearch", () => {
  return {
    restrict: "A",
    scope: {
      model: "=ngModel"
    },
    link: function (scope, element, attr) {
      scope.$watch("model", newValue => {
        $(element).css("background", "");
        if (newValue != undefined && newValue.length > 0) {
          $(element).css("background", "#ffffdd");
        }
      });
      element.bind("keydown keypress", event => {
        if (event.which === 13) {
          scope.$apply(function () {
            scope.$eval(attrs.rcOnEnter);
          });
          event.preventDefault();
        }
      });
    }
  };
});

//Directive is used for global search
calculus.directive("rcAutocompleteInputField", $timeout => {
  return {
    restrict: "A",
    scope: {
      selectedIndex: "=",
      suggestionsList: "=",
      suggestionDropdownId: "@",
      resultDivId: "@",
      notFoundId: "@",
      showSuggestionDropdown: "=",
      showNoResultsDropdown: "=",
      resultSectionVariable: "="
    },
    link: function (scope, element, attr) {
      element.bind("keydown", () => {
        if (event.keyCode === 40) {
          //down key, increment selectedIndex
          event.preventDefault();
          //Selected index is for moving up down in the suggestion drop down
          if (scope.selectedIndex + 1 === scope.suggestionsList.length) {
            scope.selectedIndex = 0;
          } else {
            scope.selectedIndex++;
          }
          scope.$apply();
        } else if (event.keyCode === 38) {
          //up key, decrement selectedIndex
          event.preventDefault();

          if (scope.selectedIndex === 0) {
            scope.selectedIndex = scope.suggestionsList.length - 1;
          } else {
            scope.selectedIndex--;
          }
          scope.$apply();
        }
      });
      element.bind("focus", () => {
        scope.selectedIndex = 0;
      });
      element.bind("blur", () => {
        //if we blur from the input box(global search box) then hide the suggestion drop down
        $timeout(() => {
          scope.showSuggestionDropdown = false;
        }, 500);
      });
      //to get the click position in the window
      scope.clickPosition = angular.element(window);
      //Once we click, event is triggered
      scope.clickPosition.bind("click", function (event) {
        if (
          scope.resultSectionVariable ||
          scope.showSuggestionDropdown ||
          scope.showNoResultsDropdown
        ) {
          //to get the co ordinates for the result div
          let offsets = document
            .getElementById(scope.resultDivId)
            .getBoundingClientRect();
          let top = offsets.top;
          let left = offsets.left;
          let right = offsets.right;
          let bottom = top + 245; // top + the height of the result div
          //if click is anywhere outside the result div then close the result div and the suggestion drop down if it is open
          //event.clientX - X-axis position of the click on the screen
          //event.clientY - Y-axis position of the click on the screen
          if (
            event.clientX < left ||
            event.clientX > right ||
            event.clientY < top ||
            event.clientY > bottom
          ) {
            $timeout(() => {
              scope.resultSectionVariable = false;
              scope.showNoResultsDropdown = false;
            }, 200);
          }
        }
      });
    }
  };
});

// Directive is used to copy the text to clipboard
calculus.directive("copyToClipboard", function () {
  return {
    restrict: "A",
    link: function (scope, elem, attrs) {
      elem.click(function () {
        if (attrs.copyToClipboard) {
          var $temp_input = $("<input>");
          $("body").append($temp_input);
          $temp_input.val(attrs.copyToClipboard).select();
          document.execCommand("copy");
          $temp_input.remove();
        }
      });
    }
  };
});

// Directive is used to view history panel
calculus.directive("showHistoryPanel", function () {
  return {
    restrict: "E",
    scope: {
      loadHistory: "&",
      closeShowHistory: "&",
      tabIndexValue: "=",
      showhistory: "=",
      showhistoryloading: "=",
      historyList: "="
    },
    replace: false,
    templateUrl: "./application/templates/history.html"
  };
});

// Directive is used to get a place address using zipcode
calculus.directive("googleplace", () => {
  return {
    require: "ngModel",
    link: (scope, element, attrs, model) => {
      let options = {
        types: ["(regions)"]
      };
      // Autocompletecreates a text input field on your web page, takes 2 arguments - input value and options(which contains properties)
      scope.autocomplete = new google.maps.places.Autocomplete(
        element[0],
        options
      );
      // Listen for the event fired when the user selects a prediction and retrieve
      // more details for that place.
      google.maps.event.addListener(scope.autocomplete, "place_changed", () => {
        scope.$apply(() => {
          model.$setViewValue(
            //  Get the place details from the autocomplete object.
            getFormattedAddress(scope.autocomplete.getPlace())
          );
        });
      });

      function getFormattedAddress(place) {
        const locationObject = {};
        if (place) {
          for (const item of place.address_components) {
            locationObject.Address = place.formatted_address;
            if (item.types.indexOf("locality") > -1) {
              locationObject.City = item.long_name;
            } else if (item.types.indexOf("administrative_area_level_1") > -1) {
              locationObject.State = item.short_name;
              locationObject.StateName = item.long_name;
            } else if (item.types.indexOf("street_number") > -1) {
              locationObject.Street = item.short_name;
            } else if (item.types.indexOf("route") > -1) {
              locationObject.Route = item.long_name;
            } else if (item.types.indexOf("country") > -1) {
              locationObject.Country = item.long_name;
              if (item.short_name === "US" || item.long_name === "United States") {
                locationObject.Country = "USA";
              }
            } else if (item.types.indexOf("postal_code") > -1) {
              locationObject.Postalcode = item.short_name;
            } else if (item.types.indexOf("administrative_area_level_2") > -1) {
              locationObject.County = item.long_name;
            }
            locationObject.Latitude = place.geometry.location.lat();
            locationObject.Longitude = place.geometry.location.lng();
          }
          return locationObject;
        }
      }
    }
  };
});

// Directive is used for Automatic phone number formatting
calculus.directive("phoneInput", function ($filter, $browser) {
  return {
    require: "ngModel",
    link: function ($scope, $element, $attrs, ngModelCtrl) {
      var listener = function () {
        let value = $element.val().replace(/[^0-9]/g, "");
        $element.val($filter("telephone")(value, false));
      };

      // This runs when we update the text field
      ngModelCtrl.$parsers.push(function (viewValue) {
        return viewValue.replace(/[^0-9]/g, "").slice(0, 10);
      });

      // This runs when the model gets updated on the scope directly and keeps our view in sync
      ngModelCtrl.$render = function () {
        $element.val($filter("telephone")(ngModelCtrl.$viewValue, false));
      };

      $element.bind("change", listener);
      $element.bind("keydown", function (event) {
        let key = event.keyCode;
        // If the keys include the CTRL, SHIFT, ALT, or META keys, or the arrow keys, do nothing.
        // This lets us support copy and paste too
        if (
          key == 91 ||
          (15 < key && key < 19) ||
          (37 <= key && key <= 40)
        ) {
          return;
        }
        $browser.defer(listener); // Have to do this or changes don't get picked up properly
      });

      $element.bind("paste cut", function () {
        $browser.defer(listener);
      });
    }
  };
});
