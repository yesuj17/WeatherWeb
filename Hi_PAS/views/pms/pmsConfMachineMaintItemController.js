angular.module('pmsConfMachineMaintItemApp', [])
    .controller('PMSConfMachineMaintItemController', ['$scope', '$http', PMSConfMachineMaintItemController]);

function PMSConfMachineMaintItemController($scope, $http) {
    var pmsConfMachineMaintItemVM = this;
    pmsConfMachineMaintItemVM.ID_PMS_facility;
    pmsConfMachineMaintItemVM.ID_PMS_BarCode;
    pmsConfMachineMaintItemVM.ficility = [];
    pmsConfMachineMaintItemVM.checkList = [];
    pmsConfMachineMaintItemVM.motherList = [];
    pmsConfMachineMaintItemVM.selectedmotherList = [];
    pmsConfMachineMaintItemVM.modalclose = modalclose;
    pmsConfMachineMaintItemVM.facilitycreate = facilitycreate;
    pmsConfMachineMaintItemVM.getAllfacility = getAllfacility;
    pmsConfMachineMaintItemVM.clickedfacilityNum = clickedfacilityNum;
    pmsConfMachineMaintItemVM.checklistmodalclose = checklistmodalclose;
    pmsConfMachineMaintItemVM.getFacilityMotherData = getFacilityMotherData;
    pmsConfMachineMaintItemVM.onMotheroneDataLoad = onMotheroneDataLoad;
    pmsConfMachineMaintItemVM.createcheckList = createcheckList;
    pmsConfMachineMaintItemVM.moveCheckList = moveCheckList;
    function facilitycreate() {
        console.log('facilitycreate');
        $http.post('/pms/createfacility', {
            FacilityId: pmsConfMachineMaintItemVM.ID_PMS_facility, //코드는 변경 안됨.
            BarCode: pmsConfMachineMaintItemVM.ID_PMS_BarCode,
        })
            .success(function () {
                var message_createsuccess = pmsConfMachineMaintItemVM.ID_PMS_facility;
                message_createsuccess += '생성 완료';
                alert(message_createsuccess);
                modalclose();
            })
            .error(function (data) {
                if (data.error == 'duplicate') {
                    onValidateDuplicate(false);
                }
            });
    }
    function getAllfacility() {
        function callback(err, temp) {
            if (err) {
                console.log(err);
            }
            else {
                console.log(temp);
            }
        }
        console.log("getallfacility");
        $http.get("/pms/getallfacility").success(function (res) {
            callback(null, res);
            pmsConfMachineMaintItemVM.ficility = res;
        }, function (err) {
            console.log(err);
        });
    }

    function getFacilityMotherData() {
        $http.get("/pms/displaymothertable").success(function (res) {
            console.log('res', res);
            for (var i = 0; pmsConfMachineMaintItemVM.motherList.length; i++)
                pmsConfMachineMaintItemVM.motherList.pop();
            for (var i = 0; i < res.length; i++) {
                if (distinguishLargecategory(pmsConfMachineMaintItemVM.ID_PMS_facility, res[i].LargeCategory) == 0)
                    pmsConfMachineMaintItemVM.motherList.push(res[i]);
            }
            if (pmsConfMachineMaintItemVM.motherList.length == 0) {
                alert('설비를 선택하지 않았거나 해당 설비의 모수 List가 없습니다. Tree에서 설비를 선택해주세요.');// string 으로 변환 
                checklistmodalclose();
            }
        }, function (err) {
            console.log(err);
        });
    }

    function moveCheckList() {
        //초기화 
        for (var i = 0; pmsConfMachineMaintItemVM.selectedmotherList.length; i++)
            pmsConfMachineMaintItemVM.selectedmotherList.pop();

        //체크된 항목 저장.
        for (var move_i = 0; move_i < pmsConfMachineMaintItemVM.motherList.length; move_i++) {
            var access = 'PMS_ID_'+pmsConfMachineMaintItemVM.motherList[move_i].Code +'_'+ move_i;
         
            if (document.getElementById(access).checked == true) {
                console.log(access, '선택됨');
                pmsConfMachineMaintItemVM.selectedmotherList.push(pmsConfMachineMaintItemVM.motherList[move_i]);
            }
        }
        console.log(pmsConfMachineMaintItemVM.selectedmotherList);
    }
    function modalclose() {
        $("#pmsfacilitydetail").modal('toggle');
    }
    function clickedfacilityNum(num) {
        //클릭되면 num과 동일한 설비 번호를 가진 항목을 점검 List에서 가지고 온다. 
        console.log(num);
        pmsConfMachineMaintItemVM.ID_PMS_facility = num;
        // var subid = num + 'sub';
        // document.getElementById(num).href = subid;
        //document.getElementById(num).dataTarget = subid;
        //  return subid;
    }

    function checklistmodalclose() {
        $("#ID_PMS_PmscheckList").modal('toggle');
    }
    function distinguishLargecategory(facilityid, Largecategory) {
        var pmstemp = Largecategory;
        facilityid += '';
        return facilityid.indexOf(pmstemp);
    }
    function applymotherListTocheckList() {

    }
    function onMotheroneDataLoad(Code) {
        getMotheroneData($http, getdata, Code);//1
        function getdata(err, temp) {
            if (err) {
                console.log(err);
            }
            else {
                console.log(temp);
            }
        }
    }
    function getMotheroneData($http, callback, Code) {
        var url = "/pms/onemother?Code=" + Code;
        $http.get(url).success(function (res) {
            inputmotherdata(res);
        }, function (err) {
            console.log(err);
        });
    }

    function createcheckList() {
        console.log('checklistcreate', pmsConfMachineMaintItemVM.motherList);
        $http.post('/pms/createchecklist', {
            arr: pmsConfMachineMaintItemVM.createcheckList,
            Facilityid: pmsConfMachineMaintItemVM.ID_PMS_facility,
        })
            .success(function () {
                var message_createsuccess = pmsConfMachineMaintItemVM.ID_PMS_facility;
                message_createsuccess += '생성 완료';
                alert(message_createsuccess);

                getFacilityCheckData();
            })
            .error(function (data) {
                if (data.error == 'duplicate') {
                    onValidateDuplicate(false);
                }
            });
    }

    function getFacilityCheckData() {
        $http.get("/pms/getFacilityCheckData").success(function (res) {
            console.log('res', res);
            pmsConfMachineMaintItemVM.checkList = res;
        }, function (err) {
            console.log(err);
        });
    }
    getAllfacility();// DB의 설비 정보를 읽어들인다. 

}
