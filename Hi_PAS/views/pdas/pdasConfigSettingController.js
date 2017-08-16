angular
    .module('pdasConfigSettingApp',[])
    .controller('pdasConfigSettingController', ['$scope', '$http', pdasConfigSettingController]);


function pdasConfigSettingController($scope, $http) {
    var pdasConfigSettingVM = this;

    pdasConfigSettingVM.currentThreshold = [];
    pdasConfigSettingVM.currentUpperLimit = 0;
    pdasConfigSettingVM.oeeThreshold = []
    pdasConfigSettingVM.oeeLowerLimit = 0;
    pdasConfigSettingVM.saveResult = '';

    getConfigSettingData();

    pdasConfigSettingVM.initConfigSettingData = function(){
        getConfigSettingData();
        $('#ID_PDAS_saveConfigBtn').prop('disabled',true);
        pdasConfigSettingVM.saveResult = '';
        localStorage.setItem('currentThreshold', pdasConfigSettingVM.currentThreshold);
        localStorage.setItem('currentUpperLimit', pdasConfigSettingVM.currentUpperLimit);
        localStorage.setItem('oeeThreshold', pdasConfigSettingVM.oeeThreshold);
        localStorage.setItem('oeeLowerLimit', pdasConfigSettingVM.oeeLowerLimit);
    };

    pdasConfigSettingVM.changeConfigData = function() {
        $('#ID_PDAS_saveConfigBtn').prop('disabled',false);
    }

    pdasConfigSettingVM.saveConfiguration = function() {
        var configSetting = {
            "CurrentTime" : new Date(),
            "CurrentData" : {
                "Threshold":  pdasConfigSettingVM.currentThreshold,
                "UpperLimit": pdasConfigSettingVM.currentUpperLimit
            },
            "OEEData" : {
                "Threshold":  pdasConfigSettingVM.oeeThreshold,
                "LowerLimit": pdasConfigSettingVM.oeeLowerLimit
            }
        }
        $http.post('/pdas/configSetting/', {"ConfigSetting":configSetting}).success(function (res) {
            pdasConfigSettingVM.saveResult = '변경 내용이 저장되었습니다.'
            localStorage.setItem('currentThreshold', pdasConfigSettingVM.currentThreshold);
            localStorage.setItem('currentUpperLimit', pdasConfigSettingVM.currentUpperLimit);
            localStorage.setItem('oeeThreshold', pdasConfigSettingVM.oeeThreshold);
            localStorage.setItem('oeeLowerLimit', pdasConfigSettingVM.oeeLowerLimit);
        });
    }
    
    function getConfigSettingData() {
        $http.get('/pdas/configSetting/').success(function (res) {
            pdasConfigSettingVM.currentThreshold  = res.CurrentData.Threshold;
            pdasConfigSettingVM.currentUpperLimit = parseInt(res.CurrentData.UpperLimit);
            pdasConfigSettingVM.oeeThreshold      = res.OEEData.Threshold;
            pdasConfigSettingVM.oeeLowerLimit     = parseInt(res.OEEData.LowerLimit);
            window.localStorage.setItem('currentThreshold', pdasConfigSettingVM.currentThreshold);
            window.localStorage.setItem('currentUpperLimit', pdasConfigSettingVM.currentUpperLimit);
            window.localStorage.setItem('oeeThreshold', pdasConfigSettingVM.oeeThreshold);
            window.localStorage.setItem('oeeLowerLimit', pdasConfigSettingVM.oeeLowerLimit);
        });
    }
}