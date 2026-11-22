export default function EnergyMeter({ energy }) {
  return (
    <div className="energy-meter visible" id="energyMeter" aria-label={`Shaadi energy: ${energy}%`}>
      <span className="energy-label">Shaadi Energy</span>
      <div className="energy-track">
        <div className="energy-fill" id="energyFill" style={{ width: `${energy}%` }} />
      </div>
      <span className="energy-pct" id="energyPct">{energy}%</span>
    </div>
  );
}
