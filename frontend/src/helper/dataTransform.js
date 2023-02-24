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