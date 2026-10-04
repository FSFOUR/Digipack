import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useErp } from '../../context/ErpDataContext';
import { Employee, AttendanceRecord } from '../../types/erp';
import { DigiPackLogo } from '../common/DigiPackLogo';
import { StatusBadge } from '../common/StatusBadge';
import {
  UserSquare2,
  Calendar,
  Clock,
  Printer,
  Plus,
  CheckCircle2,
  DollarSign,
  Download,
  X,
  Lock,
} from 'lucide-react';

export const HrModule: React.FC = () => {
  const { role } = useAuth();
  const isGuest = role === 'VIEW ONLY';
  const { employees, attendance, markAttendance } = useErp();

  const [activeTab, setActiveTab] = useState<'EMPLOYEES' | 'ATTENDANCE' | 'PAYROLL'>('EMPLOYEES');
  const [selectedEmpForPayslip, setSelectedEmpForPayslip] = useState<Employee | null>(null);

  // Daily attendance state for today
  const [attendanceSheet, setAttendanceSheet] = useState<
    { employeeId: string; status: AttendanceRecord['status']; otHours: number }[]
  >(() =>
    employees.map((e) => ({
      employeeId: e.employeeId,
      status: 'PRESENT',
      otHours: e.otEligible ? 1.5 : 0,
    }))
  );

  const handleStatusToggle = (empId: string, status: AttendanceRecord['status']) => {
    setAttendanceSheet((prev) =>
      prev.map((a) => (a.employeeId === empId ? { ...a, status } : a))
    );
  };

  const handleOtChange = (empId: string, otHours: number) => {
    setAttendanceSheet((prev) =>
      prev.map((a) => (a.employeeId === empId ? { ...a, otHours } : a))
    );
  };

  const handleSaveAttendance = async () => {
    await markAttendance(attendanceSheet);
    alert('Daily attendance successfully recorded!');
  };

  // Payroll Calculation
  const calculatePayroll = (emp: Employee) => {
    const basic = emp.basicSalary;
    const allowances = Math.round(basic * 0.15); // HRA & Conveynance
    const otRatePerHour = (basic / 200) * 1.5;
    const estimatedOtHours = emp.otEligible ? 26 : 0;
    const otPay = Math.round(otRatePerHour * estimatedOtHours);
    const deductions = Math.round(basic * 0.08); // PF & ESI
    const netSalary = basic + allowances + otPay - deductions;

    return {
      basic,
      allowances,
      estimatedOtHours,
      otPay,
      deductions,
      netSalary,
    };
  };

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-4 rounded-xl border border-neutral-200 shadow-xs">
        <div>
          <h2 className="text-lg font-black tracking-tight text-neutral-900 flex items-center gap-2">
            <UserSquare2 className="w-5 h-5 text-red-600" />
            Human Resources, Daily Attendance & Payroll
          </h2>
          <p className="text-xs text-neutral-500">
            DIGI PACK Staff Directory · Overtime Logs · Department Allocations · Printable Payslips
          </p>
        </div>

        <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('EMPLOYEES')}
            className={`px-3 py-1.5 text-xs font-bold rounded transition-colors ${
              activeTab === 'EMPLOYEES' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600'
            }`}
          >
            Employees ({employees.length})
          </button>
          <button
            onClick={() => setActiveTab('ATTENDANCE')}
            className={`px-3 py-1.5 text-xs font-bold rounded transition-colors ${
              activeTab === 'ATTENDANCE' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600'
            }`}
          >
            Daily Attendance
          </button>
          <button
            onClick={() => setActiveTab('PAYROLL')}
            className={`px-3 py-1.5 text-xs font-bold rounded transition-colors ${
              activeTab === 'PAYROLL' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600'
            }`}
          >
            Monthly Payroll
          </button>
        </div>
      </div>

      {/* Employees Directory Tab */}
      {activeTab === 'EMPLOYEES' && (
        <div className="bg-white rounded-xl border border-neutral-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto custom-scrollbar-x custom-scrollbar max-h-[600px] overflow-y-auto">
            <table className="w-full min-w-[760px] text-left text-xs border-collapse">
              <thead>
                <tr className="bg-neutral-900 text-white font-bold tracking-wider uppercase text-[11px]">
                  <th className="p-3">Staff ID</th>
                  <th className="p-3">Full Name & Contact</th>
                  <th className="p-3">Department</th>
                  <th className="p-3">Designation</th>
                  <th className="p-3">Joining Date</th>
                  <th className="p-3 text-right">Basic Monthly Salary</th>
                  <th className="p-3">OT Eligibility</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Salary Slip</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {employees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="p-3 font-black text-sm text-red-600">{emp.employeeId}</td>
                    <td className="p-3">
                      <div className="font-bold text-neutral-900">{emp.name}</div>
                      <div className="text-[11px] text-neutral-500">{emp.mobile}</div>
                    </td>
                    <td className="p-3 font-semibold text-neutral-800">{emp.department}</td>
                    <td className="p-3 font-medium text-neutral-700">{emp.designation}</td>
                    <td className="p-3 font-medium text-neutral-600">{emp.joiningDate}</td>
                    <td className="p-3 text-right font-black tabular-nums text-neutral-900 text-sm">
                      ₹{emp.basicSalary.toLocaleString('en-IN')}
                    </td>
                    <td className="p-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          emp.otEligible
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-neutral-100 text-neutral-600'
                        }`}
                      >
                        {emp.otEligible ? 'ELIGIBLE' : 'N/A'}
                      </span>
                    </td>
                    <td className="p-3">
                      <StatusBadge status={emp.employmentStatus} size="sm" />
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => setSelectedEmpForPayslip(emp)}
                        className="px-2.5 py-1 bg-neutral-900 hover:bg-black text-white rounded font-bold text-[11px] inline-flex items-center gap-1"
                      >
                        <Printer className="w-3.5 h-3.5" /> Payslip
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Attendance Tab */}
      {activeTab === 'ATTENDANCE' && (
        <div className="bg-white rounded-xl border border-neutral-200 shadow-xs p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-neutral-100 gap-3">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900">
                Daily Shift Attendance Roster
              </h3>
              <p className="text-xs text-neutral-500">
                Date: {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>

            <button
              onClick={() => {
                if (isGuest) {
                  alert('Action locked: Saving attendance is disabled in Guest (View Only) mode.');
                  return;
                }
                handleSaveAttendance();
              }}
              disabled={isGuest}
              className={`px-4 py-2 rounded text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-xs ${
                isGuest
                  ? 'bg-neutral-200 text-neutral-500 cursor-not-allowed'
                  : 'bg-red-600 hover:bg-red-700 text-white'
              }`}
              title={isGuest ? 'Locked in Guest Mode' : 'Save Daily Roster'}
            >
              {isGuest ? <Lock className="w-4 h-4 text-amber-600" /> : <CheckCircle2 className="w-4 h-4" />}
              <span>Save Daily Roster</span>
            </button>
          </div>

          <div className="border border-neutral-200 rounded-lg overflow-x-auto custom-scrollbar-x custom-scrollbar max-h-[550px] overflow-y-auto text-xs">
            <table className="w-full min-w-[650px] text-left border-collapse">
              <thead>
                <tr className="bg-neutral-100 border-b border-neutral-200 font-bold text-neutral-700 text-[11px] uppercase">
                  <th className="p-2.5">Employee ID & Name</th>
                  <th className="p-2.5">Department</th>
                  <th className="p-2.5">Attendance Status</th>
                  <th className="p-2.5 w-32">Overtime (Hours)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {employees.map((emp) => {
                  const entry = attendanceSheet.find((a) => a.employeeId === emp.employeeId);
                  const currentStatus = entry?.status || 'PRESENT';

                  return (
                    <tr key={emp.id} className="hover:bg-neutral-50">
                      <td className="p-2.5">
                        <span className="font-bold text-neutral-900">{emp.name}</span>
                        <span className="text-[11px] text-neutral-500 block">{emp.employeeId} · {emp.designation}</span>
                      </td>
                      <td className="p-2.5 font-semibold text-neutral-700">{emp.department}</td>
                      <td className="p-2.5">
                        <div className="flex items-center gap-1">
                          {(['PRESENT', 'HALF_DAY', 'LEAVE', 'ABSENT'] as const).map((st) => (
                            <button
                              key={st}
                              type="button"
                              onClick={() => handleStatusToggle(emp.employeeId, st)}
                              className={`px-2.5 py-1 rounded text-[11px] font-bold transition-colors ${
                                currentStatus === st
                                  ? st === 'PRESENT'
                                    ? 'bg-emerald-600 text-white'
                                    : st === 'HALF_DAY'
                                    ? 'bg-amber-600 text-white'
                                    : 'bg-rose-600 text-white'
                                  : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
                              }`}
                            >
                              {st.replace('_', ' ')}
                            </button>
                          ))}
                        </div>
                      </td>
                      <td className="p-2.5">
                        <input
                          type="number"
                          step="0.5"
                          min="0"
                          max="8"
                          value={entry?.otHours || 0}
                          onChange={(e) => handleOtChange(emp.employeeId, parseFloat(e.target.value) || 0)}
                          className="w-20 p-1 bg-neutral-50 border border-neutral-300 rounded text-center text-xs font-bold"
                          disabled={!emp.otEligible}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Monthly Payroll Tab */}
      {activeTab === 'PAYROLL' && (
        <div className="bg-white rounded-xl border border-neutral-200 shadow-xs overflow-hidden">
          <div className="p-3 bg-neutral-900 text-white font-bold text-xs flex justify-between items-center">
            <span>Monthly Payroll Sheet (Duplex Factory Shift Staff)</span>
            <span className="text-[11px] text-neutral-400 font-normal">Salary Month: September 2026</span>
          </div>

          <div className="overflow-x-auto custom-scrollbar-x custom-scrollbar max-h-[550px] overflow-y-auto">
            <table className="w-full min-w-[700px] text-left text-xs border-collapse">
              <thead>
                <tr className="bg-neutral-100 font-bold text-neutral-700 border-b border-neutral-200 text-[11px] uppercase">
                  <th className="p-3">Staff ID & Name</th>
                  <th className="p-3">Designation</th>
                  <th className="p-3 text-right">Basic (₹)</th>
                  <th className="p-3 text-right">Allowances (₹)</th>
                  <th className="p-3 text-right">OT Pay (₹)</th>
                  <th className="p-3 text-right text-rose-600">Deductions (₹)</th>
                  <th className="p-3 text-right text-emerald-700">Net Salary (₹)</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {employees.map((emp) => {
                  const p = calculatePayroll(emp);
                  return (
                    <tr key={emp.id} className="hover:bg-neutral-50">
                      <td className="p-3">
                        <div className="font-bold text-neutral-900">{emp.name}</div>
                        <div className="text-[11px] text-neutral-500">{emp.employeeId}</div>
                      </td>
                      <td className="p-3 font-medium text-neutral-700">{emp.designation}</td>
                      <td className="p-3 text-right font-medium tabular-nums text-neutral-800">
                        ₹{p.basic.toLocaleString('en-IN')}
                      </td>
                      <td className="p-3 text-right font-medium tabular-nums text-neutral-800">
                        ₹{p.allowances.toLocaleString('en-IN')}
                      </td>
                      <td className="p-3 text-right font-medium tabular-nums text-neutral-800">
                        ₹{p.otPay.toLocaleString('en-IN')}
                      </td>
                      <td className="p-3 text-right font-medium tabular-nums text-rose-600">
                        -₹{p.deductions.toLocaleString('en-IN')}
                      </td>
                      <td className="p-3 text-right font-black tabular-nums text-emerald-700 text-sm">
                        ₹{p.netSalary.toLocaleString('en-IN')}
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => setSelectedEmpForPayslip(emp)}
                          className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded font-bold text-[11px]"
                        >
                          View Payslip
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Printable Payslip Modal */}
      {selectedEmpForPayslip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg bg-white rounded-xl shadow-2xl border border-neutral-300 p-6 max-h-[90vh] overflow-y-auto">
            {/* Payslip Header */}
            <div className="flex justify-between items-start border-b border-black pb-4 mb-4">
              <div className="w-48">
                <DigiPackLogo size="md" />
              </div>
              <div className="text-right text-[10px] text-neutral-700">
                <p className="font-bold text-neutral-900">SALARY SLIP — SEP 2026</p>
                <p>1/426 G, Kakkanchery, Malappuram</p>
              </div>
            </div>

            {/* Employee details */}
            <div className="grid grid-cols-2 gap-2 text-xs border border-neutral-300 p-3 rounded mb-4">
              <div>Employee Name: <strong>{selectedEmpForPayslip.name}</strong></div>
              <div>Staff ID: <strong>{selectedEmpForPayslip.employeeId}</strong></div>
              <div>Department: <strong>{selectedEmpForPayslip.department}</strong></div>
              <div>Designation: <strong>{selectedEmpForPayslip.designation}</strong></div>
              <div className="col-span-2 text-[11px] text-neutral-600 truncate">
                Bank A/C: {selectedEmpForPayslip.bankDetails}
              </div>
            </div>

            {/* Salary Breakdown Table */}
            {(() => {
              const p = calculatePayroll(selectedEmpForPayslip);
              return (
                <div className="space-y-4">
                  <table className="w-full text-xs border border-black border-collapse">
                    <thead>
                      <tr className="bg-neutral-100 border-b border-black font-bold">
                        <th className="p-2 border-r border-black">Earnings</th>
                        <th className="p-2 text-right border-r border-black">Amount</th>
                        <th className="p-2 border-r border-black">Deductions</th>
                        <th className="p-2 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-neutral-300">
                        <td className="p-2 border-r border-black">Basic Salary</td>
                        <td className="p-2 text-right border-r border-black tabular-nums">₹{p.basic.toLocaleString('en-IN')}</td>
                        <td className="p-2 border-r border-black">Provident Fund (PF)</td>
                        <td className="p-2 text-right tabular-nums">₹{Math.round(p.deductions * 0.7).toLocaleString('en-IN')}</td>
                      </tr>
                      <tr className="border-b border-neutral-300">
                        <td className="p-2 border-r border-black">Allowances (HRA)</td>
                        <td className="p-2 text-right border-r border-black tabular-nums">₹{p.allowances.toLocaleString('en-IN')}</td>
                        <td className="p-2 border-r border-black">ESI & Taxes</td>
                        <td className="p-2 text-right tabular-nums">₹{Math.round(p.deductions * 0.3).toLocaleString('en-IN')}</td>
                      </tr>
                      <tr className="border-b border-black">
                        <td className="p-2 border-r border-black">Overtime Pay</td>
                        <td className="p-2 text-right border-r border-black tabular-nums">₹{p.otPay.toLocaleString('en-IN')}</td>
                        <td className="p-2 border-r border-black">-</td>
                        <td className="p-2 text-right">-</td>
                      </tr>
                      <tr className="bg-neutral-50 font-black">
                        <td className="p-2 border-r border-black">Total Earnings</td>
                        <td className="p-2 text-right border-r border-black tabular-nums">
                          ₹{(p.basic + p.allowances + p.otPay).toLocaleString('en-IN')}
                        </td>
                        <td className="p-2 border-r border-black">Total Deductions</td>
                        <td className="p-2 text-right tabular-nums text-rose-600">
                          ₹{p.deductions.toLocaleString('en-IN')}
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  <div className="p-3 bg-neutral-900 text-white rounded-lg flex justify-between items-center text-sm font-black">
                    <span>NET PAYABLE AMOUNT:</span>
                    <span className="text-emerald-400 tabular-nums text-lg">
                      ₹{p.netSalary.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="flex justify-between pt-6 text-[10px] text-neutral-600">
                    <div>Employee Signature</div>
                    <div>Authorized Signatory (DIGI PACK)</div>
                  </div>
                </div>
              );
            })()}

            <div className="flex items-center justify-end gap-2 pt-4 mt-4 border-t border-neutral-200">
              <button
                type="button"
                onClick={() => setSelectedEmpForPayslip(null)}
                className="px-3 py-1.5 rounded text-neutral-600 hover:bg-neutral-100 font-bold text-xs"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-bold uppercase tracking-wider flex items-center gap-1 shadow-xs"
              >
                <Printer className="w-3.5 h-3.5" /> Print Payslip
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
