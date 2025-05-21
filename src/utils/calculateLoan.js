export function calculateEMI(P, r, n) {
    return (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

export function generateSchedule(P, annualRate, tenureMonths, emi, extraPayments) {
    const monthlyRate = annualRate / 12 / 100;
    let schedule = [];
    let principalLeft = P;
    let month = 1;

    while (principalLeft > 0 && month <= tenureMonths + 240) {
        const interest = principalLeft * monthlyRate;
        let principalPaid = emi - interest + (extraPayments[month] || 0);
        principalPaid = principalPaid > principalLeft ? principalLeft : principalPaid;
        principalLeft -= principalPaid;

        schedule.push({
            month,
            emi: emi,
            extra: extraPayments[month] || 0,
            interest,
            principalPaid,
            principalLeft: Math.abs(principalLeft),
        });

        month++;
    }
    return schedule;
}