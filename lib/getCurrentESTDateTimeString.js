function getCurrentESTDateTimeString() {
    // Get the current date and time
    const now = new Date();

    // Convert to EST (Eastern Standard Time)
    const estOffset = -5 * 60; // EST is UTC-5
    const estDate = new Date(now.getTime() + (estOffset - now.getTimezoneOffset()) * 60000);

    // Format the date and time as YYYY-MM-DD-HHmmss
    const year = estDate.getFullYear();
    const month = String(estDate.getMonth() + 1).padStart(2, '0');
    const day = String(estDate.getDate()).padStart(2, '0');
    const hours = String(estDate.getHours()).padStart(2, '0');
    const minutes = String(estDate.getMinutes()).padStart(2, '0');
    const seconds = String(estDate.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day}-${hours}${minutes}${seconds}`;
}

export { getCurrentESTDateTimeString };
