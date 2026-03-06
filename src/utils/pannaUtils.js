function getDigitFromPanna(panna) {
    const sum = panna.split('').reduce((acc, n) => acc + Number(n), 0);
    return sum % 10;
};
function isValidPanna(panna) {
    return /^[0-9]{3}$/.test(panna);
};

module.exports = {
    getDigitFromPanna,
    isValidPanna
};