(function() {
  "use strict";

  angular
    .module("rc.prime.dashboard")
    .controller("NotificationController", NotificationController);

  NotificationController.$inject = ["$scope", "$state", "NotificationService"];

  function NotificationController($scope, $state, NotificationService) {
    let vm = this;
    $scope.isReply = false;
    $scope.isMsgDial = false;
    $scope.messageResult = [];
    $scope.showVal = false;
    $scope.isDialog = false;
    $scope.showMessanger = false;

    vm.showApproversPanel = () => {
      vm.showApprovers = true;
      vm.showMessages = false;
      vm.showNotifications = false;
      vm.showRequests = false;
      vm.jobRequestPanelShow = true;
      vm.getJobRequestsActions();
    };

    vm.getJobRequestsActions = () => {
      NotificationService.API
        .GetRequestsForGivenCodeAndState("convert-sku", "submitted")
        .then(response => {
          vm.job_actions = response;
        })
        .catch(error => {
          console.log(error);
        });
    };

    vm.doRequestAction = (request_id, action) => {
      vm.isProcessing = true;
      let transition = {
        transition_id: action.transition_id,
        action_id: action.action_id,
        request_id: request_id,
        state_id: action.next_state_id,
        current_state_id: action.current_state_id
      };
      //Create new transition action
      NotificationService.API
        .SetRequestActionState(transition, transition.request_id)
        .then(response => {
          vm.isProcessing = false;
          vm.getJobRequestsActions();          
          if (action.action.toLowerCase() === "review") {
            NotificationService.API
              .FetchRequestPropertiesForRequest(request_id, [
                "'item_id'",
                "'cloned id'"
              ])
              .then(request_properties => {
                if (
                  request_properties[0]["request_property"] === "cloned id"
                ) {
                  vm.sku_id = request_properties[0]["value"];
                } else if (
                  request_properties[1]["request_property"] === "cloned id"
                ) {
                  vm.sku_id = request_properties[1]["value"];
                }
                if (request_properties[0]["request_property"] === "item_id") {
                  vm.item_id = request_properties[0]["value"];
                  $state.go("common.prime.itemMaintenance.sku.skuInventory", {
                    item_id: vm.item_id,
                    id: vm.sku_id,
                    previous_state: "review tickets",
                    request_id: transition.request_id
                  });
                } else if (
                  request_properties[1]["request_property"] === "item_id"
                ) {
                  vm.item_id = request_properties[1]["value"];
                  $state.go("common.prime.itemMaintenance.sku.skuInventory", {
                    item_id: vm.item_id,
                    id: vm.sku_id,
                    previous_state: "review tickets",
                    request_id: transition.request_id
                  });
                }
              })
              .catch(error => {
                console.log(error);
              });
          }
        })
        .catch(error => {
          console.log(error);
        });
    };

    vm.showMessagesPanel = () => {
      vm.jobRequestPanelShow = false;
      vm.showMessages = true;
      vm.showApprovers = false;
      vm.showNotifications = false;
      vm.showRequests = false;
    };

    vm.showNotificationsPanel = () => {
      vm.showNotifications = true;
      vm.showMessages = false;
      vm.showApprovers = false;
      vm.showRequests = false;
    };

    vm.showRequestsPanel = () => {
      vm.jobRequestPanelShow = true;
      vm.showRequests = true;
      vm.showMessages = false;
      vm.showApprovers = false;
      vm.showNotifications = false;
      vm.getMyRequests();
    };

    vm.getMyRequests = () => {
      NotificationService.API
        .GetCurrentUserRequests()
        .then(response => {
          vm.user_requests = response;
        })
        .catch(error => {
          console.log(error);
        });
    };

    vm.closeOrReopenTaskRequest = (request_id, action) => {
      NotificationService.API
        .CloseOrReopenTaskRequest(request_id, action)
        .then(response => {
          vm.getMyRequests();
        })
        .catch(error => {
          console.log(error);
        });
    };
  }
})();
