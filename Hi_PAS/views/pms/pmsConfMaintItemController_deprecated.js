angular.module('pmsConfMaintItemApp', [])
    .controller('PMSConfMaintItemController', ['$scope', '$http', PMSConfMaintItemController]);

function PMSConfMaintItemController($scope, $http) {
    var pmsConfMaintItemVM = this;

    console.log(Date());
    // var pmsConfMaintItemVM = this;
    $scope.mothersRow = [];
    pmsConfMaintItemVM.mothersRow = $scope.mothersRow;
    pmsConfMaintItemVM.onMotherDataLoad = onMotherDataLoad;//top, grid 에서 쓰임 
    pmsConfMaintItemVM.distinguishTimeGroup = distinguishTimeGroup;//grid에서 쓰임 
    pmsConfMaintItemVM.radiochange = radiochange;
    pmsConfMaintItemVM.schuduleradiochange = schuduleradiochange;
    pmsConfMaintItemVM.timeradiochange = timeradiochange;
    pmsConfMaintItemVM.motherupdate = motherupdate;
    pmsConfMaintItemVM.initmotherdata = initmotherdata;
    pmsConfMaintItemVM.modalclose = modalclose;
    pmsConfMaintItemVM.newbutton = newbutton;
    pmsConfMaintItemVM.updatebutton = updatebutton;
    pmsConfMaintItemVM.modalclose = modalclose;
    pmsConfMaintItemVM.onMotheroneDataLoad = onMotheroneDataLoad;
    pmsConfMaintItemVM.mothercreate = mothercreate;
    pmsConfMaintItemVM.motherdelete = motherdelete;
    pmsConfMaintItemVM.ID_PMS_input_largecatagory = [
        { category: "SC" },
        { category: "AGV" },
        { category: "Conveyor" }];
    pmsConfMaintItemVM.ID_PMS_input_MediumCategory = [
        { category: "주행부" },
        { category: "모터" },
        { category: "나머지" }];
    pmsConfMaintItemVM.ID_PMS_input_SmallCategory = [
        { category: "볼트1" },
        { category: "센서1" },
        { category: "기름칠" }];
    pmsConfMaintItemVM.ID_PMS_input_level = [
        { grade: "1" },
        { grade: "2" },
        { grade: "3" },
        { grade: "4" },
        { grade: "5" },
        { grade: "Userdefine" }];
    pmsConfMaintItemVM.ID_PMS_input_type;
    pmsConfMaintItemVM.ID_PMS_input_timegroup;
    pmsConfMaintItemVM.ID_PMS_input_timeunit;
    pmsConfMaintItemVM.ID_PMS_input_distanceunit;
    pmsConfMaintItemVM.ID_PMS_input_timevalue;
    pmsConfMaintItemVM.ID_PMS_input_distancevalue;
    pmsConfMaintItemVM.ID_PMS_input_checktype;
    pmsConfMaintItemVM.timevalueinit;
    pmsConfMaintItemVM.weekvalueinit;
    pmsConfMaintItemVM.dayvalueinit;
    pmsConfMaintItemVM.monthvalueinit;
    pmsConfMaintItemVM.yearvalueinit;
    pmsConfMaintItemVM.distanceunitinit;
    pmsConfMaintItemVM.distancevalue;
    pmsConfMaintItemVM.distanceunitinit_warring;
    pmsConfMaintItemVM.distancevalue_warring;
    pmsConfMaintItemVM.radiochecktype = {
        check: '점검',
        action: '조치'
    };
    pmsConfMaintItemVM.radioschduletype = {
        time: '시간',
        distance: '거리'
    };
    pmsConfMaintItemVM.radiotimetype = {
        hour: '시간',
        day: '일',
        week: '주',
        month: '달',
        year: '년',
        custom: 'custom'
    };
    pmsConfMaintItemVM.timevalue = [
        { timevalue: "00:00" }, { timevalue: "01:00" }, { timevalue: "02:00" }, { timevalue: "03:00" }, { timevalue: "04:00" }, { timevalue: "05:00" },
        { timevalue: "06:00" }, { timevalue: "07:00" }, { timevalue: "08:00" }, { timevalue: "09:00" }, { timevalue: "10:00" }, { timevalue: "11:00" },
        { timevalue: "12:00" }, { timevalue: "13:00" }, { timevalue: "14:00" }, { timevalue: "15:00" }, { timevalue: "16:00" }, { timevalue: "17:00" },
        { timevalue: "18:00" }, { timevalue: "19:00" }, { timevalue: "20:00" }, { timevalue: "21:00" }, { timevalue: "22:00" }, { timevalue: "23:00" },
        { timevalue: "24:00" }];
    pmsConfMaintItemVM.weekvalue = [
        { timevalue: "월요일" }, { timevalue: "화요일" }, { timevalue: "수요일" }, { timevalue: "목요일" }, { timevalue: "금요일" }, { timevalue: "토요일" },
        { timevalue: "일요일" }];
    pmsConfMaintItemVM.dayvalue = [
        { timevalue: "1일" }, { timevalue: "2일" }, { timevalue: "3일" }, { timevalue: "4일" }, { timevalue: "5일" }, { timevalue: "6일" },
        { timevalue: "7일" }, { timevalue: "8일" }, { timevalue: "9일" }, { timevalue: "10일" }, { timevalue: "11일" }, { timevalue: "12일" },
        { timevalue: "13일" }, { timevalue: "14일" }, { timevalue: "15일" }, { timevalue: "16일" }, { timevalue: "17일" }, { timevalue: "18일" },
        { timevalue: "19일" }, { timevalue: "20일" }, { timevalue: "21일" }, { timevalue: "22일" }, { timevalue: "23일" }, { timevalue: "24일" },
        { timevalue: "25일" }, { timevalue: "26일" }, { timevalue: "27일" }, { timevalue: "28일" }, { timevalue: "29일" }, { timevalue: "30일" }];
    pmsConfMaintItemVM.monthvalue = [
        { timevalue: "1월" }, { timevalue: "2월" }, { timevalue: "3월" }, { timevalue: "4월" }, { timevalue: "5월" }, { timevalue: "6월" },
        { timevalue: "7월" }, { timevalue: "8월" }, { timevalue: "9월" }, { timevalue: "10월" }, { timevalue: "11월" }, { timevalue: "12월" },];
    pmsConfMaintItemVM.yearvalue = [
        { timevalue: "1년" }, { timevalue: "2년" }, { timevalue: "3년" }, { timevalue: "4년" }, { timevalue: "5년" }];
    pmsConfMaintItemVM.distanceunit = [
        { distanceunit: "Km" }, { distanceunit: "m" }, { distanceunit: "cm" }, { distanceunit: "mm" }, { distanceunit: "inch" }, { distanceunit: "회" }];
    pmsConfMaintItemVM.distanceunit_warring = [
        { distanceunit: "Km" }, { distanceunit: "m" }, { distanceunit: "cm" }, { distanceunit: "mm" }, { distanceunit: "inch" }, { distanceunit: "회" }];

    function onMotherDataLoad() {
        console.log("onMotherDataLoad호출");
        getMotherallData($http, getdata);//1
        function getdata(err, temp) {
            if (err) {
                console.log(err);
            }
            else {
                console.log(temp);
            }
        }
    }
    console.log("newobject", newobject);
    var newobject;
    newCode();// 실행될때 DB 정보로 new code 생성. new 버튼 누르면 비동기 처리 후 사용. 
    console.log("newobject", newobject);
    $scope.file_changed = function (element) {
        $scope.$apply(function (scope) {
            var photofile = element.files[0];
            var fd = new FormData();
            fd.append('ExcelFile', photofile);

            $http.post('/pms/createmother', fd, {
                transformRequest: angular.identity,
                headers: { 'Content-Type': undefined }
            })
                .success(function () {
                    alert("Excel Import 성공");
                    onMotherDataLoad();
                })
                .error(function () {
                    alert("Excel Import 실패");
                });
        });
    };
    function getMotherallData($http, callback) {
        //2
        $http.get("/pms/displaymothertable").success(function (res) {
            callback(null, res);
            $scope.mothersRow = res;
        }, function (err) {
            console.log(err);
        });
    }
    function onMotheroneDataLoad(Code) {
        console.log("Code:", Code);
        getMotheroneData($http, getdata, Code);//1
        function getdata(err, temp) {
            console.log("2");
            if (err) {
                console.log(err);
            }
            else {
                console.log(temp);
            }
        }
    }
    function getMotheroneData($http, callback, Code) {
        //2
        var url = "/pms/onemother?Code=" + Code;
        //  var url = "/pms/onemother/" 
        console.log("호출url: ", url);
        $http.get(url).success(function (res) {
            console.log("호출결과", res);
            inputmotherdata(res);
            console.log(pmsConfMaintItemVM.ID_PMS_input_checkname);

        }, function (err) {
            console.log(err);
        });
    }
    function distinguishTimeGroup(Code) {
        var result = 'nothing';
        var newList;
        for (var i = 0; i < $scope.mothersRow.length; i++) {
            if ($scope.mothersRow[i].Code == Code) {
                if ($scope.mothersRow[i].TimeGroup == '시간') {
                    result = '시간 / ' + $scope.mothersRow[i].TimeBaseValue + ' 마다';
                } else {
                    result = '거리 / ' + $scope.mothersRow[i].nonTimeBaseMainValue + $scope.mothersRow[i].nonTimeBaseMainUnit;
                }
            }
        }
        return result;
    }
    function initmotherdata() {

        newbutton();
        //onlymotherview(true);
        document.getElementById('pmscheck').disabled = false;
        document.getElementById('pmsaction').disabled = false;
        console.log("newobject", newobject);
        pmsConfMaintItemVM.ID_PMS_input_checktype = '점검';
        if (pmsConfMaintItemVM.ID_PMS_input_checktype == '점검')
            pmsConfMaintItemVM.ID_PMS_input_code = newobject.check;
        else if (pmsConfMaintItemVM.ID_PMS_input_checktype == '조치')
            pmsConfMaintItemVM.ID_PMS_input_code = newobject.action;
        //newCode().check;
        pmsConfMaintItemVM.ID_PMS_input_checkname = "점검이름";
        pmsConfMaintItemVM.pmslargecategory = pmsConfMaintItemVM.ID_PMS_input_largecatagory[0];/*초기 값으로 db data를 넣는다.*/
        pmsConfMaintItemVM.pmsMediumCategory = pmsConfMaintItemVM.ID_PMS_input_MediumCategory[0];/*초기 값으로 db data를 넣는다.*/
        pmsConfMaintItemVM.pmsSmallCategory = pmsConfMaintItemVM.ID_PMS_input_SmallCategory[0];/*초기 값으로 db data를 넣는다.*/
        pmsConfMaintItemVM.pmslevel = pmsConfMaintItemVM.ID_PMS_input_level[0];/*초기 값으로 db data를 넣는다.*/
        pmsConfMaintItemVM.ID_PMS_input_content = "점검내용을 입력해 주세요.";
        pmsConfMaintItemVM.radiocheck = pmsConfMaintItemVM.radiochecktype.check;/*초기 값으로 db data를 넣는다.*/
        pmsConfMaintItemVM.radioschedule = pmsConfMaintItemVM.radioschduletype.time;
        usetimebaseinput();
        pmsConfMaintItemVM.radiotime = pmsConfMaintItemVM.radiotimetype.hour;
        pmsConfMaintItemVM.timevalueinit = pmsConfMaintItemVM.timevalue[0];
        pmsConfMaintItemVM.weekvalueinit = pmsConfMaintItemVM.weekvalue[0];
        pmsConfMaintItemVM.dayvalueinit = pmsConfMaintItemVM.dayvalue[21];
        pmsConfMaintItemVM.monthvalueinit = pmsConfMaintItemVM.monthvalue[6];
        pmsConfMaintItemVM.yearvalueinit = pmsConfMaintItemVM.yearvalue[0];
        pmsConfMaintItemVM.distanceunitinit = pmsConfMaintItemVM.distanceunit[0];
        pmsConfMaintItemVM.distancevalue = "100";
        pmsConfMaintItemVM.distanceunitinit_warring = pmsConfMaintItemVM.distanceunit_warring[0];
        pmsConfMaintItemVM.distancevalue_warring = "70";
    }
    function inputmotherdata(resResult) {
        console.log('실행!!!!');
        updatebutton();
        pmsConfMaintItemVM.ID_PMS_input_checktype = resResult.Type;
        pmsConfMaintItemVM.ID_PMS_input_code = resResult.Code;
        pmsConfMaintItemVM.ID_PMS_input_checkname = resResult.Title;

        for (var i = 0; i < pmsConfMaintItemVM.ID_PMS_input_largecatagory.length; i++) {// index value를 따로 둬도 될듯. 시간나면 개선건. 
            if (resResult.LargeCategory == pmsConfMaintItemVM.ID_PMS_input_largecatagory[i].category)
                break;
        }
        pmsConfMaintItemVM.pmslargecategory = pmsConfMaintItemVM.ID_PMS_input_largecatagory[i];/*동일한 data를 찾아 넣음.*/


        for (var i = 0; i < pmsConfMaintItemVM.ID_PMS_input_MediumCategory.length; i++) {// index value를 따로 둬도 될듯. 시간나면 개선건. 
            if (resResult.MediumCategory == pmsConfMaintItemVM.ID_PMS_input_MediumCategory[i].category)
                break;
        }
        pmsConfMaintItemVM.pmsMediumCategory = pmsConfMaintItemVM.ID_PMS_input_MediumCategory[i];


        for (var i = 0; i < pmsConfMaintItemVM.ID_PMS_input_SmallCategory.length; i++) {// index value를 따로 둬도 될듯. 시간나면 개선건. 
            if (resResult.SmallCategory == pmsConfMaintItemVM.ID_PMS_input_SmallCategory[i].category)
                break;
        }
        pmsConfMaintItemVM.pmsSmallCategory = pmsConfMaintItemVM.ID_PMS_input_SmallCategory[i];



        pmsConfMaintItemVM.pmslevel = pmsConfMaintItemVM.ID_PMS_input_level[resResult.Level - 1];/*level 은 숫자라 그대로 넣음. */
        pmsConfMaintItemVM.ID_PMS_input_content = resResult.Content;


        if (resResult.Type == pmsConfMaintItemVM.radiochecktype.check)
            pmsConfMaintItemVM.radiocheck = pmsConfMaintItemVM.radiochecktype.check;
        else if (resResult.Type == pmsConfMaintItemVM.radiochecktype.action)
            pmsConfMaintItemVM.radiocheck = pmsConfMaintItemVM.radiochecktype.action;

        document.getElementById('pmscheck').disabled = true;
        document.getElementById('pmsaction').disabled = true;


        if (resResult.TimeGroup == pmsConfMaintItemVM.radioschduletype.time) {
            pmsConfMaintItemVM.radioschedule = pmsConfMaintItemVM.radioschduletype.time;
            usetimebaseinput();
        }
        else if (resResult.TimeGroup == pmsConfMaintItemVM.radioschduletype.distance) {
            pmsConfMaintItemVM.radioschedule = pmsConfMaintItemVM.radioschduletype.distance;
            usedistanceinput();
        }

        if (resResult.TimeBaseUnit == pmsConfMaintItemVM.radiotimetype.hour) {
            pmsConfMaintItemVM.radiotime = pmsConfMaintItemVM.radiotimetype.hour;
            usetimebase_nothing();
            console.log('1 ', resResult.TimeBaseUnit);
        }
        else if (resResult.TimeBaseUnit == pmsConfMaintItemVM.radiotimetype.day) {
            pmsConfMaintItemVM.radiotime = pmsConfMaintItemVM.radiotimetype.day;
            usetimebase_hour();
            console.log('2 ', resResult.TimeBaseUnit);
        }
        else if (resResult.TimeBaseUnit == pmsConfMaintItemVM.radiotimetype.week) {
            pmsConfMaintItemVM.radiotime = pmsConfMaintItemVM.radiotimetype.week;
            usetimebase_day();
            console.log('3 ', resResult.TimeBaseUnit);
        }
        else if (resResult.TimeBaseUnit == pmsConfMaintItemVM.radiotimetype.month) {
            pmsConfMaintItemVM.radiotime = pmsConfMaintItemVM.radiotimetype.month;
            usetimebase_week();
            console.log('4 ', resResult.TimeBaseUnit);
        }
        else if (resResult.TimeBaseUnit == pmsConfMaintItemVM.radiotimetype.year) {
            pmsConfMaintItemVM.radiotime = pmsConfMaintItemVM.radiotimetype.year;
            usetimebase_month();
            console.log('5 ', resResult.TimeBaseUnit);
        }
        else if (resResult.TimeBaseUnit == pmsConfMaintItemVM.radiotimetype.custom) {
            pmsConfMaintItemVM.radiotime = pmsConfMaintItemVM.radiotimetype.custom;
            usetimebase_custom();
            console.log('6 ', resResult.TimeBaseUnit);
        }

        switch (pmsConfMaintItemVM.radiotime) {
            case pmsConfMaintItemVM.radiotimetype.day: {
                for (var i = 0; i < pmsConfMaintItemVM.timevalue.length; i++) {
                    if (resResult.TimeBaseValue == pmsConfMaintItemVM.timevalue[i].timevalue)
                        break;
                }
                pmsConfMaintItemVM.timevalueinit = pmsConfMaintItemVM.timevalue[i];
            }
            case pmsConfMaintItemVM.radiotimetype.week: {
                for (var i = 0; i < pmsConfMaintItemVM.weekvalue.length; i++) {
                    if (resResult.TimeBaseValue == pmsConfMaintItemVM.weekvalue[i].timevalue)
                        break;
                }
                pmsConfMaintItemVM.weekvalueinit = pmsConfMaintItemVM.weekvalue[i];
            }
            case pmsConfMaintItemVM.radiotimetype.month: {
                for (var i = 0; i < pmsConfMaintItemVM.dayvalue.length; i++) {
                    if (resResult.TimeBaseValue == pmsConfMaintItemVM.dayvalue[i].timevalue)
                        break;
                }
                pmsConfMaintItemVM.dayvalueinit = pmsConfMaintItemVM.dayvalue[i];
            }
            case pmsConfMaintItemVM.radiotimetype.year: {
                for (var i = 0; i < pmsConfMaintItemVM.monthvalue.length; i++) {
                    if (resResult.TimeBaseValue == pmsConfMaintItemVM.monthvalue[i].timevalue)
                        break;
                }
                pmsConfMaintItemVM.monthvalueinit = pmsConfMaintItemVM.monthvalue[i];
            }
            case pmsConfMaintItemVM.radiotimetype.year: {
                for (var i = 0; i < pmsConfMaintItemVM.yearvalue.length; i++) {
                    if (resResult.TimeBaseValue == pmsConfMaintItemVM.yearvalue[i].timevalue)
                        break;
                }
                pmsConfMaintItemVM.yearvalueinit = pmsConfMaintItemVM.yearvalue[i];
            }
            case pmsConfMaintItemVM.radiotimetype.custom: {
                for (var i = 0; i < pmsConfMaintItemVM.dayvalue.length; i++) {
                    if (resResult.TimeBaseValue == pmsConfMaintItemVM.dayvalue[i].timevalue)
                        break;
                }
                pmsConfMaintItemVM.dayvalueinit = pmsConfMaintItemVM.dayvalue[i];
            }
        }


        //   pmsConfMaintItemVM.timevalueinit = pmsConfMaintItemVM.timevalue[0];

        //   pmsConfMaintItemVM.weekvalueinit = pmsConfMaintItemVM.weekvalue[0];
        //   pmsConfMaintItemVM.dayvalueinit = pmsConfMaintItemVM.dayvalue[21];
        //   pmsConfMaintItemVM.monthvalueinit = pmsConfMaintItemVM.monthvalue[6];
        //   pmsConfMaintItemVM.yearvalueinit = pmsConfMaintItemVM.yearvalue[0];
        // if (resResult.nonTimeBaseMainUnit=='km')
        pmsConfMaintItemVM.distanceunitinit = pmsConfMaintItemVM.distanceunit[0];
        pmsConfMaintItemVM.distancevalue = resResult.nonTimeBaseMainValue;
        pmsConfMaintItemVM.distanceunitinit_warring = pmsConfMaintItemVM.distanceunit_warring[0];
        pmsConfMaintItemVM.distancevalue_warring = resResult.nonTimeBaseWarningValue;
    }
    function radiochange(type) {
        if (type == pmsConfMaintItemVM.radiochecktype.check)
            pmsConfMaintItemVM.ID_PMS_input_code = newobject.check;
        else if (type == pmsConfMaintItemVM.radiochecktype.action)
            pmsConfMaintItemVM.ID_PMS_input_code = newobject.action;
    }

    function schuduleradiochange(type) {
        if (type == pmsConfMaintItemVM.radioschduletype.time) {
            usetimebaseinput();
        } else if (type == pmsConfMaintItemVM.radioschduletype.distance) {
            usedistanceinput();
        }
    }
    function timeradiochange(type) {
        if (type == pmsConfMaintItemVM.radiotimetype.hour) {
            usetimebase_nothing();
        } else if (type == pmsConfMaintItemVM.radiotimetype.day) {
            usetimebase_hour();
        } else if (type == pmsConfMaintItemVM.radiotimetype.week) {
            usetimebase_day();
        } else if (type == pmsConfMaintItemVM.radiotimetype.month) {
            usetimebase_week();
        } else if (type == pmsConfMaintItemVM.radiotimetype.year) {
            usetimebase_month();
        } else if (type == pmsConfMaintItemVM.radiotimetype.custom) {
            usetimebase_custom();
        }
    }
    function mothercreate() {
        console.log("Large 분류 :", pmsConfMaintItemVM.pmslargecategory);
        $http.post('/pms/createmotherone', {
            Code: pmsConfMaintItemVM.ID_PMS_input_code, //코드는 변경 안됨.
            Title: pmsConfMaintItemVM.ID_PMS_input_checkname,
            Content: pmsConfMaintItemVM.ID_PMS_input_content,
            LargeCategory: pmsConfMaintItemVM.pmslargecategory.category,
            MediumCategory: pmsConfMaintItemVM.pmsMediumCategory.category,

            SmallCategory: pmsConfMaintItemVM.pmsSmallCategory.category,
            //    CreateDate             :
            TimeGroup: pmsConfMaintItemVM.radioschedule,
            TimeBaseUnit: pmsConfMaintItemVM.radiotime,
            TimeBaseValue: timevalue(),
            nonTimeBaseMainUnit: pmsConfMaintItemVM.distanceunitinit.distance,
            nonTimeBaseMainValue: pmsConfMaintItemVM.distancevalue,
            nonTimeBaseWarningUnit: pmsConfMaintItemVM.distanceunitinit_warring.distance,
            nonTimeBaseWarningValue: pmsConfMaintItemVM.distancevalue_warring,
            //    Relation               :
            Type: pmsConfMaintItemVM.radiocheck,
            Level: pmsConfMaintItemVM.pmslevel.grade
        })
            .success(function () {
                newCode();// 새 코드 이름 준비.
                var message_createsuccess = pmsConfMaintItemVM.ID_PMS_input_code;
                message_createsuccess += '생성 완료';
                alert(message_createsuccess);
                modalclose();
                onMotherDataLoad();
            })
            .error(function (data) {

                if (data.error == 'duplicate') {
                    onValidateDuplicate(false);
                }
            });

    }
    function motherupdate() {
        console.log("Large 분류 :", pmsConfMaintItemVM.pmslargecategory);
        $http.post('/pms/savemother', {
            Code: pmsConfMaintItemVM.ID_PMS_input_code, //코드는 변경 안됨.
            Title: pmsConfMaintItemVM.ID_PMS_input_checkname,
            Content: pmsConfMaintItemVM.ID_PMS_input_content,
            LargeCategory: pmsConfMaintItemVM.pmslargecategory,
            MediumCategory: pmsConfMaintItemVM.pmsMediumCategory,

            SmallCategory: pmsConfMaintItemVM.pmsSmallCategory,
            //    CreateDate             :
            TimeGroup: pmsConfMaintItemVM.radioschedule,
            TimeBaseUnit: pmsConfMaintItemVM.radiotime,
            TimeBaseValue: timevalue(),
            nonTimeBaseMainUnit: pmsConfMaintItemVM.distanceunitinit,
            nonTimeBaseMainValue: pmsConfMaintItemVM.distancevalue,
            nonTimeBaseWarningUnit: pmsConfMaintItemVM.distanceunitinit_warring,
            nonTimeBaseWarningValue: pmsConfMaintItemVM.distancevalue_warring,
            Relation: [],
            //    Relation               :
            Type: pmsConfMaintItemVM.radiocheck,
            Level: pmsConfMaintItemVM.pmslevel
        })
            .success(function () {
                var message_createsuccess = pmsConfMaintItemVM.ID_PMS_input_code;
                message_createsuccess += '저장 성공';
                alert(message_createsuccess);
                modalclose();
                onMotherDataLoad();
            })
            .error(function (data) {

                if (data.error == 'duplicate') {
                    onValidateDuplicate(false);
                }
            });

    }
    function motherdelete(Code) {
        var url = "/pms/deletemother?Code=" + Code;
        //  var url = "/pms/onemother/" 
        $http.delete(url).success(function (res) {
            //inputmotherdata(res);
            newCode();
            var message_createsuccess = pmsConfMaintItemVM.ID_PMS_input_code;
            message_createsuccess += '삭제';
            alert(message_createsuccess);
            modalclose();
            onMotherDataLoad();
        }, function (err) {
            console.log(err);
        });
    }
    function usetimebaseinput() {//id 추가되면 인덱스 변경 후 사용. pmstimebase1~11
        for (var i = 1; i < 12; i++) {
            document.getElementById('pmstimebase' + i).disabled = false;
        }
        for (i = 1; i < 5; i++) {
            document.getElementById('pmsdistancebase' + i).disabled = true;
        }
    }
    function usedistanceinput() {//id 추가되면 인덱스 변경 후 사용. pmsdistancebase1~4
        for (var i = 1; i < 12; i++) {
            document.getElementById('pmstimebase' + i).disabled = true;
        }
        for (i = 1; i < 5; i++) {
            document.getElementById('pmsdistancebase' + i).disabled = false;
        }
    }
    function usetimebase_nothing() {//매시간 하면 value 없음.
        for (var i = 7; i < 12; i++) {
            document.getElementById('pmstimebase' + i).hidden = true;
            document.getElementById('pmstimebase' + i).disabled = true

        }
    }
    function usetimebase_hour() {
        for (var i = 7; i < 12; i++) {
            document.getElementById('pmstimebase' + i).disabled = true
            document.getElementById('pmstimebase' + i).hidden = true;
        }
        document.getElementById('pmstimebase7').disabled = false;//hour
        document.getElementById('pmstimebase7').hidden = false; //매시간 하면 value 없음.
    }
    function usetimebase_day() {
        for (var i = 7; i < 12; i++) {
            document.getElementById('pmstimebase' + i).disabled = true;
            document.getElementById('pmstimebase' + i).hidden = true;
        }
        document.getElementById('pmstimebase8').disabled = false;//day
        document.getElementById('pmstimebase8').hidden = false;
    }
    function usetimebase_week() {
        for (var i = 7; i < 12; i++) {
            document.getElementById('pmstimebase' + i).disabled = true;
            document.getElementById('pmstimebase' + i).hidden = true;
        }
        document.getElementById('pmstimebase9').disabled = false;//week
        document.getElementById('pmstimebase9').hidden = false;
    }
    function usetimebase_month() {
        for (var i = 7; i < 12; i++) {
            document.getElementById('pmstimebase' + i).disabled = true;
            document.getElementById('pmstimebase' + i).hidden = true;
        }
        document.getElementById('pmstimebase10').disabled = false;//month
        document.getElementById('pmstimebase10').hidden = false;
    }
    function usetimebase_year() {
        for (var i = 7; i < 12; i++) {
            document.getElementById('pmstimebase' + i).disabled = true;
            document.getElementById('pmstimebase' + i).hidden = true;
        }
        document.getElementById('pmstimebase10').disabled = false;//year
        document.getElementById('pmstimebase10').hidden = false;
    }
    function usetimebase_custom() {
        for (var i = 7; i < 12; i++) {
            document.getElementById('pmstimebase' + i).disabled = true;
            document.getElementById('pmstimebase' + i).hidden = true;
        }
        document.getElementById('pmstimebase9').disabled = false;//custom
        document.getElementById('pmstimebase9').hidden = false;
    }
    function timevalue() {
        if (pmsConfMaintItemVM.radioschedule == pmsConfMaintItemVM.radioschduletype.distance) {
            return 'distance';
        }
        for (var i = 7; i < 12; i++) {
            if (false == document.getElementById('pmstimebase' + i).disabled) {//활성화 되있는 리스트 박스에서 
                if (i == 7) {
                    console.log('pmsConfMaintItemVM.timevalueinit;');
                    return pmsConfMaintItemVM.timevalueinit.timevalue;
                }
                else if (i == 8) {
                    console.log('pmsConfMaintItemVM.weekvalueinit;');
                    return pmsConfMaintItemVM.weekvalueinit.timevalue;
                }
                else if (i == 9) {
                    console.log('pmsConfMaintItemVM.dayvalueinit;');
                    return pmsConfMaintItemVM.dayvalueinit.timevalue;
                }
                else if (i == 10) {
                    console.log('pmsConfMaintItemVM.monthvalueinit;');
                    return pmsConfMaintItemVM.monthvalueinit.timevalue;
                }
                else if (i == 11) {
                    console.log('pmsConfMaintItemVM.yearvalueinit;');
                    return pmsConfMaintItemVM.yearvalueinit.timevalue;
                }
            }
        }
    }
    function onlymotherview(hidden) {
        //점검 주기만 나옴. 
        for (var i = 7; i < 12; i++) { document.getElementById('pmstimebase' + i).hidden = hidden; }
    }
    function findnumber(array, number) {
        return (array.indexOf(number) != -1);
    }
    function emptyNumber(Inputarray) {
        var minIndex = Inputarray[0];//min 번호 ex) AC100 -> 100. 
        var maxIndex = Inputarray[Inputarray.length - 1];
        //array의 최대 최소 값 사이에 빈 값으로 할당 한다. 
        for (var i = 1; i <= maxIndex + 1; i++) {
            var flag = false;// 이미 할당 되있는 값인지 확인.
            for (var j = 0; j < Inputarray.length; j++) {
                if (findnumber(Inputarray, i)) {
                    flag = true; // 찾았다.
                    break;//찾으면 다음 후보로 넘어간다.
                }
            }
            if (flag == false)//새로 할당할 번호가 기존 값에 없다.
            {
                return i;// 할당할 번호를 반환한다. 
            }
        }
    }
    function cipher(number) {

        if (number > 99)// 세 자리수 
            return number;
        else if (number > 9)//두 자리 수 
            return '0' + number;
        else    //1자리 수.
            return '00' + number;
    }
    function newCode() {
        $http.get("/pms/getcode").success(function (res) {
            var code = res; //점검/조치 코드 배열.
            var ACcode;
            var PMcode;
            code.sort(function (a, b) {
                return a.Code < b.Code ? -1 : a.Code > b.Code ? 1 : 0;
            });
            var action_codearray = [];
            var check_codearray = [];
            //점검, 코드 별로 추림. 
            for (var k = 0; k < code.length; k++) {
                //접두 AC 항목 
                if (code[k].Code.substring(0, 2) == 'AC') {
                    var a = code[k].Code.substring(2) * 1;
                    action_codearray.push(a);
                }// PM 항목
                else if (code[k].Code.substring(0, 2) == 'PM') {
                    check_codearray.push(code[k].Code.substring(2) * 1);
                }
            }
            for (var i = 0; i < action_codearray.length; i++)
                action_codearray[i] *= 1;
            for (var i = 0; i < check_codearray.length; i++)
                check_codearray[i] *= 1;
            // AC or PM3 + 자리 int로 반환 
            ACcode = 'AC' + cipher(emptyNumber(action_codearray));
            PMcode = 'PM' + cipher(emptyNumber(check_codearray));

            if (action_codearray.length == 0)
                ACcode = 'AC001';
            if (check_codearray.length == 0)
                PMcode = 'PM001';

            console.log('PMcode', PMcode);
            console.log('ACcode', ACcode);
            newobject = {
                check: PMcode, action: ACcode
            };
        }, function (err) {
            console.log(err);
        });
    }

    function modalclose() {
        document.getElementById('pmsmotherdataupdate').hidden = false;
        document.getElementById('pmsmotherdatadelete').hidden = false;
        document.getElementById('pmsmotherdatacreate').hidden = false;
        $("#pmsMotherEdit").modal('toggle');
    }
    function newbutton() {
        document.getElementById('pmsmotherdataupdate').hidden = true;
        document.getElementById('pmsmotherdatadelete').hidden = true;
    }
    function updatebutton() {
        document.getElementById('pmsmotherdatacreate').hidden = true;
    }

}
