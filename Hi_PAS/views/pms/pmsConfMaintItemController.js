angular.module('pmsConfMaintItemApp', [])
    .controller('PMSConfMaintItemController', ['$scope', '$http', PMSConfMaintItemController]);

function PMSConfMaintItemController($scope, $http) {
    var pmsConfMaintItemVM = this;
    pmsConfMaintItemVM.ItemList = [];
    pmsConfMaintItemVM.MachineTypeList = [];
    pmsConfMaintItemVM.ModuleTypeList = [];
    pmsConfMaintItemVM.DeviceTypeList = [];
    pmsConfMaintItemVM.ItemLevelList = [];
    pmsConfMaintItemVM.TBMCheckUnitList = [];
    pmsConfMaintItemVM.CBMCheckUnitList = [];
    pmsConfMaintItemVM.TBMCheckValueList = [];
    
    pmsConfMaintItemVM.mSelectedMachineType;
    pmsConfMaintItemVM.mSelectedModuleType;
    pmsConfMaintItemVM.mSelectedDeviceType;
    pmsConfMaintItemVM.mSelectedItemLevel;
    pmsConfMaintItemVM.mSelectedTBMCheckUnit;
    pmsConfMaintItemVM.mSelectedTBMCheckValue = [{ Value : 0, Name : null}];
    pmsConfMaintItemVM.mSelectedCBMCheckUnit;
    pmsConfMaintItemVM.mSelectedItemCheckType = 0; // Default TBM   see PMSMaintItemDataSchema    
    pmsConfMaintItemVM.mSelectedItemType = 0; // Default Check  see PMSMaintItemDataSchema    


    /* Export Function declare */
    pmsConfMaintItemVM.ShowMaintItemCreateView = ShowMaintItemCreateView;
    pmsConfMaintItemVM.CloseMaintItemCreateView = CloseMaintItemCreateView;
    pmsConfMaintItemVM.ShowItemActionListView = ShowItemActionListView;
    pmsConfMaintItemVM.CloseItemActionListView = CloseItemActionListView;
    pmsConfMaintItemVM.SaveMaintItem = SaveMaintItem;
    pmsConfMaintItemVM.OnChangeMachineTypeList = OnChangeMachineTypeList;
    pmsConfMaintItemVM.OnChangeModuleTypeList = OnChangeModuleTypeList;
    pmsConfMaintItemVM.OnSelectTBMOption = OnSelectTBMOption;
    pmsConfMaintItemVM.OnSelectCBMOption = OnSelectCBMOption;
    pmsConfMaintItemVM.OnChangeTBMCheckUnit = OnChangeTBMCheckUnit;
    pmsConfMaintItemVM.OnSelectItemTypeCheck = OnSelectItemTypeCheck;
    pmsConfMaintItemVM.OnSelectItemTypeAction = OnSelectItemTypeAction;       
      
    $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
        if (e.target.hash === "#ID_PMS_MenuConfigSubMaintItem") {
            initializeControl();
        }
    });

    function initializeControl() {
        loadMaintItemList();
    }    

    function loadMaintItemList() {
        $http.get('/pms/getMaintItemList')
            .then(function (response) {
                if (response.data) {
                    pmsConfMaintItemVM.ItemList = response.data;
                }
            }, function (err) {
                console.log(err);
            });
    }    

    function ShowMaintItemCreateView(maintItemUID) {
        $('#ID_PMS_ConfMaintItemCreateModal').modal();
                                            
        LoadMachineTypeList();        
        LoadItemLevelList();
        LoadTBMCheckUnitList();
        LoadCBMCheckUnitList();

        if (maintItemUID != -1) {
            /*  XXX Load MaintItemInfo & fill view */
        }        
    }       

    function CloseMaintItemCreateView() {
        $('#ID_PMS_ConfMaintItemCreateModal').modal('toggle');
    }
        
    function ShowItemActionListView() {
        $('#ID_PMS_ConfMaintItemActionModal').modal();
    }

    function CloseItemActionListView() {
        $('#ID_PMS_ConfMaintItemActionModal').modal('toggle');
    }

    function SaveMaintItem() {
        
        /* XXX verify UI data */
              
        $http.post('/pms/createMaintItem', {
            params: {
                Code : $('#ID_PMS_ConfMaintItemCode').val(),
                Title : $('#ID_PMS_ConfMaintItemTitle').val(),
                Content : $('#ID_PMS_ConfMaintItemContent').val(),
                DeviceType : pmsConfMaintItemVM.mSelectedDeviceType.UID,
                CreateDate : Date.now(),
                CheckType : pmsConfMaintItemVM.mSelectedItemCheckType,
                TBMCheckUnit : pmsConfMaintItemVM.mSelectedTBMCheckUnit.UID,
                TBMCheckValue : pmsConfMaintItemVM.mSelectedTBMCheckValue.Value,
                CBMCheckUnit : pmsConfMaintItemVM.mSelectedCBMCheckUnit.UID,
                CBMCheckLimitValue : $('#ID_PMS_ConfMaintItemCBMLimitValue').val(),
                CBMCheckWarnLimitValue : $('#ID_PMS_ConfMaintItemCBMWarnLimitValue').val(),
                Type : pmsConfMaintItemVM.mSelectedItemType,
                Level : pmsConfMaintItemVM.mSelectedItemLevel.UID
            }
        }).then(function (response) {
            CloseMaintItemCreateView();
            loadMaintItemList();

        }, function (err) {
            console.log(err);
        });                   
    }
    
    function OnChangeMachineTypeList() {
        LoadModuleTypeList();        
    }
    
    function OnChangeModuleTypeList() {
        LoadDeviceTypeList();
    }
    
    function OnSelectTBMOption() {
        pmsConfMaintItemVM.mSelectedItemCheckType = 0;

        $('#ID_PMS_ConfMaintItemCBMOption').prop("checked", false);
    }

    function OnSelectCBMOption() {
        pmsConfMaintItemVM.mSelectedItemCheckType = 1;

        $('#ID_PMS_ConfMaintItemTBMOption').prop("checked", false);
    }
    
    function OnChangeTBMCheckUnit() {
        
        pmsConfMaintItemVM.TBMCheckValueList = [];
        
        if (pmsConfMaintItemVM.mSelectedTBMCheckUnit.UID == 1) {
            $('#ID_PMS_ConfMaintItemTBMCheckValue').prop('disabled', true);
        }
        else if (pmsConfMaintItemVM.mSelectedTBMCheckUnit.UID == 2) {
            
            $('#ID_PMS_ConfMaintItemTBMCheckValue').prop('disabled', false);
           
            pmsConfMaintItemVM.TBMCheckValueList.push({
                Value : 1, 
                Name : "월",
            });
            pmsConfMaintItemVM.TBMCheckValueList.push({
                Value : 2, 
                Name : "화",
            });
            pmsConfMaintItemVM.TBMCheckValueList.push({
                Value : 3, 
                Name : "수",
            });
            pmsConfMaintItemVM.TBMCheckValueList.push({
                Value : 4, 
                Name : "목",
            });
            pmsConfMaintItemVM.TBMCheckValueList.push({
                Value : 5, 
                Name : "금",
            });
            pmsConfMaintItemVM.TBMCheckValueList.push({
                Value : 6, 
                Name : "토",
            });
            pmsConfMaintItemVM.TBMCheckValueList.push({
                Value : 7, 
                Name : "일",
            });

            pmsConfMaintItemVM.mSelectedTBMCheckValue = pmsConfMaintItemVM.TBMCheckValueList[0];
                
        }
        else if (pmsConfMaintItemVM.mSelectedTBMCheckUnit.UID == 3) {
            
            $('#ID_PMS_ConfMaintItemTBMCheckValue').prop('disabled', false);
            
            for (var i = 1; i <= 31 ; i++) {
                pmsConfMaintItemVM.TBMCheckValueList.push({
                    Value : i,                     
                    Name : i,
            
                });
            }

            pmsConfMaintItemVM.mSelectedTBMCheckValue = pmsConfMaintItemVM.TBMCheckValueList[0];
        }
    }
    
    function OnSelectItemTypeCheck() {
        
        pmsConfMaintItemVM.mSelectedItemType = 0;
        
        $('#ID_PMS_ConfMaintItemTypeAction').prop("checked", false);
    }
    
    function OnSelectItemTypeAction() {

        pmsConfMaintItemVM.mSelectedItemCheckType = 1;
        
        $('#ID_PMS_ConfMaintItemTypeCheck').prop("checked", false);                
    }

    
    /* Internal functions *******************************************/
    function LoadMachineTypeList() {
        $http.get('/pms/getMachineTypeList')
        .then(function (response) {
            if (response.data) {
                pmsConfMaintItemVM.MachineTypeList = response.data;
                pmsConfMaintItemVM.mSelectedMachineType = pmsConfMaintItemVM.MachineTypeList[0];

                LoadModuleTypeList(pmsConfMaintItemVM.mSelectedMachineType);
            }
        }, function (err) {
            console.log(err);
        });        
    }

    function LoadModuleTypeList() {
        
        pmsConfMaintItemVM.ModuleTypeList = [];

        if (pmsConfMaintItemVM.mSelectedMachineType == null) {        
            return;    
        }

        $http.get('/pms/getModuleTypeList', {
            params: {
                MachineType: pmsConfMaintItemVM.mSelectedMachineType.UID 
            }                                             
        }).then(function (response) {
            if (response.data) {
                pmsConfMaintItemVM.ModuleTypeList = response.data;
                pmsConfMaintItemVM.mSelectedModuleType = pmsConfMaintItemVM.ModuleTypeList[0];

                LoadDeviceTypeList();
            }
        }, function (err) {
            console.log(err);
        });
                        
    }

    function LoadDeviceTypeList() {
        
        pmsConfMaintItemVM.DeviceTypeList = [];
        
        if (pmsConfMaintItemVM.mSelectedMachineType == null
                || pmsConfMaintItemVM.mSelectedModuleType == null) {
            return;
        }        

        $http.get('/pms/getDeviceTypeList', {
            params: {
                MachineType: pmsConfMaintItemVM.mSelectedMachineType.UID,
                ModuleType: pmsConfMaintItemVM.mSelectedModuleType.UID
            }
        }).then(function (response) {
            if (response.data) {
                pmsConfMaintItemVM.DeviceTypeList = response.data;
                pmsConfMaintItemVM.mSelectedDeviceType = pmsConfMaintItemVM.DeviceTypeList[0];
            }
        }, function (err) {
            console.log(err);
        });                
    }
    
    function LoadItemLevelList() {
        $http.get('/pms/getMaintItemLevelList')
        .then(function (response) {
            if (response.data) {
                pmsConfMaintItemVM.ItemLevelList = response.data;
                pmsConfMaintItemVM.mSelectedItemLevel = pmsConfMaintItemVM.ItemLevelList[0];                
            }
        }, function (err) {
            console.log(err);
        });
    }
    
    function LoadTBMCheckUnitList() {
        $http.get('/pms/getTBMCheckUnitList')
        .then(function (response) {
            if (response.data) {
                pmsConfMaintItemVM.TBMCheckUnitList = response.data;
                pmsConfMaintItemVM.mSelectedTBMCheckUnit = pmsConfMaintItemVM.TBMCheckUnitList[0];
            }
        }, function (err) {
            console.log(err);
        });
    }
    
    function LoadCBMCheckUnitList() {
        $http.get('/pms/getCBMCheckUnitList')
        .then(function (response) {
            if (response.data) {
                pmsConfMaintItemVM.CBMCheckUnitList = response.data;
                pmsConfMaintItemVM.mSelectedCBMCheckUnit = pmsConfMaintItemVM.CBMCheckUnitList[0];
            }
        }, function (err) {
            console.log(err);
        });
    }
}

