import moment from 'moment';
moment().format();

const monthsFull = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function formatDate(date) {
    const newDate = new Date(date);
    let month = newDate.getMonth() + 1;
    if (month < 10) {
        month = '0' + month;
    }
    return `${newDate.getFullYear()}-${month}-${newDate.getDate()}`;
}

export function formatDate2(date) {
    const newDate = new Date(date);
    // console.log(date);
    return `${newDate.getDate()} ${months[newDate.getMonth()]} ${newDate.getFullYear()}`;
}

export function formatDate3(date) {
    console.log(moment(date).fromNow());
    return moment(date).fromNow();
}
export function formatDate4(date) {
    let newDate = moment(date).fromNow('ss');
    console.log(newDate);
    // newDate = newDate.split(' ');
    // newDate = newDate[0].replace('an', '1') + ' ' + newDate[1].charAt(0)
    return newDate;
}

export function formatDate5(date) {
    return moment(date).format('LT');
}