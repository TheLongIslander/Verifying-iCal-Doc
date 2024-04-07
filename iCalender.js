const fs = require('fs');
const { verifyICalendarData } = require('./iCalendarValidator');

function verifyICalendarFile(filePath) {
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error(`Error reading file: ${err.message}`);
            return;
        }

        const result = verifyICalendarData(data);

        // Handle errors
        if (result.errors.length > 0) {
            console.error('Errors encountered:');
            result.errors.forEach(error => console.error(error));
        }

        // Handle warnings
        if (result.warnings.length > 0) {
            console.warn('Warnings:');
            result.warnings.forEach(warning => console.warn(warning));
        }

        // If there are no errors, confirm that the iCalendar data is valid
        if (result.errors.length === 0) {
            console.log('iCalendar data is valid.');
        }
    });
}

// Use process.argv to get the file path from command line arguments
const filePath = process.argv[2];
if (!filePath) {
    console.log('Please provide a file path as an argument.');
    process.exit(1);
}

verifyICalendarFile(filePath);
