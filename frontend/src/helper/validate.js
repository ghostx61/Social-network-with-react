
export function validateEmail(email) {
    var re = /\S+@\S+\.\S+/;
    return re.test(email);
}

export function validateDob(enteredDate) {
    if (!enteredDate || (new Date > new Date(enteredDate))) return true;
    return false;
}

// const validateFunctions = {
//     validateEmail,
//     validateDob
// };
// export default validateFunctions;