module.exports.convertUTCToLocalTime = convertUTCToLocalTime;

function convertUTCToLocalTime(utcDate) {
    return new Date(utcDate.getTime() - (utcDate.getTimezoneOffset() * 60000));
}