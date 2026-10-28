// import pool from "../config/db.js";

export async function getEmployeeByEmail(email) {
  const result = await pool.query(
    `SELECT id, first_name, last_name, email, department, job_title, salary, status
     FROM employees WHERE email = $1`,
    [email],
  );
  return result.rows[0] ?? null;
}

export async function createEmployee({
  first_name,
  last_name,
  email,
  department,
  job_title,
  salary,
  status,
}) {
  const result = await pool.query(
    `INSERT INTO employees
      (first_name, last_name, email, department, job_title, salary, status, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
     RETURNING id, first_name, last_name, email, department, job_title, salary, status`,
    [first_name, last_name, email, department, job_title, salary ?? null, status],
  );
  return result.rows[0] ?? null;
}

export async function getAllEmployees() {
  const result = await pool.query(
    `SELECT id, first_name, last_name, email, department, job_title, salary, status
     FROM employees`,
  );
  return result.rows;
}

export async function getEmployeeById(id) {
  const result = await pool.query(
    `SELECT id, first_name, last_name, email, department, job_title, salary, status
     FROM employees WHERE id = $1`,
    [id],
  );
  return result.rows[0] ?? null;
}

export async function updateEmployee(id, fields) {
  const allowedFields = [
    "first_name",
    "last_name",
    "email",
    "department",
    "job_title",
    "salary",
    "status",
  ];

  const updates = Object.entries(fields).filter(
    ([key, value]) => allowedFields.includes(key) && value !== undefined,
  );

  if (updates.length === 0) {
    throw new Error("No allowed employee fields were provided for update");
  }

  const values = updates.map(([, value]) => value);
  const assignments = updates
    .map(([key], index) => `"${key}" = $${index + 1}`)
    .join(", ");

  values.push(id);

  const result = await pool.query(
    `UPDATE employees SET ${assignments}, updated_at = NOW()
     WHERE id = $${values.length}
     RETURNING id, first_name, last_name, email, department, job_title, salary, status`,
    values,
  );
  return result.rows[0] ?? null;
}

export async function deleteEmployee(id) {
  const result = await pool.query(
    `DELETE FROM employees WHERE id = $1
     RETURNING id, first_name, last_name, email, department, job_title, salary, status`,
    [id],
  );

  return result.rows[0] ?? null;
}

export async function getEmployees(search, filters = {}, page = 1, limit = 10) {
  const conditions = [];
  const values = [];
  if (search !== undefined && search !== "") {
    values.push(`%${search}%`);
    conditions.push(`
      (first_name ILIKE $${values.length}
       OR last_name ILIKE $${values.length}
       OR email ILIKE $${values.length}
       OR job_title ILIKE $${values.length})`);
  }
  
  for (const [key, value] of Object.entries(filters)) {
    if (
      ["department", "status"].includes(key) &&
      value !== undefined &&
      value !== ""
    ){
      values.push(value);
      conditions.push(`${key} = $${values.length}`);
    }
    
  }

  const whereClause = conditions.length
    ? `WHERE ${conditions.join(" AND ")}`
    : "";

  const count_total = await pool.query(
    `SELECT COUNT(*) FROM employees ${whereClause}`,
    values,
  );

  const total = Number(count_total.rows[0].count);

  const offset = (page - 1) * limit;

  const queryValues = [...values, limit, offset];
  const limitIndex = values.length + 1;
  const offsetIndex = values.length + 2;

  const result = await pool.query(
    `SELECT id, first_name, last_name, email,
            department, job_title, salary, status
            FROM employees 
            ${whereClause}
            ORDER BY id 
            LIMIT $${limitIndex}
            OFFSET $${offsetIndex}`,
    queryValues,
  );

  return {
    employees: result.rows,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}
