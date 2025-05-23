// service-worker.js
// Handles offline EMI calculations

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Listen for calculation requests from the main app
self.addEventListener('message', async (event) => {
  if (event.data && event.data.type === 'CALCULATE_EMI') {
    const { amount, rate, tenure, extraPayments } = event.data.payload;
    // Calculation logic (copied from utils/calculateLoan.js)
    const calculateEMI = (P, r, n) => (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const generateSchedule = (P, annualRate, tenureMonths, emi, extraPayments) => {
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
    };
    const amt = parseFloat(amount) || 0;
    const rt = parseFloat(rate) || 0;
    const tn = parseInt(tenure, 10) || 0;
    const totalMonths = tn * 12;
    const monthlyRate = rt / 12 / 100;
    const emi = calculateEMI(amt, monthlyRate, totalMonths);
    const schedule = generateSchedule(amt, rt, totalMonths, emi, extraPayments || {});
    event.source.postMessage({ type: 'EMI_RESULT', payload: { emi, schedule } });
  }
});

// Cache static assets for offline use (optional, basic example)
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.open('emi-static-v1').then((cache) =>
      cache.match(event.request).then((resp) =>
        resp || fetch(event.request).then((response) => {
          cache.put(event.request, response.clone());
          return response;
        })
      )
    )
  );
});
