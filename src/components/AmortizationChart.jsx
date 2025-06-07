import { useMemo, useEffect, Suspense, lazy, useState } from 'react';
import AmortizationPie from './AmortizationPie';
import { Tooltip, IconButton } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

const Bar = lazy(() => import('react-chartjs-2').then(mod => ({ default: mod.Bar })));
const chartJsModules = () => import('chart.js').then(mod => {
  mod.Chart.register(
    mod.BarElement,
    mod.CategoryScale,
    mod.LinearScale,
    mod.Tooltip,
    mod.Legend,
    mod.PointElement, // <-- Register PointElement for line charts
    mod.LineElement   // <-- Register LineElement for line charts
  );
});

function AmortizationChart({ schedule }) {
  useEffect(() => { chartJsModules(); }, []);

  // Year/quarter toggle
  const [view, setView] = useState('year');
  const monthsPerGroup = view === 'year' ? 12 : 3;
  const groups = Math.ceil(schedule.length / monthsPerGroup);
  const labels = Array.from({ length: groups }, (_, i) => view === 'year' ? `Year ${i + 1}` : `Q${i + 1}`);

  // Brush/slider for selecting year/quarter
  const [brush, setBrush] = useState([0, groups - 1]);
  const handleBrush = (e) => {
    const val = Number(e.target.value);
    setBrush([val, val]);
  };

  // Prepare data for chart
  const chartData = useMemo(() => {
    if (!schedule || schedule.length === 0) return null;
    const outflowByGroup = Array(groups).fill(0);
    const principalByGroup = Array(groups).fill(0);
    const interestByGroup = Array(groups).fill(0);
    schedule.forEach((row, idx) => {
      const groupIdx = Math.floor(idx / monthsPerGroup);
      outflowByGroup[groupIdx] += row.emi + (row.extra || 0);
      principalByGroup[groupIdx] += row.principalPaid;
      interestByGroup[groupIdx] += row.interestPaid ?? row.interest;
    });
    // Show total outflow as a line, principal and interest as stacked bars
    const datasets = [];
    if (principalByGroup.some(v => v > 0)) {
      datasets.push({
        type: 'bar',
        label: 'Principal Paid',
        data: principalByGroup,
        backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--chart-bar-principal').trim() || '#3B82F6',
        borderRadius: 8,
        barPercentage: 0.7,
        categoryPercentage: 0.7,
        borderSkipped: false,
        stack: 'stack1',
      });
    }
    if (interestByGroup.some(v => v > 0)) {
      datasets.push({
        type: 'bar',
        label: 'Interest Paid',
        data: interestByGroup,
        backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--chart-bar-interest').trim() || '#6366F1',
        borderRadius: 8,
        barPercentage: 0.7,
        categoryPercentage: 0.7,
        borderSkipped: false,
        stack: 'stack1',
      });
    }
    // Add total outflow as a line
    datasets.push({
      type: 'line',
      label: 'Total Outflow (EMI + Extra)',
      data: outflowByGroup,
      borderColor: getComputedStyle(document.documentElement).getPropertyValue('--chart-line-outflow').trim() || '#EF4444',
      backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--chart-line-outflow-bg').trim() || 'rgba(239, 68, 68, 0.15)',
      borderWidth: 3,
      pointRadius: 4,
      pointBackgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--chart-line-outflow').trim() || '#EF4444',
      fill: false,
      yAxisID: 'y',
      tension: 0.3,
      order: 0,
    });
    return { labels, datasets };
  }, [schedule, view, monthsPerGroup, groups, labels]);

  // Milestone: 50% principal paid, ₹1L interest saved
  const totalPrincipal = schedule.reduce((sum, row) => sum + row.principalPaid, 0);
  let milestone50 = null, milestone1L = null, runningPrincipal = 0, runningInterest = 0;
  for (let i = 0; i < schedule.length; ++i) {
    runningPrincipal += schedule[i].principalPaid;
    runningInterest += schedule[i].interest;
    if (!milestone50 && runningPrincipal >= totalPrincipal / 2) milestone50 = i;
    if (!milestone1L && runningInterest >= 100000) milestone1L = i;
    if (milestone50 && milestone1L) break;
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: 'var(--color-primary)',
          font: { family: 'Poppins, Arial, sans-serif', size: 16, weight: 700 },
          boxWidth: 20,
          padding: 20,
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
            return `${context.dataset.label}: ₹${Math.round(context.parsed.y).toLocaleString('en-IN')}`;
          },
        },
        padding: 14,
        caretSize: 8,
        cornerRadius: 8,
      },
      title: {
        display: true,
        text: 'Yearly Principal, Interest, and Total Outflow',
        color: 'var(--color-primary)',
        font: { family: 'Poppins, Arial, sans-serif', size: 18, weight: 700 },
        padding: { top: 10, bottom: 20 },
      },
      subtitle: {
        display: true,
        text: 'Y-axis: Total paid per year (EMI + extra), with principal and interest breakdown.',
        color: 'var(--color-secondary)',
        font: { family: 'Poppins, Arial, sans-serif', size: 14, weight: 400 },
        padding: { bottom: 10 },
      },
    },
    layout: {
      padding: { left: 16, right: 16, top: 16, bottom: 16 },
    },
    scales: {
      x: {
        stacked: true,
        title: {
          display: true,
          text: 'Year',
          color: 'var(--color-secondary)',
          font: { family: 'Poppins, Arial, sans-serif', size: 15, weight: 600 },
        },
        ticks: {
          color: 'var(--color-secondary)',
          font: { family: 'Poppins, Arial, sans-serif', size: 14 },
          maxRotation: 0,
          minRotation: 0,
        },
        grid: {
          color: 'var(--color-grid)',
          borderColor: 'var(--color-grid-border)',
        },
      },
      y: {
        stacked: true,
        title: {
          display: true,
          text: 'Amount Paid (₹) per Year',
          color: 'var(--color-secondary)',
          font: { family: 'Poppins, Arial, sans-serif', size: 15, weight: 600 },
        },
        ticks: {
          color: 'var(--color-secondary)',
          font: { family: 'Poppins, Arial, sans-serif', size: 14 },
          callback: function(value) {
            return `₹${Math.round(Number(value)).toLocaleString('en-IN')}`;
          },
        },
        grid: {
          color: 'var(--color-grid)',
          borderColor: 'var(--color-grid-border)',
        },
        beginAtZero: true,
        suggestedMin: 0,
        suggestedMax: chartData && chartData.datasets.length > 0
          ? Math.ceil(Math.max(...chartData.datasets.flatMap(ds => ds.data)) / 100000) * 100000
          : undefined,
      },
    },
    animation: {
      duration: 900,
      easing: 'easeOutCubic',
    },
    elements: {
      bar: {
        borderRadius: 8,
      },
    },
  };

  // Render
  if (!chartData) return (
    <div style={{ textAlign: 'center', color: 'var(--color-secondary)', padding: 32, fontSize: 18 }}>
      No data to display.
    </div>
  );

  return (
    <div style={{ width: '100%', maxWidth: 1400, minWidth: 700, margin: '0 auto', background: 'var(--color-bg)', borderRadius: 24, boxShadow: 'var(--shadow-elevation)', padding: 40, display: 'flex', flexDirection: 'column', gap: 32, alignItems: 'center', justifyContent: 'center', overflowX: 'auto', transition: 'background 0.3s, color 0.3s' }}>
      {/* Pie/Donut Chart */}
      <div style={{ width: 340, maxWidth: '100%', margin: '0 auto' }}>
        <AmortizationPie schedule={schedule} />
      </div>
      {/* Main Chart + Controls */}
      <div style={{ width: '100%', maxWidth: 1200, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
          <button onClick={() => setView('year')} style={{ fontWeight: view==='year'?700:400, background: view==='year'?'#e3f2fd':'#fff', color: 'var(--color-primary)', border: '1px solid #3B82F6', borderRadius: 8, padding: '6px 18px', cursor: 'pointer' }}>Yearly</button>
          <button onClick={() => setView('quarter')} style={{ fontWeight: view==='quarter'?700:400, background: view==='quarter'?'#e3f2fd':'#fff', color: 'var(--color-primary)', border: '1px solid #3B82F6', borderRadius: 8, padding: '6px 18px', cursor: 'pointer' }}>Quarterly</button>
          <Tooltip title="Interest is compounded monthly. Extra payments reduce interest and tenure.">
            <IconButton size="small" sx={{ ml: 1 }} tabIndex={0} aria-label="Chart info">
              <InfoOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <input type="range" min={0} max={groups-1} value={brush[0]} onChange={handleBrush} style={{ flex: 1, marginLeft: 24, marginRight: 8, minWidth: 120 }} aria-label="Select year/quarter" />
          <span style={{ minWidth: 80, fontWeight: 600, color: 'var(--color-secondary)' }}>{labels[brush[0]]}</span>
        </div>
        <div style={{ width: '100%', minWidth: 700, height: 400, position: 'relative' }}>
          <Suspense fallback={<div style={{textAlign:'center',padding:40}}>Loading chart…</div>}>
            <Bar data={chartData} options={{
              ...options,
              plugins: {
                ...options.plugins,
                annotation: {
                  annotations: [
                    milestone50 !== null ? {
                      type: 'line',
                      scaleID: 'x',
                      value: Math.floor(milestone50 / monthsPerGroup),
                      borderColor: '#10B981',
                      borderWidth: 3,
                      label: {
                        content: '50% Principal Paid',
                        enabled: true,
                        position: 'start',
                        color: '#10B981',
                        font: { weight: 700 },
                        backgroundColor: '#fff',
                        borderRadius: 6,
                        padding: 6,
                      },
                    } : null,
                    milestone1L !== null ? {
                      type: 'line',
                      scaleID: 'x',
                      value: Math.floor(milestone1L / monthsPerGroup),
                      borderColor: '#EF4444',
                      borderWidth: 3,
                      label: {
                        content: '₹1L Interest Paid',
                        enabled: true,
                        position: 'end',
                        color: '#EF4444',
                        font: { weight: 700 },
                        backgroundColor: '#fff',
                        borderRadius: 6,
                        padding: 6,
                      },
                    } : null,
                  ].filter(Boolean),
                },
              },
            }} height={400} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

export default AmortizationChart;
