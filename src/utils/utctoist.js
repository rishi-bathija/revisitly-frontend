const IST_OFFSET = 5.5 * 60 * 60 * 1000;

export const getISTISOString = (date) => {
    console.log('inside getistisostring with date', date);

    const d = date instanceof Date ? date : new Date(date);
    if (isNaN(d)) {
        console.warn("Invalid date passed to getISTISOString:", date);
        return null;
    }

    const ist = new Date(d.getTime() + IST_OFFSET);
    return ist.toISOString().slice(0, 16);
}
