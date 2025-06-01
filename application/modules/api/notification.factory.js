/* Company			: ndvor IT Solutions ( www.ndvor.com )
 * Project			: Retail Calculus
 * Created Date		: 2 May 2016
 * Purpose			: Factory for notifications
 * Author			: Narun Shathvik
 */
function Notification($http, growlService, growl) {
  var config = {
    disableCountDown: true,
    ttl: 7000
  };
  return {
    //When request executed successfully response notification will be show in UI with growl
    responsenotification: function(response) {
      if (!response.error) {
        if (response.message) {
          growl.success(response.message, config);
        } else {
          growl.success(response.data.message, config);
        }
      } else if (response.errorno === 1644) {
        //This will get executed when mysql returns a duplicate entry(NO:1062) error
        growl.error("Record already exist in the database", config);
      } else {
        growl.error("Reference Error", config);
      }
    },
    //If error occured in any request, error notification will be show in UI with growl
    errornotification: function(flag) {
      if (flag == 0) {
        growl.error("Server not connected", config);
      } else if (flag.status === 412) {
        if (
          flag.data.type !== undefined &&
          (flag.data.type.toLowerCase() === "_check_dependency" ||
            flag.data.type.toLowerCase() === "dependency check" ||
            flag.data.type.toLowerCase() === "validation")
        ) {
          if (
            flag.data.error === "" ||
            flag.data.error === undefined ||
            flag.data.error === null
          ) {
            /* Do not show any growl message */
          } else if (
            flag.data.error !== "" &&
            flag.data.error !== undefined &&
            flag.data.error !== null
          ) {
            growl.error(flag.data.error, config);
          }
        } else {
          if (
            flag.data.error.message !== undefined &&
            flag.data.error.message !== null
          ) {
            growl.error(flag.data.error.message, config);
          }
        }
      } else if (flag == 2) {
        growl.error("Unauthorized User Access", config);
      } else if (flag.status == 401) {
        growl.error(flag.data, config);
      } else if (flag.status == 505) {
        growl.error(flag.data.error, config);
      } else {
        growl.error(flag.data, config);
      }
    },
    errorNotification: error => {
      if (error.status === 412) {
        if (error.data.type === "_check_dependency") {
          return error.data.dependency;
        } else if (error.data.type === "Dependency Check") {
          return error.data.error;
        } else if(error.data.error.message !== undefined){
          return error.data.error.message;
        } else {
          return error.data.error.error;
        }
      } else {
        if (error && error.data) {
          if (error.data.message) {
            return error.data.message;
          } else {
            return error.data.error;
          }
        } else {
          return error;
        }
      }
    }
  };
}
Notification.$inject = ["$http", "growlService", "growl"];
calculus.factory("Notification", Notification);
