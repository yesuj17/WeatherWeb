const MAX_DISPLAY_MOTOR_COUNT = 5;
/* PdAS Javascript */
/* OnLoad() call from index */
function pdas_OnLoad() {    
    var ulElement = document.getElementById('ID_PDAS_DAS_realTimeCurrent');
    for (var i = 0; i < MAX_DISPLAY_MOTOR_COUNT; i++) {
        var x = document.createElement('LI');
        x.setAttribute('class','pdasDashRTCurrent');
        x.innerHTML = "<a href='#'><span class='badge' style='font-size:30px; border-radius:100%;'>0.0</a></span>";
        ulElement.appendChild(x);
    }
    var socket = io();
    socket.on('updateCurrentData', function (datas) {
        var lstLIElement = ulElement.getElementsByTagName('li');
        var arrLIElement =  Array.prototype.slice.call(lstLIElement);
        for(var ipx = 0; ipx < lstLIElement.length; ipx++) {
            ulElement.removeChild(ulElement.childNodes[ipx]);
        }
        datas.forEach(function(data){
            // upate
            var insertFlg = 'true';
            for(var ipx in arrLIElement) {
                var title = '';
                if(arrLIElement[ipx].nodeValue)
                    title = arrLIElement[ipx].nodeValue.split('_');
                if (title[0] == data.MachineID && title[1] == data.Type) {
                    arrLIElement[ipx].textContent = data.CurrentVal.toFixed(1);
                    insertFlg = false;
                    break;
                }
            }
            if(insertFlg) {
                var x = document.createElement('LI');
                x.title = data.MachineID + '_' + data.Type;
                x.setAttribute('class','pdasDashRTCurrent');
                x.innerHTML = "<a class='moveToPdasAnal' href='#ID_PDAS_pdasAnalysisModal' data-target='#ID_PDAS_pdasAnalysisModal'  data-toggle='modal'>"  
                            + "<span class='badge' style='font-size:30px; border-radius:100%;'>"+ data.CurrentVal.toFixed(1) +"</a></span>";
                arrLIElement.push(x);
            }
        });
        arrLIElement.sort(function(a, b){ return b.textContent - a.textContent;});
        for(var ipx = 0; ipx < MAX_DISPLAY_MOTOR_COUNT; ipx++) { 
            ulElement.appendChild(arrLIElement[ipx]);
        }
    });
}

$(document).ready(function(){
    $('.pdasDashRTCurrent').tooltip();
});

$(document).on('click', '.moveToPdasAnal', function () {
     var machineID = $(this).parent().attr('title').split('_')[0];
     $("#ID_PDAS_machine").val(machineID).trigger('change');
});