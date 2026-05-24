import { useState, useRef } from "react";

const INITIAL_EMPLOYEES = [
  { id: 1, name: "Budi Santoso", position: "Software Engineer", department: "Engineering", baseSalary: 12000000 },
  { id: 2, name: "Sari Dewi", position: "Marketing Manager", department: "Marketing", baseSalary: 10000000 },
  { id: 3, name: "Andi Wijaya", position: "HR Specialist", department: "Human Resources", baseSalary: 8500000 },
];

const formatRupiah = (num) =>
  "Rp " + Number(num).toLocaleString("id-ID");

const MONTHS = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];

export default function App() {
  const [page, setPage] = useState("dashboard"); // dashboard | payroll | employees | slip
  const [employees, setEmployees] = useState(INITIAL_EMPLOYEES);
  const [selectedMonth, setSelectedMonth] = useState(4);
  const [selectedYear, setSelectedYear] = useState(2026);
  const [payrollData, setPayrollData] = useState({});
  const [slipEmployee, setSlipEmployee] = useState(null);
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [newEmp, setNewEmp] = useState({ name: "", position: "", department: "", baseSalary: "" });
  const slipRef = useRef();

  const getPayroll = (empId) => {
    const key = `${empId}-${selectedMonth}-${selectedYear}`;
    return payrollData[key] || {
      tunjangan: 0, bonus: 0, lembur: 0,
      bpjsKesehatan: 0, bpjsTk: 0, pph21: 0, potonganLain: 0,
      hadir: 22, cuti: 0, sakit: 0
    };
  };

  const setPayroll = (empId, data) => {
    const key = `${empId}-${selectedMonth}-${selectedYear}`;
    setPayrollData(prev => ({ ...prev, [key]: data }));
  };

  const calcGross = (emp, pr) =>
    Number(emp.baseSalary) + Number(pr.tunjangan||0) + Number(pr.bonus||0) + Number(pr.lembur||0);

  const calcDeductions = (pr) =>
    Number(pr.bpjsKesehatan||0) + Number(pr.bpjsTk||0) + Number(pr.pph21||0) + Number(pr.potonganLain||0);

  const calcNet = (emp, pr) => calcGross(emp, pr) - calcDeductions(pr);

  const handlePrint = () => {
    window.print();
  };

  const addEmployee = () => {
    if (!newEmp.name || !newEmp.position || !newEmp.department || !newEmp.baseSalary) return;
    setEmployees(prev => [...prev, { ...newEmp, id: Date.now(), baseSalary: Number(newEmp.baseSalary) }]);
    setNewEmp({ name: "", position: "", department: "", baseSalary: "" });
    setShowAddEmployee(false);
  };

  const openSlip = (emp) => {
    setSlipEmployee(emp);
    setPage("slip");
  };

  const totalPayroll = employees.reduce((sum, emp) => sum + calcNet(emp, getPayroll(emp.id)), 0);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Syne:wght@700;800&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          font-family: 'Plus Jakarta Sans', sans-serif;
          background: #0a0f1e;
          color: #e2e8f0;
          min-height: 100vh;
        }

        .app { display: flex; min-height: 100vh; }

        /* SIDEBAR */
        .sidebar {
          width: 240px;
          background: #0d1427;
          border-right: 1px solid rgba(255,255,255,0.06);
          display: flex;
          flex-direction: column;
          padding: 28px 0;
          position: fixed;
          top: 0; left: 0; bottom: 0;
          z-index: 100;
        }
        .sidebar-logo {
          padding: 0 24px 32px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .logo-text {
          font-family: 'Syne', sans-serif;
          font-size: 20px;
          font-weight: 800;
          background: linear-gradient(135deg, #60a5fa, #a78bfa);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          letter-spacing: -0.5px;
        }
        .logo-sub {
          font-size: 11px;
          color: #64748b;
          margin-top: 2px;
          letter-spacing: 1.5px;
          text-transform: uppercase;
        }
        .nav { padding: 20px 12px; flex: 1; }
        .nav-label {
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          color: #475569;
          padding: 0 12px;
          margin-bottom: 8px;
          margin-top: 20px;
        }
        .nav-label:first-child { margin-top: 0; }
        .nav-item {
          display: flex; align-items: center; gap: 10px;
          padding: 10px 12px;
          border-radius: 10px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          color: #64748b;
          transition: all 0.15s;
          margin-bottom: 2px;
        }
        .nav-item:hover { background: rgba(255,255,255,0.04); color: #94a3b8; }
        .nav-item.active {
          background: linear-gradient(135deg, rgba(96,165,250,0.15), rgba(167,139,250,0.15));
          color: #93c5fd;
          border: 1px solid rgba(96,165,250,0.2);
        }
        .nav-icon { font-size: 16px; width: 20px; text-align: center; }

        .sidebar-footer {
          padding: 16px 24px;
          border-top: 1px solid rgba(255,255,255,0.06);
          font-size: 12px;
          color: #475569;
        }

        /* MAIN */
        .main {
          flex: 1;
          margin-left: 240px;
          padding: 32px 36px;
          min-height: 100vh;
        }

        /* PAGE HEADER */
        .page-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 32px;
        }
        .page-title {
          font-family: 'Syne', sans-serif;
          font-size: 26px;
          font-weight: 800;
          color: #f1f5f9;
          letter-spacing: -0.5px;
        }
        .page-subtitle { font-size: 14px; color: #64748b; margin-top: 4px; }

        /* CARDS */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 28px;
        }
        .stat-card {
          background: #0d1427;
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 16px;
          padding: 22px;
          position: relative;
          overflow: hidden;
        }
        .stat-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 2px;
          background: var(--accent, linear-gradient(90deg, #60a5fa, #a78bfa));
        }
        .stat-label { font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px; }
        .stat-value { font-family: 'Syne', sans-serif; font-size: 24px; font-weight: 800; color: #f1f5f9; }
        .stat-sub { font-size: 12px; color: #475569; margin-top: 6px; }

        /* TABLE */
        .card {
          background: #0d1427;
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 16px;
          overflow: hidden;
          margin-bottom: 20px;
        }
        .card-header {
          padding: 20px 24px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .card-title { font-size: 15px; font-weight: 700; color: #f1f5f9; }

        table { width: 100%; border-collapse: collapse; }
        thead tr { background: rgba(255,255,255,0.02); }
        th {
          padding: 12px 16px;
          text-align: left;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #475569;
          font-weight: 600;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        td {
          padding: 14px 16px;
          font-size: 14px;
          color: #cbd5e1;
          border-bottom: 1px solid rgba(255,255,255,0.04);
        }
        tr:last-child td { border-bottom: none; }
        tr:hover td { background: rgba(255,255,255,0.02); }

        /* BADGE */
        .badge {
          display: inline-block;
          padding: 3px 10px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 600;
        }
        .badge-blue { background: rgba(96,165,250,0.15); color: #93c5fd; }
        .badge-purple { background: rgba(167,139,250,0.15); color: #c4b5fd; }
        .badge-green { background: rgba(52,211,153,0.15); color: #6ee7b7; }
        .badge-orange { background: rgba(251,146,60,0.15); color: #fdba74; }

        /* BUTTONS */
        .btn {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 9px 18px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          border: none;
          transition: all 0.15s;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
        .btn-primary {
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          color: white;
        }
        .btn-primary:hover { opacity: 0.9; transform: translateY(-1px); }
        .btn-ghost {
          background: rgba(255,255,255,0.05);
          color: #94a3b8;
          border: 1px solid rgba(255,255,255,0.08);
        }
        .btn-ghost:hover { background: rgba(255,255,255,0.08); }
        .btn-sm { padding: 6px 12px; font-size: 12px; }
        .btn-danger {
          background: rgba(239,68,68,0.15);
          color: #f87171;
          border: 1px solid rgba(239,68,68,0.2);
        }
        .btn-success {
          background: rgba(52,211,153,0.15);
          color: #6ee7b7;
          border: 1px solid rgba(52,211,153,0.2);
        }
        .btn-success:hover { background: rgba(52,211,153,0.25); }

        /* MONTH SELECTOR */
        .period-selector {
          display: flex;
          align-items: center;
          gap: 12px;
          background: #0d1427;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px;
          padding: 8px 16px;
        }
        .period-selector select {
          background: transparent;
          border: none;
          color: #e2e8f0;
          font-size: 14px;
          font-weight: 600;
          font-family: 'Plus Jakarta Sans', sans-serif;
          cursor: pointer;
          outline: none;
        }
        .period-selector select option { background: #1e293b; }

        /* FORM */
        .form-group { margin-bottom: 16px; }
        .form-label { font-size: 12px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; display: block; }
        .form-input {
          width: 100%;
          background: #0a0f1e;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px;
          padding: 10px 14px;
          font-size: 14px;
          color: #e2e8f0;
          font-family: 'Plus Jakarta Sans', sans-serif;
          outline: none;
          transition: border-color 0.15s;
        }
        .form-input:focus { border-color: rgba(96,165,250,0.5); }

        /* PAYROLL EDITOR */
        .payroll-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
        .payroll-section {
          background: #0a0f1e;
          border-radius: 12px;
          padding: 20px;
          border: 1px solid rgba(255,255,255,0.05);
        }
        .payroll-section-title {
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 14px;
        }
        .income-title { color: #6ee7b7; }
        .deduction-title { color: #f87171; }
        .salary-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 0;
          border-bottom: 1px solid rgba(255,255,255,0.04);
          font-size: 13px;
        }
        .salary-row:last-child { border-bottom: none; }
        .salary-row-label { color: #94a3b8; }
        .salary-row-value { color: #e2e8f0; font-weight: 600; }
        .salary-total {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 14px;
          border-radius: 10px;
          margin-top: 16px;
          font-weight: 700;
          font-size: 15px;
        }
        .total-net {
          background: linear-gradient(135deg, rgba(96,165,250,0.15), rgba(167,139,250,0.15));
          border: 1px solid rgba(96,165,250,0.2);
          color: #93c5fd;
        }
        .total-gross { background: rgba(52,211,153,0.1); border: 1px solid rgba(52,211,153,0.2); color: #6ee7b7; }
        .total-deduct { background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.2); color: #f87171; }

        /* MODAL */
        .modal-overlay {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 200;
          backdrop-filter: blur(4px);
        }
        .modal {
          background: #0d1427;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 20px;
          padding: 32px;
          width: 480px;
          max-width: 90vw;
        }
        .modal-title { font-family: 'Syne', sans-serif; font-size: 20px; font-weight: 800; color: #f1f5f9; margin-bottom: 24px; }

        /* SLIP */
        .slip-page {
          max-width: 740px;
        }
        .slip-card {
          background: white;
          color: #1e293b;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 25px 60px rgba(0,0,0,0.5);
        }
        .slip-header {
          background: linear-gradient(135deg, #1e3a8a, #312e81);
          padding: 32px 40px;
          color: white;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }
        .slip-company { font-family: 'Syne', sans-serif; font-size: 22px; font-weight: 800; letter-spacing: -0.5px; }
        .slip-company-sub { font-size: 12px; opacity: 0.7; margin-top: 4px; }
        .slip-badge {
          background: rgba(255,255,255,0.15);
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 8px;
          padding: 8px 16px;
          font-size: 12px;
          font-weight: 700;
          text-align: center;
          backdrop-filter: blur(10px);
        }
        .slip-body { padding: 32px 40px; }
        .slip-emp-info {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          background: #f8fafc;
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 28px;
        }
        .slip-emp-row { display: flex; flex-direction: column; gap: 3px; }
        .slip-emp-label { font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #94a3b8; font-weight: 600; }
        .slip-emp-value { font-size: 14px; font-weight: 700; color: #1e293b; }
        .slip-table { width: 100%; margin-bottom: 20px; }
        .slip-table th {
          background: #f1f5f9;
          color: #475569;
          font-size: 11px;
          padding: 10px 14px;
          text-align: left;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border: none;
        }
        .slip-table td {
          padding: 10px 14px;
          font-size: 13px;
          color: #334155;
          border-bottom: 1px solid #f1f5f9;
          border-top: none;
        }
        .slip-table tr:hover td { background: transparent; }
        .slip-total-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px;
          border-radius: 10px;
          margin-bottom: 10px;
        }
        .slip-total-label { font-size: 13px; font-weight: 700; }
        .slip-total-val { font-size: 15px; font-weight: 800; }
        .slip-net-row {
          background: linear-gradient(135deg, #1e3a8a, #312e81);
          color: white;
          border-radius: 12px;
          padding: 20px 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 16px;
        }
        .slip-net-label { font-size: 14px; font-weight: 700; opacity: 0.9; }
        .slip-net-value { font-family: 'Syne', sans-serif; font-size: 22px; font-weight: 800; }
        .slip-footer {
          border-top: 1px solid #e2e8f0;
          padding: 20px 40px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 11px;
          color: #94a3b8;
        }
        .slip-sign {
          text-align: center;
          font-size: 12px;
          color: #64748b;
        }
        .slip-sign-line { width: 140px; border-bottom: 1px dashed #cbd5e1; margin: 40px auto 8px; }
        .attendance-chips {
          display: flex; gap: 8px; margin-bottom: 20px;
        }
        .chip {
          flex: 1;
          background: #f8fafc;
          border-radius: 10px;
          padding: 12px 16px;
          text-align: center;
          font-size: 12px;
          color: #64748b;
        }
        .chip-val { font-size: 20px; font-weight: 800; color: #1e293b; display: block; }

        /* PRINT */
        @media print {
          .sidebar, .page-header, .card:not(.slip-card), .btn, .period-selector, .no-print { display: none !important; }
          .main { margin-left: 0 !important; padding: 0 !important; }
          body { background: white !important; }
          .slip-card { box-shadow: none !important; }
          .slip-page { max-width: 100% !important; }
        }

        /* DIVIDER */
        .divider { height: 1px; background: rgba(255,255,255,0.05); margin: 24px 0; }

        /* EMPTY */
        .empty-state { padding: 60px; text-align: center; color: #475569; font-size: 14px; }
      `}</style>

      <div className="app">
        {/* SIDEBAR */}
        <div className="sidebar">
          <div className="sidebar-logo">
            <div className="logo-text">HRD System</div>
            <div className="logo-sub">PT. Maju Bersama</div>
          </div>
          <div className="nav">
            <div className="nav-label">Menu Utama</div>
            {[
              { id: "dashboard", icon: "⬡", label: "Dashboard" },
              { id: "payroll", icon: "💰", label: "Penggajian" },
              { id: "employees", icon: "👥", label: "Karyawan" },
            ].map(item => (
              <div
                key={item.id}
                className={`nav-item ${page === item.id || (page === "slip" && item.id === "payroll") ? "active" : ""}`}
                onClick={() => setPage(item.id)}
              >
                <span className="nav-icon">{item.icon}</span>
                {item.label}
              </div>
            ))}
          </div>
          <div className="sidebar-footer">
            v1.0 • Mei 2026
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="main">

          {/* ── DASHBOARD ── */}
          {page === "dashboard" && (
            <>
              <div className="page-header">
                <div>
                  <div className="page-title">Dashboard</div>
                  <div className="page-subtitle">Ringkasan data kepegawaian bulan {MONTHS[selectedMonth - 1]} {selectedYear}</div>
                </div>
                <div className="period-selector">
                  <select value={selectedMonth} onChange={e => setSelectedMonth(Number(e.target.value))}>
                    {MONTHS.map((m, i) => <option key={i} value={i+1}>{m}</option>)}
                  </select>
                  <select value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))}>
                    {[2024,2025,2026].map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
              </div>

              <div className="stats-grid">
                {[
                  { label: "Total Karyawan", value: employees.length, sub: "aktif", accent: "linear-gradient(90deg,#60a5fa,#a78bfa)" },
                  { label: "Total Penggajian", value: formatRupiah(totalPayroll), sub: `bulan ini`, accent: "linear-gradient(90deg,#34d399,#059669)" },
                  { label: "Rata-rata Gaji", value: formatRupiah(totalPayroll / employees.length || 0), sub: "per karyawan", accent: "linear-gradient(90deg,#f59e0b,#ef4444)" },
                  { label: "Departemen", value: [...new Set(employees.map(e => e.department))].length, sub: "aktif", accent: "linear-gradient(90deg,#a78bfa,#ec4899)" },
                ].map((s, i) => (
                  <div key={i} className="stat-card" style={{"--accent": s.accent}}>
                    <div className="stat-label">{s.label}</div>
                    <div className="stat-value">{s.value}</div>
                    <div className="stat-sub">{s.sub}</div>
                  </div>
                ))}
              </div>

              <div className="card">
                <div className="card-header">
                  <div className="card-title">Daftar Karyawan & Gaji Pokok</div>
                  <button className="btn btn-primary btn-sm" onClick={() => setPage("payroll")}>Kelola Penggajian →</button>
                </div>
                <table>
                  <thead>
                    <tr>
                      <th>#</th><th>Nama</th><th>Jabatan</th><th>Departemen</th><th>Gaji Pokok</th><th>Take Home Pay</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employees.map((emp, idx) => {
                      const pr = getPayroll(emp.id);
                      return (
                        <tr key={emp.id}>
                          <td style={{color:"#475569"}}>{idx+1}</td>
                          <td><strong style={{color:"#f1f5f9"}}>{emp.name}</strong></td>
                          <td><span className="badge badge-blue">{emp.position}</span></td>
                          <td><span className="badge badge-purple">{emp.department}</span></td>
                          <td>{formatRupiah(emp.baseSalary)}</td>
                          <td><strong style={{color:"#6ee7b7"}}>{formatRupiah(calcNet(emp, pr))}</strong></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* ── PAYROLL ── */}
          {page === "payroll" && (
            <>
              <div className="page-header">
                <div>
                  <div className="page-title">Penggajian</div>
                  <div className="page-subtitle">Input komponen gaji & cetak slip</div>
                </div>
                <div className="period-selector">
                  <select value={selectedMonth} onChange={e => setSelectedMonth(Number(e.target.value))}>
                    {MONTHS.map((m, i) => <option key={i} value={i+1}>{m}</option>)}
                  </select>
                  <select value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))}>
                    {[2024,2025,2026].map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
              </div>

              {employees.map(emp => {
                const pr = getPayroll(emp.id);
                const gross = calcGross(emp, pr);
                const deductions = calcDeductions(pr);
                const net = calcNet(emp, pr);
                return (
                  <div key={emp.id} className="card" style={{marginBottom:20}}>
                    <div className="card-header">
                      <div>
                        <div className="card-title">{emp.name}</div>
                        <div style={{fontSize:12,color:"#64748b",marginTop:3}}>{emp.position} · {emp.department}</div>
                      </div>
                      <div style={{display:"flex",gap:8}}>
                        <button className="btn btn-success btn-sm" onClick={() => openSlip(emp)}>🖨 Cetak Slip PDF</button>
                      </div>
                    </div>
                    <div style={{padding:"20px 24px"}}>
                      <div className="payroll-grid">
                        {/* INCOME */}
                        <div className="payroll-section">
                          <div className="payroll-section-title income-title">✦ Pendapatan</div>
                          <div className="salary-row">
                            <span className="salary-row-label">Gaji Pokok</span>
                            <span className="salary-row-value">{formatRupiah(emp.baseSalary)}</span>
                          </div>
                          {[
                            {key:"tunjangan", label:"Tunjangan"},
                            {key:"bonus", label:"Bonus"},
                            {key:"lembur", label:"Lembur"},
                          ].map(f => (
                            <div key={f.key} className="salary-row" style={{alignItems:"center"}}>
                              <span className="salary-row-label">{f.label}</span>
                              <input
                                className="form-input"
                                style={{width:140,padding:"5px 10px",fontSize:13,textAlign:"right"}}
                                type="number"
                                value={pr[f.key] || ""}
                                placeholder="0"
                                onChange={e => setPayroll(emp.id, {...pr, [f.key]: e.target.value})}
                              />
                            </div>
                          ))}
                          <div className="salary-total total-gross">
                            <span>Total Bruto</span>
                            <span>{formatRupiah(gross)}</span>
                          </div>
                        </div>

                        {/* DEDUCTIONS */}
                        <div className="payroll-section">
                          <div className="payroll-section-title deduction-title">✦ Potongan</div>
                          {[
                            {key:"bpjsKesehatan", label:"BPJS Kesehatan"},
                            {key:"bpjsTk", label:"BPJS Ketenagakerjaan"},
                            {key:"pph21", label:"PPh 21"},
                            {key:"potonganLain", label:"Potongan Lain"},
                          ].map(f => (
                            <div key={f.key} className="salary-row" style={{alignItems:"center"}}>
                              <span className="salary-row-label">{f.label}</span>
                              <input
                                className="form-input"
                                style={{width:140,padding:"5px 10px",fontSize:13,textAlign:"right"}}
                                type="number"
                                value={pr[f.key] || ""}
                                placeholder="0"
                                onChange={e => setPayroll(emp.id, {...pr, [f.key]: e.target.value})}
                              />
                            </div>
                          ))}
                          <div className="salary-row" style={{marginTop:8}}>
                            <span className="salary-row-label">Hari Hadir</span>
                            <input className="form-input" style={{width:60,padding:"5px 10px",fontSize:13,textAlign:"center"}} type="number"
                              value={pr.hadir} onChange={e => setPayroll(emp.id,{...pr,hadir:e.target.value})} />
                          </div>
                          <div className="salary-total total-deduct">
                            <span>Total Potongan</span>
                            <span>- {formatRupiah(deductions)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="salary-total total-net" style={{marginTop:16}}>
                        <span>💳 Take Home Pay — {MONTHS[selectedMonth-1]} {selectedYear}</span>
                        <span style={{fontSize:18}}>{formatRupiah(net)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </>
          )}

          {/* ── EMPLOYEES ── */}
          {page === "employees" && (
            <>
              <div className="page-header">
                <div>
                  <div className="page-title">Manajemen Karyawan</div>
                  <div className="page-subtitle">Data seluruh karyawan aktif</div>
                </div>
                <button className="btn btn-primary" onClick={() => setShowAddEmployee(true)}>+ Tambah Karyawan</button>
              </div>

              <div className="card">
                <table>
                  <thead>
                    <tr><th>#</th><th>Nama</th><th>Jabatan</th><th>Departemen</th><th>Gaji Pokok</th><th>Aksi</th></tr>
                  </thead>
                  <tbody>
                    {employees.map((emp, idx) => (
                      <tr key={emp.id}>
                        <td style={{color:"#475569"}}>{idx+1}</td>
                        <td><strong style={{color:"#f1f5f9"}}>{emp.name}</strong></td>
                        <td><span className="badge badge-blue">{emp.position}</span></td>
                        <td><span className="badge badge-purple">{emp.department}</span></td>
                        <td>{formatRupiah(emp.baseSalary)}</td>
                        <td>
                          <button className="btn btn-danger btn-sm" onClick={() => setEmployees(prev => prev.filter(e => e.id !== emp.id))}>Hapus</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {showAddEmployee && (
                <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowAddEmployee(false)}>
                  <div className="modal">
                    <div className="modal-title">Tambah Karyawan Baru</div>
                    {[
                      {key:"name",label:"Nama Lengkap",placeholder:"Contoh: Rudi Hartono"},
                      {key:"position",label:"Jabatan",placeholder:"Contoh: Staff Keuangan"},
                      {key:"department",label:"Departemen",placeholder:"Contoh: Finance"},
                    ].map(f => (
                      <div key={f.key} className="form-group">
                        <label className="form-label">{f.label}</label>
                        <input className="form-input" placeholder={f.placeholder} value={newEmp[f.key]}
                          onChange={e => setNewEmp(p => ({...p,[f.key]:e.target.value}))} />
                      </div>
                    ))}
                    <div className="form-group">
                      <label className="form-label">Gaji Pokok (Rp)</label>
                      <input className="form-input" type="number" placeholder="Contoh: 8000000" value={newEmp.baseSalary}
                        onChange={e => setNewEmp(p => ({...p,baseSalary:e.target.value}))} />
                    </div>
                    <div style={{display:"flex",gap:10,marginTop:8}}>
                      <button className="btn btn-primary" style={{flex:1}} onClick={addEmployee}>Simpan</button>
                      <button className="btn btn-ghost" onClick={() => setShowAddEmployee(false)}>Batal</button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* ── SLIP ── */}
          {page === "slip" && slipEmployee && (() => {
            const emp = slipEmployee;
            const pr = getPayroll(emp.id);
            const gross = calcGross(emp, pr);
            const deductions = calcDeductions(pr);
            const net = calcNet(emp, pr);
            const slipNo = `SL-${selectedYear}${String(selectedMonth).padStart(2,"0")}-${String(emp.id).padStart(3,"0")}`;
            return (
              <div className="slip-page">
                <div className="page-header no-print">
                  <div>
                    <div className="page-title">Slip Gaji</div>
                    <div className="page-subtitle">{emp.name} · {MONTHS[selectedMonth-1]} {selectedYear}</div>
                  </div>
                  <div style={{display:"flex",gap:10}}>
                    <button className="btn btn-ghost" onClick={() => setPage("payroll")}>← Kembali</button>
                    <button className="btn btn-primary" onClick={handlePrint}>🖨 Export PDF</button>
                  </div>
                </div>

                <div className="slip-card" ref={slipRef}>
                  <div className="slip-header">
                    <div>
                      <div className="slip-company">PT. Maju Bersama</div>
                      <div className="slip-company-sub">Jl. Sudirman No. 123, Jakarta Pusat · (021) 5550-1234</div>
                      <div style={{marginTop:16,fontSize:18,fontWeight:800,letterSpacing:"-0.3px"}}>
                        SLIP GAJI KARYAWAN
                      </div>
                      <div style={{fontSize:12,opacity:0.7,marginTop:4}}>
                        {MONTHS[selectedMonth-1]} {selectedYear}
                      </div>
                    </div>
                    <div className="slip-badge">
                      <div style={{fontSize:10,opacity:0.7,marginBottom:4}}>NO. SLIP</div>
                      <div style={{fontSize:13}}>{slipNo}</div>
                    </div>
                  </div>

                  <div className="slip-body">
                    <div className="slip-emp-info">
                      {[
                        {label:"Nama Karyawan", value:emp.name},
                        {label:"Jabatan", value:emp.position},
                        {label:"Departemen", value:emp.department},
                        {label:"Periode", value:`${MONTHS[selectedMonth-1]} ${selectedYear}`},
                      ].map((item,i) => (
                        <div key={i} className="slip-emp-row">
                          <span className="slip-emp-label">{item.label}</span>
                          <span className="slip-emp-value">{item.value}</span>
                        </div>
                      ))}
                    </div>

                    <div className="attendance-chips">
                      {[
                        {label:"Hari Hadir", val:pr.hadir||22},
                        {label:"Hari Cuti", val:pr.cuti||0},
                        {label:"Hari Sakit", val:pr.sakit||0},
                      ].map((c,i) => (
                        <div key={i} className="chip">
                          <span className="chip-val">{c.val}</span>
                          {c.label}
                        </div>
                      ))}
                    </div>

                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20,marginBottom:20}}>
                      <div>
                        <div style={{fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:"1px",color:"#059669",marginBottom:10}}>Pendapatan</div>
                        <table className="slip-table" style={{color:"#334155"}}>
                          <tbody>
                            {[
                              {label:"Gaji Pokok", val:emp.baseSalary},
                              {label:"Tunjangan", val:pr.tunjangan||0},
                              {label:"Bonus", val:pr.bonus||0},
                              {label:"Lembur", val:pr.lembur||0},
                            ].map((r,i) => (
                              <tr key={i}>
                                <td style={{color:"#475569",fontSize:13,padding:"8px 0",borderBottom:"1px solid #f1f5f9"}}>{r.label}</td>
                                <td style={{textAlign:"right",fontWeight:600,fontSize:13,padding:"8px 0",borderBottom:"1px solid #f1f5f9"}}>{formatRupiah(r.val)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        <div style={{display:"flex",justifyContent:"space-between",padding:"10px 0",borderTop:"2px solid #059669",marginTop:4,fontWeight:800,color:"#059669"}}>
                          <span>Total Bruto</span><span>{formatRupiah(gross)}</span>
                        </div>
                      </div>

                      <div>
                        <div style={{fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:"1px",color:"#ef4444",marginBottom:10}}>Potongan</div>
                        <table className="slip-table" style={{color:"#334155"}}>
                          <tbody>
                            {[
                              {label:"BPJS Kesehatan", val:pr.bpjsKesehatan||0},
                              {label:"BPJS Ketenagakerjaan", val:pr.bpjsTk||0},
                              {label:"PPh 21", val:pr.pph21||0},
                              {label:"Potongan Lain", val:pr.potonganLain||0},
                            ].map((r,i) => (
                              <tr key={i}>
                                <td style={{color:"#475569",fontSize:13,padding:"8px 0",borderBottom:"1px solid #f1f5f9"}}>{r.label}</td>
                                <td style={{textAlign:"right",fontWeight:600,fontSize:13,padding:"8px 0",borderBottom:"1px solid #f1f5f9"}}>{formatRupiah(r.val)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        <div style={{display:"flex",justifyContent:"space-between",padding:"10px 0",borderTop:"2px solid #ef4444",marginTop:4,fontWeight:800,color:"#ef4444"}}>
                          <span>Total Potongan</span><span>- {formatRupiah(deductions)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="slip-net-row">
                      <div>
                        <div className="slip-net-label">TOTAL TAKE HOME PAY</div>
                        <div style={{fontSize:11,opacity:0.6,marginTop:2}}>Gaji Bersih yang Diterima</div>
                      </div>
                      <div className="slip-net-value">{formatRupiah(net)}</div>
                    </div>
                  </div>

                  <div className="slip-footer">
                    <div>
                      <div>Diterbitkan oleh HRD PT. Maju Bersama</div>
                      <div style={{marginTop:3}}>Dokumen ini sah tanpa tanda tangan basah</div>
                    </div>
                    <div style={{display:"flex",gap:60}}>
                      <div className="slip-sign">
                        <div className="slip-sign-line" />
                        <div>HRD Manager</div>
                        <div style={{color:"#94a3b8",marginTop:2}}>PT. Maju Bersama</div>
                      </div>
                      <div className="slip-sign">
                        <div className="slip-sign-line" />
                        <div>{emp.name}</div>
                        <div style={{color:"#94a3b8",marginTop:2}}>Karyawan</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    </>
  );
}
