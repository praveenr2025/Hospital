import pool from '../config/db.js';

// ------------------ DOCTORS ------------------
export const getAllDoctors = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, full_name AS name FROM staff WHERE role = 'Doctor' ORDER BY full_name ASC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching doctors:", err);
    res.status(500).json({ message: "Failed to fetch doctors." });
  }
};

export const getAllAppointments = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT a.id,
             p.full_name AS patientName,
             d.name AS doctorName,
             a.date,
             a.time,
             a.type,
             a.reason,
             a.status
      FROM appointments a
      JOIN patients p ON a.patient_id = p.id
      JOIN doctors d ON a.doctor_id = d.id
      ORDER BY a.date DESC, a.time ASC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching all appointments:", err);
    res.status(500).json({ message: "Failed to fetch all appointments." });
  }
};


export const getTodaysAppointments = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        a.id, 
        p.full_name AS "patientName",   -- Get patient name
        s.full_name AS "doctorName",    -- Get doctor name from staff table
        a.date, 
        a.time, 
        a.type, 
        a.reason, 
        a.status
      FROM appointments a
      JOIN patients p ON a.patient_id = p.id
      JOIN staff s ON a.doctor_id = s.id    -- JOIN with the staff table
      WHERE a.date = CURRENT_DATE
      ORDER BY a.time ASC
    `);
    
    // Ensure you always return an array, even if empty
    res.json(result.rows || []); 
  } catch (err) {
    console.error("Error fetching today's appointments:", err);
    // Send back the error message so the frontend knows what went wrong
    res.status(500).json({ message: "Failed to fetch today's appointments", error: err.message }); 
  }
};

export const createAppointment = async (req, res) => {
  const { patientId, doctorId, date, time, type, reason } = req.body;

  if (!patientId || !doctorId || !date || !time) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    // 1. Insert the basic appointment, only return the new ID
    const result = await pool.query(
      `INSERT INTO appointments 
         (patient_id, doctor_id, date, time, type, reason, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'Scheduled') 
       RETURNING id`, // Only need the ID
      [patientId, doctorId, date, time, type || "Walk-in", reason || ""]
    );

    const insertedId = result.rows[0].id;

    // 2. Fetch the newly created appointment with names joined correctly
    const enrichedResult = await pool.query(
      `SELECT 
         a.id, 
         p.full_name AS "patientName",   -- Use double quotes for camelCase
         s.full_name AS "doctorName",    -- Correctly get name from staff table
         a.date, a.time, a.type, a.reason, a.status
       FROM appointments a
       JOIN patients p ON a.patient_id = p.id
       JOIN staff s ON a.doctor_id = s.id    -- Correctly JOIN with staff table
       WHERE a.id = $1`,
      [insertedId]
    );

    // 3. Check if the enriched query found the appointment (it should)
    if (enrichedResult.rows.length === 0) {
        // This case is unlikely but good practice to handle
        return res.status(404).json({ message: "Appointment created but could not be retrieved with names." });
    }

    // 4. Return the complete appointment data with names
    res.status(201).json(enrichedResult.rows[0]); 
  } catch (err) {
    console.error("Error creating appointment:", err);
    // Include the specific error message in the response for debugging
    res.status(500).json({ message: "Failed to create appointment", error: err.message }); 
  }
};
// ------------------ PATIENTS ------------------
export const getAllPatients = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM patients ORDER BY id ASC");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch patients." });
  }
};

export const createPatient = async (req, res) => {
  const {
    fullName,
    dob,
    gender,
    guardianPrimary,
    contactPrimary,
    guardianSecondary = null,
    contactSecondary = null,
    address = null,
    bloodGroup = null,
    allergies = null,
  } = req.body;

  if (!fullName || !dob || !gender || !guardianPrimary || !contactPrimary) {
    return res.status(400).json({ message: "Missing required fields." });
  }

  try {
    const result = await pool.query(
      `INSERT INTO patients 
        (full_name, dob, gender, guardian_primary, contact_primary, guardian_secondary, contact_secondary, address, blood_group, allergies)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       RETURNING *`,
      [
        fullName,
        dob,
        gender,
        guardianPrimary,
        contactPrimary,
        guardianSecondary,
        contactSecondary,
        address,
        bloodGroup,
        allergies,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error creating patient:", err);
    res.status(500).json({ message: "Failed to create patient." });
  }
};

// ------------------ VACCINES ------------------
export const getAllVaccines = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name, vaccine_id FROM vaccines ORDER BY name ASC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch vaccines." });
  }
};

// ------------------ INVENTORY ------------------
export const getAllInventory = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM inventory ORDER BY id ASC");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch inventory." });
  }
};

export const addInventory = async (req, res) => {
  const { vaccineId, batchNumber, expiryDate, quantity } = req.body;
  if (!vaccineId || !batchNumber || !expiryDate || !quantity)
    return res.status(400).json({ message: "All fields are required." });

  try {
    // 1. Look up the vaccine name using its PRIMARY KEY (id)
    const vaccineResult = await pool.query(
      "SELECT name FROM vaccines WHERE id = $1", // <-- The fix is here
      [vaccineId]
    );

    if (vaccineResult.rows.length === 0)
      return res.status(404).json({ message: "Vaccine not found." });

    const { name: vaccineName } = vaccineResult.rows[0];

    // 2. Insert into inventory
    const result = await pool.query(
      `INSERT INTO inventory (vaccine_id, vaccine_name, batch_number, expiry_date, quantity, status)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [
        vaccineId, // <-- Use vaccineId from the body directly
        vaccineName,
        batchNumber,
        expiryDate,
        quantity,
        quantity > 0 ? "Available" : "Out of stock",
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error adding inventory:", err);
    res.status(500).json({ message: "Failed to add inventory." });
  }
};

// ------------------ Invoice------------
export const getAllInvoices = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT i.id, i.invoice_date, i.total_amount, i.status, p.full_name AS patient_name
      FROM invoices i
      JOIN patients p ON p.id = i.patient_id
      ORDER BY i.id DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch invoices." });
  }
};

export const createInvoice = async (req, res) => {
  const { patientId, invoiceDate, items, status } = req.body;
  if (!patientId || !invoiceDate || !items || items.length === 0)
    return res.status(400).json({ message: "All fields are required." });

  try {
    const totalAmount = items.reduce((sum, item) => sum + Number(item.cost), 0);

    const invoiceResult = await pool.query(
      `INSERT INTO invoices (patient_id, invoice_date, total_amount, status)
       VALUES ($1,$2,$3,$4) RETURNING id`,
      [patientId, invoiceDate, totalAmount, status || "Pending"]
    );

    const invoiceId = invoiceResult.rows[0].id;

    const itemPromises = items.map(item =>
      pool.query(
        `INSERT INTO invoice_items (invoice_id, description, cost)
         VALUES ($1,$2,$3)`,
        [invoiceId, item.desc, item.cost]
      )
    );

    await Promise.all(itemPromises);

    res.status(201).json({ message: "Invoice created successfully", invoiceId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create invoice." });
  }
};

// ------------------ LAB & RADIOLOGY ------------------
export const getAllLabOrders = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT lo.id, lo.test_name, lo.test_type, lo.status, lo.order_date,
             lo.clinical_notes, lo.report, p.full_name AS patient_name
      FROM lab_orders lo
      JOIN patients p ON p.id = lo.patient_id
      ORDER BY lo.id DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch lab orders." });
  }
};

export const createLabOrder = async (req, res) => {
  const { patientId, testName, testType, clinicalNotes } = req.body;
  if (!patientId || !testName || !testType) {
    return res.status(400).json({ message: "Missing required fields." });
  }

  try {
    const result = await pool.query(
      `INSERT INTO lab_orders (patient_id, test_name, test_type, clinical_notes)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [patientId, testName, testType, clinicalNotes || ""]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error creating lab order:", err);
    res.status(500).json({ message: "Failed to create lab order." });
  }
};

export const updateLabReport = async (req, res) => {
  const { id } = req.params;
  const { report, status } = req.body;

  try {
    const result = await pool.query(
      `UPDATE lab_orders SET report = $1, status = $2 WHERE id = $3 RETURNING *`,
      [report, status || "Completed", id]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ message: "Lab order not found." });

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error updating lab report:", err);
    res.status(500).json({ message: "Failed to update lab report." });
  }
};
// ------------------ REFERRALS ------------------
export const getAllReferrals = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT r.id, r.referral_date, r.direction, r.provider, r.reason, r.status, p.full_name AS patient_name
      FROM referrals r
      JOIN patients p ON p.id = r.patient_id
      ORDER BY r.id DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching referrals:", err);
    res.status(500).json({ message: "Failed to fetch referrals." });
  }
};

export const createReferral = async (req, res) => {
  const { patientId, provider, reason, direction } = req.body;
  if (!patientId || !provider || !reason)
    return res.status(400).json({ message: "Missing required fields." });

  try {
    const result = await pool.query(
      `INSERT INTO referrals (patient_id, referral_date, provider, reason, direction, status)
       VALUES ($1, NOW(), $2, $3, $4, $5) RETURNING *`,
      [patientId, provider, reason, direction || 'Outbound', 'Sent']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error creating referral:", err);
    res.status(500).json({ message: "Failed to create referral." });
  }
};


export const getAppointmentsByPatient = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `SELECT a.*, s.full_name AS doctor_name
       FROM appointments a
       JOIN staff s ON s.id = a.doctor_id
       WHERE a.patient_id = $1
       ORDER BY a.date DESC`,
      [id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch appointments" });
  }
};


export const getMilestonesByPatient = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `SELECT * FROM milestones WHERE patient_id = $1 ORDER BY typical_age ASC`,
      [id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch milestones" });
  }
};

// ------------------ VACCINATION RECORDS ------------------

export const getVaccinationsByPatient = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `SELECT vr.id, v.name AS vaccine_name, v.vaccine_id, vr.date_given, vr.batch_number, vr.status, vr.notes
       FROM vaccination_records vr
       JOIN vaccines v ON vr.vaccine_id = v.id
       WHERE vr.patient_id = $1
       ORDER BY v.name ASC`,
      [id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching vaccinations:", err);
    res.status(500).json({ message: "Failed to fetch vaccination records." });
  }
};

export const updateMilestoneStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const result = await pool.query(
      `UPDATE milestones 
       SET status = $1, achieved_date = CASE WHEN $1 = 'Achieved' THEN NOW() ELSE achieved_date END
       WHERE id = $2
       RETURNING *`,
      [status, id]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ message: "Milestone not found." });

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error updating milestone:", err);
    res.status(500).json({ message: "Failed to update milestone status." });
  }
};
// ------------------ GROWTH RECORDS ------------------

// ------------------ GROWTH RECORDS ------------------

export const getGrowthByPatient = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `SELECT id, date, weight, height, head_circumference, status, notes
       FROM growth_records 
       WHERE patient_id = $1 
       ORDER BY date ASC`,
      [id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching growth records:", err);
    res.status(500).json({ message: "Failed to fetch growth chart." });
  }
};

export const addGrowthRecord = async (req, res) => {
  const { id } = req.params; // patient_id
  const { date, weight, height, headCircumference, status, notes } = req.body;

  if (!date || !weight || !height) {
    return res.status(400).json({ message: "Date, weight, and height are required." });
  }

  try {
    const result = await pool.query(
      `INSERT INTO growth_records 
        (patient_id, date, weight, height, head_circumference, status, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        id, // patient_id from URL
        date, // user-provided date
        weight,
        height,
        headCircumference || null,
        status || "Pending", // default to Pending
        notes || "", // optional field
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error adding growth record:", err);
    res.status(500).json({ message: "Failed to add growth record." });
  }
};


export const updateGrowthRecordStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status)
    return res.status(400).json({ message: "Status is required." });

  try {
    const result = await pool.query(
      `UPDATE growth_records 
       SET status = $1 
       WHERE id = $2 
       RETURNING *`,
      [status, id]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ message: "Growth record not found." });

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error updating growth record status:", err);
    res.status(500).json({ message: "Failed to update growth record." });
  }
};

export const createConsultation = async (req, res) => {
  const {
    patientId,
    doctorId,        // 👈 Make sure this is received from frontend
    temperature,
    heartRate,
    respRate,
    symptoms,
    diagnosis,
    treatmentPlan,
    prescription,
  } = req.body;

  if (!patientId || !doctorId) {
    return res.status(400).json({ message: "Missing required fields: patientId or doctorId" });
  }

  try {
    const result = await pool.query(
      `INSERT INTO consultations 
         (patient_id, doctor_id, temperature, heart_rate, resp_rate, symptoms, diagnosis, treatment_plan, prescription)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       RETURNING *`,
      [
        patientId,
        doctorId,
        temperature || null,
        heartRate || null,
        respRate || null,
        symptoms || null,
        diagnosis || null,
        treatmentPlan || null,
        prescription || null,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error saving consultation:", err);
    res.status(500).json({ message: "Failed to save consultation" });
  }
};
// ------------------ CONSULTATIONS ------------------
// ==================== GET CONSULTATIONS BY PATIENT ====================
export const getConsultationsByPatient = async (req, res) => {
  const { id } = req.params; // patient_id

  try {
    const result = await pool.query(
      `SELECT c.*, s.full_name AS doctor_name
       FROM consultations c
       LEFT JOIN staff s ON c.doctor_id = s.id
       WHERE c.patient_id = $1
       ORDER BY c.consultation_date DESC`,
      [id]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching consultations:", err);
    res.status(500).json({ message: "Failed to fetch consultations." });
  }
};

export const addVaccinationRecord = async (req, res) => {
  const { id: patientId } = req.params;
  const { vaccineId, dateGiven } = req.body;

  if (!vaccineId) {
    return res.status(400).json({ message: "Vaccine ID is required." });
  }

  try {
    // Check if record already exists
    const existing = await pool.query(
      `SELECT * FROM patient_vaccinations WHERE patient_id = $1 AND vaccine_id = $2`,
      [patientId, vaccineId]
    );

    let result;

    if (existing.rows.length > 0) {
      // ✅ Update existing record
      result = await pool.query(
        `UPDATE patient_vaccinations
         SET status = 'Given', date_given = $3
         WHERE patient_id = $1 AND vaccine_id = $2
         RETURNING *`,
        [patientId, vaccineId, dateGiven]
      );
    } else {
      // ✅ Create new record
      result = await pool.query(
        `INSERT INTO patient_vaccinations (patient_id, vaccine_id, status, date_given)
         VALUES ($1, $2, 'Given', $3)
         RETURNING *`,
        [patientId, vaccineId, dateGiven]
      );
    }

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("❌ Error updating vaccination:", err);
    res.status(500).json({ message: "Failed to update vaccination record." });
  }
};
export const getPatientVaccinations = async (req, res) => {
  const { id: patientId } = req.params;

  try {
    const result = await pool.query(
      `SELECT v.id, v.name, v.due_range, pv.status, pv.date_given
       FROM vaccines v
       LEFT JOIN patient_vaccinations pv
       ON v.id = pv.vaccine_id AND pv.patient_id = $1
       ORDER BY v.id ASC`,
      [patientId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("❌ Error fetching patient vaccinations:", err);
    res.status(500).json({ message: "Failed to fetch vaccination data." });
  }
};

export const getPatientMilestones = async (req, res) => {
  const { id: patientId } = req.params;
  try {
    const result = await pool.query(
      `SELECT id, milestone_name, typical_age, status, achieved_date
       FROM milestones
       WHERE patient_id = $1
       ORDER BY id ASC`,
      [patientId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching milestones:", err);
    res.status(500).json({ message: "Failed to load milestones." });
  }
};

// ------------------- UPDATE MILESTONE STATUS -------------------
export const updatePatientMilestone = async (req, res) => {
  const { id: patientId } = req.params;
  const { milestoneId, dateAchieved } = req.body;

  console.log("➡️ Incoming milestone update:", { patientId, milestoneId, dateAchieved });

  try {
    const result = await pool.query(
      `UPDATE milestones 
       SET status = 'Achieved', achieved_date = $1
       WHERE id = $2 AND patient_id = $3
       RETURNING id, milestone_name, typical_age, status, achieved_date`,
      [dateAchieved, milestoneId, patientId]
    );

    if (result.rowCount === 0) {
      console.log("⚠️ No milestone found for update.");
      return res.status(404).json({ message: "Milestone not found for patient." });
    }

    console.log("✅ Milestone updated:", result.rows[0]);
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error("❌ Error updating milestone:", err);
    res.status(500).json({ message: "Failed to update milestone." });
  }
};
export const addMilestone = async (req, res) => {
  const { id } = req.params;
  const { milestone_name, typical_age } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO milestones (patient_id, milestone_name, typical_age, status)
       VALUES ($1, $2, $3, 'Pending')
       RETURNING *`,
      [id, milestone_name, typical_age]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error adding milestone:", err);
    res.status(500).json({ message: "Failed to add milestone" });
  }
};
export const getLabOrdersByPatient = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `SELECT * FROM lab_orders WHERE patient_id = $1 ORDER BY order_date DESC`,
      [id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch lab orders" });
  }
};

export const getInvoicesByPatient = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `SELECT * FROM invoices WHERE patient_id = $1 ORDER BY id DESC`,
      [id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch invoices" });
  }
};
