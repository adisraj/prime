/* Company      : ndvor IT Solutions ( www.ndvor.com )
 * Project      : Retail Calculus
 * Created Date :
 * Purpose      : Controller for R module
 * Author       : narun92@gmail.com
 */

/*
 *  Change Log :
 1. Modified Date   : 2 May 2016
    Purpose : a. Modified the structure of the code based on the new UI changes.
              b. Modified the timeouts to promises.
              c. Added fetch and reload method.
              d. Removed state.go method for editpage and newpage
              e. Added code to populate the CRUD Form based on click of R rows.
              f. Added code to edit the R row.
    Author: biswa_b@ndvor.com
2.  Modified Date: 4 May 2016
    Purpose : a.  Added Notification API code for Grwol Service to come dynamically from API.
    Author: narun92@gmail.com
3.  Modified Date   : 14 June 2016
    Purpose         : a.  Refeshing of the table without reloading is done
    Author          : narun92@gmail.com

/**
 * R Controller
 * @param   : {angular.$scope} $scope The Angular scope service.
 * @param   : {angular.$filter} $filter The Angular filter service.
 * @param   : {Calculus.API} API Calculus API Data Service
 * @param   : {ngTable.ngTablePrams} ngTableParams ngtable parameter service
 * @param   : {angular.$stateparams} stateparams state parameter service
 * @param   : {angular.$state} state parameter service
 * @param   : {calculus.ValidationAPI} GenericAPI Calculus Validation API Data Service
 * @param   : {calculus.Notification} Notification Calculus Notification Data Service
 * @return  : returns javascript functions.
 */
function RController($scope, $filter, API, ngTableParams, $state, $stateParams, ValidationAPI, Notification, UserAccessAllPermissionsService, UserDataFactory) {

    $scope.accessRules = {};

    function initPrefixes() {
        var str = [];
        UserDataFactory.getPrefix("R Master").then(function(response) {
                $scope.RPrefix = response.data.data[0].prefix;
                str.push($scope.RPrefix);
                var prefixes = str.getQueryCommaSeparatedStrings();
                initalizePermissions(prefixes);
            },
            function(error) {
                //console.log("error");
            });
    }

    initPrefixes();

    function initalizePermissions(prefixes) {

        $scope.accessRules = {};

        UserAccessAllPermissionsService.getAllPermissions(prefixes).then(function(data) {
            $scope.accessRules["RMaster"] = data[$scope.RPrefix];
            var RPrefixId = data[$scope.RPrefix]["prefixId"];
            initR(RPrefixId);

        }).catch(function() {
            $scope.error = 'unable to get ';
        });
    }
    var self = this;

    function initR(RPrefixId) {

        //API Resoruce
        ValidationAPI.setProgramNumber($state.current.templateUrl, $scope);
        var R = API.RAPI(RPrefixId).R;
        var RId = $stateParams.id;
        this.listviewSearchStat = false;
        this.newR = false;
        var getMetaByInstNamePromise = API.Meta.query({ name: "R" }, function() {
            $scope.changeMeta(getMetaByInstNamePromise.data);
        });
        $scope.changeName("R");


        $scope.$showPanel = 'default';
        $scope.$showDetails = false;
        $scope.R_details = [];
        var allR = [{ 'id': 1, 'status': 'Active' }, { 'id': 0, 'status': 'Inactive' }];
        $scope.allR = allR;

        /*
         *  Watching the returnValue for any value change by user in the group by drop down. Then it calls the fetch method
         * to re-group the data in the table
         */
        $scope.$watch(angular.bind(self.returnValue, function() {
            $scope.setReturnValue(self.returnValue);
            return self.returnValue;
        }), function(value) {
            if (typeof $scope.R_table != "undefined") {
                $scope.R_table.reload();
            }
        });

        /*
         * In group by, whenever you collapse a group by, that group of elements will get collapsed/expand based on the selection made
         */
        $scope.showHideFollowingArray = function(groupArray) {
            for (var i = 0; i < groupArray.length; i++) {
                groupArray[i].hideRows = !groupArray[i].hideRows;
            }
        };

        $scope.reload = function() {
            R.query(function(response) {
              
                $scope.R_table = $scope.getTable(response, self.returnValue);
            });
        }
        $scope.reload();

        function showMainList(data) {
            self.$showDetails = false;
            self.newR = false;
            $scope.R_details = '';
            data.$edit = false;
            $scope.R = "";
            $scope.reload();
        }

        function prepareData(data) {
            data.active = data.active_id;
        }

        $scope.save_R = function(data) {
     
            prepareData(data);
            $scope.save(new R(), data, '').then(function(response) {
                showMainList(data);
            }, function(error) {

            });
        };

        $scope.update_R = function(data) {
            prepareData(data);
            $scope.update(new R(), data, '').then(function(response) {
                showMainList(data);
            }, function(error) {

            });
        };

        $scope.delete_R = function(data) {
            prepareData(data);
            $scope.delete(new R(), data, '').then(function(response) {
                showMainList(data);
            }, function(error) {

            });
        };

        $scope.clear = function() {
            $scope.editMode = false;
            $scope.R = "";
        };

        $scope.copyLog = function(newLog) {
            $scope.changeLog(newLog);
        };

        function Validate() {
            $scope.RInsideObject = ValidationAPI.getRules("R", "R");
        }
        $scope.showDetailsByID = function(R) {
            $scope.R_details = R;
            $scope.$showDetails = true;
            $scope.$showAdd = false;
            $scope.allR = allR;
            $scope.R_details.active_id = $scope.R_details.active_id;
            self.$showDetails = true;
            self.$showAdd = false;
        };

        $scope.growlIt = function(message, type) {
            growlService.growl(message, type);
        };
        $scope.newValue = function() {
            $scope.R_details = "";
            $scope.allR = allR;
        };
        $scope.showValues = function(R) {
            $scope.R = R;
            $scope.allR = allR;
            $scope.R.active_id = $scope.R.active_id.toString();
        };

        /** Using Same Shortcuts to Open,Close and fullscreen*/
        self.fs = 0;
        self.createR = function(){
          /** Mouse Trap Binding Event **/
                self.newR = true;
                self.$showDetails=true;
                self.$showAdd = true;
                $scope.R_details = "";
                $scope.newValue();
                setTimeout(function () {
                      $scope.$apply(function () {
                      });
                  },1000);
         }
         self.closeCreateR = function(){
           self.newR = false;
           self.$showDetails=false;
           self.$showAdd = true;
           $scope.R_details = "";
           setTimeout(function () {
                 $scope.$apply(function () {
                 });
             },1000);
         }
        self.fullScreenR = function(){
          if(self.fs == 0){
            self.$listFullScreen = true;
            self.fs++;
          }else{
            self.$listFullScreen = false;
            self.fs--;
         }
        }


    }
};


/**
 * R Controller
 * @param   : {angular.$scope} $scope The Angular scope service.
 * @param   : {angular.$filter} $filter The Angular filter service.
 * @param   : {Calculus.API} API Calculus API Data Service
 * @param   : {ngTable.ngTablePrams} ngTableParams ngtable parameter service
 * @param   : {angular.$stateparams} stateparams state parameter service
 * @param   : {angular.$state} state parameter service
 * @param   : {calculus.ValidationAPI} GenericAPI Calculus Validation API Data Service
 * @param   : {calculus.Notification} Notification Calculus Notification Data Service
 * @return  : returns javascript functions.
 */
RController.$inject = ['$scope', '$filter', 'API', 'ngTableParams', '$state', '$stateParams', 'ValidationAPI', 'Notification', 'UserAccessAllPermissionsService', 'UserDataFactory'];
calculus.controller('RController', RController);
