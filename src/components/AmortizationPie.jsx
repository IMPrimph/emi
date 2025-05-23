import { Suspense, lazy, useMemo, useEffect } from 'react';

const Doughnut = lazy(() => import('react-chartjs-2').then(mod => ({ default: mod.Doughnut })));
const chartJsModules = () => import('chart.js').then(mod => {
  mod.Chart.register(
    mod.ArcElement,
    mod.Tooltip,
    mod.Legend
  );
});

export default function AmortizationPie({ schedule }) {
  useEffect(() => { chartJsModules(); }, []);
  const data = useMemo(() => {
    if (!schedule || schedule.length === 0) return null;
    const totalPrincipal = schedule.reduce((sum, row) => sum + row.principalPaid, 0);
    const totalInterest = schedule.reduce((sum, row) => sum + row.interest, 0);
    return {
      labels: ['Principal', 'Interest'],
      datasets: [
        {
          data: [totalPrincipal, totalInterest],
          backgroundColor: [
            getComputedStyle(document.documentElement).getPropertyValue('--chart-bar-principal').trim() || '#3B82F6',
            getComputedStyle(document.documentElement).getPropertyValue('--chart-bar-interest').trim() || '#6366F1',
          ],
          borderWidth: 2,
        },
      ],
    };
  }, [schedule]);

  // Calculate percent split for center label
  const totalPrincipal = schedule?.reduce((sum, row) => sum + row.principalPaid, 0) || 0;
  const totalInterest = schedule?.reduce((sum, row) => sum + row.interest, 0) || 0;
  const totalPaid = totalPrincipal + totalInterest;
  const principalPct = totalPaid ? Math.round((totalPrincipal / totalPaid) * 100) : 0;
  const interestPct = totalPaid ? 100 - principalPct : 0;

  const options = {
    responsive: true,
    cutout: '70%',
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          color: 'var(--color-primary)',
          font: { family: 'Poppins, Arial, sans-serif', size: 16, weight: 700 },
        },
      },
      tooltip: {
        backgroundColor: 'var(--color-tooltip-bg)',
        titleColor: 'var(--color-tooltip-title)',
        bodyColor: 'var(--color-tooltip-body)',
        borderColor: 'var(--color-accent)',
        borderWidth: 1,
        callbacks: {
          label: function(context) {
            return `${context.label}: ₹${Math.round(context.parsed).toLocaleString('en-IN')}`;
          },
        },
        padding: 14,
        caretSize: 8,
        cornerRadius: 8,
      },
      title: {
        display: true,
        text: 'Total Principal vs. Total Interest',
        color: 'var(--color-primary)',
        font: { family: 'Poppins, Arial, sans-serif', size: 18, weight: 700 },
        padding: { top: 10, bottom: 10 },
      },
    },
    animation: {
      duration: 900,
      easing: 'easeOutCubic',
    },
  };

  if (!data) return null;

  return (
    <div style={{ width: 320, height: 320, margin: '0 auto', background: 'var(--color-bg)', borderRadius: 24, boxShadow: 'var(--shadow-elevation)', padding: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', transition: 'background 0.3s, color 0.3s' }}>
      <Suspense fallback={<div style={{textAlign:'center',padding:40}}>Loading pie…</div>}>
        <Doughnut data={data} options={options} />
      </Suspense>
      {/* Center label overlay */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        textAlign: 'center',
        pointerEvents: 'none',
        zIndex: 2,
      }} aria-hidden="true">
        <div style={{ fontWeight: 700, fontSize: 28, color: 'var(--color-primary)', lineHeight: 1 }}>{principalPct}%</div>
        <div style={{ fontWeight: 500, fontSize: 15, color: 'var(--color-secondary)', marginBottom: 2 }}>Principal</div>
        <div style={{ fontWeight: 700, fontSize: 18, color: 'var(--color-accent)' }}>vs</div>
        <div style={{ fontWeight: 700, fontSize: 22, color: 'var(--color-accent)', lineHeight: 1 }}>{interestPct}%</div>
        <div style={{ fontWeight: 500, fontSize: 15, color: 'var(--color-secondary)' }}>Interest</div>
        <div style={{ fontWeight: 400, fontSize: 13, color: 'var(--color-secondary)', marginTop: 6 }}>Total: ₹{Math.round(totalPaid).toLocaleString('en-IN')}</div>
      </div>
    </div>
  );
}
