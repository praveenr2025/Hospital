import { useEffect, useState } from "react";
import Header from "../../components/layout/clinic/Header";
import { fetchAPI } from "../api/api";

type KPI = {
  title: string;
  value: number;
};

type Appointment = {
  id: number;
  patientName: string;
  doctorName: string;
  time: string;
  reason: string; 
};

type Vaccination = {
  id: number;
  patientName: string;
  vaccineName: string;
  dueDate: string;
};

export default function ClinicDashboard() {
  const [kpis, setKpis] = useState<KPI[]>([
    { title: "Appointments Today", value: 0 },
    { title: "Total Patients", value: 0 },
    { title: "Overdue Vaccinations", value: 0 },
    { title: "Pending Labs", value: 0 },
    { title: "Pending Invoices", value: 0 },
    { title: "Low Stock Alerts", value: 0 },
  ]);

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [vaccinations, setVaccinations] = useState<Vaccination[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      setError("");

      try {
        const [
          apptDataRaw,
          patientsDataRaw,
          vacDataRaw,
          labsDataRaw,
          invoicesDataRaw,
          stockDataRaw,
        ] = await Promise.all([
          fetchAPI("/clinic/appointments/today"),
          fetchAPI("/clinic/patients"),
          fetchAPI("/clinic/vaccines"),
          fetchAPI("/clinic/lab-orders"),
          fetchAPI("/clinic/invoices"),
          fetchAPI("/clinic/inventory"),
        ]);

        // Normalize data to expected shape
        const apptArray = Array.isArray(apptDataRaw)
          ? apptDataRaw
          : apptDataRaw
          ? [apptDataRaw] // if a single object is returned, wrap it in array
          : [];

          const apptData: Appointment[] = apptArray.map((a: any) => ({
            id: a.id,
            patientName: a.patientname || a.patientName || "Unknown",
            doctorName: a.doctorname || a.doctorName || "Unknown",
            time: a.time?.slice(0, 5) || "Unknown",
            reason: a.reason || "—", // 🩺 ADD THIS LINE
          }));


        const vacData: Vaccination[] = (vacDataRaw || []).map((v: any) => ({
          id: v.id,
          patientName: v.patientName || v.full_name || "Unknown",
          vaccineName: v.vaccineName || v.name || "Unknown",
          dueDate: v.dueDate || v.due_date || "Unknown",
        }));

        // Ensure patients count is a number
        const patientsCount = (patientsDataRaw || []).length;

        setKpis([
          { title: "Appointments Today", value: apptData.length },
          { title: "Total Patients", value: (patientsDataRaw || []).length },
          { title: "Overdue Vaccinations", value: vacData.length },
          { title: "Pending Labs", value: (labsDataRaw || []).length },
          { title: "Pending Invoices", value: (invoicesDataRaw || []).length },
          { title: "Low Stock Alerts", value: (stockDataRaw || []).length },
        ]);

        setAppointments(apptData);
        setVaccinations(vacData);
      } catch (err) {
        console.error("Dashboard load error:", err);
        setError(
          "Failed to load dashboard data. Check backend and API endpoints."
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

 return (
  <>
    <Header />

    <main className="clinic-dashboard">
      <div className="container">
        <div className="dashboard-header">
          <h2 className="dashboard-title"> Clinic Dashboard</h2>
          <p className="dashboard-sub">Overview of today’s activity</p>
        </div>

        {loading ? (
          <p>Loading dashboard...</p>
        ) : error ? (
          <p>{error}</p>
        ) : (
          <>
            <div
              className="kpis"
              style={{ maxWidth: "1280px", margin: "16px auto" }}
            >
              {kpis.map((kpi, idx) => (
                <div key={idx} className="kpi">
                  <h3>{kpi.title}</h3>
                  <span className="v">{kpi.value}</span>
                </div>
              ))}
            </div>

            <div
              className="grid"
              style={{ maxWidth: "1280px", margin: "16px auto" }}
            >
              {/* Appointments Card */}
              <div className="card cols-2">
                <h3>Today's Appointments</h3>
                {appointments.length === 0 ? (
                  <p>No appointments today.</p>
                ) : (
                  <ul className="dashboard-list">
                    {appointments.map((a) => (
                  <li key={a.id} className="dashboard-item">
                    <span className="item-time">{a.time}</span>
                    <span className="item-name">{a.patientName}</span>
                    <span className="item-reason">{a.reason}</span>
                  </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Vaccinations Card */}
              <div className="card cols-1">
                <h3>Vaccinations Due Soon</h3>
                {vaccinations.length === 0 ? (
                  <p>No upcoming vaccinations.</p>
                ) : (
                  <ul className="dashboard-list">
                    {vaccinations.map((v) => (
                      <li key={v.id} className="dashboard-item">
                        <span className="item-name">{v.patientName}</span>
                        <span className="item-reason">
                          {v.vaccineName} - {v.dueDate}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  </>
);
}
