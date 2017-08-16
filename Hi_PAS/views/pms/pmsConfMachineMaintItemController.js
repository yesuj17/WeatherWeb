angular.module('pmsConfMachineMaintItemApp', [])
    .controller('PMSConfMachineMaintItemController', ['$scope', '$http', PMSConfMachineMaintItemController]);

function PMSConfMachineMaintItemController($scope, $http) {
    var pmsConfMachineMaintItemVM = this;

    pmsConfMachineMaintItemVM.selectedMachineType = -1;
    pmsConfMachineMaintItemVM.selectedMachineID = -1;

    pmsConfMachineMaintItemVM.SCMachineList = [];
    pmsConfMachineMaintItemVM.MachineItemList = [];
    pmsConfMachineMaintItemVM.ModalMachineItemList = [];
    pmsConfMachineMaintItemVM.ModalMaintItemList = [];
    
    pmsConfMachineMaintItemVM.LoadMachineItemList = LoadMachineItemList;
    pmsConfMachineMaintItemVM.ShowMaintItemManageView = ShowMaintItemManageView;
    pmsConfMachineMaintItemVM.CloseMaintItemManageView = CloseMaintItemManageView;
    pmsConfMachineMaintItemVM.RemoveMachineMaintItem = RemoveMachineMaintItem;
    pmsConfMachineMaintItemVM.SaveMachineMaintItem = SaveMachineMaintItem;      
    pmsConfMachineMaintItemVM.AddMaintItemtoMachine = AddMaintItemtoMachine;      
    
    
    $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
        if (e.target.hash === "#ID_PMS_MenuConfigSubMachineMaintItem") {
            initializeControl();
        }
    });
    
    function LoadMachineItemList(machineType, machineID) {

        pmsConfMachineMaintItemVM.selectedMachineType = machineType;
        pmsConfMachineMaintItemVM.selectedMachineID = machineID;

        $http.get('/pms/getMachineMaintItemList', {
            params: {
                MachineType: machineType,
                MachineID: machineID
            }
        }).then(function (response) {
            if (response.data) {
                pmsConfMachineMaintItemVM.MachineItemList = response.data;                                
                pmsConfMachineMaintItemVM.ModalMachineItemList = angular.copy(response.data);                                
            }
        }, function (err) {
            console.log(err);
        });          
    } 

    function ShowMaintItemManageView() {
        $('#ID_PMS_MachineMaintItemManageModal').modal();
        loadModalMaintItemList();                

        pmsConfMachineMaintItemVM.ModalMachineItemList
            = angular.copy(pmsConfMachineMaintItemVM.MachineItemList);                                
    }

    function CloseMaintItemManageView() {
        $('#ID_PMS_MachineMaintItemManageModal').modal('toggle');        
    }    

    function SaveMachineMaintItem() {  

        /* If there are new item, add to machine item list */
        var addMaintItemIDList = [];

        for (var i = 0; i < pmsConfMachineMaintItemVM.ModalMachineItemList.length; i++) {            
            if (pmsConfMachineMaintItemVM.ModalMachineItemList[i].UID == -1) {
                addMaintItemIDList.push({
                    ID: pmsConfMachineMaintItemVM.ModalMachineItemList[i].MachineItemUID
                });
            }            
        } 

        if (addMaintItemIDList.length > 0) {
            $http.post('/pms/addMachineMaintItem', {
                params: {
                    MachineType: pmsConfMachineMaintItemVM.selectedMachineType,
                    MachineID: pmsConfMachineMaintItemVM.selectedMachineID,
                    MaintItemIDList : addMaintItemIDList
                }
            }).then(function (response) {

                /* refresh */
                LoadMachineItemList(pmsConfMachineMaintItemVM.selectedMachineType,
                    pmsConfMachineMaintItemVM.selectedMachineID);

            }, function (err) {
                console.log(err);
            });   
        }  

        /* Compare with original and make remove machine item ID List */        
        var removeMachineItemIDList = [];
        for (var i = 0; i < pmsConfMachineMaintItemVM.MachineItemList.length; i++) {

            if (ExistInModalMachineItemList(pmsConfMachineMaintItemVM.MachineItemList[i].UID) == false) {
                removeMachineItemIDList.push({
                    ID: pmsConfMachineMaintItemVM.MachineItemList[i].UID
                });
            }
        }

        if (removeMachineItemIDList.length > 0) {
            $http.post('/pms/removeMachineMaintItem', {
                params: {
                    MachineType: pmsConfMachineMaintItemVM.selectedMachineType,
                    MachineID: pmsConfMachineMaintItemVM.selectedMachineID,
                    MaintItemIDList: removeMachineItemIDList
                }
            }).then(function (response) {
        
                /* refresh */
                LoadMachineItemList(pmsConfMachineMaintItemVM.selectedMachineType,
                    pmsConfMachineMaintItemVM.selectedMachineID);
                
            }, function (err) {
                console.log(err);
            });             
        }
        
        CloseMaintItemManageView();           
    }

    function AddMaintItemtoMachine() {
        
        for (var i = 0; i < pmsConfMachineMaintItemVM.ModalMaintItemList.length; i++) {
            var res = $('#ID_PMS_MaintItemCheckUID-' + pmsConfMachineMaintItemVM.ModalMaintItemList[i].UID).prop('checked');
            if (res == true) {
                pmsConfMachineMaintItemVM.ModalMachineItemList.push(
                    {
                        UID: -1,
                        MachineItemUID: pmsConfMachineMaintItemVM.ModalMaintItemList[i].UID,
                        Code: pmsConfMachineMaintItemVM.ModalMaintItemList[i].Code,
                        Level: pmsConfMachineMaintItemVM.ModalMaintItemList[i].Level,
                        Title: pmsConfMachineMaintItemVM.ModalMaintItemList[i].Title,
                    });

                $('#ID_PMS_MaintItemCheckUID-' + pmsConfMachineMaintItemVM.ModalMaintItemList[i].UID).prop('checked', false);
                pmsConfMachineMaintItemVM.ModalMaintItemList[i].isExistinMachineItem = true;
            }         
        }
    }
    
    function RemoveMachineMaintItem() {        

        var updated = false;

        for (var i = pmsConfMachineMaintItemVM.ModalMachineItemList.length - 1; i >= 0; i--) {
            var res = $('#ID_PMS_ModalMachineMaintItemCheckUID-' + pmsConfMachineMaintItemVM.ModalMachineItemList[i].UID).prop('checked');
            if (res == true) {                
                /* Restore Maint Item Status */
                for (var j = 0; j < pmsConfMachineMaintItemVM.ModalMaintItemList.length; j++) {
                    if (pmsConfMachineMaintItemVM.ModalMaintItemList[j].UID
                        == pmsConfMachineMaintItemVM.ModalMachineItemList[i].MaintItemUID) {
                        pmsConfMachineMaintItemVM.ModalMaintItemList[j].isExistinMachineItem = false;
                    }
                }

                pmsConfMachineMaintItemVM.ModalMachineItemList.splice(i, 1);                
            }
        }         

        if (updated == true) {
            $scope.$apply(pmsConfMachineMaintItemVM.ModalMaintItemList);
        }
    }    

    /* Internal functions *********************************************/
    function initializeControl() {

        loadSCMachineList();
    }    

    function loadSCMachineList() {
        $http.get('/MA/getMachineInfoList')
        .then(function (response) {
            if (response.data) {
                pmsConfMachineMaintItemVM.SCMachineList = response.data;                
                
                // Support SC only 
                LoadMachineItemList(1, pmsConfMachineMaintItemVM.SCMachineList[0].ID);
            }
        }, function (err) {
            console.log(err);
        });
    }

    function ExistInMachineItemList(maintItemUID) {

        for (var i = 0; i < pmsConfMachineMaintItemVM.MachineItemList.length; i++) {            
            if (pmsConfMachineMaintItemVM.MachineItemList[i].MaintItemUID === maintItemUID) {
                return true;
            }
        }

        return false;
    }

    function ExistInModalMachineItemList(machineItemUID) {
        
        for (var i = 0; i < pmsConfMachineMaintItemVM.ModalMachineItemList.length; i++) {            
            if (pmsConfMachineMaintItemVM.ModalMachineItemList[i].UID === machineItemUID) {
                return true;
            }
        }

        return false;
    }

    function loadModalMaintItemList() {

        pmsConfMachineMaintItemVM.ModalMaintItemList = [];

        $http.get('/pms/getMaintItemList')
            .then(function (response) {
                if (response.data) {
                    var maintItems = response.data;
                    for (var i = 0; i < maintItems.length; i++) {                        
                        if (ExistInMachineItemList(maintItems[i].UID)) {
                            maintItems[i]['isExistinMachineItem'] = true;
                        }
                        else {
                            maintItems[i]['isExistinMachineItem'] = false;
                        }
                        pmsConfMachineMaintItemVM.ModalMaintItemList.push(maintItems[i]);                        
                    }                    
                }
            }, function (err) {
                console.log(err);
            });
    }
}
