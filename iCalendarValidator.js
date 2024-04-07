const { isValidEmail, isValidPhoneNumber, isValidDateTime } = require('./utils');

function verifyICalendarData(data) {
    data = data.replace(/\r?\n/g, '\r\n').trim();
    //console.log("Content being checked:", JSON.stringify(data));

    let errors = [];
    let warnings = [];
    let methodFound = false;
    let methodType = "";
    let veventFound = false;

    const knownProperties = [
        'BEGIN', 'END', 'DTSTART', 'DTSTAMP', 'UID', 'ATTENDEE', 'STATUS', 'CREATED', 'DTEND',
        'DURATION', 'LAST-MODIFIED', 'NAME', 'ORGANIZER', 'DESCRIPTION', 'SUMMARY', 'METHOD',
        'VERSION', 'PRODID'
    ];
    const requiredProperties = ['DTSTART', 'DTSTAMP', 'ATTENDEE', 'STATUS'];

    if (!data.startsWith('BEGIN:VCALENDAR') || !data.endsWith('END:VCALENDAR')) {
        errors.push('iCalendar content must start with "BEGIN:VCALENDAR" and end with "END:VCALENDAR".');
    }

    const lines = data.split('\r\n');

    lines.forEach((line, index) => {
        if (line.startsWith('METHOD:')) {
            methodType = line.split(':')[1].trim();
            methodFound = true;
        }
    
        if (line.startsWith('BEGIN:VEVENT')) {
            veventFound = true;
            let eventProperties = {};
    
            for (let i = index + 1; i < lines.length && !lines[i].startsWith('END:VEVENT'); i++) {
                let currentLine = lines[i];
                let [key, ...valueParts] = currentLine.split(':');
                let value = valueParts.join(':'); // Handle values with colons
                let propKey = key.split(';')[0]; // Remove any parameterization, e.g., ROLE=REQ-PARTICIPANT
    
                if (propKey === 'ATTENDEE') {
                    // Extract the email or phone number, considering additional parameters
                let contactInfo = value.split('MAILTO:')[1] || value.split('TEL:')[1];
                
                if (contactInfo && contactInfo.includes('@')) {
                    if (!isValidEmail(contactInfo)) {
                        errors.push(`ATTENDEE email format is invalid: ${contactInfo}`);
                    }
                } else if (contactInfo && contactInfo.startsWith('+')) {
                    if (!isValidPhoneNumber(contactInfo)) {
                        errors.push(`ATTENDEE phone number format is invalid: ${contactInfo}`);
                    }
                } else {
                    warnings.push(`ATTENDEE contact information format is unrecognized or may be invalid: ${contactInfo}`);
                }
                eventProperties[propKey] = contactInfo; // Save the extracted contact info
            } else {
                // Directly assign other properties
                eventProperties[propKey] = value;
                    // Check if the property is known but not required and add a warning
                if (knownProperties.includes(propKey) && !requiredProperties.includes(propKey)) {
                    warnings.push(`Encountered optional property "${propKey}".`);
                }
                else if (!knownProperties.includes(propKey) && !requiredProperties.includes(propKey))
                {
                    errors.push(`Encountered unrecognized property "${propKey}".`);
                }
                }
            }
    
            // Validate required properties...
            requiredProperties.forEach(rp => {
                if (!eventProperties[rp]) {
                    errors.push(`VEVENT is missing the ${rp} property.`);
                } else if (['DTSTART', 'DTSTAMP'].includes(rp)) {
                    const isValid = isValidDateTime(eventProperties[rp]);
                    if (!isValid) {
                        errors.push(`${rp} property value is invalid: ${eventProperties[rp]}`);
                    }
                }
            });
    
            // Perform STATUS specific validation
            if (eventProperties['STATUS'] && !['TENTATIVE', 'CONFIRMED', 'CANCELLED'].includes(eventProperties['STATUS'])) {
                errors.push(`STATUS property contains invalid value: '${eventProperties['STATUS']}'.`);
            }
        }
    });

    if (methodFound && methodType !== 'REQUEST') {
        warnings.push(`Found METHOD:${methodType}. METHOD:REQUEST is preferred but tolerating other METHOD values.`);
    }

    if (!methodFound) {
        errors.push('VCALENDAR is missing the METHOD property.');
    }

    if (!veventFound) {
        errors.push('No VEVENT component found in iCalendar data.');
    }

    // Report errors and warnings
     return { errors, warnings };
};

module.exports = { verifyICalendarData };
