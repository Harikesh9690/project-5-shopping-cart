const isValid = function (value) {
    if (typeof value === "undefined" || value === null) return false;
    if (typeof value === "string" && value.trim().length === 0) return false;
    if (typeof value === "object" && Object.keys(value).length === 0) return false;
    return true;
  };

  const stringChecking = function (data) {
    if (typeof data !== 'string') {
        return false;
    } else if (typeof data === 'string' && data.trim().length === 0) {
        return false;
    } else {
        return true;
    }
}

let isValidSize = function (sizes) {
    return ['S', 'XS', 'M', 'X', 'L', 'XXL', 'XL'].includes(sizes);
}

const validPrice = (value) => {
    return (/^([0-9]{0,15}((.)[0-9]{0,2}))$/).test(value)
}
const isvalidpassword = (value) => {
    return (/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,15}$/).test(value)
}
const isvalidemail = (value) => {
    return (/^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/).test(value)
}
const isvalidmobileNumber = (value) => {
    return (/^(?:(?:\+|0{0,2})91(\s*[\-]\s*)?|[0]?)?[6789]\d{9}$/).test(value)
}
module.exports = {isValid, isValidSize, stringChecking, validPrice, isvalidemail, isvalidmobileNumber, isvalidpassword}