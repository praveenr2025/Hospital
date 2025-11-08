
import pool from "../config/db.js"; 
// Get all staff
export const getAllStaff = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM staff ORDER BY id ASC");
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching staff:", err);
    res.status(500).json({ message: "Failed to fetch staff." });
  }
};

export const createStaff = async (req, res) => {
  
  const { fullName, role, department, contact, email, password, securityRole, status } = req.body;

  if (!fullName || !role) {
    return res.status(400).json({ message: "Full name and role are required." });
  }

  try {
    const passwordHash = password || null;

    const result = await pool.query(
      `INSERT INTO staff (full_name, role, department, contact, email, password_hash, security_role, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      // Use 'status' here, defaulting to "Active"
      [fullName, role, department || null, contact || null, email || null, passwordHash, securityRole || "User", status || "Active"]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error creating staff:", err);
    res.status(500).json({ message: "Failed to create staff." });
  }
};

export const updateStaff = async (req, res) => {
  const { id } = req.params;
  const { fullName, role, department, contact, email, status, password } = req.body;

  try {
    const result = await pool.query(
      `UPDATE staff
       SET full_name = $1,
           role = $2,
           department = $3,
           contact = $4,
           email = $5,
           status = $6,
           password_hash = COALESCE($7, password_hash)
       WHERE id = $8
       RETURNING *`,
      [fullName, role, department || null, contact || null, email || null, status, password || null, id]
    );

    if (result.rows.length === 0) return res.status(404).json({ message: "Staff not found" });

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error updating staff:", err);
    res.status(500).json({ message: "Failed to update staff." });
  }
};



// Delete staff
export const deleteStaff = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query("DELETE FROM staff WHERE id = $1 RETURNING *", [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Staff not found." });
    }

    res.json({ message: "Staff deleted successfully", deletedStaff: result.rows[0] });
  } catch (err) {
    console.error("Error deleting staff:", err);
    res.status(500).json({ message: "Failed to delete staff." });
  }
};

// Get a single staff member by ID
export const getStaffById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("SELECT * FROM staff WHERE id = $1", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Staff not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error fetching staff by ID:", err);
    res.status(500).json({ message: "Failed to fetch staff." });
  }
};

// Get all notes for a specific staff member
export const getStaffNotes = async (req, res) => {
  const { id } = req.params; 
  try {
    // Assumes your notes table is 'staff_notes' and has a 'staff_id' column
    const result = await pool.query(
      "SELECT * FROM staff_notes WHERE staff_id = $1 ORDER BY date DESC",
      [id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching staff notes:", err);
    res.status(500).json({ message: "Failed to fetch notes." });
  }
};

// Add a new note for a specific staff member
export const addStaffNote = async (req, res) => {
  const { id } = req.params; // This is staff_id
  const { note, date } = req.body;

  if (!note || !date) {
    return res.status(400).json({ message: "Note and date are required." });
  }

  try {
    const result = await pool.query(
      "INSERT INTO staff_notes (staff_id, note, date) VALUES ($1, $2, $3) RETURNING *",
      [id, note, date]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error adding staff note:", err);
    res.status(500).json({ message: "Failed to add note." });
  }
};

// Get all rosters (optional: filter by weekStart)
export const getAllRosters = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT r.*, s.full_name AS staff_name, s.role, s.department
      FROM roster r
      JOIN staff s ON r.staff_id = s.id
      ORDER BY r.week_start DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching rosters:", err);
    res.status(500).json({ message: "Failed to fetch roster data." });
  }
};

// Get roster by staffId (optional: include weekStart)
export const getRosterByStaff = async (req, res) => {
  const { staffId, weekStart } = req.params; // send staffId, optional weekStart
  try {
    const result = await pool.query(
      `SELECT * FROM roster WHERE staff_id = $1 ${weekStart ? "AND week_start = $2" : ""}`,
      weekStart ? [staffId, weekStart] : [staffId]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: "Roster not found" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error fetching roster:", err);
    res.status(500).json({ message: "Failed to fetch roster." });
  }
};

export const getTodaysRoster = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        r.*, 
        s.full_name, 
        s.role
      FROM roster r
      JOIN staff s ON r.staff_id = s.id
      WHERE CURRENT_DATE BETWEEN r.week_start AND (r.week_start + INTERVAL '6 days')
      ORDER BY s.full_name ASC
    `);

    console.log("Today's roster:", result.rows);
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching today's roster:", err);
    res.status(500).json({ message: "Failed to fetch today's roster." });
  }
};


// Create or update roster (UPSERT)
export const upsertRoster = async (req, res) => {
  const { staffId, weekStart, shifts } = req.body;

  if (!staffId || !weekStart || !shifts)
    return res.status(400).json({ message: "staffId, weekStart, and shifts are required" });

  try {
    // Check if roster exists
    const existing = await pool.query(
      "SELECT * FROM roster WHERE staff_id = $1 AND week_start = $2",
      [staffId, weekStart]
    );

    if (existing.rows.length === 0) {
      // Create
      const created = await pool.query(
        "INSERT INTO roster (staff_id, week_start, shifts) VALUES ($1, $2, $3) RETURNING *",
        [staffId, weekStart, JSON.stringify(shifts)]
      );
      return res.status(201).json(created.rows[0]);
    } else {
      // Update
      const updated = await pool.query(
        "UPDATE roster SET shifts = $1 WHERE staff_id = $2 AND week_start = $3 RETURNING *",
        [JSON.stringify(shifts), staffId, weekStart]
      );
      return res.json(updated.rows[0]);
    }
  } catch (err) {
    console.error("Error upserting roster:", err);
    res.status(500).json({ message: "Failed to upsert roster." });
  }
};

// Delete roster
export const deleteRoster = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("DELETE FROM roster WHERE id = $1 RETURNING *", [id]);
    if (result.rows.length === 0)
      return res.status(404).json({ message: "Roster not found." });
    res.json({ message: "Roster deleted", deletedRoster: result.rows[0] });
  } catch (err) {
    console.error("Error deleting roster:", err);
    res.status(500).json({ message: "Failed to delete roster." });
  }
};

export const getBillingCodes = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM billing_codes ORDER BY id ASC");
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching billing codes:", err);
    res.status(500).json({ error: "Failed to fetch billing codes" });
  }
};

export const addOrUpdateBillingCode = async (req, res) => {
  try {
    const { id, code, description, cost } = req.body;
    if (!code || !description || !cost) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (id) {
      await pool.query(
        "UPDATE billing_codes SET code=$1, description=$2, cost=$3 WHERE id=$4",
        [code, description, cost, id]
      );
      return res.json({ message: "Billing code updated" });
    } else {
      await pool.query(
        "INSERT INTO billing_codes (code, description, cost) VALUES ($1,$2,$3)",
        [code, description, cost]
      );
      return res.json({ message: "Billing code added" });
    }
  } catch (err) {
    console.error("Error saving billing code:", err);
    res.status(500).json({ error: "Failed to save billing code" });
  }
};

// ------------------- LAB TESTS -------------------
export const getLabTests = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM lab_tests ORDER BY id ASC");
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching lab tests:", err);
    res.status(500).json({ error: "Failed to fetch lab tests" });
  }
};

export const addOrUpdateLabTest = async (req, res) => {
  try {
    const { id, name, type } = req.body;
    if (!name || !type) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (id) {
      await pool.query("UPDATE lab_tests SET name=$1, type=$2 WHERE id=$3", [name, type, id]);
      return res.json({ message: "Lab test updated" });
    } else {
      await pool.query("INSERT INTO lab_tests (name, type) VALUES ($1,$2)", [name, type]);
      return res.json({ message: "Lab test added" });
    }
  } catch (err) {
    console.error("Error saving lab test:", err);
    res.status(500).json({ error: "Failed to save lab test" });
  }
};

export const getLowStockItems = async (req, res) => {
  try {
    // This query now matches your table's column names
    const result = await pool.query(
      `SELECT 
         id, 
         vaccine_name AS name, 
         quantity AS quantity_in_stock, 
         10 AS reorder_level 
       FROM inventory 
       WHERE quantity <= 10 
       ORDER BY vaccine_name ASC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching low stock items:", err);
    res.status(500).json({ message: "Failed to fetch low stock items." });
  }
};
