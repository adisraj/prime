function UserController($scope,
    $filter,
    API,
    ngTableParams,
    UserDataService,
    $state,
    $stateParams,
    growlService,
    $timeout,
    Notification) {

    let vm = this;
    $scope.login_attempts = null;
    $scope.input_type = 'password';
    $scope.showMode = false;
    $scope.oldPasswordError = true;
    $scope.passwordsSame = true;
    $scope.Hello = true;
    $scope.recovery = {};
    this.$showPermissions = false;
    this.$showPassRstDetails = false;
    this.$updateBtnText = "Update";
    this.$updatesuccess = false;
    this.$updatebtnerror = false;
    $scope.head = {};
    //var recoverPassword = UserDataService.recoverPasswordOptions();


    this.openForm = function() {
        $scope.head = {};
        vm.$showPassRstDetails = true;
        vm.$updatesuccess = false;
    }
    this.closeForm = function() {
        vm.$showPassRstDetails = false;
    };

    $scope.hideShowPassword = function() {
        if ($scope.input_type === 'password') {
            $scope.input_type = 'text';
        } else {
            $scope.input_type = 'password';
        }
    };


    UserDataService.$user.getLoginAttempts()
        .then(function(response) {
            $scope.login_attempts = response.data;
        });

    UserDataService.$user.getRecoveryOptions()
        .then(function(response) {
                $scope.recovery = response.data[0];
            },
            function(error) {

            });

    $scope.reset = function(userInfo) {
        var samePassword = $scope.checkPassword();
        if (samePassword) {
            userInfo.current_password = $scope.head.old_password;
            userInfo.new_password = $scope.head.new_password;
            userInfo.retype_password = $scope.head.retype_password;
            $scope.head = userInfo;
            UserDataService.$user.resetPassword($scope.head)
                .then(function(response) {
                        vm.$updatesuccess = true;
                    },
                    function(error) {
                        vm.$updatebtnerror = true;
                        vm.$updateBtnText = "Oops!!. Something went wrong";
                        Notification.errornotification(error);
                        $timeout(function() {
                            vm.$updateBtnText = "Update";
                            vm.$updatebtnerror = false;
                        }, 3000);

                    });
        } else if (!samePassword) {
            vm.$updatebtnerror = true;
            vm.$updateBtnText = "Oops!!. Something went wrong";
            Notification.errornotification({
                "status": 412,
                "data": {
                    "type": 'validation',
                    "error": "Passwords do not match"
                }
            });

            $timeout(function() {
                vm.$updateBtnText = "Update";
                vm.$updatebtnerror = false;
            }, 3000);
        }
    };

    $scope.checkPassword = function() {
        if ($scope.head.new_password && $scope.head.retype_password && ($scope.head.new_password !== $scope.head.retype_password)) {
            return false;
        } else {
            return true;
        }
    };
    $scope.passwordRecoveryOptionsSubmit = function() {
        UserDataService.$user.recoverPasswordOptions($scope.recovery)
            .then(function(response) {
                    growlService.growl('Password Recovery Options set successfully', 'inverse');
                },
                function(error) {
                    growlService.growl('Error setting Password Recovery Options', 'inverse');
                    $scope.recovery = "";
                });

    };
    $scope.notifications = function() {
        UserDataFactory.getMessagesByid(2)
            .then(
                function(response) {
                    $scope.messagNotifications = response.data;
                },
                function(error) {});
    }


}
UserController.$inject = ['$scope',
    '$filter',
    'API',
    'ngTableParams',
    'UserDataService',
    '$state',
    '$stateParams',
    'growlService',
    '$timeout',
    'Notification'
];
angular.module('rc.prime.user').controller('UserController', UserController);