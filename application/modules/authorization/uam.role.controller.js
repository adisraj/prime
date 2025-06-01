(function() {
  calculus.controller("AccessRoleController", AccessRoleController);

  AccessRoleController.$inject = [
    "Logger",
    "$state",
    "$scope",
    "$timeout",
    "UserService",
    "RoleService",
    "EntityService"
  ];

  function AccessRoleController(
    Logger,
    $state,
    $scope,
    $timeout,
    UserService,
    RoleService,
    EntityService
  ) {
    let vm = this;
    vm.$showDetails = false;
    vm.saveBtnText = "Save";
    vm.$savebtnerror = false;
    vm.isSaveSuccess = false;
    vm.updateBtnText = "Update";
    vm.$updatebtnerror = false;
    vm.$updatesuccess = false;
    vm.moduleName = "User";
    vm.moduleNameRoles = "Role";
    vm.showDetails = false;
    vm.isShowPermission = false;
    vm.isShowExistingUsers = false;
    vm.$updateFormParameters = false;
    vm.isShowRoleDetails = false;
    vm.isShowUser = false;
    let logger = Logger.getInstance("AccessRoleController");

    vm.getAccessRoles = function(user_roles) {
      RoleService.API.GetAccessRoles()
        .then(response => {
          vm.accessRolesList = JSON.parse(JSON.stringify(response.data));
        })
        .catch(error => {
          logger.error(error);
        });
    };

    vm.loadUsersByRoleId = function() {
      vm.isSummary = true;
      vm.isShowPermission = false;
      vm.isShowTemplate = false;
      vm.isSettings = false;
      vm.selectedUserDetails = vm.role_information;
      RoleService.API.GetUserAccessRoles(vm.role_information.id).then(
        response => {
          vm.userRoles = JSON.parse(JSON.stringify(response.data));
          vm.getAvailableUsers(vm.userRoles);
        }
      );
    };

    vm.getAvailableUsers = function(existing_user_roles) {
      UserService.API.GetUser()
        .then(response => {
          vm.users = _.clone(response.data);
          vm.availableUsers = [];
          let usersMap = {};
          for (let i = 0; i < existing_user_roles.length; i++) {
            if (usersMap[existing_user_roles[i]["user_id"]] === undefined) {
              usersMap[existing_user_roles[i]["user_id"]] =
                existing_user_roles[i];
            }
          }
          for (let i = 0; i < vm.users.length; i++) {
            if (!usersMap[vm.users[i]["id"]]) {
              vm.availableUsers.push(vm.users[i]);
            }
          }
        })
        .catch(error => {
          logger.error(error);
        });
    };

    vm.assignAvailableUserToRole = function(available_user) {
      vm.availableUsers.splice(available_user, 1);
      vm.userRoles.push(available_user);
      let user_role = {};
      user_role.user_id = available_user.id;
      user_role.role_id = vm.role_information.id;
      RoleService.API.InsertUserRole(user_role)
        .then(response => {})
        .catch(error => {
          logger.error(error);
        });
    };

    vm.removeUserRole = function(user_role) {
      vm.userRoles.splice(user_role, 1);
      vm.availableUsers.push(user_role);
      RoleService.API.DeleteUserRole(user_role)
        .then(response => {})
        .catch(error => {
          logger.error(error);
        });
    };

    vm.loadTemplate = () => {
      vm.isShowTemplate = true;
      vm.isShowPermission = false;
      vm.isSummary = false;
      vm.isShowExistingUsers = false;
      vm.isSettings = false;
    };

    vm.loadSettings = () => {
      vm.isSettings = true;
      vm.isShowTemplate = false;
      vm.isShowPermission = false;
      vm.isSummary = false;
      vm.isShowExistingUsers = false;
    };

    vm.loadRolePermissionsByRoleId = function() {
      vm.isShowPermission = true;
      vm.isSummary = false;
      vm.isShowExistingUsers = false;
      vm.isShowTemplate = false;
      vm.isSettings = false;
      RoleService.API.GetRolePermission(vm.role_information.id).then(
        response => {
          vm.assigned_permissions = response.data;
          vm.getAccessPermission(vm.assigned_permissions);
        }
      );
    };

    vm.getAccessPermission = function(assigned_permissions) {
      EntityService.API.GetAllEntities().then(entities => {
        let role_permission_map = {};
        let ids = [];
        vm.role_permissions = [];
        _.each(assigned_permissions, function(role_permission) {
          if (role_permission_map[role_permission.entity_id] === undefined) {
            role_permission_map[role_permission.entity_id] = role_permission;
            role_permission_map[role_permission.entity_id][
              role_permission.permission
            ] = 1;
            ids.push(role_permission.entity_id);
          } else {
            role_permission_map[role_permission.entity_id][
              role_permission.permission
            ] = 1;
          }
        });
        _.each(entities.data, entity => {
          if (role_permission_map[entity.id]) {
            vm.role_permissions.push(role_permission_map[entity.id]);
          } else {
            vm.role_permissions.push(entity);
          }
        });
      });
    };

    vm.addPermission = function(value, permission, access) {
      if (value === 1) {
        if (permission.entity_id === undefined) {
          permission.entity_id = permission.id;
        }
        permission.role_id = vm.role_information.id;
        permission.permission = access;
        RoleService.API.CreateRolePermission(permission)
          .then(response => {
            vm.message = "Updated permissions successfully";
            vm.loadRolePermissionsByRoleId();
          })
          .catch(error => {
            logger.error(error);
          });
      } else {
        vm.removePermission(permission);
      }
    };

    vm.removePermission = function(role_permission) {
      RoleService.API.DeleteRolePermission(role_permission)
        .then(response => {
          vm.message = "Removed permissions successfully";
          vm.loadRolePermissionsByRoleId();
        })
        .catch(error => {
          logger.error(error);
        });
    };

    vm.changeView = function(val) {
      if (val === 1) {
        vm.showRoles = true;
        vm.$showDetails = false;
        vm.$showRolePermissions = false;
        document.getElementById("rolesBtn").focus();
      } else if (val === 2) {
        vm.showPermission = true;
      } else if (val === 5) {
        vm.activeUsers = true;
        document.getElementById("activeUsersBtn").focus();
      } else if (val === 4) {
      }
    };

    if ($state.current.name === "authorization.master.roles") {
      vm.changeView(1);
    } else if ($state.current.name === "authorization.master.permissions") {
      vm.changeView(2);
    } else if ($state.current.name === "authorization.master.activeusers") {
      vm.changeView(5);
    } else {
      vm.changeView(4);
    }

    /**** Configuration of Roles and Permissions *********/
    Array.prototype.arrayObjectIndexOf = function(property, value) {
      for (let i = 0, len = vm.length; i < len; i++) {
        if (vm[i][property] === value) return i;
      }
      return -1;
    };

    vm.createRole = function(role) {
      vm.saveBtnText = "Saving Now...";
      role.status_id = 1;
      RoleService.API.CreateRole(role).then(
        response => {
          vm.getAccessRoles();
          response.message = "User Role created Successfully !!!";
          vm.saveBtnText = "Save";
          vm.isSaveSuccess = true;
        },
        function(error) {
          vm.saveBtnText = "Oops.!! Something went wrong";
          vm.$savebtnerror = true;
          $timeout(function() {
            vm.saveBtnText = "Save";
            vm.$savebtnerror = false;
          }, 5000);
        }
      );
    };

    vm.dblClickAction = function(role_information) {
      vm.role_information = "";
      vm.isShowRoleDetails = true;
      vm.isShowPermission = false;
      vm.$updateFormParameters = true;
      vm.isSaveSuccess = false;
      vm.$updatesuccess = false;
      vm.$showAdd = false;
      vm.role_information = role_information;
      vm.loadUsersByRoleId();
    };

    $scope.selectedRow = null;
    $scope.setClickedRow = function(index) {
      $scope.selectedRow = index;
    };

    vm.setInitialState = function(entityName) {
      if (entityName.toLowerCase() === "user" && entityName) {
        angular.element("#inputName").focus();
      } else if (entityName.toLowerCase() === "roles" && entityName) {
        angular.element("#role").focus();
      } else {
        // console.log("Entity Name id defined", entityName);
      }
    };

    vm.createNewFn = function(entityName) {
      if (entityName === "User") {
        vm.$showAdd = true;
        vm.$showDetails = true;
        vm.$updateFormParameters = false;
        $scope.registeration = {};
        vm.setInitialState(entityName);
      } else if (entityName === "Roles") {
        $scope.role_details = {};
        vm.$showAdd = true;
        vm.$showDetails = true;
        vm.$back = true;
        vm.setInitialState(entityName);
      }
    };

    vm.closeCreateNew = function() {
      vm.showDetails = false;
      vm.isShowUser = false;
      vm.updateBtnText = "Update";
      vm.$updatebtnerror = false;
      $timeout(function() {
        vm.$updatesuccess = false;
        vm.isSaveSuccess = false;
      }, 1500);
    };

    vm.createUserPanel = function() {
      vm.isShowUser = true;
      vm.user = "";
      vm.isCreateUser = true;
      vm.isDeleteSuccess = false;
    };
  }
})();
