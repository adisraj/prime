(function() {
  "use strict";

  angular
    .module("rc.prime.retail.rounding.rule")
    .controller("RoundingRuleGroupsController", RoundingRuleGroupsController);

  RoundingRuleGroupsController.$inject = [
    "$scope",
    "common",
    "RoundingRulesService"
  ];

  function RoundingRuleGroupsController($scope, common, RoundingRulesService) {
    var vm = this;
    let $timeout = common.$timeout;
    vm.allRuleGroups = [];
    vm.isLoaded = true;

    vm.sortType = "rule_group";
    vm.currentPage = 1;
    vm.pageSize = 100;

    let logger = common.Logger.getInstance("RoundingRuleGroupsController");

    //Set attribute grid properties for show-hide Rounding Rules Groups columns
    vm.setGridProperties = () => {
      vm.roundingRulesGroupGrid = {
        columns: {
          id: {
            visible: false
          },
          status: {
            visible: true
          },
          priceType: {
            visible: true
          },
          ruleGroupName: {
            visible: true
          },
          isDefault: {
            visible: true
          },
          rules: {
            visible: true
          }
        }
      };
    };

    vm.getRoundingRuleGroups = refresh => {
      vm.setGridProperties();
      if (refresh !== undefined) {
        vm.totalRecords = "";
        vm.totalTimeText = "";
        vm.isRefreshTable = true;
        vm.refreshTableText = "Table is refreshing...";
      }
      vm.isLoaded = false;
      RoundingRulesService.API.GetRoundingRuleGroups()
        .then(response => {
          vm.allRuleGroups = response.data;
          vm.rowsCount = response.data.length;
          if (refresh !== undefined) {
            vm.refreshTableText = "Table is refreshing...";
            vm.totalRecords = response.data.length;
            vm.totalRecordsText = "record(s) loaded in approximately";
            vm.totalTimeText =
              "<strong>" +
              response.time_taken +
              "</strong><span class='f-14 c-gray'> seconds</span>";
            vm.refreshTableText = "Successfully refreshed";
            $timeout(() => {
              vm.isRefreshTable = false;
            }, 3500);
          }
          vm.isLoaded = true;
          vm.updateTableInformation(1);
        })
        .catch(error => {
          vm.isRefreshTable = true;
          vm.refreshTableText = "Unsuccessfull!";
          $timeout(() => {
            vm.isRefreshTable = false;
          }, 3500);
          logger.error(error);
        });
    };

    vm.ShowHideColumnSettings = () => {
      vm.isColumnSettingsVisible = vm.isColumnSettingsVisible ? false : true;
    };

    vm.pageChangeHandler = num => {
      vm.currentPage = num;
      vm.updateTableInformation(num);
    };

    vm.updateTableInformation = currentPage => {
      if (vm.rulesCount === 0) {
        vm.initalCount = 0;
      } else {
        vm.initalCount = 1;
      }
      if (currentPage === 1) {
        vm.rowsInfo =
          "Displaying " +
          vm.initalCount +
          "-" +
          (vm.rowsCount < vm.pageSize ? vm.rowsCount : vm.pageSize) +
          " Of " +
          vm.rowsCount +
          " Records";
      } else {
        var start =
          parseInt(currentPage) * parseInt(vm.pageSize) -
          parseInt(vm.pageSize) +
          1;
        var end =
          parseInt(currentPage) * parseInt(vm.pageSize) -
          parseInt(vm.pageSize) +
          parseInt(vm.pageSize);
        vm.rowsInfo =
          "Displaying " +
          start +
          " -" +
          (end < vm.rowsCount ? end : vm.rowsCount) +
          " Of " +
          vm.rowsCount +
          " Records";
      }
    };

    activate();

    function activate() {
      vm.getRoundingRuleGroups();
      vm.setGridProperties();
    }
  }
})();

(function() {
  "use strict";

  angular
    .module("rc.prime.item")
    .controller("RoundingRulesController", RoundingRulesController);

  RoundingRulesController.$inject = [
    "$scope",
    "$state",
    "RoundingRulesService",
    "common"
  ];

  function RoundingRulesController(
    $scope,
    $state,
    RoundingRulesService,
    common
  ) {
    /* jshint validthis:true */
    var vm = this;
    let logger = common.Logger.getInstance("RoundingRulesController");
    let $timeout = common.$timeout;
    vm.sortType = "rule_id";
    vm.currentPage = 1;
    vm.pageSize = 100;
    vm.isLoaded = true;
    vm.isColumnSettingsVisible = false;

    //Set attribute grid properties for show-hide Rounding Rules columns
    vm.setGridProperties = () => {
      vm.roundingRulesGrid = {
        columns: {
          id: {
            visible: false
          },
          priceChangeReason: {
            visible: true
          },
          priceType: {
            visible: true
          },
          orderOfApply: {
            visible: true
          },
          unrPrice: {
            visible: true
          },
          unrPriceDecimal: {
            visible: true
          },
          rnrPrice: {
            visible: true
          }
        }
      };
    };

    vm.ShowHideColumnSettings = () => {
      vm.isColumnSettingsVisible = vm.isColumnSettingsVisible ? false : true;
    };

    vm.getRoundingRulesForRuleGroup = refresh => {
      vm.setGridProperties();
      vm.rulesList = [];
      vm.rule_group_id = $state.params.rule_group_id;
      vm.rule_group_name = $state.params.rule_group_name;
      vm.isLoaded = false;
      if (refresh !== undefined) {
        vm.totalRecords = "";
        vm.totalTimeText = "";
        vm.isRefreshTable = true;
        vm.refreshTableText = "Table is refreshing...";
      }
      RoundingRulesService.API.GetRulesByRuleGroupId(vm.rule_group_id)
        .then(response => {
          vm.rulesList = response.data;
          vm.rowsCount = response.data.length;
          vm.isLoaded = true;
          if (refresh !== undefined) {
            vm.refreshTableText = "Table is refreshing...";
            vm.totalRecords = response.data.length;
            vm.totalRecordsText = "record(s) loaded in approximately";
            vm.totalTimeText =
              "<strong>" +
              response.time_taken +
              "</strong><span class='f-14 c-gray'> seconds</span>";
            vm.refreshTableText = "Successfully refreshed";
            $timeout(() => {
              vm.isRefreshTable = false;
            }, 3500);
          }
          vm.updateTableInformation(1);
        })
        .catch(error => {
          logger.error(error);
        });
    };

    vm.pageChangeHandler = num => {
      vm.currentPage = num;
      vm.updateTableInformation(num);
    };

    vm.updateTableInformation = currentPage => {
      if (currentPage === 1) {
        vm.rowsInfo =
          "Displaying 1-" +
          (vm.rowsCount < vm.pageSize ? vm.rowsCount : vm.pageSize) +
          " Of " +
          vm.rowsCount +
          " Records";
      } else {
        var start =
          parseInt(currentPage) * parseInt(vm.pageSize) -
          parseInt(vm.pageSize) +
          1;
        var end =
          parseInt(currentPage) * parseInt(vm.pageSize) -
          parseInt(vm.pageSize) +
          parseInt(vm.pageSize);
        vm.rowsInfo =
          "Displaying " +
          start +
          " -" +
          (end < vm.rowsCount ? end : vm.rowsCount) +
          " Of " +
          vm.rowsCount +
          " Records";
      }
    };

    activate();

    function activate() {
      vm.getRoundingRulesForRuleGroup();
      vm.setGridProperties();
    }
  }
})();
