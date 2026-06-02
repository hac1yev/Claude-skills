const months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

function getYear() {
    return new Date().getFullYear();
};

function getMonth() {
    return months[new Date().getMonth()];
}

getYear();

function getDay() {
    return new Date().getDate();
}

console.log(getMonth())
console.log(getDay())