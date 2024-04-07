const fs = require('fs');
const { verifyICalendarData } = require('../iCalendarValidator');
const { error } = require('console');
const validICalendarData = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//hacksw/handcal//NONSGML v1.0//EN
METHOD:REQUEST
BEGIN:VEVENT
UID:uid1@example.com
DTSTART:20241212T090000
DTSTAMP:20241212T080000
ATTENDEE;ROLE=REQ-PARTICIPANT;RSVP=TRUE:MAILTO:john.doe@example.com
STATUS:CONFIRMED
SUMMARY:Patient Appointment
DESCRIPTION:Annual check-up
END:VEVENT
END:VCALENDAR`;

const invalidICalendarDataMissingRequiredProperty = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//hacksw/handcal//NONSGML v1.0//EN
METHOD:REQUEST
BEGIN:VEVENT
UID:uid1@example.com
DTSTAMP:20241212T080000
ATTENDEE;ROLE=REQ-PARTICIPANT;RSVP=TRUE:MAILTO:john.doe@example.com
STATUS:CONFIRMED
SUMMARY:Patient Appointment
DESCRIPTION:Annual check-up
END:VEVENT
END:VCALENDAR`;

const iCalendarDataWithOptionalProperty = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//hacksw/handcal//NONSGML v1.0//EN
METHOD:REQUEST
BEGIN:VEVENT
UID:uid1@example.com
DTSTART:20241212T090000
DTSTAMP:20241212T080000
ATTENDEE;ROLE=REQ-PARTICIPANT;RSVP=TRUE:MAILTO:john.doe@example.com
STATUS:CONFIRMED
SUMMARY:Patient Appointment
DESCRIPTION:Annual check-up
LOCATION:Doctor's Office
END:VEVENT
END:VCALENDAR`;

const iCalendarDataWithInvalidEmail = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//hacksw/handcal//NONSGML v1.0//EN
METHOD:REQUEST
BEGIN:VEVENT
UID:uid1@example.com
DTSTART:20241212T090000
DTSTAMP:20241212T080000
ATTENDEE;ROLE=REQ-PARTICIPANT;RSVP=TRUE:MAILTO:john.doeexample.com
STATUS:CONFIRMED
SUMMARY:Invalid Email Test
DESCRIPTION:Testing invalid email address
END:VEVENT
END:VCALENDAR`;

const iCalendarDataWithInvalidEmail2 = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//hacksw/handcal//NONSGML v1.0//EN
METHOD:REQUEST
BEGIN:VEVENT
UID:uid1@example.com
DTSTART:20241212T090000
DTSTAMP:20241212T080000
ATTENDEE;ROLE=REQ-PARTICIPANT;RSVP=TRUE:MAILTO:john.doeexample@com
STATUS:CONFIRMED
SUMMARY:Invalid Email Test
DESCRIPTION:Testing invalid email address
END:VEVENT
END:VCALENDAR`;

const iCalendarDataWithInvalidPhone = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//hacksw/handcal//NONSGML v1.0//EN
METHOD:REQUEST
BEGIN:VEVENT
UID:uid1@example.com
DTSTART:20241212T090000
DTSTAMP:20241212T080000
ATTENDEE:TEL:+1234567890invalid
STATUS:CONFIRMED
SUMMARY:Invalid Phone Number Test
DESCRIPTION:Testing invalid phone number
END:VEVENT
END:VCALENDAR`;

const iCalendarDataWithInvalidDate = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//hacksw/handcal//NONSGML v1.0//EN
METHOD:REQUEST
BEGIN:VEVENT
UID:uid1@example.com
DTSTART:2024-02-12T090000
DTSTAMP:20241212T080000
ATTENDEE:MAILTO:johndoe@example.com
STATUS:CONFIRMED
SUMMARY:Invalid Date Test
DESCRIPTION:Testing invalid date format
END:VEVENT
END:VCALENDAR`;

const iCalendarDataWithInvalidDate2 = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//hacksw/handcal//NONSGML v1.0//EN
METHOD:REQUEST
BEGIN:VEVENT
UID:uid1@example.com
DTSTART:20240212T090000
DTSTAMP:20241312T080000
ATTENDEE:MAILTO:johndoe@example.com
STATUS:CONFIRMED
SUMMARY:Invalid Date Test
DESCRIPTION:Testing invalid date format
END:VEVENT
END:VCALENDAR`;

const iCalendarDataWithInvalidStatus = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//hacksw/handcal//NONSGML v1.0//EN
METHOD:REQUEST
BEGIN:VEVENT
UID:uid1@example.com
DTSTART:20241212T090000
DTSTAMP:20241212T080000
ATTENDEE:MAILTO:johndoe@example.com
STATUS:INVALID_STATUS
SUMMARY:Invalid Status Test
DESCRIPTION:Testing invalid status value
END:VEVENT
END:VCALENDAR`;

const iCalenderDataWithUnrecognizedProperty = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//hacksw/handcal//NONSGML v1.0//EN
METHOD:REQUEST
BEGIN:VEVENT
UID:uid1@example.com
DTSTART:20241212T090000
DTSTAMP:20241212T080000
ATTENDEE:MAILTO:johndoe@example.com
STATUS:INVALID_STATUS
SUMMARY:Invalid Status Test
DESCRIPTION:Testing invalid status value
SobbingAndCrying: This homework really is fun is :D
END:VEVENT
END:VCALENDAR`;

const iCalendarDataWithMultipleAttendees = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//hacksw/handcal//NONSGML v1.0//EN
METHOD:REQUEST
BEGIN:VEVENT
UID:uid1@example.com
DTSTART:20241212T090000
DTSTAMP:20241212T080000
ATTENDEE;ROLE=REQ-PARTICIPANT;RSVP=TRUE:MAILTO:john.doe@example.com
ATTENDEE;ROLE=REQ-PARTICIPANT;RSVP=TRUE:MAILTO:john.doe@exile.com
STATUS:CONFIRMED
SUMMARY:Patient Appointment
DESCRIPTION:Annual check-up
END:VEVENT
END:VCALENDAR`;

const iCalendarDataWithCancelledStatus = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//hacksw/handcal//NONSGML v1.0//EN
METHOD:REQUEST
BEGIN:VEVENT
UID:uid1@example.com
DTSTART:20241212T090000
DTSTAMP:20241212T080000
ATTENDEE:MAILTO:johndoe@example.com
STATUS:CANCELLED
SUMMARY:Cancelled Status Test
DESCRIPTION:Testing if status is recognized as cancelled
END:VEVENT
END:VCALENDAR`;

const leapYearICalendarData = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//hacksw/handcal//NONSGML v1.0//EN
METHOD:REQUEST
BEGIN:VEVENT
UID:uid-leap@example.com
DTSTART:20240229T090000
DTSTAMP:20240229T080000
ATTENDEE;ROLE=REQ-PARTICIPANT;RSVP=TRUE:MAILTO:leap@example.com
STATUS:CONFIRMED
SUMMARY:Leap Year Check
DESCRIPTION:Check leap year date handling
END:VEVENT
END:VCALENDAR`;

const iCalendarDataWithCancelMethod = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//hacksw/handcal//NONSGML v1.0//EN
METHOD:CANCEL
BEGIN:VEVENT
UID:uid-cancel@example.com
DTSTART:20241212T090000
DTSTAMP:20241212T080000
ATTENDEE;ROLE=REQ-PARTICIPANT;RSVP=TRUE:MAILTO:cancel@example.com
STATUS:CANCELLED
SUMMARY:Event Cancellation
DESCRIPTION:This event has been cancelled.
END:VEVENT
END:VCALENDAR`;

describe("iCalendar Validator", () => {
    it("validates a correctly formatted iCalendar data", () => {
        const { errors, warnings } = verifyICalendarData(validICalendarData);
        expect(errors.length).toBe(0);
    });

    it("detects missing required properties in iCalendar data", () => {
        const { errors, warnings } = verifyICalendarData(invalidICalendarDataMissingRequiredProperty);
        expect(errors).toContain('VEVENT is missing the DTSTART property.'); // Directly checking for specific error message
    });

    it("handles optional properties correctly and issues warnings", () => {
        const { errors, warnings } = verifyICalendarData(iCalendarDataWithOptionalProperty);
        expect(errors.length).toBe(1);
    
    });

    it("handles invalid attendee contact information", () => {
        const { errors, warnings } = verifyICalendarData(iCalendarDataWithInvalidEmail);
        // If you are checking for a warning message
        expect(warnings).toContain('ATTENDEE contact information format is unrecognized or may be invalid: john.doeexample.com');
    });

    it("handles invalid email format", () => {
        const { errors, warnings } = verifyICalendarData(iCalendarDataWithInvalidEmail2);
        expect(errors).toContain('ATTENDEE email format is invalid: john.doeexample@com'); // Check for specific error message
    });

    it("handles invalid phone number format", () => {
        const { errors, warnings } = verifyICalendarData(iCalendarDataWithInvalidPhone);
        expect(errors).toContain('ATTENDEE phone number format is invalid: +1234567890invalid'); // Check for specific error message
    });

    it("handles invalid date format", () => {
        const { errors, warnings } = verifyICalendarData(iCalendarDataWithInvalidDate);
        expect(errors).toContain('DTSTART property value is invalid: 2024-02-12T090000'); // Check for specific error message
    });

    it("detects invalid date values", () => {
        const { errors, warnings } = verifyICalendarData(iCalendarDataWithInvalidDate2);
        expect(errors).toContain('DTSTAMP property value is invalid: 20241312T080000'); // Check for specific error message
    });

    it("handles invalid STATUS property values", () => {
        const { errors, warnings } = verifyICalendarData(iCalendarDataWithInvalidStatus);
        expect(errors).toContain("STATUS property contains invalid value: 'INVALID_STATUS'."); // Check for specific error message
    });

    it("handles unrecognized properties with error messages", () => {
        const { errors, warnings } = verifyICalendarData(iCalenderDataWithUnrecognizedProperty);
        expect(errors).toContain('Encountered unrecognized property "SobbingAndCrying".'); // Check for specific error message
    });

    it("allows for multiple attendees without error", () => {
        const { errors, warnings } = verifyICalendarData(iCalendarDataWithMultipleAttendees);
        expect(errors.length).toBe(0); // No errors expected for valid multiple attendees
    });

    it("recognizes the status as cancelled without error", () => {
        const { errors, warnings } = verifyICalendarData(iCalendarDataWithCancelledStatus);
        expect(errors.length).toBe(0); // Expect no errors for a cancelled status
    });
    it("correctly handles a leap year date", () => {
        const { errors, warnings } = verifyICalendarData(leapYearICalendarData);
        expect(errors.length).toBe(0, "Should not produce errors for valid leap year dates.");
        expect(warnings).not.toContain(jasmine.stringMatching(/invalid date/i), "Should not warn about valid leap year dates.");
    });
    it("handles events with METHOD other than REQUEST", () => {
        const { errors, warnings } = verifyICalendarData(iCalendarDataWithCancelMethod);
        expect(errors.length).toBe(0, "Should not produce errors for valid iCalendar data with METHOD:CANCEL.");
        expect(warnings).toContain(jasmine.stringMatching(/METHOD:CANCEL/), "Should warn about METHOD other than REQUEST.");
    });

});
