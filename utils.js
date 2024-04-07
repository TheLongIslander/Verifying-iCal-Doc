// Contains utility functions for validation

function isValidDateTimeGroup(year, month, day, hour, minute, second) 
{
    year = parseInt(year, 10);
    month = parseInt(month, 10) - 1; // Adjust for zero-indexed months in JavaScript
    day = parseInt(day, 10);
    hour = parseInt(hour, 10);
    minute = parseInt(minute, 10);
    second = parseInt(second, 10);

    const date = new Date(Date.UTC(year, month, day, hour, minute, second));

    if (month === 1) { // February
        const isLeapYear = (year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0));
        if (day > (isLeapYear ? 29 : 28)) {
            return 'February does not have that many days';
        }
    } else if (month === 3 || month === 5 || month === 8 || month === 10) {
        if (day > 30) {
            return 'The day is invalid or does not exist for the given month and year.';
        }
    } else if (day > 31) {
        return 'The day is invalid or does not exist for the given month and year.';
    }

    if (hour > 23) {
        return 'The hour is invalid or out of range (00-23).';
    }
    if (minute > 59) {
        return 'The minute is invalid or out of range (00-59).';
    }
    if (second > 59) {
        return 'The second is invalid or out of range (00-59).';
    }

    if (date.getUTCFullYear() !== year ||
        date.getUTCMonth() !== month ||
        date.getUTCDate() !== day ||
        date.getUTCHours() !== hour ||
        date.getUTCMinutes() !== minute ||
        date.getUTCSeconds() !== second) {
        return 'The date-time components do not match a valid date.';
    }

    return null; // Indicates the date-time group is valid
}

function isValidEmail(email) {
    const regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return regex.test(email);
}

function isValidPhoneNumber(phoneNumber) {
    // Simplified validation for international numbers starting with +
    const regex = /^\+[1-9]{1}[0-9]{3,14}$/;
    return regex.test(phoneNumber);
}

function isValidDateTime(dateTime) {
    // Extract components from the dateTime string
    const year = dateTime.substring(0, 4);
    const month = dateTime.substring(4, 6);
    const day = dateTime.substring(6, 8);
    const hour = dateTime.substring(9, 11);
    const minute = dateTime.substring(11, 13);
    const second = dateTime.substring(13, 15);

    // Validate using the detailed function
    const validationResult = isValidDateTimeGroup(year, month, day, hour, minute, second);
    if (validationResult !== null) {
        console.error(validationResult); // Log specific validation error
        return false;
    }
    return true;
}

module.exports = {
    isValidDateTimeGroup,
    isValidEmail,
    isValidPhoneNumber,
    isValidDateTime
};