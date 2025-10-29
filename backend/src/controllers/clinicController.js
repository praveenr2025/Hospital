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
