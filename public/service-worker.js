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
        let principalPaid = emi - interest + (extraPayments && extraPayments[month] ? extraPayments[month] : 0);
        principalPaid = principalPaid > principalLeft ? principalLeft : principalPaid;
        principalLeft -= principalPaid;
        schedule.push({
          month,
          emi: emi,
          extra: extraPayments && extraPayments[month] ? extraPayments[month] : 0,
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
    let emi = 0;
    if (amt > 0 && monthlyRate > 0 && totalMonths > 0) {
      emi = calculateEMI(amt, monthlyRate, totalMonths);
    }
    const schedule = emi > 0 ? generateSchedule(amt, rt, totalMonths, emi, extraPayments || {}) : [];
    // Always respond to both MessageChannel and event.source for maximum compatibility
    if (event.ports && event.ports[0]) {
      try {
        event.ports[0].postMessage({ type: 'EMI_RESULT', payload: { emi, schedule } });
      } catch (e) {}
    }
    if (event.source && event.source.postMessage) {
      try {
        event.source.postMessage({ type: 'EMI_RESULT', payload: { emi, schedule } });
      } catch (e) {}
    }
  }
});

// Cache static assets for offline use (optional, basic example)
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  // Skip chrome-extension and other unsupported schemes
  if (!event.request.url.startsWith('http')) return;
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
