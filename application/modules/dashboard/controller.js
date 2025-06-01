(function () {
  "use strict";

  angular
    .module("rc.prime.dashboard")
    .controller("DashboardController", DashboardController);

  DashboardController.$inject = [
    "$scope",
    "EntityDetails",
    "ApplicationDetails",
    "Logger",
    "DashboardService",
    "Versions",
    'SessionMemory',
    "common",
    "EntityService",
    "$timeout",
    "$element",
    "LoginService",
    "Module",
    "application_configuration"
  ];


  function DashboardController(
    $scope,
    EntityDetails,
    ApplicationDetails,
    Logger,
    DashboardService,
    Versions,
    SessionMemory,
    common,
    EntityService,
    $timeout,
    $element,
    LoginService,
    Module,
    application_configuration
  ) {
    var logger = Logger.getInstance("DashboardController");
    let vm = this;
    vm.common = common;
    let cacheChecked=false
    vm.Module = Module;
    vm.issideMenuVisible = false;
    vm.showSuccessCachePopup = false;
    vm.showCacheClearPopup = false;
    vm.popupHeaderText = `Requires an Update!`;
    vm.showCookieConsentPopup = false;
    vm.cookiesAllowed = '';
    vm.currentVersion = 'v1r122m0'
    checkCookieConsent()

    // To show version details
    vm.toggleVersionMenu = () => {
      $("#releaseVersionModal").modal("show");
    };

    // Listen for state changes 
    $scope.$on('$stateChangeStart', function () {
      checkCookieConsent();
    });


    vm.LoadEntityCounts = (isCache) => {
      vm.isCountProcessing = true;
      vm.uuidMap = new Map();
      if (isCache === undefined || isCache === null) {
        isCache = false;
      }
      let uuids = {
        location: 1,
        item: 4,
        vendor: 9,
        mto: 36,
        hierarchy: 27,
        attribute: 21
      };
      vm.uuids = [
        uuids["location"],
        uuids["item"],
        uuids["vendor"],
        uuids["mto"],
        uuids["hierarchy"],
        uuids["attribute"]
      ];
      for (let i = 0; i < vm.uuids.length; i++) {
        EntityDetails.API
          .GetEntityCount(vm.uuids[i], isCache)
          .then(response => {
            vm.isCountProcessing = false;
            if (response && response.uuid) {
              vm.uuidMap[response.uuid] = response.data.total_records;
            }
          })
          .catch(error => {
            logger.error(error);
          });
      }
    }

    //Get more sku details by id and navigate to update sku screen
    vm.gotoSKUUpdate = (sku) => {
      EntityDetails.API.GetGraphSet(
        common.Identifiers.sku_master,
        [
          "id",
          "description",
          "sku_type",
          "sku_sub_type",
          "item_id"
        ],
        "id",
        sku.sku_id
      )
        .then(res => {
          // go to update sku screen for selected sku
          common.$state
            .go("common.prime.itemMaintenance.sku.update", {
              id: res.data[0].id,
              item_id: res.data[0].item_id,
              skutype: res.data[0].sku_type.toLowerCase(),
              subtype: res.data[0].sku_sub_type.toLowerCase()
            })
        })
        .catch(err => logger.error(err));
    };


    vm.ShowSideOfSideMenu = function () {
      vm.issideMenuVisible = !vm.issideMenuVisible;
    }

    vm.fetchPopularSkusBySkus = () => {
      if (vm.isGroupBySKU === undefined || vm.isGroupBySKU === false) {
        vm.isTrendingProcessing = true;
        vm.isGroupBySKU = true;
        DashboardService.API
          .FetchMostViewedSkusBySkus()
          .then(result => {
            vm.isTrendingProcessing = false;
            vm.popularSkus = result;
          })
          .catch(error => {
            vm.isTrendingProcessing = false;
            logger.error(error);
          });
      }
    };

    vm.fetchPopularSkusByLocations = () => {
      if (vm.isGroupBySKU === true) {
        vm.isTrendingProcessing = true;
        vm.isGroupBySKU = false;
        DashboardService.API
          .FetchMostViewedSkusByLocations()
          .then(result => {
            vm.isTrendingProcessing = false;
            vm.popularSkus = result;
          })
          .catch(error => {
            vm.isTrendingProcessing = false;
            logger.error(error);
          });
      }
    };

    vm.fetchPopularSkusSavedInCarts = () => {
      if (
        vm.isGroupByPopularSKU === undefined ||
        vm.isGroupByPopularSKU === false
      ) {
        vm.isPopularProcessing = true;
        vm.isGroupByPopularSKU = true;
        DashboardService.API
          .FetchPopularSkusSavedInCarts()
          .then(result => {
            vm.isPopularProcessing = false;
            vm.popularCartSKUs = result;
            vm.popularSKUsInCart = result;

          })
          .catch(error => {
            vm.isPopularProcessing = false;
            logger.error(error);
          });
      }
    };


    vm.getUserInfo = () => {
      vm.username = JSON.parse(JSON.stringify(SessionMemory.API.Get("user.name")));
    }

    vm.findByCopyright = () => {
      EntityService.API.FindByCopyright()
        .then(response => {
          vm.copyrightDetails = response.filter(x => x.module_id == vm.Module.id)[0];
        })
        .catch(error => {
          logger.error(error);

        });

    };

    vm.resetAtMidnight = () => {
      var now = new Date();
      var night = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1, // the next day, ...
        1, 30, 0 // ...at 02:00:00 hours
      );
      var msToMidnight = night.getTime() - now.getTime();


      if (msToMidnight >= 0) {
        setTimeout(function () {
          // reset();              //      <-- This is the function being called at midnight.
          window.location = window.location.href + '?eraseCache=true';
          window.location.reload(true)
        }, msToMidnight);
      }
      var isFirstLoad = sessionStorage.getItem('isFirstLoad');

      if (!isFirstLoad) {
        setTimeout(() => {
          // vm.ReloadonLogin()
          sessionStorage.setItem('isFirstLoad', 'true');
        }, 2500)
      }
    }

    vm.ReloadonLogin = () => {
      // window.location = window.location.href + '?eraseCache=true';
      window.location.reload(true);
    }


    function activate() {
      vm.getUserInfo();
      vm.fetchPopularSkusBySkus();
      vm.fetchPopularSkusSavedInCarts();
      vm.LoadEntityCounts(true);
      findByCopyright();
      vm.resetAtMidnight();
      checkPreviousCache()
    }

    activate();

    function checkPreviousCache  ()  {
      if (cacheChecked) return; // Prevent further calls
      cacheChecked = true;
      if ('caches' in window) {
        const specificPath = `/${window.location.pathname.split('/')[1]}`;
        caches.keys().then(function (cacheNames) {
          let segmentFound = false;
    
          Promise.all(
            cacheNames.map(cacheName =>
              caches.open(cacheName).then(cache =>
                cache.keys().then(requests => {
                  const urls = requests.map(r => r.url);
                  const segments = urls.map(url => {
                    const match = url.match(/\.com\/([^/]+)/);
                    return match ? `/${match[1]}` : null;
                  });
    
                  if (segments.includes(specificPath)) {
                    segmentFound = true;
                  }
                })
              )
            )
          ).then(() => {
            if (!segmentFound) {
              vm.clearCookies();
            }
          });
        });
      }
    };

    function checkCookieConsent() {
      const consentGiven = getCookie("cookiesAllowed");
      vm.showCookieConsentPopup = consentGiven !== "true";
    }

    // Function to logout the user and redirect to the login page
    vm.logoutAndRedirect = () => {
      vm.storeCacheMetadata()
        .then(() => vm.clearCache())
        .then(() => LoginService.API.Logout())
        .then(() => {
          const userSession = SessionMemory.API.Get("user.session");
          // Remove reference to this.Module.id
          const moduleId = common.Module ? common.Module.id : null;
          // Call removeSessionId to remove session from the server
          if (userSession && moduleId) {
            return LoginService.API.RemoveSessionId(userSession, moduleId);
          }
        })
        .then(() => {
          // Move the worker logic here
          if (typeof Worker !== "undefined") {
            const worker = new Worker("application/utility/cache-worker.js");
            worker.postMessage({ action: "clearCache", domain: window.location.hostname });
            worker.onmessage = (event) => {
              if (event.data.success) {
                vm.closeSuccessPopup();
                vm.updateAppVersionAfterReload();
              } else {
                console.error("Error clearing cache metadata:", event.data.message);
              }
              worker.terminate();
            };
            worker.onerror = (error) => {
              console.error("Worker error:", error);
              worker.terminate();
            };
          }
        })
        .catch(error => {
          console.error("Error during logout:", error);
        })
        .finally(() => {
          // Always redirect to login, even if there's an error
          vm.redirectToLoginWithReload();
        });
    };

    vm.redirectToLoginWithReload = () => {
      common.$state.go("login").then(() => {
        common.$timeout(() => {
          window.location.reload(true);
        }, 2000);
      });
    }

    vm.updateAppVersionAfterReload = () => {
      try {
        const copyrightDetails = this.common.SessionMemory.API.Get('copyrightDetails');
        if (copyrightDetails) {
          const parsedDetails = JSON.parse(copyrightDetails);
          vm.latestVersion = parsedDetails.app_version || 'unknown';
          vm.currentVersion = vm.latestVersion;
        } else {
          console.error('No copyrightDetails found in session memory.');
        }
      } catch (error) {
        console.error('Error updating app version:', error);
      }
    }

    /* Function to store cache metadata */
    vm.storeCacheMetadata = () => {
      return new Promise((resolve, reject) => {
        try {
          const version = new Date().getTime();
          const cacheKeys = [
            `./?v=${version}`,
            './index.html?v=' + version,
            './main.css?v=' + version,
            './404.html?v=' + version,
            './404.png?v=' + version,
            './main.js?v=' + version,
            '/api/user/profile',
            '/api/user/settings',
          ];
          if (typeof Worker !== 'undefined') {
            const worker = new Worker('application/utility/cache-worker.js');
            const domain = window.location.hostname;
            worker.postMessage({ action: 'storeCache', domain, data: cacheKeys });
            worker.onmessage = (event) => {
              if (event.data.success) {
                resolve();
                vm.showCookieConsentPopup = false;
              } else {
                reject(new Error(event.data.message));
              }
              worker.terminate();
            };
            worker.onerror = (error) => {
              console.error('Error in Service Worker:', error.message);
              reject(new Error('Worker error: ' + error.message));
              worker.terminate();
            };
          } else {
            reject(new Error('Web Workers are not supported in this browser.'));
          }
        } catch (error) {
          console.error('Error during cache metadata storage:', error);
          reject(error);
        }
      });
    }

    /* clear domain cache */
    vm.clearDomainCache = () => {
      const domain = window.location.hostname
      if (typeof Worker !== "undefined") {
        const worker = new Worker("application/utility/cache-worker.js");
        return new Promise((resolve, reject) => {
          worker.postMessage({ action: "clearCache", domain });
          worker.onmessage = (event) => {
            if (event.data.success) {
              resolve();
            } else {
              reject(new Error(event.data.message));
            }
            worker.terminate();
          };
          worker.onerror = (error) => {
            reject(new Error("Worker error: " + error.message));
            worker.terminate();
          };
        });
      } else {
        return Promise.reject(new Error("Web Workers are not supported in this browser."));
      }
    }

    /* set a cookie */
    vm.setCookie = (name, value, days, domain, path) => {
      const currentDate = new Date();
      currentDate.setTime(currentDate.getTime() + days * 24 * 60 * 60 * 1000);
      const expires = `expires=${currentDate.toUTCString()}`;
      const specificPath = path || `/${window.location.pathname.split('/')[1]}`;
      const cookieStr = `${name}=${encodeURIComponent(value)}; ${expires}; path=${specificPath}; domain=${domain || window.location.hostname}; Secure; SameSite=Strict`;
      document.cookie = cookieStr;
    }

    /* get a cookie by name*/
    function getCookie(name) {
      const nameEQ = `${name}=`;
      const ca = document.cookie.split(';');
      for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
      }
      return null;
    }

    /*check user consent before clearing cache or cookies */
    vm.getUserConsent = () => {
      try {
        const consent = getCookie('cookiesAllowed');
        return consent === 'true';
      } catch (error) {
        console.error('Error checking cookie consent:', error);
        return false;
      }
    };

    /*save allowed cookies */
    vm.saveCookies = () => {
      vm.latestVersion = vm.copyrightDetails?.app_version;
      vm.storeCacheMetadata();
      try {
        localStorage.setItem("cookiesAllowed", "true");
        const userInfo = sessionStorage.getItem('user');
        if (userInfo) {
          const parsedUserInfo = JSON.parse(userInfo);
          const userInfoStr = JSON.stringify(parsedUserInfo);
          const specificPath = `/${window.location.pathname.split('/')[1]}`;
          vm.setCookie('userInfo', userInfoStr, 15, window.location.hostname, specificPath);
          vm.showCookieConsentPopup = false;
        }
      } catch (error) {
        console.error('Error saving user information as cookie:', error);
      }
    }

    vm.acceptCookies = () => {
      localStorage.setItem("cookiesAllowed", "accepted");
      vm.showCookieConsentPopup = false;
      const specificPath = `/${window.location.pathname.split('/')[1]}`;
      vm.setCookie("cookiesAllowed", "true", 15, window.location.hostname, specificPath);
      vm.saveCookies();
      vm.showCookieConsentPopup = false;
    }

    vm.declineCookies = () => {
      vm.latestVersion = vm.copyrightDetails?.app_version;
      localStorage.setItem("cookiesAllowed", "declined");
      vm.showCookieConsentPopup = false;
    }

    /*clear cookies of domain */
    vm.clearCookies = async () => {
      const currentDate = new Date();
      currentDate.setTime(currentDate.getTime() - 1);
      const expires = `expires=${currentDate.toUTCString()}`;
      const currentDomain = window.location.hostname;
      const specificPath = `/${window.location.pathname.split('/')[1]}`;
      document.cookie.split(";").forEach(cookie => {
        const cookieName = cookie.split("=")[0].trim();
        // Clear cookies for the specific path
        document.cookie = `${cookieName}=; ${expires}; path=${specificPath}; domain=${currentDomain}`;
      });
    };

    function getPlatform() {
      const ua = navigator.userAgent;
      let platform = 'Unknown';
      let shortcut = 'Ctrl + Shift + R'; // default fallback
      let ipads=''

      if (/iPad/.test(ua)) {
        platform = 'iPad';
        shortcut = " please navigate to Chrome's three-dot menu in the top right corner, select 'History' from the dropdown, set the duration to 'All time,' check the boxes for 'Cookies and cache,' and then click 'Clear browsing data'";
        ipads='To ensure these updates are fully loaded,'
      } else if (/Macintosh/.test(ua) && 'ontouchend' in document) {
        platform = 'iPad'; // iPadOS pretends to be Mac
        shortcut = " please navigate to Chrome's three-dot menu in the top right corner, select 'History' from the dropdown, set the duration to 'All time,' check the boxes for 'Cookies and cache,' and then click 'Clear browsing data'";
        ipads='To ensure these updates are fully loaded,'
      } else if (/Macintosh/.test(ua)) {
        platform = 'Mac';
        shortcut = 'Cmd + Shift + R';
        ipads='Please press '
      } else if (/Windows/.test(ua)) {
        platform = 'Windows';
        shortcut = 'Ctrl + Shift + R';
        ipads='Please press '
      }
    
      return {
        platform,
        shortcut,ipads
      };
    }

    /*clear cache */
    vm.clearCache = async () => {
      const domain = window.location.hostname;
      try {
        await vm.clearDomainCache(domain);
        await vm.clearCookies();
        $scope.$apply(() => {
          vm.showSuccessCachePopup = true;
        });
        await new Promise(resolve => $timeout(resolve, 4000));
      } catch (error) {
        console.error("Error clearing cache:", error);
      } finally {
        vm.closeCachePopup();
        this.common.$timeout(() => {
          vm.logoutAndRedirect();
        }, 4000);
      }
    };

    function findByCopyright() {
      const value = getPlatform();
      vm.deviceThatUses=value.shortcut
      vm.ipadContent=value.ipads
      EntityService.API.FindByCopyright()
        .then(response => {
          vm.copyrightDetails = response.filter(x => x.module_id == vm.Module.id)[0];
          sessionStorage.setItem('copyrightDetails', JSON.stringify(vm.copyrightDetails));
          vm.copyrightDetails = JSON.parse(common.SessionMemory.API.Get('copyrightDetails'));
          vm.newVersion = vm.copyrightDetails?.app_version;
          const consent = vm.getUserConsent();
          if (!consent && vm.latestVersion === vm.currentVersion && vm.cookiesAllowed !== 'declined') {
            vm.showCookieConsentPopup = true;
          } else {
            const consent = vm.getUserConsent();
            if (!consent) {
              common.$timeout(() => {
                vm.showCookieConsentPopup = true;
                vm.showCacheClearPopup = false;
              }, 0);
            } else {
              common.$timeout(() => {
                vm.showCookieConsentPopup = false;
              }, 0)
            }
            vm.closeSuccessPopup();
          }
          if(vm.newVersion !== vm.currentVersion || !consent){
            vm.showCookieConsentPopup=true
          }
          if(consent){
            vm.showCookieConsentPopup = false;
            vm.latestVersion = vm.copyrightDetails?.app_version;
          }
          vm.closeSuccessPopup();
        })
        .catch(error => {
          logger.error(error);
        });
    };


    vm.closeCachePopup = () => {
      vm.showCacheClearPopup = false;
      $scope.$apply();
    }

    vm.closeSuccessPopup = () => {
      if (!$scope.$$phase && !$scope.$root.$$phase) {
        $scope.$apply(() => {
          vm.showSuccessCachePopup = false;
        });
      } else {
        vm.showSuccessCachePopup = false;
      }
    };
  }
})();
