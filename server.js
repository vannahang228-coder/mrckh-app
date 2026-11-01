const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

let db;
const DATA_DIR = process.env.DATA_DIR || __dirname;
if (!fs.existsSync(DATA_DIR)) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch (e) {
    console.error('Error creating DATA_DIR:', e);
  }
}
const dbPath = path.join(DATA_DIR, 'database.sqlite');

try {
  const { DatabaseSync } = require('node:sqlite');
  db = new DatabaseSync(dbPath);
} catch (e) {
  const Database = require('better-sqlite3');
  db = new Database(dbPath);
}

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
// Universal Static Serving: Serve from root AND public directory
app.use(express.static(__dirname));
app.use(express.static(path.join(__dirname, 'public')));

// Enable WAL mode and foreign keys for speed & reliability
db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA foreign_keys = ON;');

// 1. Create employees table
db.exec(`
  CREATE TABLE IF NOT EXISTS employees (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    emp_code TEXT UNIQUE NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    khmer_name TEXT,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    department TEXT NOT NULL,
    position TEXT NOT NULL,
    salary REAL NOT NULL DEFAULT 0,
    hire_date TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Active',
    gender TEXT NOT NULL DEFAULT 'Male',
    avatar_color TEXT DEFAULT '#6366f1',
    address TEXT DEFAULT '',
    notes TEXT DEFAULT '',
    shift_start TEXT DEFAULT '08:00',
    shift_end TEXT DEFAULT '17:00',
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );
`);

// Migration: Ensure shift_start and shift_end exist in employees table
try {
  const empCols = db.prepare('PRAGMA table_info(employees)').all().map(c => c.name);
  if (!empCols.includes('shift_start')) {
    db.exec("ALTER TABLE employees ADD COLUMN shift_start TEXT DEFAULT '08:00'");
  }
  if (!empCols.includes('shift_end')) {
    db.exec("ALTER TABLE employees ADD COLUMN shift_end TEXT DEFAULT '17:00'");
  }
} catch (e) {
  console.error('Error adding shift columns:', e);
}

// 1.1 Create attendances table for Clock-In / Clock-Out & Attendance Tracking
db.exec(`
  CREATE TABLE IF NOT EXISTS attendances (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id INTEGER NOT NULL,
    attendance_date TEXT NOT NULL,
    check_in TEXT,
    check_out TEXT,
    status TEXT DEFAULT 'On Time',
    work_hours REAL DEFAULT 0,
    notes TEXT DEFAULT '',
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
  );
`);

// Migration: Check and migrate attendances table if older legacy schema exists (emp_id, att_date)
try {
  const attCols = db.prepare("PRAGMA table_info(attendances)").all().map(c => c.name);
  if (attCols.includes('emp_id') && !attCols.includes('employee_id')) {
    console.log('Migrating legacy attendances table columns to standard schema...');
    db.exec(`
      CREATE TABLE attendances_v2 (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        employee_id INTEGER NOT NULL,
        attendance_date TEXT NOT NULL,
        check_in TEXT,
        check_out TEXT,
        status TEXT DEFAULT 'On Time',
        work_hours REAL DEFAULT 0,
        notes TEXT DEFAULT '',
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
      );
      INSERT INTO attendances_v2 (id, employee_id, attendance_date, check_in, check_out, status, work_hours, notes, created_at, updated_at)
      SELECT id, emp_id, att_date, COALESCE(clock_in, ''), COALESCE(clock_out, ''), COALESCE(status, 'On Time'), COALESCE(work_hours, 0), COALESCE(notes, ''), COALESCE(created_at, datetime('now')), COALESCE(updated_at, datetime('now')) FROM attendances;
      DROP TABLE attendances;
      ALTER TABLE attendances_v2 RENAME TO attendances;
    `);
    console.log('Legacy attendances table migrated successfully.');
  }
} catch (e) {
  console.error('Error migrating attendances table schema:', e);
}

// 2. Create leave_requests table for Absence / Leave Management
db.exec(`
  CREATE TABLE IF NOT EXISTS leave_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id INTEGER NOT NULL,
    leave_type TEXT NOT NULL,
    start_date TEXT NOT NULL,
    end_date TEXT NOT NULL,
    days_count REAL NOT NULL DEFAULT 1,
    reason TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Pending',
    approved_by TEXT DEFAULT '',
    rejection_reason TEXT DEFAULT '',
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
  );
`);

// 3. Create sales table for Products & Sales / POS & Profit Management
db.exec(`
  CREATE TABLE IF NOT EXISTS sales (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    invoice_no TEXT UNIQUE NOT NULL,
    product_name TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'ទូទៅ / General',
    quantity REAL NOT NULL DEFAULT 1,
    cost_price REAL NOT NULL DEFAULT 0,
    selling_price REAL NOT NULL DEFAULT 0,
    total_cost REAL NOT NULL DEFAULT 0,
    total_amount REAL NOT NULL DEFAULT 0,
    profit REAL NOT NULL DEFAULT 0,
    seller_id INTEGER,
    seller_name TEXT NOT NULL,
    customer_name TEXT DEFAULT '',
    payment_method TEXT DEFAULT 'Cash',
    sale_date TEXT NOT NULL,
    sale_time TEXT NOT NULL,
    notes TEXT DEFAULT '',
    subtotal REAL DEFAULT 0,
    items_count INTEGER DEFAULT 1,
    discount_type TEXT DEFAULT 'fixed',
    discount_val REAL DEFAULT 0,
    discount_amount REAL DEFAULT 0,
    tax_rate REAL DEFAULT 0,
    tax_amount REAL DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (seller_id) REFERENCES employees(id) ON DELETE SET NULL
  );
`);

// 4. Create products table for Inventory & Stock Tracking
db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'គ្រឿងអេឡិចត្រូនិច & IT',
    cost_price REAL NOT NULL DEFAULT 0,
    selling_price REAL NOT NULL DEFAULT 0,
    stock_qty REAL NOT NULL DEFAULT 0,
    low_stock_threshold REAL NOT NULL DEFAULT 5,
    unit TEXT DEFAULT 'គ្រឿង',
    image_url TEXT DEFAULT '',
    notes TEXT DEFAULT '',
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );
`);

// 5. Create sale_items table for Multi-Item Cart Sales
db.exec(`
  CREATE TABLE IF NOT EXISTS sale_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sale_id INTEGER NOT NULL,
    product_id INTEGER,
    product_name TEXT NOT NULL,
    category TEXT DEFAULT '',
    quantity REAL NOT NULL DEFAULT 1,
    cost_price REAL NOT NULL DEFAULT 0,
    selling_price REAL NOT NULL DEFAULT 0,
    total_cost REAL NOT NULL DEFAULT 0,
    total_amount REAL NOT NULL DEFAULT 0,
    profit REAL NOT NULL DEFAULT 0,
    FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
  );

  CREATE TABLE IF NOT EXISTS customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    telegram TEXT,
    address TEXT,
    customer_type TEXT DEFAULT 'Regular',
    total_spent REAL DEFAULT 0,
    total_orders INTEGER DEFAULT 0,
    notes TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS expenses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'ផ្សេងៗ / Others',
    amount REAL NOT NULL,
    expense_date TEXT NOT NULL,
    payment_method TEXT DEFAULT 'Cash',
    recorded_by TEXT,
    receipt_ref TEXT,
    notes TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS payrolls (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id INTEGER NOT NULL,
    employee_name TEXT NOT NULL,
    month_str TEXT NOT NULL,
    base_salary REAL NOT NULL,
    bonus REAL DEFAULT 0,
    allowance REAL DEFAULT 0,
    deduction REAL DEFAULT 0,
    net_salary REAL NOT NULL,
    payment_date TEXT NOT NULL,
    payment_status TEXT DEFAULT 'Paid',
    payment_method TEXT DEFAULT 'Bank Transfer',
    notes TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS store_settings (
    key TEXT PRIMARY KEY,
    value TEXT
  );
`);

// Migrate existing sales table to add missing columns if needed
const salesColsToAdd = [
  { name: 'subtotal', type: 'REAL DEFAULT 0' },
  { name: 'items_count', type: 'INTEGER DEFAULT 1' },
  { name: 'discount_type', type: "TEXT DEFAULT 'fixed'" },
  { name: 'discount_val', type: 'REAL DEFAULT 0' },
  { name: 'discount_amount', type: 'REAL DEFAULT 0' },
  { name: 'tax_rate', type: 'REAL DEFAULT 0' },
  { name: 'tax_amount', type: 'REAL DEFAULT 0' }
];
for (const col of salesColsToAdd) {
  try {
    db.exec(`ALTER TABLE sales ADD COLUMN ${col.name} ${col.type};`);
  } catch (e) {
    // Column already exists, safe to ignore
  }
}

// Migrate products table for Condition, Serial Number / IMEI & Warranty (New & Secondhand Shop)
const productColsToAdd = [
  { name: 'condition', type: "TEXT DEFAULT 'ថ្មី 100%'" },
  { name: 'serial_number', type: "TEXT DEFAULT ''" },
  { name: 'warranty_period', type: "TEXT DEFAULT 'គ្មានការធានា'" }
];
for (const col of productColsToAdd) {
  try {
    db.exec(`ALTER TABLE products ADD COLUMN ${col.name} ${col.type};`);
  } catch (e) {}
}

// Migrate sale_items table for Condition, Serial Number & Warranty
const saleItemColsToAdd = [
  { name: 'item_condition', type: "TEXT DEFAULT ''" },
  { name: 'serial_number', type: "TEXT DEFAULT ''" },
  { name: 'warranty_period', type: "TEXT DEFAULT ''" }
];
for (const col of saleItemColsToAdd) {
  try {
    db.exec(`ALTER TABLE sale_items ADD COLUMN ${col.name} ${col.type};`);
  } catch (e) {}
}

// Sample Employees Data
const sampleEmployees = [
  {
    emp_code: 'EMP-0001',
    first_name: 'Visal',
    last_name: 'Chhim',
    khmer_name: 'ឈឹម វិសាល',
    email: 'visal.chhim@company.kh',
    phone: '+855 12 345 678',
    department: 'IT & Engineering',
    position: 'Lead Software Architect',
    salary: 2800,
    hire_date: '2021-03-15',
    status: 'Active',
    gender: 'Male',
    avatar_color: '#4f46e5',
    address: 'Phnom Penh, Cambodia',
    notes: 'Architect for internal cloud services and core systems.'
  },
  {
    emp_code: 'EMP-0002',
    first_name: 'Sophea',
    last_name: 'Sok',
    khmer_name: 'សុខ សោភា',
    email: 'sophea.sok@company.kh',
    phone: '+855 17 890 123',
    department: 'Human Resources',
    position: 'HR Director',
    salary: 2200,
    hire_date: '2020-08-01',
    status: 'Active',
    gender: 'Female',
    avatar_color: '#ec4899',
    address: 'Siem Reap / Phnom Penh, Cambodia',
    notes: 'Oversees company culture, talent development and HR operations.'
  },
  {
    emp_code: 'EMP-0003',
    first_name: 'Dara',
    last_name: 'Chan',
    khmer_name: 'ចាន់ តារា',
    email: 'dara.chan@company.kh',
    phone: '+855 88 456 789',
    department: 'IT & Engineering',
    position: 'Senior Frontend Engineer',
    salary: 1750,
    hire_date: '2022-01-10',
    status: 'Active',
    gender: 'Male',
    avatar_color: '#06b6d4',
    address: 'Khan Toul Kork, Phnom Penh',
    notes: 'Specializes in responsive UI, Web animations and design systems.'
  },
  {
    emp_code: 'EMP-0004',
    first_name: 'Kalyan',
    last_name: 'Mao',
    khmer_name: 'ម៉ៅ កល្យាណ',
    email: 'kalyan.mao@company.kh',
    phone: '+855 10 567 890',
    department: 'Finance & Accounting',
    position: 'Chief Financial Officer',
    salary: 2600,
    hire_date: '2019-11-20',
    status: 'Active',
    gender: 'Female',
    avatar_color: '#10b981',
    address: 'Battambang / Phnom Penh',
    notes: 'Handles strategic corporate budgets, audit and fiscal compliance.'
  },
  {
    emp_code: 'EMP-0005',
    first_name: 'Rothana',
    last_name: 'Heng',
    khmer_name: 'ហេង រតនា',
    email: 'rothana.heng@company.kh',
    phone: '+855 93 234 567',
    department: 'Marketing & Sales',
    position: 'Marketing Director',
    salary: 1900,
    hire_date: '2022-05-14',
    status: 'Active',
    gender: 'Male',
    avatar_color: '#f59e0b',
    address: 'Khan Chamkarmon, Phnom Penh',
    notes: 'Leads digital growth, brand partnerships and campaign execution.'
  },
  {
    emp_code: 'EMP-0006',
    first_name: 'Sreynich',
    last_name: 'Kim',
    khmer_name: 'គឹម ស្រីនីច',
    email: 'sreynich.kim@company.kh',
    phone: '+855 11 678 901',
    department: 'Operations',
    position: 'Operations Supervisor',
    salary: 1200,
    hire_date: '2023-02-01',
    status: 'Active',
    gender: 'Female',
    avatar_color: '#8b5cf6',
    address: 'Kandal Province',
    notes: 'Coordinates daily company operational workflow and supply chains.'
  },
  {
    emp_code: 'EMP-0007',
    first_name: 'Sambath',
    last_name: 'Ouk',
    khmer_name: 'អ៊ុក សម្បត្តិ',
    email: 'sambath.ouk@company.kh',
    phone: '+855 96 789 012',
    department: 'IT & Engineering',
    position: 'Cloud & DevOps Specialist',
    salary: 1850,
    hire_date: '2022-09-18',
    status: 'Active',
    gender: 'Male',
    avatar_color: '#3b82f6',
    address: 'Khan Sensok, Phnom Penh',
    notes: 'Maintains Docker, Kubernetes clusters and CI/CD deployment pipelines.'
  },
  {
    emp_code: 'EMP-0008',
    first_name: 'Sovann',
    last_name: 'Lim',
    khmer_name: 'លឹម សុវណ្ណ',
    email: 'sovann.lim@company.kh',
    phone: '+855 77 123 456',
    department: 'Marketing & Sales',
    position: 'Digital Content Creator',
    salary: 950,
    hire_date: '2024-08-01',
    status: 'Probation',
    gender: 'Male',
    avatar_color: '#14b8a6',
    address: 'Kampong Cham',
    notes: 'Creates engaging video content, social media campaigns and graphics.'
  },
  {
    emp_code: 'EMP-0009',
    first_name: 'Chariya',
    last_name: 'Prum',
    khmer_name: 'ព្រុំ ចរិយា',
    email: 'chariya.prum@company.kh',
    phone: '+855 89 234 567',
    department: 'Human Resources',
    position: 'Talent Acquisition Officer',
    salary: 1100,
    hire_date: '2023-07-22',
    status: 'Active',
    gender: 'Female',
    avatar_color: '#f43f5e',
    address: 'Khan Dangkao, Phnom Penh',
    notes: 'Manages candidate sourcing, interviews and staff onboarding.'
  },
  {
    emp_code: 'EMP-0010',
    first_name: 'Vattanak',
    last_name: 'Tieng',
    khmer_name: 'ទៀង វឌ្ឍនៈ',
    email: 'vattanak.tieng@company.kh',
    phone: '+855 15 345 678',
    department: 'Finance & Accounting',
    position: 'Junior Accountant',
    salary: 850,
    hire_date: '2024-09-10',
    status: 'Probation',
    gender: 'Male',
    avatar_color: '#eab308',
    address: 'Takeo Province',
    notes: 'Assists with monthly payroll, receipts and invoice reconciliations.'
  },
  {
    emp_code: 'EMP-0011',
    first_name: 'Malika',
    last_name: 'Tep',
    khmer_name: 'ទេព មល្លិកា',
    email: 'malika.tep@company.kh',
    phone: '+855 98 456 789',
    department: 'IT & Engineering',
    position: 'Senior UI/UX Designer',
    salary: 1550,
    hire_date: '2022-11-05',
    status: 'On Leave',
    gender: 'Female',
    avatar_color: '#a855f7',
    address: 'Khan Chroy Changvar, Phnom Penh',
    notes: 'Product designer currently on maternity leave.'
  },
  {
    emp_code: 'EMP-0012',
    first_name: 'Sopheap',
    last_name: 'Yim',
    khmer_name: 'យឹម សុភាព',
    email: 'sopheap.yim@company.kh',
    phone: '+855 81 567 890',
    department: 'Operations',
    position: 'Logistics Coordinator',
    salary: 800,
    hire_date: '2021-06-10',
    status: 'Resigned',
    gender: 'Male',
    avatar_color: '#64748b',
    address: 'Kampot Province',
    notes: 'Transitioned to family business in June 2024.'
  }
];

// Sample Products Catalog & Inventory Data
const sampleProducts = [
  {
    code: 'PRD-001',
    name: 'Dell Latitude 5420 Laptop',
    category: 'គ្រឿងអេឡិចត្រូនិច & IT',
    cost_price: 450,
    selling_price: 620,
    stock_qty: 8,
    low_stock_threshold: 3,
    unit: 'គ្រឿង',
    notes: 'Intel Core i5, 16GB RAM, 512GB SSD'
  },
  {
    code: 'PRD-002',
    name: 'iPhone 16 Pro Max 256GB',
    category: 'ទូរស័ព្ទ & គ្រឿងបន្លាស់',
    cost_price: 1050,
    selling_price: 1280,
    stock_qty: 4,
    low_stock_threshold: 3,
    unit: 'គ្រឿង',
    notes: 'Titanium, Official 1 Year Warranty'
  },
  {
    code: 'PRD-003',
    name: 'Samsung Galaxy S24 Ultra',
    category: 'ទូរស័ព្ទ & គ្រឿងបន្លាស់',
    cost_price: 890,
    selling_price: 1100,
    stock_qty: 6,
    low_stock_threshold: 2,
    unit: 'គ្រឿង',
    notes: 'AI Phone, 12GB RAM, S-Pen included'
  },
  {
    code: 'PRD-004',
    name: 'MacBook Air M3 13-inch',
    category: 'គ្រឿងអេឡិចត្រូនិច & IT',
    cost_price: 920,
    selling_price: 1150,
    stock_qty: 5,
    low_stock_threshold: 2,
    unit: 'គ្រឿង',
    notes: 'Apple Silicon M3, 8GB/256GB Midnight'
  },
  {
    code: 'PRD-005',
    name: 'ម៉ូនីទ័រ Dell 27" 4K Monitor',
    category: 'គ្រឿងអេឡិចត្រូនិច & IT',
    cost_price: 210,
    selling_price: 290,
    stock_qty: 10,
    low_stock_threshold: 4,
    unit: 'គ្រឿង',
    notes: 'IPS Panel, USB-C 90W Hub'
  },
  {
    code: 'PRD-006',
    name: 'Logitech MX Master 3S Mouse',
    category: 'គ្រឿងអេឡិចត្រូនិច & IT',
    cost_price: 65,
    selling_price: 99,
    stock_qty: 2,
    low_stock_threshold: 5,
    unit: 'គ្រាប់',
    notes: 'Ergonomic Quiet Click Wireless Mouse (ជិតអស់ពីស្តុក!)'
  },
  {
    code: 'PRD-007',
    name: 'កាសប៊្លូធូស Sony WH-1000XM5',
    category: 'គ្រឿងអេឡិចត្រូនិច & IT',
    cost_price: 240,
    selling_price: 320,
    stock_qty: 3,
    low_stock_threshold: 3,
    unit: 'គ្រឿង',
    notes: 'Noise Cancelling Premium Headphones'
  },
  {
    code: 'PRD-008',
    name: 'អាវយឺត Polo Cotton MRC KH',
    category: 'សម្លៀកបំពាក់ & ម៉ូដ',
    cost_price: 5.5,
    selling_price: 14.0,
    stock_qty: 35,
    low_stock_threshold: 10,
    unit: 'អាវ',
    notes: '100% Premium Combed Cotton'
  },
  {
    code: 'PRD-009',
    name: 'កាហ្វេទឹកដោះគោទឹកកក Iced Latte',
    category: 'ម្ហូបអាហារ & ភេសជ្ជៈ',
    cost_price: 0.8,
    selling_price: 2.25,
    stock_qty: 50,
    low_stock_threshold: 15,
    unit: 'កែវ',
    notes: 'Fresh Arabica Beans, Khm-Milk'
  },
  {
    code: 'PRD-010',
    name: 'តែបៃតងទឹកដោះគោ Green Tea Latte',
    category: 'ម្ហូបអាហារ & ភេសជ្ជៈ',
    cost_price: 0.75,
    selling_price: 2.0,
    stock_qty: 40,
    low_stock_threshold: 15,
    unit: 'កែវ',
    notes: 'Uji Matcha Premium Blend'
  },
  {
    code: 'PRD-011',
    name: 'ក្រដាស A4 Double A 80gsm',
    category: 'សម្ភារៈការិយាល័យ',
    cost_price: 18.0,
    selling_price: 26.0,
    stock_qty: 16,
    low_stock_threshold: 5,
    unit: 'កេស',
    notes: 'Box with 5 reams (2,500 sheets)'
  },
  {
    code: 'PRD-012',
    name: 'USB-C Hub 8-in-1 Multiport',
    category: 'គ្រឿងអេឡិចត្រូនិច & IT',
    cost_price: 16.0,
    selling_price: 29.0,
    stock_qty: 1,
    low_stock_threshold: 4,
    unit: 'គ្រឿង',
    notes: '4K HDMI, Gigabit Ethernet, SD Card (ជិតអស់ពីស្តុក!)'
  }
];

function seedDatabase(force = false) {
  // Only seed sample demo data if explicitly requested via force=true
  if (!force) return;
  const rowCount = db.prepare('SELECT COUNT(*) as count FROM employees').get().count;
  if (rowCount === 0 || force) {
    if (force) {
      db.exec('DELETE FROM sale_items;');
      db.exec('DELETE FROM products;');
      db.exec('DELETE FROM sales;');
      db.exec('DELETE FROM leave_requests;');
      db.exec('DELETE FROM employees;');
    }
    const insertEmp = db.prepare(`
      INSERT INTO employees (
        emp_code, first_name, last_name, khmer_name, email, phone, 
        department, position, salary, hire_date, status, gender, 
        avatar_color, address, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const emp of sampleEmployees) {
      insertEmp.run(
        emp.emp_code,
        emp.first_name,
        emp.last_name,
        emp.khmer_name,
        emp.email,
        emp.phone,
        emp.department,
        emp.position,
        emp.salary,
        emp.hire_date,
        emp.status,
        emp.gender,
        emp.avatar_color,
        emp.address,
        emp.notes
      );
    }
    console.log(`Database seeded with ${sampleEmployees.length} employees.`);

    // Seed Leaves / Absence Data
    const emps = db.prepare('SELECT id, emp_code FROM employees').all();
    const empMap = {};
    emps.forEach(e => { empMap[e.emp_code] = e.id; });

    const sampleLeaves = [
      {
        emp_code: 'EMP-0011',
        leave_type: 'Maternity Leave',
        start_date: '2026-10-01',
        end_date: '2026-11-30',
        days_count: 60,
        reason: 'ច្បាប់សម្រាកលំហែមាតុភាព (Maternity leave)',
        status: 'Approved',
        approved_by: 'Sophea Sok (HR Director)'
      },
      {
        emp_code: 'EMP-0003',
        leave_type: 'Sick Leave',
        start_date: '2026-10-22',
        end_date: '2026-10-24',
        days_count: 3,
        reason: 'គ្រុនផ្តាសាយធំ និងឈឺបំពង់ក មានវេជ្ជបញ្ជាពីពេទ្យ (Severe flu)',
        status: 'Approved',
        approved_by: 'Sophea Sok (HR Director)'
      },
      {
        emp_code: 'EMP-0008',
        leave_type: 'Annual Leave',
        start_date: '2026-10-27',
        end_date: '2026-10-29',
        days_count: 3,
        reason: 'ដំណើរកម្សាន្តប្រចាំឆ្នាំជាមួយគ្រួសារនៅខេត្តមណ្ឌលគិរី (Family trip to Mondulkiri)',
        status: 'Pending',
        approved_by: ''
      },
      {
        emp_code: 'EMP-0005',
        leave_type: 'Personal Leave',
        start_date: '2026-10-25',
        end_date: '2026-10-25',
        days_count: 1,
        reason: 'ចូលរួមពិធីអាពាហ៍ពិពាហ៍បងប្អូនជីដូនមួយ (Cousin wedding ceremony)',
        status: 'Pending',
        approved_by: ''
      },
      {
        emp_code: 'EMP-0010',
        leave_type: 'Sick Leave',
        start_date: '2026-10-14',
        end_date: '2026-10-15',
        days_count: 2,
        reason: 'ពិនិត្យសុខភាពតាមការណាត់របស់វេជ្ជបណ្ឌិត (Medical appointment)',
        status: 'Approved',
        approved_by: 'Kalyan Mao (CFO)'
      },
      {
        emp_code: 'EMP-0001',
        leave_type: 'Annual Leave',
        start_date: '2026-10-06',
        end_date: '2026-10-09',
        days_count: 4,
        reason: 'សម្រាកប្រចាំឆ្នាំ (Annual Vacation)',
        status: 'Approved',
        approved_by: 'Sophea Sok (HR Director)'
      },
      {
        emp_code: 'EMP-0009',
        leave_type: 'Unpaid Leave',
        start_date: '2026-09-18',
        end_date: '2026-09-20',
        days_count: 3,
        reason: 'កិច្ចការបន្ទាន់នៅស្រុកកំណើត (Personal emergency)',
        status: 'Rejected',
        approved_by: 'Sophea Sok (HR Director)',
        rejection_reason: 'គម្រោងសម្ភាសន៍បុគ្គលិកថ្មីកំពុងត្រូវការមនុស្សបន្ទាន់'
      }
    ];

    const insertLeave = db.prepare(`
      INSERT INTO leave_requests (
        employee_id, leave_type, start_date, end_date, days_count,
        reason, status, approved_by, rejection_reason
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const l of sampleLeaves) {
      if (empMap[l.emp_code]) {
        insertLeave.run(
          empMap[l.emp_code],
          l.leave_type,
          l.start_date,
          l.end_date,
          l.days_count,
          l.reason,
          l.status,
          l.approved_by || '',
          l.rejection_reason || ''
        );
      }
    }
    console.log(`Database seeded with ${sampleLeaves.length} leave records.`);
  }

  // Seed Sales Data (if empty or force)
  const salesCount = db.prepare('SELECT COUNT(*) as count FROM sales').get().count;
  if (salesCount === 0 || force) {
    if (force) {
      db.exec('DELETE FROM sales;');
    }

    const emps = db.prepare('SELECT id, emp_code, first_name, last_name, khmer_name FROM employees').all();
    const getSellerId = (code) => {
      const e = emps.find(x => x.emp_code === code);
      return e ? e.id : null;
    };

    const sampleSales = [
      {
        invoice_no: 'INV-20261025-001',
        product_name: 'Laptop Dell XPS 15 OLED (Core i7 / 32GB RAM)',
        category: 'គ្រឿងអេឡិចត្រូនិក & IT',
        quantity: 1,
        cost_price: 1250,
        selling_price: 1580,
        seller_code: 'EMP-0001',
        seller_name: 'ឈឹម វិសាល (Visal Chhim)',
        customer_name: 'ក្រុមហ៊ុន ស៊ី អិន ភី ខូអិលធីឌី (CNP Co., Ltd)',
        payment_method: 'ABA KHQR',
        sale_date: '2026-10-25',
        sale_time: '09:30',
        notes: 'លក់រួមជាមួយការធានាផ្លូវការរយៈពេល 1 ឆ្នាំ និងកាតាប Dell'
      },
      {
        invoice_no: 'INV-20261025-002',
        product_name: 'iPhone 16 Pro Max 256GB Desert Titanium',
        category: 'ទូរស័ព្ទ & គ្រឿងបន្លាស់',
        quantity: 2,
        cost_price: 1120,
        selling_price: 1350,
        seller_code: 'EMP-0003',
        seller_name: 'ចាន់ តារា (Dara Chan)',
        customer_name: 'លោក ហេង ពិសិដ្ឋ',
        payment_method: 'ABA KHQR',
        sale_date: '2026-10-25',
        sale_time: '11:15',
        notes: 'អតិថិជនបានផ្ទេរប្រាក់តាម KHQR រួចរាល់'
      },
      {
        invoice_no: 'INV-20261025-003',
        product_name: 'កាហ្វេទឹកដោះគោពិសេស MRC Special Blend (កែវ)',
        category: 'ម្ហូបអាហារ & ភេសជ្ជៈ',
        quantity: 15,
        cost_price: 0.90,
        selling_price: 2.25,
        seller_code: 'EMP-0002',
        seller_name: 'សុខ សោភា (Sophea Sok)',
        customer_name: 'ការិយាល័យ IT ជាន់ទី ៣',
        payment_method: 'Cash',
        sale_date: '2026-10-25',
        sale_time: '14:05',
        notes: 'កម្ម៉ង់ប្រចាំថ្ងៃសម្រាប់បុគ្គលិក និងភ្ញៀវក្រុមហ៊ុន'
      },
      {
        invoice_no: 'INV-20261025-004',
        product_name: 'អាវយឺត Polo MRC Premium Cotton',
        category: 'សម្លៀកបំពាក់ & ម៉ូដ',
        quantity: 6,
        cost_price: 5.50,
        selling_price: 13.00,
        seller_code: 'EMP-0008',
        seller_name: 'លឹម សុវណ្ណ (Sovann Lim)',
        customer_name: 'ក្រុមការងារផ្សព្វផ្សាយ',
        payment_method: 'Cash',
        sale_date: '2026-10-25',
        sale_time: '16:20',
        notes: 'ឯកសណ្ឋានការងារ'
      },
      {
        invoice_no: 'INV-20261024-001',
        product_name: 'ម៉ូនីទ័រ Dell UltraSharp 27" 4K UHD USB-C Hub',
        category: 'គ្រឿងអេឡិចត្រូនិក & IT',
        quantity: 3,
        cost_price: 360,
        selling_price: 485,
        seller_code: 'EMP-0001',
        seller_name: 'ឈឹម វិសាល (Visal Chhim)',
        customer_name: 'ក្រុមហ៊ុន Fintech Solution KH',
        payment_method: 'ABA KHQR',
        sale_date: '2026-10-24',
        sale_time: '10:45',
        notes: 'ផ្ញើទៅកាន់ខណ្ឌទួលគោក ភ្នំពេញ'
      },
      {
        invoice_no: 'INV-20261024-002',
        product_name: 'ក្រដាស A4 Double A 80gsm (កេស / 5 រាម)',
        category: 'សម្ភារៈការិយាល័យ',
        quantity: 20,
        cost_price: 18.50,
        selling_price: 24.00,
        seller_code: 'EMP-0005',
        seller_name: 'ហេង រតនា (Rathana Heng)',
        customer_name: 'មន្ទីរសម្រាកព្យាបាលមេគង្គ',
        payment_method: 'Wing',
        sale_date: '2026-10-24',
        sale_time: '15:10',
        notes: 'ទិញសម្ភារៈការិយាល័យប្រចាំខែ'
      },
      {
        invoice_no: 'INV-20261022-001',
        product_name: 'ក្ដារចុចមេកានិច Keychron Q1 Pro Wireless RGB',
        category: 'គ្រឿងអេឡិចត្រូនិក & IT',
        quantity: 4,
        cost_price: 120,
        selling_price: 175,
        seller_code: 'EMP-0003',
        seller_name: 'ចាន់ តារា (Dara Chan)',
        customer_name: 'អ្នកស្រី គង់ ម៉ាលី',
        payment_method: 'ABA KHQR',
        sale_date: '2026-10-22',
        sale_time: '13:00',
        notes: 'Brown Switches'
      },
      {
        invoice_no: 'INV-20261020-001',
        product_name: 'សេវាកម្មដំឡើងប្រព័ន្ធ Network & Security Firewall',
        category: 'សេវាកម្ម & ដំណោះស្រាយ',
        quantity: 1,
        cost_price: 250,
        selling_price: 650,
        seller_code: 'EMP-0001',
        seller_name: 'ឈឹម វិសាល (Visal Chhim)',
        customer_name: 'Golden Bridge Logistics',
        payment_method: 'Bank Transfer',
        sale_date: '2026-10-20',
        sale_time: '16:00',
        notes: 'កិច្ចសន្យាសេវាកម្មបច្ចេកវិទ្យា'
      },
      {
        invoice_no: 'INV-20261018-001',
        product_name: 'កាសប៊្លូធូស Sony WH-1000XM5 Wireless Noise-Cancelling',
        category: 'គ្រឿងអេឡិចត្រូនិក & IT',
        quantity: 2,
        cost_price: 260,
        selling_price: 345,
        seller_code: 'EMP-0008',
        seller_name: 'លឹម សុវណ្ណ (Sovann Lim)',
        customer_name: 'លោក វ៉ាន់ ធារ៉ា',
        payment_method: 'Card',
        sale_date: '2026-10-18',
        sale_time: '11:30',
        notes: 'ទូទាត់តាមកាត Visa Card'
      },
      {
        invoice_no: 'INV-20261015-001',
        product_name: 'ទឹកបរិសុទ្ធធម្មជាតិ MRC Spring Water 500ml (កេស)',
        category: 'ម្ហូបអាហារ & ភេសជ្ជៈ',
        quantity: 35,
        cost_price: 2.10,
        selling_price: 3.50,
        seller_code: 'EMP-0002',
        seller_name: 'សុខ សោភា (Sophea Sok)',
        customer_name: 'អង្គការសហគមន៍កម្ពុជា',
        payment_method: 'Cash',
        sale_date: '2026-10-15',
        sale_time: '09:00',
        notes: 'សម្រាប់សិក្ខាសាលា'
      },
      {
        invoice_no: 'INV-20260928-001',
        product_name: 'កៅអីការិយាល័យ Ergonomic Chair Herman Style',
        category: 'ទំនិញប្រើប្រាស់ទូទៅ',
        quantity: 5,
        cost_price: 140,
        selling_price: 220,
        seller_code: 'EMP-0004',
        seller_name: 'ម៉ៅ កល្យាណ (Kalyan Mao)',
        customer_name: 'Studio Design KH',
        payment_method: 'ABA KHQR',
        sale_date: '2026-09-28',
        sale_time: '14:20',
        notes: 'ដឹកជញ្ជូនរួចរាល់'
      },
      {
        invoice_no: 'INV-20260915-001',
        product_name: 'Printer HP LaserJet Pro MFP 4103fdw',
        category: 'សម្ភារៈការិយាល័យ',
        quantity: 2,
        cost_price: 310,
        selling_price: 430,
        seller_code: 'EMP-0005',
        seller_name: 'ហេង រតនា (Rathana Heng)',
        customer_name: 'ក្រុមហ៊ុន អាស៊ីវិនិយោគ',
        payment_method: 'Bank Transfer',
        sale_date: '2026-09-15',
        sale_time: '10:00',
        notes: 'រួមបញ្ចូលទឹកថ្នាំចំនួន ២ ប្រអប់បន្ថែម'
      }
    ];

    const insertSale = db.prepare(`
      INSERT INTO sales (
        invoice_no, product_name, category, quantity, cost_price, selling_price,
        total_cost, total_amount, profit, seller_id, seller_name,
        customer_name, payment_method, sale_date, sale_time, notes,
        subtotal, items_count, discount_type, discount_val, discount_amount, tax_rate, tax_amount
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertSaleItem = db.prepare(`
      INSERT INTO sale_items (
        sale_id, product_id, product_name, category, quantity, cost_price, selling_price, total_cost, total_amount, profit
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const s of sampleSales) {
      const totalCost = Math.round(s.quantity * s.cost_price * 100) / 100;
      const totalAmount = Math.round(s.quantity * s.selling_price * 100) / 100;
      const profit = Math.round((totalAmount - totalCost) * 100) / 100;
      const result = insertSale.run(
        s.invoice_no,
        s.product_name,
        s.category,
        s.quantity,
        s.cost_price,
        s.selling_price,
        totalCost,
        totalAmount,
        profit,
        getSellerId(s.seller_code),
        s.seller_name,
        s.customer_name,
        s.payment_method,
        s.sale_date,
        s.sale_time,
        s.notes,
        totalAmount,
        1,
        'fixed',
        0,
        0,
        0,
        0
      );

      insertSaleItem.run(
        result.lastInsertRowid,
        null,
        s.product_name,
        s.category,
        s.quantity,
        s.cost_price,
        s.selling_price,
        totalCost,
        totalAmount,
        profit
      );
    }
    console.log(`Database seeded with ${sampleSales.length} sales records.`);
  }

  // Seed Products / Inventory Data (if empty or force)
  const prodCount = db.prepare('SELECT COUNT(*) as count FROM products').get().count;
  if (prodCount === 0 || force) {
    if (force) {
      db.exec('DELETE FROM products;');
    }
    const insertProd = db.prepare(`
      INSERT INTO products (
        code, name, category, cost_price, selling_price, stock_qty, low_stock_threshold, unit, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const p of sampleProducts) {
      insertProd.run(
        p.code,
        p.name,
        p.category,
        p.cost_price,
        p.selling_price,
        p.stock_qty,
        p.low_stock_threshold,
        p.unit,
        p.notes
      );
    }
    console.log(`Database seeded with ${sampleProducts.length} inventory products.`);
  }

  // Seed Settings if empty
  const settingsCount = db.prepare('SELECT COUNT(*) as count FROM store_settings').get().count;
  if (settingsCount === 0 || force) {
    if (force) db.exec('DELETE FROM store_settings;');
    const insertSetting = db.prepare('INSERT OR REPLACE INTO store_settings (key, value) VALUES (?, ?)');
    insertSetting.run('store_name', 'MRC KH Enterprise & POS Store');
    insertSetting.run('store_tagline', 'ប្រព័ន្ធគ្រប់គ្រងអាជីវកម្ម បុគ្គលិក និងការលក់ស្តង់ដារ');
    insertSetting.run('store_phone', '+855 12 345 678 / +855 98 765 432');
    insertSetting.run('store_email', 'contact@mrckh.com');
    insertSetting.run('store_address', 'អគារ MRC KH មហាវិថីសហព័ន្ធរុស្ស៊ី រាជធានីភ្នំពេញ');
    insertSetting.run('store_telegram', '@mrckh_official');
    insertSetting.run('currency_rate', '4100');
    insertSetting.run('default_tax_rate', '10');
    insertSetting.run('receipt_footer_km', 'សូមអរគុណចំពោះការគាំទ្រ! ទំនិញទិញរួចមិនអាចប្តូរជាប្រាក់វិញបានទេ');
    insertSetting.run('receipt_footer_en', 'Thank you for your business! Goods sold are not refundable');
    insertSetting.run('bakong_account', 'mrckh@acleda');
    insertSetting.run('bakong_merchant_name', 'MRC KH ENTERPRISE');
    console.log('Database seeded with default store settings.');
  }

  // Seed Customers if empty
  const custCount = db.prepare('SELECT COUNT(*) as count FROM customers').get().count;
  if (custCount === 0 || force) {
    if (force) db.exec('DELETE FROM customers;');
    const insertCust = db.prepare(`
      INSERT INTO customers (name, phone, email, telegram, address, customer_type, total_spent, total_orders, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    insertCust.run('លោក វ៉ាន់ដា', '012 888 999', 'vanda@gmail.com', '@vanda_kh', 'ខណ្ឌទួលគោក រាជធានីភ្នំពេញ', 'VIP', 1335.51, 1, 'អតិថិជន VIP');
    insertCust.run('លោកជំទាវ កុលាប', '010 777 666', 'koulap.retail@yahoo.com', '@koulap_store', 'ខណ្ឌដូនពេញ រាជធានីភ្នំពេញ', 'Wholesale', 2490.00, 1, 'ទិញដុំសម្រាប់ចែកចាយបន្ត');
    insertCust.run('កញ្ញា សុជាតា', '098 555 444', 'socheata.design@gmail.com', '@socheata_d', 'ខណ្ឌបឹងកេងកង រាជធានីភ្នំពេញ', 'Regular', 450.00, 1, 'អតិថិជនទិញរាយ');
    insertCust.run('ក្រុមហ៊ុន អប្សរា មេឌា', '023 111 222', 'procurement@apsara.com.kh', '@apsara_corp', 'ខណ្ឌសែនសុខ រាជធានីភ្នំពេញ', 'Wholesale', 3200.00, 2, 'កិច្ចសន្យាផ្គត់ផ្គង់ប្រចាំត្រីមាស');
    insertCust.run('លោក ចាន់ណា', '077 333 444', 'channa.tech@gmail.com', '', 'ក្រុងតាខ្មៅ ខេត្តកណ្តាល', 'Regular', 185.00, 1, 'ទិញសម្ភារៈការិយាល័យ');
    console.log('Database seeded with sample customers.');
  }

  // Seed Expenses if empty
  const expCount = db.prepare('SELECT COUNT(*) as count FROM expenses').get().count;
  if (expCount === 0 || force) {
    if (force) db.exec('DELETE FROM expenses;');
    const insertExp = db.prepare(`
      INSERT INTO expenses (title, category, amount, expense_date, payment_method, recorded_by, receipt_ref, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    insertExp.run('ថ្លៃជួលទីតាំងហាងប្រចាំខែតុលា (Store Rent)', 'ថ្លៃជួលទីតាំង / Rent', 650.00, '2026-10-05', 'Bank Transfer', 'Sophea Sok', 'RENT-202610', 'ជួលជាន់ផ្ទាល់ដីអគារ');
    insertExp.run('ថ្លៃអគ្គិសនី និងទឹកប្រចាំខែ (Electricity & Water)', 'ថ្លៃទឹក-ភ្លើង / Utilities', 145.50, '2026-10-10', 'ABA KHQR', 'Kalyan Mao', 'UTIL-202610', 'វិក្កយបត្រ EDC & រដ្ឋាករទឹក');
    insertExp.run('ថ្លៃអ៊ីនធឺណិត Fiber Optic 100Mbps', 'ថ្លៃទឹក-ភ្លើង / Utilities', 45.00, '2026-10-12', 'Bank Transfer', 'Kalyan Mao', 'NET-202610', 'ក្រុមហ៊ុន ISP');
    insertExp.run('ទិញក្រដាសកម្ដៅវិក្កយបត្រ 80mm & ទឹកថ្នាំព្រីន (POS Supplies)', 'សម្ភារៈការិយាល័យ / Supplies', 55.00, '2026-10-15', 'Cash', 'ឈឹម វិសាល', 'SUP-001', 'ក្រដាស 2 កេស');
    insertExp.run('យុទ្ធនាការផ្សព្វផ្សាយ Facebook & TikTok Ads', 'ទីផ្សារ-ផ្សព្វផ្សាយ / Marketing', 120.00, '2026-10-18', 'Card', 'ឈឹម វិសាល', 'ADS-FB-01', 'Boost Post ប្រូម៉ូសិនចុងឆ្នាំ');
    insertExp.run('សេវាថែទាំម៉ាស៊ីនត្រជាក់ ៤ គ្រឿង (AC Maintenance)', 'ជួសជុល-ថែទាំ / Maintenance', 60.00, '2026-10-20', 'Cash', 'Sophea Sok', 'AC-MAINT', 'លាងសម្អាត និងបញ្ចូលហ្គាស');
    console.log('Database seeded with sample expenses.');
  }

  // Seed Payrolls if empty
  const payCount = db.prepare('SELECT COUNT(*) as count FROM payrolls').get().count;
  if (payCount === 0 || force) {
    if (force) db.exec('DELETE FROM payrolls;');
    const insertPay = db.prepare(`
      INSERT INTO payrolls (employee_id, employee_name, month_str, base_salary, bonus, allowance, deduction, net_salary, payment_date, payment_status, payment_method, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const activeEmps = db.prepare("SELECT id, khmer_name, salary FROM employees WHERE status = 'Active' LIMIT 5").all();
    for (const e of activeEmps) {
      const bonus = 50.00;
      const allowance = 30.00;
      const net = (parseFloat(e.salary) || 0) + bonus + allowance;
      insertPay.run(e.id, e.khmer_name, '2026-10', parseFloat(e.salary) || 0, bonus, allowance, 0, net, '2026-10-25', 'Paid', 'Bank Transfer', 'បើកប្រាក់ខែតាមធនាគារ ABA');
    }
    console.log('Database seeded with sample payrolls.');
  }
}

// Initial seed disabled - Clean database for user custom data entry
// seedDatabase(false);

function seedAttendancesIfEmpty() {
  // Disabled auto-seeding dummy attendances
  return;
}
// seedAttendancesIfEmpty();

// Helper to generate next employee code
function getNextEmpCode() {
  const last = db.prepare('SELECT emp_code FROM employees ORDER BY id DESC LIMIT 1').get();
  if (!last || !last.emp_code) return 'EMP-0001';
  const match = last.emp_code.match(/EMP-(\d+)/i);
  if (match) {
    const nextNum = parseInt(match[1], 10) + 1;
    return `EMP-${String(nextNum).padStart(4, '0')}`;
  }
  return `EMP-${Date.now().toString().slice(-4)}`;
}

// ----------------- EMPLOYEES API ROUTES -----------------

// 1. Get all employees (with filter, search, sort)
app.get('/api/employees', (req, res) => {
  try {
    const { search, department, status, sortBy, sortOrder } = req.query;

    let query = 'SELECT * FROM employees WHERE 1=1';
    const params = [];

    if (search && search.trim()) {
      const term = `%${search.trim()}%`;
      query += ` AND (
        first_name LIKE ? OR 
        last_name LIKE ? OR 
        khmer_name LIKE ? OR 
        emp_code LIKE ? OR 
        email LIKE ? OR 
        phone LIKE ? OR 
        position LIKE ? OR 
        department LIKE ?
      )`;
      params.push(term, term, term, term, term, term, term, term);
    }

    if (department && department !== 'all') {
      query += ' AND department = ?';
      params.push(department);
    }

    if (status && status !== 'all') {
      query += ' AND status = ?';
      params.push(status);
    }

    const sortMap = {
      id: 'id',
      name: 'first_name',
      salary: 'salary',
      hire_date: 'hire_date',
      department: 'department',
      status: 'status',
      emp_code: 'emp_code'
    };

    const sortColumn = sortMap[sortBy] || 'id';
    const direction = sortOrder && sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    query += ` ORDER BY ${sortColumn} ${direction}`;

    const employees = db.prepare(query).all(...params);
    res.json({ success: true, count: employees.length, data: employees });
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 2. Get single employee by ID
app.get('/api/employees/:id', (req, res) => {
  try {
    const { id } = req.params;
    const employee = db.prepare('SELECT * FROM employees WHERE id = ?').get(id);

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }
    res.json({ success: true, data: employee });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 3. Create new employee
app.post('/api/employees', (req, res) => {
  try {
    let {
      emp_code,
      first_name,
      last_name,
      khmer_name,
      email,
      phone,
      department,
      position,
      salary,
      hire_date,
      status,
      gender,
      avatar_color,
      address,
      notes,
      shift_start,
      shift_end
    } = req.body;

    // Support Khmer full name as primary identifier
    if ((!first_name || !first_name.trim()) && (!last_name || !last_name.trim()) && khmer_name && khmer_name.trim()) {
      const parts = khmer_name.trim().split(/\s+/);
      last_name = parts[0] || 'MRC';
      first_name = parts.slice(1).join(' ') || parts[0];
    }
    if (!first_name || !first_name.trim()) first_name = (khmer_name && khmer_name.trim()) || 'Staff';
    if (!last_name || !last_name.trim()) last_name = 'Member';
    if (!department || !department.trim()) department = 'Operations';
    if (!position || !position.trim()) position = 'បុគ្គលិក';
    if (!email || !email.trim()) {
      const codeClean = (emp_code || ('EMP_' + Date.now())).toLowerCase().replace(/[^a-z0-9]/g, '');
      email = `${codeClean}@mrckh.local`;
    }

    if (!emp_code || !emp_code.trim()) {
      emp_code = getNextEmpCode();
    } else {
      emp_code = emp_code.trim().toUpperCase();
      const existing = db.prepare('SELECT id FROM employees WHERE emp_code = ?').get(emp_code);
      if (existing) {
        return res.status(400).json({
          success: false,
          message: `Employee code ${emp_code} is already in use.`
        });
      }
    }

    const colors = ['#4f46e5', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#3b82f6'];
    if (!avatar_color) {
      avatar_color = colors[Math.floor(Math.random() * colors.length)];
    }

    const insertStmt = db.prepare(`
      INSERT INTO employees (
        emp_code, first_name, last_name, khmer_name, email, phone,
        department, position, salary, hire_date, status, gender,
        avatar_color, address, notes, shift_start, shift_end
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = insertStmt.run(
      emp_code,
      first_name.trim(),
      last_name.trim(),
      khmer_name ? khmer_name.trim() : '',
      email.trim(),
      phone ? phone.trim() : '',
      department,
      position.trim(),
      Number(salary) || 0,
      hire_date || new Date().toISOString().split('T')[0],
      status || 'Active',
      gender || 'Male',
      avatar_color,
      address ? address.trim() : '',
      notes ? notes.trim() : '',
      shift_start ? shift_start.trim() : '08:00',
      shift_end ? shift_end.trim() : '17:00'
    );

    const newId = Number(result.lastInsertRowid);
    const newEmployee = db.prepare('SELECT * FROM employees WHERE id = ?').get(newId);

    res.status(201).json({ success: true, data: newEmployee, message: 'Employee added successfully' });
  } catch (error) {
    console.error('Error creating employee:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 4. Update employee
app.put('/api/employees/:id', (req, res) => {
  try {
    const { id } = req.params;
    const existing = db.prepare('SELECT * FROM employees WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    const {
      emp_code,
      first_name,
      last_name,
      khmer_name,
      email,
      phone,
      department,
      position,
      salary,
      hire_date,
      status,
      gender,
      avatar_color,
      address,
      notes,
      shift_start,
      shift_end
    } = req.body;

    if (emp_code && emp_code.trim().toUpperCase() !== existing.emp_code) {
      const codeCheck = db.prepare('SELECT id FROM employees WHERE emp_code = ? AND id != ?')
        .get(emp_code.trim().toUpperCase(), id);
      if (codeCheck) {
        return res.status(400).json({
          success: false,
          message: `Employee code ${emp_code} is already in use by another employee.`
        });
      }
    }

    const updateStmt = db.prepare(`
      UPDATE employees SET
        emp_code = ?,
        first_name = ?,
        last_name = ?,
        khmer_name = ?,
        email = ?,
        phone = ?,
        department = ?,
        position = ?,
        salary = ?,
        hire_date = ?,
        status = ?,
        gender = ?,
        avatar_color = ?,
        address = ?,
        notes = ?,
        shift_start = ?,
        shift_end = ?,
        updated_at = datetime('now')
      WHERE id = ?
    `);

    updateStmt.run(
      (emp_code ? emp_code.trim().toUpperCase() : existing.emp_code),
      (first_name ? first_name.trim() : existing.first_name),
      (last_name ? last_name.trim() : existing.last_name),
      (khmer_name !== undefined ? khmer_name.trim() : existing.khmer_name),
      (email ? email.trim() : existing.email),
      (phone ? phone.trim() : existing.phone),
      (department || existing.department),
      (position ? position.trim() : existing.position),
      (salary !== undefined ? Number(salary) : existing.salary),
      (hire_date || existing.hire_date),
      (status || existing.status),
      (gender || existing.gender),
      (avatar_color || existing.avatar_color),
      (address !== undefined ? address.trim() : existing.address),
      (notes !== undefined ? notes.trim() : existing.notes),
      (shift_start !== undefined ? shift_start.trim() : (existing.shift_start || '08:00')),
      (shift_end !== undefined ? shift_end.trim() : (existing.shift_end || '17:00')),
      id
    );

    const updated = db.prepare('SELECT * FROM employees WHERE id = ?').get(id);
    res.json({ success: true, data: updated, message: 'Employee updated successfully' });
  } catch (error) {
    console.error('Error updating employee:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 5. Delete employee
app.delete('/api/employees/:id', (req, res) => {
  try {
    const { id } = req.params;
    const existing = db.prepare('SELECT * FROM employees WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    db.prepare('DELETE FROM employees WHERE id = ?').run(id);
    res.json({
      success: true,
      message: `Employee ${existing.first_name} ${existing.last_name} deleted successfully.`
    });
  } catch (error) {
    console.error('Error deleting employee:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 6. Employees Statistics
app.get('/api/stats', (req, res) => {
  try {
    const total = db.prepare('SELECT COUNT(*) as count FROM employees').get().count;
    const active = db.prepare("SELECT COUNT(*) as count FROM employees WHERE status = 'Active'").get().count;
    const probation = db.prepare("SELECT COUNT(*) as count FROM employees WHERE status = 'Probation'").get().count;
    const onLeave = db.prepare("SELECT COUNT(*) as count FROM employees WHERE status = 'On Leave'").get().count;
    const resigned = db.prepare("SELECT COUNT(*) as count FROM employees WHERE status = 'Resigned'").get().count;

    const payrollResult = db.prepare("SELECT SUM(salary) as total FROM employees WHERE status IN ('Active', 'Probation')").get();
    const monthlyPayroll = payrollResult.total || 0;

    const departments = db.prepare(`
      SELECT department, COUNT(*) as count, SUM(salary) as totalSalary 
      FROM employees 
      GROUP BY department 
      ORDER BY count DESC
    `).all();

    const statuses = [
      { status: 'Active', count: active },
      { status: 'Probation', count: probation },
      { status: 'On Leave', count: onLeave },
      { status: 'Resigned', count: resigned }
    ];

    res.json({
      success: true,
      data: {
        total,
        active,
        probation,
        onLeave,
        resigned,
        monthlyPayroll,
        departments,
        statuses
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ----------------- LEAVES / ABSENCE API ROUTES -----------------

// 8. Get leaves (with filtering)
app.get('/api/leaves', (req, res) => {
  try {
    const { status, leave_type, employee_id, search } = req.query;

    let query = `
      SELECT 
        l.*,
        e.emp_code,
        e.first_name,
        e.last_name,
        e.khmer_name,
        e.department,
        e.position,
        e.avatar_color
      FROM leave_requests l
      JOIN employees e ON l.employee_id = e.id
      WHERE 1=1
    `;
    const params = [];

    if (status && status !== 'all') {
      query += ' AND l.status = ?';
      params.push(status);
    }

    if (leave_type && leave_type !== 'all') {
      query += ' AND l.leave_type = ?';
      params.push(leave_type);
    }

    if (employee_id && employee_id !== 'all') {
      query += ' AND l.employee_id = ?';
      params.push(employee_id);
    }

    if (search && search.trim()) {
      const term = `%${search.trim()}%`;
      query += ` AND (
        e.first_name LIKE ? OR 
        e.last_name LIKE ? OR 
        e.khmer_name LIKE ? OR 
        e.emp_code LIKE ? OR 
        l.reason LIKE ?
      )`;
      params.push(term, term, term, term, term);
    }

    query += ' ORDER BY l.id DESC';

    const leaves = db.prepare(query).all(...params);
    res.json({ success: true, count: leaves.length, data: leaves });
  } catch (error) {
    console.error('Error fetching leaves:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 9. Leave statistics
app.get('/api/leaves/stats', (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const total = db.prepare('SELECT COUNT(*) as count FROM leave_requests').get().count;
    const pending = db.prepare("SELECT COUNT(*) as count FROM leave_requests WHERE status = 'Pending'").get().count;
    const approved = db.prepare("SELECT COUNT(*) as count FROM leave_requests WHERE status = 'Approved'").get().count;
    const rejected = db.prepare("SELECT COUNT(*) as count FROM leave_requests WHERE status = 'Rejected'").get().count;

    // Count currently active leaves today
    const absentToday = db.prepare(`
      SELECT COUNT(DISTINCT employee_id) as count 
      FROM leave_requests 
      WHERE status = 'Approved' AND ? >= start_date AND ? <= end_date
    `).get(today, today).count;

    res.json({
      success: true,
      data: {
        total,
        pending,
        approved,
        rejected,
        absentToday
      }
    });
  } catch (error) {
    console.error('Error fetching leave stats:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 10. Create new leave request
app.post('/api/leaves', (req, res) => {
  try {
    const { employee_id, leave_type, start_date, end_date, days_count, reason } = req.body;

    if (!employee_id || !leave_type || !start_date || !end_date || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Employee, leave type, start date, end date, and reason are required.'
      });
    }

    // Verify employee exists
    const emp = db.prepare('SELECT id FROM employees WHERE id = ?').get(employee_id);
    if (!emp) {
      return res.status(404).json({ success: false, message: 'Selected employee not found' });
    }

    // Auto calculate days if not provided
    let calculatedDays = Number(days_count);
    if (!calculatedDays || calculatedDays <= 0) {
      const s = new Date(start_date);
      const e = new Date(end_date);
      const diffTime = Math.abs(e - s);
      calculatedDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    }

    const insertStmt = db.prepare(`
      INSERT INTO leave_requests (
        employee_id, leave_type, start_date, end_date, days_count,
        reason, status
      ) VALUES (?, ?, ?, ?, ?, ?, 'Pending')
    `);

    const result = insertStmt.run(
      employee_id,
      leave_type,
      start_date,
      end_date,
      calculatedDays,
      reason.trim()
    );

    const newId = Number(result.lastInsertRowid);
    const created = db.prepare(`
      SELECT l.*, e.emp_code, e.first_name, e.last_name, e.khmer_name, e.department, e.position, e.avatar_color
      FROM leave_requests l
      JOIN employees e ON l.employee_id = e.id
      WHERE l.id = ?
    `).get(newId);

    res.status(201).json({ success: true, data: created, message: 'Leave request submitted successfully' });
  } catch (error) {
    console.error('Error submitting leave:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 11. Update leave request (Status approval / edit)
app.put('/api/leaves/:id', (req, res) => {
  try {
    const { id } = req.params;
    const existing = db.prepare('SELECT * FROM leave_requests WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Leave request not found' });
    }

    const {
      leave_type,
      start_date,
      end_date,
      days_count,
      reason,
      status,
      approved_by,
      rejection_reason
    } = req.body;

    const updateStmt = db.prepare(`
      UPDATE leave_requests SET
        leave_type = ?,
        start_date = ?,
        end_date = ?,
        days_count = ?,
        reason = ?,
        status = ?,
        approved_by = ?,
        rejection_reason = ?,
        updated_at = datetime('now')
      WHERE id = ?
    `);

    updateStmt.run(
      leave_type || existing.leave_type,
      start_date || existing.start_date,
      end_date || existing.end_date,
      days_count !== undefined ? Number(days_count) : existing.days_count,
      reason ? reason.trim() : existing.reason,
      status || existing.status,
      approved_by !== undefined ? approved_by.trim() : existing.approved_by,
      rejection_reason !== undefined ? rejection_reason.trim() : existing.rejection_reason,
      id
    );

    // If approved and today is within leave range, sync employee status
    if (status === 'Approved') {
      const today = new Date().toISOString().split('T')[0];
      const s = start_date || existing.start_date;
      const e = end_date || existing.end_date;
      if (today >= s && today <= e) {
        db.prepare("UPDATE employees SET status = 'On Leave' WHERE id = ?").run(existing.employee_id);
      }
    } else if (status === 'Rejected' || status === 'Pending') {
      // If was previously on leave, reset to Active if they have no other approved leaves today
      const today = new Date().toISOString().split('T')[0];
      const otherLeaves = db.prepare(`
        SELECT COUNT(*) as count FROM leave_requests 
        WHERE employee_id = ? AND id != ? AND status = 'Approved' AND ? >= start_date AND ? <= end_date
      `).get(existing.employee_id, id, today, today).count;

      if (otherLeaves === 0) {
        const emp = db.prepare('SELECT status FROM employees WHERE id = ?').get(existing.employee_id);
        if (emp && emp.status === 'On Leave') {
          db.prepare("UPDATE employees SET status = 'Active' WHERE id = ?").run(existing.employee_id);
        }
      }
    }

    const updated = db.prepare(`
      SELECT l.*, e.emp_code, e.first_name, e.last_name, e.khmer_name, e.department, e.position, e.avatar_color
      FROM leave_requests l
      JOIN employees e ON l.employee_id = e.id
      WHERE l.id = ?
    `).get(id);

    res.json({ success: true, data: updated, message: 'Leave request updated successfully' });
  } catch (error) {
    console.error('Error updating leave:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 12. Delete leave request
app.delete('/api/leaves/:id', (req, res) => {
  try {
    const { id } = req.params;
    const existing = db.prepare('SELECT * FROM leave_requests WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Leave request not found' });
    }

    db.prepare('DELETE FROM leave_requests WHERE id = ?').run(id);
    res.json({ success: true, message: 'Leave request deleted successfully' });
  } catch (error) {
    console.error('Error deleting leave:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// =========================================================================
// ATTENDANCE & SHIFT / CLOCK-IN & CLOCK-OUT API ROUTES
// =========================================================================

// 1. Get all attendance logs (with filters: date, employee_id, status, search)
app.get('/api/attendances', (req, res) => {
  try {
    const { date, employee_id, status, search } = req.query;
    let query = `
      SELECT 
        a.*,
        e.emp_code,
        e.first_name,
        e.last_name,
        e.khmer_name,
        e.department,
        e.position,
        e.avatar_color,
        COALESCE(e.shift_start, '08:00') as shift_start,
        COALESCE(e.shift_end, '17:00') as shift_end
      FROM attendances a
      JOIN employees e ON a.employee_id = e.id
      WHERE 1=1
    `;
    const params = [];

    if (date && date !== 'all') {
      query += ' AND a.attendance_date = ?';
      params.push(date);
    }
    if (employee_id && employee_id !== 'all') {
      query += ' AND a.employee_id = ?';
      params.push(employee_id);
    }
    if (status && status !== 'all') {
      query += ' AND a.status = ?';
      params.push(status);
    }
    if (search && search.trim()) {
      const term = `%${search.trim()}%`;
      query += ` AND (
        e.first_name LIKE ? OR 
        e.last_name LIKE ? OR 
        e.khmer_name LIKE ? OR 
        e.emp_code LIKE ? OR 
        e.department LIKE ?
      )`;
      params.push(term, term, term, term, term);
    }

    query += ' ORDER BY a.attendance_date DESC, a.check_in DESC, a.id DESC';
    const records = db.prepare(query).all(...params);
    res.json({ success: true, count: records.length, data: records });
  } catch (error) {
    console.error('Error fetching attendances:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 2. Get today's attendance summary & stats
app.get('/api/attendances/today', (req, res) => {
  try {
    const today = getLocalDateStr();
    const totalActiveStaff = db.prepare("SELECT COUNT(*) as count FROM employees WHERE status = 'Active'").get().count;
    const todayRecords = db.prepare(`
      SELECT 
        a.*,
        e.emp_code,
        e.first_name,
        e.last_name,
        e.khmer_name,
        e.department,
        e.position,
        e.avatar_color,
        COALESCE(e.shift_start, '08:00') as shift_start,
        COALESCE(e.shift_end, '17:00') as shift_end
      FROM attendances a
      JOIN employees e ON a.employee_id = e.id
      WHERE a.attendance_date = ?
      ORDER BY a.check_in DESC, a.id DESC
    `).all(today);

    const presentCount = todayRecords.filter(r => r.check_in).length;
    const lateCount = todayRecords.filter(r => r.status === 'Late').length;
    const onTimeCount = todayRecords.filter(r => r.status === 'On Time').length;
    const workingNow = todayRecords.filter(r => r.check_in && !r.check_out).length;

    res.json({
      success: true,
      data: {
        date: today,
        stats: {
          totalActiveStaff,
          presentCount,
          lateCount,
          onTimeCount,
          workingNow,
          absentCount: Math.max(0, totalActiveStaff - presentCount)
        },
        records: todayRecords
      }
    });
  } catch (error) {
    console.error('Error fetching today attendance stats:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get single attendance record
app.get('/api/attendances/:id', (req, res) => {
  try {
    const { id } = req.params;
    const record = db.prepare(`
      SELECT a.*, e.emp_code, e.first_name, e.last_name, e.khmer_name, e.department, e.position,
             COALESCE(e.shift_start, '08:00') as shift_start, COALESCE(e.shift_end, '17:00') as shift_end
      FROM attendances a JOIN employees e ON a.employee_id = e.id
      WHERE a.id = ?
    `).get(id);
    if (!record) return res.status(404).json({ success: false, message: 'Attendance record not found' });
    res.json({ success: true, data: record });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 3. Quick Clock-In / Clock-Out
app.post('/api/attendances/clock', (req, res) => {
  try {
    const { employee_id, action, time, date, notes } = req.body;
    if (!employee_id) {
      return res.status(400).json({ success: false, message: 'Employee is required.' });
    }

    const emp = db.prepare('SELECT * FROM employees WHERE id = ?').get(employee_id);
    if (!emp) {
      return res.status(404).json({ success: false, message: 'Employee not found.' });
    }

    const attDate = date || getLocalDateStr();
    const now = new Date();
    const currentTime = time || `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    let existing = db.prepare('SELECT * FROM attendances WHERE employee_id = ? AND attendance_date = ?').get(employee_id, attDate);

    if (action === 'in' || action === 'clock-in') {
      const shiftStart = emp.shift_start || '08:00';
      let status = 'On Time';
      const [sH, sM] = shiftStart.split(':').map(Number);
      const [cH, cM] = currentTime.split(':').map(Number);
      const diffMins = (cH * 60 + cM) - (sH * 60 + sM);
      if (diffMins > 10) {
        status = 'Late';
      }

      if (existing) {
        db.prepare(`
          UPDATE attendances SET
            check_in = ?,
            status = ?,
            notes = CASE WHEN ? != '' THEN ? ELSE notes END,
            updated_at = datetime('now')
          WHERE id = ?
        `).run(currentTime, status, notes || '', notes || '', existing.id);
      } else {
        db.prepare(`
          INSERT INTO attendances (employee_id, attendance_date, check_in, status, notes)
          VALUES (?, ?, ?, ?, ?)
        `).run(employee_id, attDate, currentTime, status, notes || '');
      }

      const record = db.prepare(`
        SELECT a.*, e.emp_code, e.first_name, e.last_name, e.khmer_name, e.department, e.position,
               COALESCE(e.shift_start, '08:00') as shift_start, COALESCE(e.shift_end, '17:00') as shift_end
        FROM attendances a JOIN employees e ON a.employee_id = e.id
        WHERE a.employee_id = ? AND a.attendance_date = ?
      `).get(employee_id, attDate);

      return res.json({
        success: true,
        message: `បានកត់ត្រាម៉ោងចូលដោយជោគជ័យ: ${currentTime} (${status === 'Late' ? 'មកយឺត' : 'ទាន់ពេល'})`,
        data: record
      });
    } else if (action === 'out' || action === 'clock-out') {
      let checkInTime = existing ? existing.check_in : (emp.shift_start || '08:00');
      let workHours = 0;
      if (checkInTime) {
        const [inH, inM] = checkInTime.split(':').map(Number);
        const [outH, outM] = currentTime.split(':').map(Number);
        const totalMins = (outH * 60 + outM) - (inH * 60 + inM);
        workHours = Math.max(0, Math.round((totalMins / 60) * 10) / 10);
      }

      let status = existing ? existing.status : 'On Time';
      const shiftEnd = emp.shift_end || '17:00';
      const [seH, seM] = shiftEnd.split(':').map(Number);
      const [outH, outM] = currentTime.split(':').map(Number);
      const diffEnd = (outH * 60 + outM) - (seH * 60 + seM);
      if (diffEnd < -15 && status !== 'Late') {
        status = 'Early Leave';
      }

      if (existing) {
        db.prepare(`
          UPDATE attendances SET
            check_out = ?,
            work_hours = ?,
            status = ?,
            notes = CASE WHEN ? != '' THEN ? ELSE notes END,
            updated_at = datetime('now')
          WHERE id = ?
        `).run(currentTime, workHours, status, notes || '', notes || '', existing.id);
      } else {
        db.prepare(`
          INSERT INTO attendances (employee_id, attendance_date, check_in, check_out, status, work_hours, notes)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(employee_id, attDate, checkInTime, currentTime, status, workHours, notes || '');
      }

      const record = db.prepare(`
        SELECT a.*, e.emp_code, e.first_name, e.last_name, e.khmer_name, e.department, e.position,
               COALESCE(e.shift_start, '08:00') as shift_start, COALESCE(e.shift_end, '17:00') as shift_end
        FROM attendances a JOIN employees e ON a.employee_id = e.id
        WHERE a.employee_id = ? AND a.attendance_date = ?
      `).get(employee_id, attDate);

      return res.json({
        success: true,
        message: `បានកត់ត្រាម៉ោងចេញដោយជោគជ័យ: ${currentTime} (${workHours} ម៉ោង)`,
        data: record
      });
    } else {
      return res.status(400).json({ success: false, message: 'Invalid action. Use "in" or "out".' });
    }
  } catch (error) {
    console.error('Error recording attendance clock:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 4. Create or upsert attendance log manually
app.post('/api/attendances', (req, res) => {
  try {
    const { employee_id, attendance_date, check_in, check_out, status, notes } = req.body;
    if (!employee_id || !attendance_date) {
      return res.status(400).json({ success: false, message: 'Employee and date are required.' });
    }

    const emp = db.prepare('SELECT * FROM employees WHERE id = ?').get(employee_id);
    if (!emp) {
      return res.status(404).json({ success: false, message: 'Employee not found.' });
    }

    let workHours = 0;
    if (check_in && check_out) {
      const [inH, inM] = check_in.split(':').map(Number);
      const [outH, outM] = check_out.split(':').map(Number);
      const totalMins = (outH * 60 + outM) - (inH * 60 + inM);
      workHours = Math.max(0, Math.round((totalMins / 60) * 10) / 10);
    }

    let attStatus = status;
    if (!attStatus || attStatus === 'Auto') {
      attStatus = 'On Time';
      const shiftStart = emp.shift_start || '08:00';
      const shiftEnd = emp.shift_end || '17:00';
      if (check_in) {
        const [sH, sM] = shiftStart.split(':').map(Number);
        const [cH, cM] = check_in.split(':').map(Number);
        const diffMins = (cH * 60 + cM) - (sH * 60 + sM);
        if (diffMins > 10) attStatus = 'Late';
      }
      if (check_out) {
        const [eH, eM] = shiftEnd.split(':').map(Number);
        const [oH, oM] = check_out.split(':').map(Number);
        const diffEnd = (eH * 60 + eM) - (oH * 60 + oM);
        if (diffEnd > 15) attStatus = 'Early Leave';
      }
    }

    const existing = db.prepare('SELECT * FROM attendances WHERE employee_id = ? AND attendance_date = ?').get(employee_id, attendance_date);
    let recordId;
    if (existing) {
      db.prepare(`
        UPDATE attendances SET
          check_in = COALESCE(?, check_in),
          check_out = COALESCE(?, check_out),
          status = ?,
          work_hours = ?,
          notes = CASE WHEN ? != '' THEN ? ELSE notes END,
          updated_at = datetime('now')
        WHERE id = ?
      `).run(
        check_in || null,
        check_out || null,
        attStatus,
        workHours,
        notes || '',
        notes || '',
        existing.id
      );
      recordId = existing.id;
    } else {
      const insertStmt = db.prepare(`
        INSERT INTO attendances (employee_id, attendance_date, check_in, check_out, status, work_hours, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      const result = insertStmt.run(
        employee_id,
        attendance_date,
        check_in || null,
        check_out || null,
        attStatus,
        workHours,
        notes || ''
      );
      recordId = result.lastInsertRowid;
    }

    const record = db.prepare(`
      SELECT a.*, e.emp_code, e.first_name, e.last_name, e.khmer_name, e.department, e.position,
             COALESCE(e.shift_start, '08:00') as shift_start, COALESCE(e.shift_end, '17:00') as shift_end
      FROM attendances a JOIN employees e ON a.employee_id = e.id
      WHERE a.id = ?
    `).get(recordId);

    res.status(201).json({ success: true, data: record, message: 'Attendance record saved successfully' });
  } catch (error) {
    console.error('Error creating attendance record:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 5. Update attendance log
app.put('/api/attendances/:id', (req, res) => {
  try {
    const { id } = req.params;
    const existing = db.prepare('SELECT * FROM attendances WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Attendance record not found' });
    }

    const { employee_id, attendance_date, check_in, check_out, status, notes } = req.body;
    const finalEmpId = employee_id || existing.employee_id;
    const finalDate = attendance_date || existing.attendance_date;
    const finalIn = check_in !== undefined ? check_in : existing.check_in;
    const finalOut = check_out !== undefined ? check_out : existing.check_out;

    let workHours = existing.work_hours;
    if (finalIn && finalOut) {
      const [inH, inM] = finalIn.split(':').map(Number);
      const [outH, outM] = finalOut.split(':').map(Number);
      const totalMins = (outH * 60 + outM) - (inH * 60 + inM);
      workHours = Math.max(0, Math.round((totalMins / 60) * 10) / 10);
    }

    let finalStatus = status;
    if (!finalStatus || finalStatus === 'Auto') {
      const emp = db.prepare('SELECT * FROM employees WHERE id = ?').get(finalEmpId);
      finalStatus = existing.status || 'On Time';
      if (emp) {
        const shiftStart = emp.shift_start || '08:00';
        const shiftEnd = emp.shift_end || '17:00';
        if (finalIn) {
          const [sH, sM] = shiftStart.split(':').map(Number);
          const [cH, cM] = finalIn.split(':').map(Number);
          const diffMins = (cH * 60 + cM) - (sH * 60 + sM);
          finalStatus = diffMins > 10 ? 'Late' : 'On Time';
        }
        if (finalOut) {
          const [eH, eM] = shiftEnd.split(':').map(Number);
          const [oH, oM] = finalOut.split(':').map(Number);
          const diffEnd = (eH * 60 + eM) - (oH * 60 + oM);
          if (diffEnd > 15) finalStatus = 'Early Leave';
        }
      }
    }

    db.prepare(`
      UPDATE attendances SET
        employee_id = ?,
        attendance_date = ?,
        check_in = ?,
        check_out = ?,
        status = ?,
        work_hours = ?,
        notes = ?,
        updated_at = datetime('now')
      WHERE id = ?
    `).run(
      finalEmpId,
      finalDate,
      finalIn || null,
      finalOut || null,
      finalStatus,
      workHours,
      notes !== undefined ? notes : existing.notes,
      id
    );

    const record = db.prepare(`
      SELECT a.*, e.emp_code, e.first_name, e.last_name, e.khmer_name, e.department, e.position,
             COALESCE(e.shift_start, '08:00') as shift_start, COALESCE(e.shift_end, '17:00') as shift_end
      FROM attendances a JOIN employees e ON a.employee_id = e.id
      WHERE a.id = ?
    `).get(id);

    res.json({ success: true, data: record, message: 'Attendance record updated successfully' });
  } catch (error) {
    console.error('Error updating attendance record:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 6. Delete attendance log
app.delete('/api/attendances/:id', (req, res) => {
  try {
    const { id } = req.params;
    const existing = db.prepare('SELECT * FROM attendances WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Attendance record not found' });
    }

    db.prepare('DELETE FROM attendances WHERE id = ?').run(id);
    res.json({ success: true, message: 'Attendance record deleted successfully' });
  } catch (error) {
    console.error('Error deleting attendance record:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ----------------- PRODUCTS & INVENTORY API ROUTES -----------------

// 1. Get all products with search, category, low_stock filters & inventory stats
app.get('/api/products', (req, res) => {
  try {
    const { search, category, low_stock, sortBy, sortOrder } = req.query;

    let query = 'SELECT * FROM products WHERE 1=1';
    const params = [];

    if (search && search.trim()) {
      const term = `%${search.trim()}%`;
      query += ' AND (name LIKE ? OR code LIKE ? OR category LIKE ?)';
      params.push(term, term, term);
    }

    if (category && category !== 'all') {
      query += ' AND category = ?';
      params.push(category);
    }

    if (low_stock === 'true' || low_stock === '1') {
      query += ' AND stock_qty <= low_stock_threshold';
    }

    const direction = sortOrder && sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
    let sortField = 'name';
    if (sortBy === 'stock') sortField = 'stock_qty';
    else if (sortBy === 'price') sortField = 'selling_price';
    else if (sortBy === 'code') sortField = 'code';
    query += ` ORDER BY ${sortField} ${direction}`;

    const products = db.prepare(query).all(...params).map(p => ({
      ...p,
      is_low_stock: p.stock_qty <= p.low_stock_threshold && p.stock_qty > 0,
      is_out_of_stock: p.stock_qty <= 0
    }));

    // Inventory summary statistics
    const stats = db.prepare(`
      SELECT
        COUNT(*) as total_products,
        COALESCE(SUM(stock_qty), 0) as total_stock_qty,
        ROUND(COALESCE(SUM(stock_qty * cost_price), 0), 2) as total_cost_value,
        ROUND(COALESCE(SUM(stock_qty * selling_price), 0), 2) as total_retail_value,
        SUM(CASE WHEN stock_qty <= low_stock_threshold AND stock_qty > 0 THEN 1 ELSE 0 END) as low_stock_count,
        SUM(CASE WHEN stock_qty <= 0 THEN 1 ELSE 0 END) as out_of_stock_count
      FROM products
    `).get();

    // Distinct Product Categories
    const categories = db.prepare(`
      SELECT DISTINCT category FROM products WHERE category IS NOT NULL AND category != '' ORDER BY category ASC
    `).all().map(r => r.category);

    res.json({ success: true, count: products.length, data: products, stats, categories });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 2. Get single product by ID
app.get('/api/products/:id', (req, res) => {
  try {
    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 3. Create new product (Supports New & Secondhand Condition, Serial/IMEI, Warranty)
app.post('/api/products', (req, res) => {
  try {
    const { code, name, category, cost_price, selling_price, stock_qty, low_stock_threshold, unit, notes, condition, serial_number, warranty_period } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Product name is required' });
    }

    const prdCode = code && code.trim() ? code.trim().toUpperCase() : `PRD-${Date.now().toString().slice(-4)}`;
    const cost = Math.max(0, parseFloat(cost_price) || 0);
    const sell = Math.max(0, parseFloat(selling_price) || 0);
    const stock = Math.max(0, parseFloat(stock_qty) || 0);
    const lowThreshold = Math.max(0, parseFloat(low_stock_threshold) || 5);

    const insertStmt = db.prepare(`
      INSERT INTO products (code, name, category, cost_price, selling_price, stock_qty, low_stock_threshold, unit, notes, condition, serial_number, warranty_period)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = insertStmt.run(
      prdCode,
      name.trim(),
      category || 'គ្រឿងអេឡិចត្រូនិច & IT',
      cost,
      sell,
      stock,
      lowThreshold,
      unit || 'គ្រឿង',
      notes ? notes.trim() : '',
      condition || 'ថ្មី 100%',
      serial_number ? serial_number.trim() : '',
      warranty_period || 'គ្មានការធានា'
    );

    const newProd = db.prepare('SELECT * FROM products WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({ success: true, data: newProd, message: 'Product added successfully' });
  } catch (error) {
    console.error('Error adding product:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 4. Update existing product
app.put('/api/products/:id', (req, res) => {
  try {
    const { id } = req.params;
    const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
    if (!existing) return res.status(404).json({ success: false, message: 'Product not found' });

    const { code, name, category, cost_price, selling_price, stock_qty, low_stock_threshold, unit, notes, condition, serial_number, warranty_period } = req.body;

    const prdCode = code ? code.trim().toUpperCase() : existing.code;
    const prdName = name ? name.trim() : existing.name;
    const cat = category || existing.category;
    const cost = cost_price !== undefined ? Math.max(0, parseFloat(cost_price) || 0) : existing.cost_price;
    const sell = selling_price !== undefined ? Math.max(0, parseFloat(selling_price) || 0) : existing.selling_price;
    const stock = stock_qty !== undefined ? Math.max(0, parseFloat(stock_qty) || 0) : existing.stock_qty;
    const lowThreshold = low_stock_threshold !== undefined ? Math.max(0, parseFloat(low_stock_threshold) || 0) : existing.low_stock_threshold;
    const prdUnit = unit || existing.unit;
    const prdNotes = notes !== undefined ? notes.trim() : existing.notes;
    const prdCond = condition !== undefined ? condition : (existing.condition || 'ថ្មី 100%');
    const prdSerial = serial_number !== undefined ? serial_number.trim() : (existing.serial_number || '');
    const prdWarranty = warranty_period !== undefined ? warranty_period : (existing.warranty_period || 'គ្មានការធានា');

    db.prepare(`
      UPDATE products SET
        code = ?, name = ?, category = ?, cost_price = ?, selling_price = ?,
        stock_qty = ?, low_stock_threshold = ?, unit = ?, notes = ?,
        condition = ?, serial_number = ?, warranty_period = ?, updated_at = datetime('now')
      WHERE id = ?
    `).run(prdCode, prdName, cat, cost, sell, stock, lowThreshold, prdUnit, prdNotes, prdCond, prdSerial, prdWarranty, id);

    const updated = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
    res.json({ success: true, data: updated, message: 'Product updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 5. Delete product
app.delete('/api/products/:id', (req, res) => {
  try {
    const { id } = req.params;
    const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
    if (!existing) return res.status(404).json({ success: false, message: 'Product not found' });
    try {
      db.prepare('UPDATE sale_items SET product_id = NULL WHERE product_id = ?').run(id);
    } catch (e) {}
    db.prepare('DELETE FROM products WHERE id = ?').run(id);
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 6. Quick Restock
app.post('/api/products/:id/restock', (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;
    const addQty = parseFloat(quantity) || 0;
    if (addQty <= 0) return res.status(400).json({ success: false, message: 'Restock quantity must be greater than 0' });

    const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
    if (!existing) return res.status(404).json({ success: false, message: 'Product not found' });

    db.prepare(`UPDATE products SET stock_qty = stock_qty + ?, updated_at = datetime('now') WHERE id = ?`).run(addQty, id);
    const updated = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
    res.json({ success: true, data: updated, message: `Added ${addQty} units to stock successfully` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ----------------- SALES & POS / PROFIT API ROUTES -----------------

// Helper to format local date YYYY-MM-DD
function getLocalDateStr(d = new Date()) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Helper to generate next invoice number (e.g., INV-20261025-001)
function getNextInvoiceNo() {
  const dateStr = getLocalDateStr().replace(/-/g, '');
  const prefix = `INV-${dateStr}-`;
  const last = db.prepare('SELECT invoice_no FROM sales WHERE invoice_no LIKE ? ORDER BY id DESC LIMIT 1').get(`${prefix}%`);
  if (!last || !last.invoice_no) return `${prefix}001`;
  const match = last.invoice_no.match(/INV-\d+-(\d+)/);
  if (match) {
    const nextNum = parseInt(match[1], 10) + 1;
    return `${prefix}${String(nextNum).padStart(3, '0')}`;
  }
  return `${prefix}${Date.now().toString().slice(-3)}`;
}

// 1. Get all sales (with search, category, seller, date filters, sorting)
app.get('/api/sales', (req, res) => {
  try {
    const { search, category, seller, date_filter, start_date, end_date, sortBy, sortOrder } = req.query;

    let query = 'SELECT * FROM sales WHERE 1=1';
    const params = [];

    if (search && search.trim()) {
      const term = `%${search.trim()}%`;
      query += ` AND (
        product_name LIKE ? OR 
        invoice_no LIKE ? OR 
        seller_name LIKE ? OR 
        customer_name LIKE ? OR 
        category LIKE ?
      )`;
      params.push(term, term, term, term, term);
    }

    if (category && category !== 'all') {
      query += ' AND category = ?';
      params.push(category);
    }

    if (seller && seller !== 'all') {
      query += ' AND seller_name = ?';
      params.push(seller);
    }

    const todayStr = getLocalDateStr();
    const yDate = new Date();
    yDate.setDate(yDate.getDate() - 1);
    const yesterdayStr = getLocalDateStr(yDate);

    const currentMonth = todayStr.slice(0, 7);
    const lmDate = new Date();
    lmDate.setMonth(lmDate.getMonth() - 1);
    const lastMonthStr = `${lmDate.getFullYear()}-${String(lmDate.getMonth() + 1).padStart(2, '0')}`;

    const currentYear = todayStr.slice(0, 4);
    const lastYearStr = String(parseInt(currentYear, 10) - 1);

    if (date_filter === 'today') {
      query += ' AND sale_date = ?';
      params.push(todayStr);
    } else if (date_filter === 'yesterday') {
      query += ' AND sale_date = ?';
      params.push(yesterdayStr);
    } else if (date_filter === 'this_month') {
      query += ' AND sale_date LIKE ?';
      params.push(`${currentMonth}%`);
    } else if (date_filter === 'last_month') {
      query += ' AND sale_date LIKE ?';
      params.push(`${lastMonthStr}%`);
    } else if (date_filter === 'this_year') {
      query += ' AND sale_date LIKE ?';
      params.push(`${currentYear}%`);
    } else if (date_filter === 'last_year') {
      query += ' AND sale_date LIKE ?';
      params.push(`${lastYearStr}%`);
    } else if (date_filter === 'custom' && start_date && end_date) {
      query += ' AND sale_date >= ? AND sale_date <= ?';
      params.push(start_date, end_date);
    }

    const sortMap = {
      total: 'total_amount',
      profit: 'profit',
      quantity: 'quantity',
      product: 'product_name',
      id: 'id'
    };

    const direction = sortOrder && sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    if (!sortBy || sortBy === 'date' || !sortMap[sortBy]) {
      query += ` ORDER BY sale_date ${direction}, sale_time ${direction}, id ${direction}`;
    } else {
      query += ` ORDER BY ${sortMap[sortBy]} ${direction}`;
    }

    const sales = db.prepare(query).all(...params);
    res.json({ success: true, count: sales.length, data: sales });
  } catch (error) {
    console.error('Error fetching sales:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 2. Get Sales Statistics (Today, This Month, Overall, Daily & Monthly Breakdown)
app.get('/api/sales/stats', (req, res) => {
  try {
    const todayStr = getLocalDateStr();
    const currentMonth = todayStr.slice(0, 7);
    const currentYear = todayStr.slice(0, 4);

    // Today metrics
    const today = db.prepare(`
      SELECT 
        COUNT(*) as count,
        COALESCE(SUM(total_cost), 0) as total_cost,
        COALESCE(SUM(total_amount), 0) as total_revenue,
        COALESCE(SUM(profit), 0) as total_profit
      FROM sales WHERE sale_date = ?
    `).get(todayStr);
    today.margin = today.total_revenue > 0 ? Math.round((today.total_profit / today.total_revenue) * 1000) / 10 : 0;

    // This month metrics
    const thisMonth = db.prepare(`
      SELECT 
        COUNT(*) as count,
        COALESCE(SUM(total_cost), 0) as total_cost,
        COALESCE(SUM(total_amount), 0) as total_revenue,
        COALESCE(SUM(profit), 0) as total_profit
      FROM sales WHERE sale_date LIKE ?
    `).get(`${currentMonth}%`);
    thisMonth.margin = thisMonth.total_revenue > 0 ? Math.round((thisMonth.total_profit / thisMonth.total_revenue) * 1000) / 10 : 0;

    // This year metrics
    const thisYear = db.prepare(`
      SELECT 
        COUNT(*) as count,
        COALESCE(SUM(total_cost), 0) as total_cost,
        COALESCE(SUM(total_amount), 0) as total_revenue,
        COALESCE(SUM(profit), 0) as total_profit
      FROM sales WHERE sale_date LIKE ?
    `).get(`${currentYear}%`);
    thisYear.margin = thisYear.total_revenue > 0 ? Math.round((thisYear.total_profit / thisYear.total_revenue) * 1000) / 10 : 0;

    // All-time overall metrics
    const overall = db.prepare(`
      SELECT 
        COUNT(*) as count,
        COALESCE(SUM(total_cost), 0) as total_cost,
        COALESCE(SUM(total_amount), 0) as total_revenue,
        COALESCE(SUM(profit), 0) as total_profit
      FROM sales
    `).get();
    overall.margin = overall.total_revenue > 0 ? Math.round((overall.total_profit / overall.total_revenue) * 1000) / 10 : 0;

    // Daily breakdown (grouped by sale_date)
    const dailyBreakdown = db.prepare(`
      SELECT 
        sale_date,
        COUNT(*) as count,
        ROUND(SUM(total_cost), 2) as total_cost,
        ROUND(SUM(total_amount), 2) as total_revenue,
        ROUND(SUM(profit), 2) as total_profit
      FROM sales 
      GROUP BY sale_date 
      ORDER BY sale_date DESC 
      LIMIT 30
    `).all().map(item => ({
      ...item,
      margin: item.total_revenue > 0 ? Math.round((item.total_profit / item.total_revenue) * 1000) / 10 : 0
    }));

    // Monthly breakdown (grouped by YYYY-MM)
    const monthlyBreakdown = db.prepare(`
      SELECT 
        substr(sale_date, 1, 7) as month_str,
        COUNT(*) as count,
        ROUND(SUM(total_cost), 2) as total_cost,
        ROUND(SUM(total_amount), 2) as total_revenue,
        ROUND(SUM(profit), 2) as total_profit
      FROM sales 
      GROUP BY month_str 
      ORDER BY month_str DESC
    `).all().map(item => ({
      ...item,
      margin: item.total_revenue > 0 ? Math.round((item.total_profit / item.total_revenue) * 1000) / 10 : 0
    }));

    // Yearly breakdown (grouped by YYYY)
    const yearlyBreakdown = db.prepare(`
      SELECT 
        substr(sale_date, 1, 4) as year_str,
        COUNT(*) as count,
        ROUND(SUM(total_cost), 2) as total_cost,
        ROUND(SUM(total_amount), 2) as total_revenue,
        ROUND(SUM(profit), 2) as total_profit
      FROM sales 
      GROUP BY year_str 
      ORDER BY year_str DESC
    `).all().map(item => ({
      ...item,
      margin: item.total_revenue > 0 ? Math.round((item.total_profit / item.total_revenue) * 1000) / 10 : 0
    }));

    // Distinct Categories
    const categories = db.prepare(`
      SELECT DISTINCT category FROM sales WHERE category IS NOT NULL AND category != '' ORDER BY category ASC
    `).all().map(r => r.category);

    // Distinct Sellers
    const sellers = db.prepare(`
      SELECT DISTINCT seller_name FROM sales WHERE seller_name IS NOT NULL AND seller_name != '' ORDER BY seller_name ASC
    `).all().map(r => r.seller_name);

    // Inventory overview stats
    const inventoryStats = db.prepare(`
      SELECT
        COUNT(*) as total_products,
        COALESCE(SUM(stock_qty), 0) as total_stock_qty,
        ROUND(COALESCE(SUM(stock_qty * cost_price), 0), 2) as total_cost_value,
        ROUND(COALESCE(SUM(stock_qty * selling_price), 0), 2) as total_retail_value,
        SUM(CASE WHEN stock_qty <= low_stock_threshold AND stock_qty > 0 THEN 1 ELSE 0 END) as low_stock_count,
        SUM(CASE WHEN stock_qty <= 0 THEN 1 ELSE 0 END) as out_of_stock_count
      FROM products
    `).get() || { total_products: 0, total_stock_qty: 0, total_cost_value: 0, total_retail_value: 0, low_stock_count: 0, out_of_stock_count: 0 };

    // Financial totals (Discounts & VAT)
    const financialTotals = db.prepare(`
      SELECT
        ROUND(COALESCE(SUM(discount_amount), 0), 2) as total_discount_given,
        ROUND(COALESCE(SUM(tax_amount), 0), 2) as total_tax_collected
      FROM sales
    `).get() || { total_discount_given: 0, total_tax_collected: 0 };

    res.json({
      success: true,
      data: {
        today,
        thisMonth,
        thisYear,
        overall,
        dailyBreakdown,
        monthlyBreakdown,
        yearlyBreakdown,
        categories,
        sellers,
        inventoryStats,
        financialTotals
      }
    });
  } catch (error) {
    console.error('Error fetching sales stats:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 3. Get single sale by ID (with line items)
app.get('/api/sales/:id', (req, res) => {
  try {
    const sale = db.prepare('SELECT * FROM sales WHERE id = ?').get(req.params.id);
    if (!sale) {
      return res.status(404).json({ success: false, message: 'Sale record not found' });
    }
    const items = db.prepare('SELECT * FROM sale_items WHERE sale_id = ?').all(sale.id);
    sale.items = items.length > 0 ? items : [{
      product_name: sale.product_name,
      category: sale.category,
      quantity: sale.quantity,
      cost_price: sale.cost_price,
      selling_price: sale.selling_price,
      total_cost: sale.total_cost,
      total_amount: sale.total_amount,
      profit: sale.profit
    }];
    res.json({ success: true, data: sale });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 4. Record new sale (supports Multi-Item Cart, Discount, Tax, & Auto-Stock Deduction)
app.post('/api/sales', (req, res) => {
  try {
    const {
      items, // Array of { product_id, product_name, category, quantity, cost_price, selling_price }
      product_name, // fallback for single-item
      category,
      quantity,
      cost_price,
      selling_price,
      discount_type, // 'fixed' | 'percentage'
      discount_val,
      tax_rate, // e.g. 10 for 10% VAT
      seller_name,
      seller_id,
      customer_name,
      payment_method,
      sale_date,
      sale_time,
      notes
    } = req.body;

    let saleItems = [];
    if (Array.isArray(items) && items.length > 0) {
      saleItems = items.map(it => {
        const q = Math.max(0.01, parseFloat(it.quantity) || 1);
        const cp = Math.max(0, parseFloat(it.cost_price) || 0);
        const sp = Math.max(0, parseFloat(it.selling_price) || 0);
        const tc = Math.round(q * cp * 100) / 100;
        const ta = Math.round(q * sp * 100) / 100;
        const pr = Math.round((ta - tc) * 100) / 100;
        return {
          product_id: it.product_id || null,
          product_name: (it.product_name || 'ទំនិញ').trim(),
          category: (it.category || 'ទូទៅ / General').trim(),
          quantity: q,
          cost_price: cp,
          selling_price: sp,
          total_cost: tc,
          total_amount: ta,
          profit: pr
        };
      });
    } else {
      if (!product_name || !product_name.trim()) {
        return res.status(400).json({ success: false, message: 'Product name is required' });
      }
      const q = Math.max(0.01, parseFloat(quantity) || 1);
      const cp = Math.max(0, parseFloat(cost_price) || 0);
      const sp = Math.max(0, parseFloat(selling_price) || 0);
      const tc = Math.round(q * cp * 100) / 100;
      const ta = Math.round(q * sp * 100) / 100;
      const pr = Math.round((ta - tc) * 100) / 100;
      saleItems.push({
        product_id: null,
        product_name: product_name.trim(),
        category: category || 'ទូទៅ / General',
        quantity: q,
        cost_price: cp,
        selling_price: sp,
        total_cost: tc,
        total_amount: ta,
        profit: pr
      });
    }

    // Compute Totals, Discount, and Tax
    const subtotal = Math.round(saleItems.reduce((acc, it) => acc + it.total_amount, 0) * 100) / 100;
    const total_cost = Math.round(saleItems.reduce((acc, it) => acc + it.total_cost, 0) * 100) / 100;

    const discType = discount_type === 'percentage' ? 'percentage' : 'fixed';
    const discVal = Math.max(0, parseFloat(discount_val) || 0);
    let discount_amount = 0;
    if (discType === 'percentage') {
      discount_amount = Math.round(subtotal * (discVal / 100) * 100) / 100;
    } else {
      discount_amount = Math.min(subtotal, discVal);
    }
    discount_amount = Math.round(discount_amount * 100) / 100;

    const afterDiscount = Math.max(0, subtotal - discount_amount);
    const taxRate = Math.max(0, parseFloat(tax_rate) || 0);
    const tax_amount = Math.round(afterDiscount * (taxRate / 100) * 100) / 100;
    const total_amount = Math.round((afterDiscount + tax_amount) * 100) / 100;
    // Net profit = revenue after discount - wholesale cost
    const profit = Math.round((afterDiscount - total_cost) * 100) / 100;

    const invoice_no = getNextInvoiceNo();
    const todayStr = getLocalDateStr();
    const nowTime = new Date().toTimeString().slice(0, 5);

    const sDate = sale_date || todayStr;
    const sTime = sale_time || nowTime;
    const sSeller = seller_name && seller_name.trim() ? seller_name.trim() : 'MRC Staff';

    const mainProductName = saleItems.length === 1 
      ? saleItems[0].product_name 
      : `${saleItems[0].product_name} (+${saleItems.length - 1} មុខទៀត)`;
    const mainCategory = saleItems.length === 1 ? saleItems[0].category : 'កន្ត្រកទំនិញចម្រុះ / Multi-Items';
    const totalQty = saleItems.reduce((acc, it) => acc + it.quantity, 0);

    const insertStmt = db.prepare(`
      INSERT INTO sales (
        invoice_no, product_name, category, quantity, cost_price, selling_price,
        total_cost, total_amount, profit, seller_id, seller_name,
        customer_name, payment_method, sale_date, sale_time, notes,
        subtotal, items_count, discount_type, discount_val, discount_amount,
        tax_rate, tax_amount
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = insertStmt.run(
      invoice_no,
      mainProductName,
      mainCategory,
      totalQty,
      saleItems[0].cost_price,
      saleItems[0].selling_price,
      total_cost,
      total_amount,
      profit,
      seller_id || null,
      sSeller,
      customer_name ? customer_name.trim() : '',
      payment_method || 'Cash',
      sDate,
      sTime,
      notes ? notes.trim() : '',
      subtotal,
      saleItems.length,
      discType,
      discVal,
      discount_amount,
      taxRate,
      tax_amount
    );

    const saleId = result.lastInsertRowid;

    // Insert line items & decrement stock (Supports Condition, Serial/IMEI, Warranty)
    const insertItemStmt = db.prepare(`
      INSERT INTO sale_items (
        sale_id, product_id, product_name, category, quantity, cost_price, selling_price, total_cost, total_amount, profit,
        item_condition, serial_number, warranty_period
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const deductStockStmt = db.prepare(`
      UPDATE products SET stock_qty = MAX(0, stock_qty - ?), updated_at = datetime('now') WHERE id = ?
    `);

    for (const it of saleItems) {
      insertItemStmt.run(
        saleId,
        it.product_id,
        it.product_name,
        it.category,
        it.quantity,
        it.cost_price,
        it.selling_price,
        it.total_cost,
        it.total_amount,
        it.profit,
        it.condition || it.item_condition || '',
        it.serial_number || '',
        it.warranty_period || ''
      );

      if (it.product_id) {
        deductStockStmt.run(it.quantity, it.product_id);
      }
    }

    const newSale = db.prepare('SELECT * FROM sales WHERE id = ?').get(saleId);
    newSale.items = db.prepare('SELECT * FROM sale_items WHERE sale_id = ?').all(saleId);

    // Trigger Instant Telegram Notification in background if configured
    try {
      sendTelegramSaleNotification(newSale);
    } catch (e) {}

    res.status(201).json({ success: true, data: newSale, message: 'Sale recorded successfully' });
  } catch (error) {
    console.error('Error creating sale:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 5. Update existing sale
app.put('/api/sales/:id', (req, res) => {
  try {
    const { id } = req.params;
    const existing = db.prepare('SELECT * FROM sales WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Sale record not found' });
    }

    const {
      product_name,
      category,
      quantity,
      cost_price,
      selling_price,
      discount_type,
      discount_val,
      seller_name,
      seller_id,
      customer_name,
      payment_method,
      sale_date,
      sale_time,
      notes
    } = req.body;

    const pName = product_name ? product_name.trim() : existing.product_name;
    const cat = category || existing.category;
    const qty = quantity !== undefined ? parseFloat(quantity) : existing.quantity;
    const cost = cost_price !== undefined ? parseFloat(cost_price) : existing.cost_price;
    const sell = selling_price !== undefined ? parseFloat(selling_price) : existing.selling_price;
    
    const dType = discount_type || existing.discount_type || 'fixed';
    const dVal = discount_val !== undefined ? (parseFloat(discount_val) || 0) : (existing.discount_val || 0);
    const subtotal = Math.round(qty * sell * 100) / 100;
    let discAmount = 0;
    if (dType === 'percentage') {
      discAmount = Math.round(subtotal * (dVal / 100) * 100) / 100;
    } else {
      discAmount = Math.min(subtotal, dVal);
    }
    discAmount = Math.round(discAmount * 100) / 100;
    const afterDiscount = Math.max(0, subtotal - discAmount);
    const total_cost = Math.round(qty * cost * 100) / 100;
    const total_amount = afterDiscount;
    const profit = Math.round((afterDiscount - total_cost) * 100) / 100;

    const updateStmt = db.prepare(`
      UPDATE sales SET
        product_name = ?,
        category = ?,
        quantity = ?,
        cost_price = ?,
        selling_price = ?,
        subtotal = ?,
        discount_type = ?,
        discount_val = ?,
        discount_amount = ?,
        total_cost = ?,
        total_amount = ?,
        profit = ?,
        seller_id = ?,
        seller_name = ?,
        customer_name = ?,
        payment_method = ?,
        sale_date = ?,
        sale_time = ?,
        notes = ?,
        updated_at = datetime('now')
      WHERE id = ?
    `);

    updateStmt.run(
      pName,
      cat,
      qty,
      cost,
      sell,
      subtotal,
      dType,
      dVal,
      discAmount,
      total_cost,
      total_amount,
      profit,
      seller_id !== undefined ? seller_id : existing.seller_id,
      seller_name ? seller_name.trim() : existing.seller_name,
      customer_name !== undefined ? customer_name.trim() : existing.customer_name,
      payment_method || existing.payment_method,
      sale_date || existing.sale_date,
      sale_time || existing.sale_time,
      notes !== undefined ? notes.trim() : existing.notes,
      id
    );

    const updated = db.prepare('SELECT * FROM sales WHERE id = ?').get(id);
    res.json({ success: true, data: updated, message: 'Sale updated successfully' });
  } catch (error) {
    console.error('Error updating sale:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 6. Delete sale (restores stock if products were linked)
app.delete('/api/sales/:id', (req, res) => {
  try {
    const { id } = req.params;
    const existing = db.prepare('SELECT * FROM sales WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Sale record not found' });
    }

    // Restore stock if products were linked
    const items = db.prepare('SELECT product_id, quantity FROM sale_items WHERE sale_id = ? AND product_id IS NOT NULL').all(id);
    const restoreStockStmt = db.prepare("UPDATE products SET stock_qty = stock_qty + ?, updated_at = datetime('now') WHERE id = ?");
    for (const item of items) {
      restoreStockStmt.run(item.quantity, item.product_id);
    }

    db.prepare('DELETE FROM sale_items WHERE sale_id = ?').run(id);
    db.prepare('DELETE FROM sales WHERE id = ?').run(id);

    res.json({ success: true, message: 'Sale record deleted successfully and stock restored' });
  } catch (error) {
    console.error('Error deleting sale:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// =========================================================================
// EXECUTIVE DASHBOARD API
// =========================================================================
app.get('/api/dashboard/stats', (req, res) => {
  try {
    const todayStr = getLocalDateStr();
    const currentMonth = todayStr.slice(0, 7);

    // Sales Today
    const todaySales = db.prepare(`
      SELECT COUNT(*) as count, COALESCE(SUM(total_amount), 0) as revenue, COALESCE(SUM(profit), 0) as profit
      FROM sales WHERE sale_date = ?
    `).get(todayStr);

    // Sales This Month
    const monthSales = db.prepare(`
      SELECT COUNT(*) as count, COALESCE(SUM(total_amount), 0) as revenue, COALESCE(SUM(profit), 0) as profit
      FROM sales WHERE sale_date LIKE ?
    `).get(`${currentMonth}%`);

    // Sales This Year
    const currentYear = todayStr.slice(0, 4);
    const yearSales = db.prepare(`
      SELECT COUNT(*) as count, COALESCE(SUM(total_amount), 0) as revenue, COALESCE(SUM(profit), 0) as profit
      FROM sales WHERE sale_date LIKE ?
    `).get(`${currentYear}%`);

    // Expenses This Month
    const monthExp = db.prepare(`
      SELECT COUNT(*) as count, COALESCE(SUM(amount), 0) as total
      FROM expenses WHERE expense_date LIKE ?
    `).get(`${currentMonth}%`);

    // Payroll This Month
    const monthPayroll = db.prepare(`
      SELECT COUNT(*) as count, COALESCE(SUM(net_salary), 0) as total
      FROM payrolls WHERE month_str = ?
    `).get(currentMonth);

    // Staff stats
    const staff = db.prepare(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'Active' THEN 1 ELSE 0 END) as active,
        COUNT(DISTINCT department) as dept_count
      FROM employees
    `).get();

    // Inventory stats
    const inv = db.prepare(`
      SELECT 
        COUNT(*) as total_products,
        SUM(CASE WHEN stock_qty <= low_stock_threshold AND stock_qty > 0 THEN 1 ELSE 0 END) as low_stock,
        SUM(CASE WHEN stock_qty <= 0 THEN 1 ELSE 0 END) as out_of_stock,
        ROUND(COALESCE(SUM(stock_qty * selling_price), 0), 2) as inventory_value
      FROM products
    `).get();

    // Customers count
    const customersCount = db.prepare('SELECT COUNT(*) as count FROM customers').get().count;

    // Today Attendance Stats
    const todayAttendance = db.prepare(`
      SELECT 
        COUNT(*) as total_records,
        SUM(CASE WHEN check_in IS NOT NULL THEN 1 ELSE 0 END) as present,
        SUM(CASE WHEN status = 'Late' THEN 1 ELSE 0 END) as late,
        SUM(CASE WHEN check_in IS NOT NULL AND check_out IS NULL THEN 1 ELSE 0 END) as working_now
      FROM attendances WHERE attendance_date = ?
    `).get(todayStr);

    // Operating Profit = Gross Sales Profit - Expenses - Payroll
    const operatingProfit = (monthSales.profit || 0) - (monthExp.total || 0) - (monthPayroll.total || 0);

    // 7-Day Sales Trend (Last 7 days ending today)
    const salesTrend7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dStr = getLocalDateStr(d);
      const stat = db.prepare(`
        SELECT COALESCE(SUM(total_amount), 0) as revenue, COALESCE(SUM(profit), 0) as profit, COUNT(*) as count
        FROM sales WHERE sale_date = ?
      `).get(dStr);
      salesTrend7Days.push({
        date: dStr,
        dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
        revenue: Math.round((stat.revenue || 0) * 100) / 100,
        profit: Math.round((stat.profit || 0) * 100) / 100,
        count: stat.count || 0
      });
    }

    // Monthly Comparison (Last 6 months)
    const monthlyComparison = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const mStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const mSale = db.prepare(`
        SELECT COALESCE(SUM(total_amount), 0) as revenue, COALESCE(SUM(profit), 0) as profit
        FROM sales WHERE sale_date LIKE ?
      `).get(`${mStr}%`);
      const mEx = db.prepare(`
        SELECT COALESCE(SUM(amount), 0) as total
        FROM expenses WHERE expense_date LIKE ?
      `).get(`${mStr}%`);
      const mPay = db.prepare(`
        SELECT COALESCE(SUM(net_salary), 0) as total
        FROM payrolls WHERE month_str = ?
      `).get(mStr);
      const net = (mSale.profit || 0) - (mEx.total || 0) - (mPay.total || 0);
      monthlyComparison.push({
        month: mStr,
        monthName: d.toLocaleDateString('en-US', { month: 'short' }),
        revenue: Math.round((mSale.revenue || 0) * 100) / 100,
        expenses: Math.round(((mEx.total || 0) + (mPay.total || 0)) * 100) / 100,
        net_profit: Math.round(net * 100) / 100
      });
    }

    // Top Selling Products
    const topProducts = db.prepare(`
      SELECT 
        s.product_name as name, 
        s.category, 
        COALESCE(SUM(s.quantity), 0) as total_qty, 
        ROUND(COALESCE(SUM(s.total_amount), 0), 2) as total_revenue
      FROM sales s
      WHERE s.product_name IS NOT NULL AND s.product_name != ''
      GROUP BY s.product_name
      ORDER BY total_revenue DESC, total_qty DESC
      LIMIT 5
    `).all();

    // Payment Distribution
    const paymentDistribution = db.prepare(`
      SELECT payment_method, COUNT(*) as count, ROUND(SUM(total_amount), 2) as total
      FROM sales
      GROUP BY payment_method
      ORDER BY total DESC
    `).all();

    // Department Distribution
    const departmentStaff = db.prepare(`
      SELECT department, COUNT(*) as count
      FROM employees
      GROUP BY department
      ORDER BY count DESC
    `).all();

    // Recent Activities (Latest sales + leaves + expenses)
    const recentSales = db.prepare(`
      SELECT 'sale' as type, invoice_no as ref, product_name as title, total_amount as amount, sale_date as date, sale_time as time, seller_name as actor
      FROM sales ORDER BY id DESC LIMIT 4
    `).all();

    const recentExpenses = db.prepare(`
      SELECT 'expense' as type, receipt_ref as ref, title, amount, expense_date as date, '' as time, recorded_by as actor
      FROM expenses ORDER BY id DESC LIMIT 3
    `).all();

    const recentLeaves = db.prepare(`
      SELECT 'leave' as type, '' as ref, (e.khmer_name || ' - ' || l.leave_type) as title, l.days_count as amount, l.start_date as date, '' as time, l.status as actor
      FROM leave_requests l
      JOIN employees e ON l.employee_id = e.id
      ORDER BY l.id DESC LIMIT 3
    `).all();

    res.json({
      success: true,
      data: {
        kpis: {
          todayRevenue: todaySales.revenue || 0,
          todayProfit: todaySales.profit || 0,
          todayCount: todaySales.count || 0,
          monthRevenue: monthSales.revenue || 0,
          monthProfit: monthSales.profit || 0,
          monthCount: monthSales.count || 0,
          yearRevenue: yearSales.revenue || 0,
          yearProfit: yearSales.profit || 0,
          yearCount: yearSales.count || 0,
          monthExpenses: monthExp.total || 0,
          monthPayroll: monthPayroll.total || 0,
          operatingProfit: Math.round(operatingProfit * 100) / 100,
          totalStaff: staff.total || 0,
          activeStaff: staff.active || 0,
          deptCount: staff.dept_count || 0,
          todayPresent: (todayAttendance && todayAttendance.present) || 0,
          todayLate: (todayAttendance && todayAttendance.late) || 0,
          todayWorkingNow: (todayAttendance && todayAttendance.working_now) || 0,
          totalProducts: inv.total_products || 0,
          lowStock: inv.low_stock || 0,
          outOfStock: inv.out_of_stock || 0,
          inventoryValue: inv.inventory_value || 0,
          totalCustomers: customersCount || 0
        },
        salesTrend7Days,
        monthlyComparison,
        topProducts,
        paymentDistribution,
        departmentStaff,
        recentActivities: [...recentSales, ...recentExpenses, ...recentLeaves].slice(0, 8)
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// =========================================================================
// CUSTOMERS API
// =========================================================================
app.get('/api/customers', (req, res) => {
  try {
    const { search, customer_type } = req.query;
    let query = 'SELECT * FROM customers WHERE 1=1';
    const params = [];
    if (search && search.trim()) {
      const term = `%${search.trim()}%`;
      query += ' AND (name LIKE ? OR phone LIKE ? OR email LIKE ? OR telegram LIKE ? OR address LIKE ?)';
      params.push(term, term, term, term, term);
    }
    if (customer_type && customer_type !== 'all') {
      query += ' AND customer_type = ?';
      params.push(customer_type);
    }
    query += ' ORDER BY id DESC';
    const customers = db.prepare(query).all(...params);
    res.json({ success: true, count: customers.length, data: customers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/customers/:id', (req, res) => {
  try {
    const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(req.params.id);
    if (!customer) return res.status(404).json({ success: false, message: 'Customer not found' });
    const orders = db.prepare('SELECT * FROM sales WHERE customer_name = ? ORDER BY id DESC LIMIT 20').all(customer.name);
    res.json({ success: true, data: { ...customer, orders } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/customers', (req, res) => {
  try {
    const { name, phone, email, telegram, address, customer_type, notes } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ success: false, message: 'Name is required' });
    const stmt = db.prepare(`
      INSERT INTO customers (name, phone, email, telegram, address, customer_type, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    const info = stmt.run(name.trim(), phone || '', email || '', telegram || '', address || '', customer_type || 'Regular', notes || '');
    const newCust = db.prepare('SELECT * FROM customers WHERE id = ?').get(info.lastInsertRowid);
    res.status(201).json({ success: true, data: newCust, message: 'Customer added successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.put('/api/customers/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, email, telegram, address, customer_type, notes } = req.body;
    db.prepare(`
      UPDATE customers 
      SET name = ?, phone = ?, email = ?, telegram = ?, address = ?, customer_type = ?, notes = ?, updated_at = datetime('now')
      WHERE id = ?
    `).run(name.trim(), phone || '', email || '', telegram || '', address || '', customer_type || 'Regular', notes || '', id);
    const updated = db.prepare('SELECT * FROM customers WHERE id = ?').get(id);
    res.json({ success: true, data: updated, message: 'Customer updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.delete('/api/customers/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM customers WHERE id = ?').run(req.params.id);
    res.json({ success: true, message: 'Customer deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// =========================================================================
// EXPENSES API
// =========================================================================
app.get('/api/expenses', (req, res) => {
  try {
    const { search, category, month } = req.query;
    let query = 'SELECT * FROM expenses WHERE 1=1';
    const params = [];
    if (search && search.trim()) {
      const term = `%${search.trim()}%`;
      query += ' AND (title LIKE ? OR recorded_by LIKE ? OR receipt_ref LIKE ? OR notes LIKE ?)';
      params.push(term, term, term, term);
    }
    if (category && category !== 'all') {
      query += ' AND category = ?';
      params.push(category);
    }
    if (month && month !== 'all') {
      query += ' AND expense_date LIKE ?';
      params.push(`${month}%`);
    }
    query += ' ORDER BY expense_date DESC, id DESC';
    const expenses = db.prepare(query).all(...params);
    res.json({ success: true, count: expenses.length, data: expenses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/expenses/stats', (req, res) => {
  try {
    const todayStr = getLocalDateStr();
    const currentMonth = todayStr.slice(0, 7);
    const monthTotal = db.prepare("SELECT COALESCE(SUM(amount), 0) as total, COUNT(*) as count FROM expenses WHERE expense_date LIKE ?").get(`${currentMonth}%`);
    const allTotal = db.prepare("SELECT COALESCE(SUM(amount), 0) as total, COUNT(*) as count FROM expenses").get();
    const categories = db.prepare(`
      SELECT category, ROUND(SUM(amount), 2) as total, COUNT(*) as count
      FROM expenses
      GROUP BY category
      ORDER BY total DESC
    `).all();
    res.json({
      success: true,
      data: {
        currentMonthTotal: monthTotal.total || 0,
        currentMonthCount: monthTotal.count || 0,
        overallTotal: allTotal.total || 0,
        overallCount: allTotal.count || 0,
        categories
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/expenses', (req, res) => {
  try {
    const { title, category, amount, expense_date, payment_method, recorded_by, receipt_ref, notes } = req.body;
    if (!title || !amount) return res.status(400).json({ success: false, message: 'Title and amount are required' });
    const stmt = db.prepare(`
      INSERT INTO expenses (title, category, amount, expense_date, payment_method, recorded_by, receipt_ref, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const info = stmt.run(
      title.trim(),
      category || 'ផ្សេងៗ / Others',
      parseFloat(amount) || 0,
      expense_date || getLocalDateStr(),
      payment_method || 'Cash',
      recorded_by || '',
      receipt_ref || '',
      notes || ''
    );
    const newExp = db.prepare('SELECT * FROM expenses WHERE id = ?').get(info.lastInsertRowid);
    res.status(201).json({ success: true, data: newExp, message: 'Expense recorded successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.put('/api/expenses/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { title, category, amount, expense_date, payment_method, recorded_by, receipt_ref, notes } = req.body;
    db.prepare(`
      UPDATE expenses 
      SET title = ?, category = ?, amount = ?, expense_date = ?, payment_method = ?, recorded_by = ?, receipt_ref = ?, notes = ?
      WHERE id = ?
    `).run(
      title.trim(),
      category || 'ផ្សេងៗ / Others',
      parseFloat(amount) || 0,
      expense_date || getLocalDateStr(),
      payment_method || 'Cash',
      recorded_by || '',
      receipt_ref || '',
      notes || '',
      id
    );
    const updated = db.prepare('SELECT * FROM expenses WHERE id = ?').get(id);
    res.json({ success: true, data: updated, message: 'Expense updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.delete('/api/expenses/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM expenses WHERE id = ?').run(req.params.id);
    res.json({ success: true, message: 'Expense deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// =========================================================================
// PAYROLL API
// =========================================================================
app.get('/api/payrolls', (req, res) => {
  try {
    const { month, search } = req.query;
    let query = 'SELECT p.*, e.department, e.position, e.emp_code FROM payrolls p LEFT JOIN employees e ON p.employee_id = e.id WHERE 1=1';
    const params = [];
    if (month && month !== 'all') {
      query += ' AND p.month_str = ?';
      params.push(month);
    }
    if (search && search.trim()) {
      const term = `%${search.trim()}%`;
      query += ' AND (p.employee_name LIKE ? OR e.emp_code LIKE ? OR e.department LIKE ?)';
      params.push(term, term, term);
    }
    query += ' ORDER BY p.id DESC';
    const payrolls = db.prepare(query).all(...params);
    res.json({ success: true, count: payrolls.length, data: payrolls });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/payrolls/stats', (req, res) => {
  try {
    const todayStr = getLocalDateStr();
    const currentMonth = todayStr.slice(0, 7);
    const stat = db.prepare(`
      SELECT 
        COUNT(*) as count,
        COALESCE(SUM(base_salary), 0) as total_base,
        COALESCE(SUM(bonus), 0) as total_bonus,
        COALESCE(SUM(allowance), 0) as total_allowance,
        COALESCE(SUM(deduction), 0) as total_deduction,
        COALESCE(SUM(net_salary), 0) as total_net
      FROM payrolls WHERE month_str = ?
    `).get(currentMonth);
    res.json({ success: true, currentMonth, data: stat });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/payrolls', (req, res) => {
  try {
    const { employee_id, month_str, month, base_salary, bonus, allowance, deduction, deductions, payment_date, payment_status, status, payment_method, notes } = req.body;
    const emp = db.prepare('SELECT id, khmer_name, salary FROM employees WHERE id = ?').get(employee_id);
    if (!emp) return res.status(404).json({ success: false, message: 'Employee not found' });
    const bSalary = parseFloat(base_salary) || emp.salary || 0;
    const bBonus = parseFloat(bonus) || 0;
    const bAllow = parseFloat(allowance) || 0;
    const bDeduct = parseFloat(deduction !== undefined ? deduction : deductions) || 0;
    const net = bSalary + bBonus + bAllow - bDeduct;
    const stmt = db.prepare(`
      INSERT INTO payrolls (employee_id, employee_name, month_str, base_salary, bonus, allowance, deduction, net_salary, payment_date, payment_status, payment_method, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const info = stmt.run(
      emp.id,
      emp.khmer_name,
      month_str || month || getLocalDateStr().slice(0, 7),
      bSalary,
      bBonus,
      bAllow,
      bDeduct,
      net,
      payment_date || getLocalDateStr(),
      payment_status || status || 'Paid',
      payment_method || 'Bank Transfer',
      notes || ''
    );
    const newPay = db.prepare('SELECT * FROM payrolls WHERE id = ?').get(info.lastInsertRowid);
    res.status(201).json({ success: true, data: newPay, message: 'Payroll recorded successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.put('/api/payrolls/:id', (req, res) => {
  try {
    const { id } = req.params;
    const existing = db.prepare('SELECT * FROM payrolls WHERE id = ?').get(id);
    if (!existing) return res.status(404).json({ success: false, message: 'Payroll record not found' });

    const { employee_id, month_str, month, base_salary, bonus, allowance, deduction, deductions, payment_date, payment_status, status, payment_method, notes } = req.body;
    const empId = employee_id || existing.employee_id;
    const emp = db.prepare('SELECT id, khmer_name, salary FROM employees WHERE id = ?').get(empId);
    const empName = emp ? emp.khmer_name : existing.employee_name;

    const bSalary = parseFloat(base_salary !== undefined ? base_salary : existing.base_salary) || 0;
    const bBonus = parseFloat(bonus !== undefined ? bonus : existing.bonus) || 0;
    const bAllow = parseFloat(allowance !== undefined ? allowance : existing.allowance) || 0;
    const deductVal = deduction !== undefined ? deduction : (deductions !== undefined ? deductions : existing.deduction);
    const bDeduct = parseFloat(deductVal) || 0;
    const net = bSalary + bBonus + bAllow - bDeduct;

    db.prepare(`
      UPDATE payrolls
      SET employee_id = ?, employee_name = ?, month_str = ?, base_salary = ?, bonus = ?, allowance = ?, deduction = ?, net_salary = ?, payment_date = ?, payment_status = ?, payment_method = ?, notes = ?
      WHERE id = ?
    `).run(
      empId,
      empName,
      month_str || month || existing.month_str,
      bSalary,
      bBonus,
      bAllow,
      bDeduct,
      net,
      payment_date || existing.payment_date,
      payment_status || status || existing.payment_status,
      payment_method || existing.payment_method,
      notes !== undefined ? notes : existing.notes,
      id
    );

    const updated = db.prepare('SELECT * FROM payrolls WHERE id = ?').get(id);
    res.json({ success: true, data: updated, message: 'Payroll updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/payrolls/generate-month', (req, res) => {
  try {
    const { month_str } = req.body;
    const targetMonth = month_str || getLocalDateStr().slice(0, 7);
    const activeEmps = db.prepare("SELECT id, khmer_name, salary FROM employees WHERE status = 'Active'").all();
    const existing = db.prepare("SELECT employee_id FROM payrolls WHERE month_str = ?").all(targetMonth).map(r => r.employee_id);
    const insertStmt = db.prepare(`
      INSERT INTO payrolls (employee_id, employee_name, month_str, base_salary, bonus, allowance, deduction, net_salary, payment_date, payment_status, payment_method, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    let addedCount = 0;
    for (const emp of activeEmps) {
      if (!existing.includes(emp.id)) {
        insertStmt.run(emp.id, emp.khmer_name, targetMonth, emp.salary, 0, 0, 0, emp.salary, getLocalDateStr(), 'Pending', 'Bank Transfer', `ប្រាក់បៀវត្សរ៍ប្រចាំខែ ${targetMonth}`);
        addedCount++;
      }
    }
    res.json({ success: true, message: `Generated payroll for ${addedCount} employees for month ${targetMonth}.`, count: addedCount });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.delete('/api/payrolls/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM payrolls WHERE id = ?').run(req.params.id);
    res.json({ success: true, message: 'Payroll record deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// =========================================================================
// STORE SETTINGS & BACKUP API
// =========================================================================
app.get('/api/settings', (req, res) => {
  try {
    const rows = db.prepare('SELECT key, value FROM store_settings').all();
    const settings = {};
    rows.forEach(r => { settings[r.key] = r.value; });
    res.json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/settings', (req, res) => {
  try {
    const entries = req.body;
    const upsert = db.prepare('INSERT OR REPLACE INTO store_settings (key, value) VALUES (?, ?)');
    for (const [key, value] of Object.entries(entries)) {
      upsert.run(key, String(value));
    }
    res.json({ success: true, message: 'Settings saved successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/backup', (req, res) => {
  try {
    const employees = db.prepare('SELECT * FROM employees').all();
    const attendances = db.prepare('SELECT * FROM attendances').all();
    const leaves = db.prepare('SELECT * FROM leave_requests').all();
    const products = db.prepare('SELECT * FROM products').all();
    const sales = db.prepare('SELECT * FROM sales').all();
    const sale_items = db.prepare('SELECT * FROM sale_items').all();
    const customers = db.prepare('SELECT * FROM customers').all();
    const expenses = db.prepare('SELECT * FROM expenses').all();
    const payrolls = db.prepare('SELECT * FROM payrolls').all();
    const settings = db.prepare('SELECT * FROM store_settings').all();

    const backupData = {
      system: 'MRC KH Enterprise Management System',
      version: '2.0.0',
      exported_at: new Date().toISOString(),
      tables: {
        employees,
        attendances,
        leaves,
        products,
        sales,
        sale_items,
        customers,
        expenses,
        payrolls,
        settings
      }
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="mrckh_backup_${getLocalDateStr().replace(/-/g, '')}.json"`);
    res.send(JSON.stringify(backupData, null, 2));
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// RESTORE BACKUP (1-Click Restore & Auto-Sync)
app.post('/api/backup/restore', (req, res) => {
  try {
    const { tables } = req.body;
    if (!tables) {
      return res.status(400).json({ success: false, message: 'ទិន្នន័យ Backup មិនត្រឹមត្រូវ (Invalid backup format)' });
    }

    db.exec('BEGIN TRANSACTION;');
    try {
      if (Array.isArray(tables.employees) && tables.employees.length > 0) {
        db.exec('DELETE FROM employees;');
        const stmt = db.prepare(`
          INSERT OR REPLACE INTO employees 
          (id, emp_code, first_name, last_name, khmer_name, email, phone, department, position, salary, hire_date, status, gender, avatar_color, address, notes, shift_start, shift_end)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        for (const e of tables.employees) {
          stmt.run(e.id, e.emp_code, e.first_name, e.last_name, e.khmer_name || '', e.email || '', e.phone || '', e.department || '', e.position || '', e.salary || 0, e.hire_date || '', e.status || 'Active', e.gender || 'Other', e.avatar_color || '#3b82f6', e.address || '', e.notes || '', e.shift_start || '08:00', e.shift_end || '17:00');
        }
      }

      if (Array.isArray(tables.products) && tables.products.length > 0) {
        db.exec('DELETE FROM products;');
        const stmt = db.prepare(`
          INSERT OR REPLACE INTO products
          (id, code, name, category, cost_price, selling_price, stock_qty, low_stock_threshold, unit, image_url, notes, condition, serial_number, warranty_period)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        for (const p of tables.products) {
          stmt.run(p.id, p.code, p.name, p.category || '', p.cost_price || 0, p.selling_price || 0, p.stock_qty || 0, p.low_stock_threshold || 5, p.unit || 'pcs', p.image_url || '', p.notes || '', p.condition || 'ថ្មី 100%', p.serial_number || '', p.warranty_period || '');
        }
      }

      if (Array.isArray(tables.sales) && tables.sales.length > 0) {
        db.exec('DELETE FROM sales;');
        const stmt = db.prepare(`
          INSERT OR REPLACE INTO sales
          (id, invoice_no, customer_name, customer_phone, subtotal, discount, tax_amount, total_amount, payment_status, payment_method, notes, sale_date)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        for (const s of tables.sales) {
          stmt.run(s.id, s.invoice_no, s.customer_name || '', s.customer_phone || '', s.subtotal || 0, s.discount || 0, s.tax_amount || 0, s.total_amount || 0, s.payment_status || 'Paid', s.payment_method || 'Cash', s.notes || '', s.sale_date || '');
        }
      }

      if (Array.isArray(tables.sale_items) && tables.sale_items.length > 0) {
        db.exec('DELETE FROM sale_items;');
        const stmt = db.prepare(`
          INSERT OR REPLACE INTO sale_items
          (id, sale_id, product_id, product_name, product_code, quantity, unit_price, total_price)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `);
        for (const i of tables.sale_items) {
          stmt.run(i.id, i.sale_id, i.product_id || null, i.product_name, i.product_code || '', i.quantity || 1, i.unit_price || 0, i.total_price || 0);
        }
      }

      if (Array.isArray(tables.attendances) && tables.attendances.length > 0) {
        db.exec('DELETE FROM attendances;');
        const stmt = db.prepare(`
          INSERT OR REPLACE INTO attendances
          (id, employee_id, attendance_date, check_in, check_out, status, work_hours, notes)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `);
        for (const a of tables.attendances) {
          stmt.run(a.id, a.employee_id, a.attendance_date, a.check_in || null, a.check_out || null, a.status || 'Present', a.work_hours || 0, a.notes || '');
        }
      }

      if (Array.isArray(tables.leaves) && tables.leaves.length > 0) {
        db.exec('DELETE FROM leave_requests;');
        const stmt = db.prepare(`
          INSERT OR REPLACE INTO leave_requests
          (id, employee_id, leave_type, start_date, end_date, days_count, reason, status, approved_by, rejection_reason)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        for (const l of tables.leaves) {
          stmt.run(l.id, l.employee_id, l.leave_type, l.start_date, l.end_date, l.days_count || 1, l.reason || '', l.status || 'Pending', l.approved_by || '', l.rejection_reason || '');
        }
      }

      if (Array.isArray(tables.customers) && tables.customers.length > 0) {
        db.exec('DELETE FROM customers;');
        const stmt = db.prepare(`
          INSERT OR REPLACE INTO customers
          (id, customer_code, name, phone, email, telegram, address, customer_type, total_spent, total_orders, notes)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        for (const c of tables.customers) {
          stmt.run(c.id, c.customer_code || '', c.name, c.phone || '', c.email || '', c.telegram || '', c.address || '', c.customer_type || 'Regular', c.total_spent || 0, c.total_orders || 0, c.notes || '');
        }
      }

      if (Array.isArray(tables.expenses) && tables.expenses.length > 0) {
        db.exec('DELETE FROM expenses;');
        const stmt = db.prepare(`
          INSERT OR REPLACE INTO expenses
          (id, title, category, amount, expense_date, payment_method, recorded_by, receipt_number, notes)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        for (const ex of tables.expenses) {
          stmt.run(ex.id, ex.title, ex.category, ex.amount || 0, ex.expense_date, ex.payment_method || 'Cash', ex.recorded_by || '', ex.receipt_number || '', ex.notes || '');
        }
      }

      if (Array.isArray(tables.payrolls) && tables.payrolls.length > 0) {
        db.exec('DELETE FROM payrolls;');
        const stmt = db.prepare(`
          INSERT OR REPLACE INTO payrolls
          (id, employee_id, employee_name, month_str, base_salary, bonus, allowance, deduction, net_salary, payment_date, payment_status, payment_method, notes)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        for (const p of tables.payrolls) {
          stmt.run(p.id, p.employee_id, p.employee_name, p.month_str, p.base_salary || 0, p.bonus || 0, p.allowance || 0, p.deduction || 0, p.net_salary || 0, p.payment_date || '', p.payment_status || 'Pending', p.payment_method || 'Cash', p.notes || '');
        }
      }

      if (tables.settings) {
        const stmt = db.prepare('INSERT OR REPLACE INTO store_settings (key, value) VALUES (?, ?)');
        const entries = Array.isArray(tables.settings)
          ? tables.settings.map(s => [s.key, s.value])
          : Object.entries(tables.settings);
        for (const [k, v] of entries) {
          stmt.run(k, String(v));
        }
      }

      db.exec('COMMIT;');
      res.json({ success: true, message: 'ទិន្នន័យត្រូវបានស្តារឡើងវិញដោយជោគជ័យ (Database restored successfully)!' });
    } catch (e) {
      db.exec('ROLLBACK;');
      throw e;
    }
  } catch (error) {
    console.error('Error restoring backup:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 13. Reset / Re-seed sample data
app.post('/api/seed', (req, res) => {
  try {
    seedDatabase(true);
    res.json({ success: true, message: 'Database reset and re-seeded with demo records.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Clear all sample demo data
app.post('/api/clear-all-data', (req, res) => {
  try {
    const tables = ['sale_items', 'sales', 'products', 'leave_requests', 'attendances', 'payrolls', 'expenses', 'customers', 'employees'];
    for (const t of tables) {
      db.prepare(`DELETE FROM ${t}`).run();
    }
    try {
      db.prepare('DELETE FROM sqlite_sequence').run();
    } catch(e) {}
    res.json({ success: true, message: 'ទិន្នន័យគំរូទាំងអស់ត្រូវបានលុបចេញដោយជោគជ័យ។' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================================================
function cleanTelegramChatId(input) {
  if (!input) return '';
  let id = input.trim();
  if (id.includes('t.me/') && !id.includes('/+')) {
    const parts = id.split('t.me/');
    if (parts[1]) {
      const u = parts[1].split(/[/?#]/)[0].trim();
      if (u) return u.startsWith('@') ? u : `@${u}`;
    }
  }
  return id;
}

// FEATURE: Telegram Bot Integration & Instant Sale Notifications
// ==========================================================================
async function sendTelegramSaleNotification(sale) {
  try {
    const tokenRow = db.prepare("SELECT value FROM store_settings WHERE key = 'telegram_bot_token'").get();
    const chatIdRow = db.prepare("SELECT value FROM store_settings WHERE key = 'telegram_chat_id'").get();
    const enabledRow = db.prepare("SELECT value FROM store_settings WHERE key = 'telegram_sales_enabled'").get();
    const token = tokenRow ? tokenRow.value.trim() : '';
    const chatId = chatIdRow ? cleanTelegramChatId(chatIdRow.value) : '';
    const enabled = enabledRow ? enabledRow.value : 'true';

    if (!token || !chatId || enabled === 'false') return;

    const itemsText = (sale.items || []).map(i => {
      let extra = [];
      if (i.item_condition) extra.push(`[${i.item_condition}]`);
      if (i.serial_number) extra.push(`SN:${i.serial_number}`);
      if (i.warranty_period && i.warranty_period !== 'គ្មានការធានា') extra.push(`(ធានា:${i.warranty_period})`);
      const extraStr = extra.length > 0 ? ` <i>${extra.join(' ')}</i>` : '';
      return `• <b>${i.product_name}</b> (x${i.quantity}) - $${Number(i.total_amount).toFixed(2)}${extraStr}`;
    }).join('\n');

    const khrTotal = Math.round((Number(sale.total_amount) || 0) * 4100).toLocaleString();

    const msg = `🧾 <b>ការលក់ថ្មី / NEW SALE</b>\n` +
      `━━━━━━━━━━━━━━━━━━━\n` +
      `<b>វិក្កយបត្រ:</b> <code>#${sale.invoice_no}</code>\n` +
      `<b>កាលបរិច្ឆេទ:</b> ${sale.sale_date} ${sale.sale_time || ''}\n` +
      `<b>អ្នកលក់:</b> ${sale.seller_name || 'ទូទៅ'}\n` +
      `<b>អតិថិជន:</b> ${sale.customer_name || 'អតិថិជនទូទៅ'}\n` +
      `<b>វិធីទូទាត់:</b> ${sale.payment_method}\n` +
      `───────────────────\n` +
      (itemsText || '• ទំនិញទូទៅ') + `\n` +
      `───────────────────\n` +
      `💰 <b>សរុប (TOTAL):</b> <b>$${Number(sale.total_amount).toFixed(2)}</b> (${khrTotal} ៛)\n` +
      `🏪 <i>ហាង MRC KH - ហាងលក់អីវ៉ាន់ថ្មី និងមួយទឹក</i>`;

    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: msg, parse_mode: 'HTML' })
    });
    return await resp.json();
  } catch (err) {
    console.error('Error sending Telegram notification:', err.message);
  }
}

// Test Telegram endpoint
app.post('/api/telegram/test', async (req, res) => {
  try {
    const { token, chat_id } = req.body;
    if (!token || !chat_id) {
      return res.status(400).json({ success: false, message: 'Bot Token and Chat ID are required' });
    }
    const testMsg = `🎉 <b>តេស្តភ្ជាប់ Telegram ជោគជ័យ!</b>\n` +
      `━━━━━━━━━━━━━━━━━━━\n` +
      `ប្រព័ន្ធគ្រប់គ្រងហាង <b>MRC KH - ហាងលក់អីវ៉ាន់ថ្មី និងមួយទឹក</b> បានភ្ជាប់ជាមួយ Telegram Channel នេះយ៉ាងជោគជ័យ។\n` +
      `រាល់ពេលមានការលក់ទំនិញថ្មីៗ វិក្កយបត្រនឹងត្រូវផ្ញើមកទីនេះដោយស្វ័យប្រវត្តិ។\n` +
      `⏰ <i>${new Date().toLocaleString()}</i>`;

    const cleanChatId = cleanTelegramChatId(chat_id);
    const url = `https://api.telegram.org/bot${token.trim()}/sendMessage`;
    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: cleanChatId, text: testMsg, parse_mode: 'HTML' })
    });
    const data = await resp.json();
    if (data.ok) {
      res.json({ success: true, message: 'បានផ្ញើសារតេស្តសាកល្បងទៅ Telegram ដោយជោគជ័យ!' });
    } else {
      res.status(400).json({ success: false, message: data.description || 'Telegram API Error' });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==========================================================================
// FEATURE: Daily Z-Report (End of Day / Cash Drawer Shift Closing)
// ==========================================================================
app.get('/api/reports/z-report', (req, res) => {
  try {
    const reportDate = req.query.date || getLocalDateStr();
    const sales = db.prepare('SELECT * FROM sales WHERE sale_date = ? ORDER BY id ASC').all(reportDate);

    let totalRevenue = 0;
    let totalCost = 0;
    let totalProfit = 0;
    let totalItems = 0;
    let discountSum = 0;
    let taxSum = 0;

    const breakdown = {
      cash: 0,
      aba: 0,
      acleda: 0,
      wing: 0,
      card: 0,
      other: 0
    };

    sales.forEach(s => {
      const amount = Number(s.total_amount) || 0;
      totalRevenue += amount;
      totalCost += Number(s.total_cost) || 0;
      totalProfit += Number(s.profit) || 0;
      totalItems += Number(s.quantity) || 1;
      discountSum += Number(s.discount_amount) || 0;
      taxSum += Number(s.tax_amount) || 0;

      const method = (s.payment_method || '').toLowerCase();
      if (method.includes('cash') || method.includes('សាច់ប្រាក់')) {
        breakdown.cash += amount;
      } else if (method.includes('aba')) {
        breakdown.aba += amount;
      } else if (method.includes('acleda') || method.includes('អេស៊ីលីដា')) {
        breakdown.acleda += amount;
      } else if (method.includes('wing') || method.includes('វីង')) {
        breakdown.wing += amount;
      } else if (method.includes('card') || method.includes('កាត')) {
        breakdown.card += amount;
      } else {
        breakdown.other += amount;
      }
    });

    const items = db.prepare(`
      SELECT si.product_name, si.item_condition, SUM(si.quantity) as total_qty, SUM(si.total_amount) as total_rev
      FROM sale_items si
      JOIN sales s ON si.sale_id = s.id
      WHERE s.sale_date = ?
      GROUP BY si.product_name, si.item_condition
      ORDER BY total_qty DESC
      LIMIT 10
    `).all(reportDate);

    res.json({
      success: true,
      data: {
        date: reportDate,
        total_transactions: sales.length,
        total_revenue: totalRevenue,
        total_revenue_khr: Math.round(totalRevenue * 4100),
        total_cost: totalCost,
        total_profit: totalProfit,
        total_items: totalItems,
        total_discount: discountSum,
        total_tax: taxSum,
        breakdown: breakdown,
        top_items: items,
        sales_summary: sales.map(s => ({
          invoice_no: s.invoice_no,
          time: s.sale_time,
          customer: s.customer_name,
          payment: s.payment_method,
          amount: s.total_amount
        }))
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==========================================================================
// FEATURE: 1-Click Database Download & Automated Backup
// ==========================================================================
app.get('/api/backup/database', (req, res) => {
  try {
    const dbPath = path.join(__dirname, 'database.sqlite');
    if (!fs.existsSync(dbPath)) {
      return res.status(404).json({ success: false, message: 'Database file not found' });
    }
    const filename = `mrckh_database_backup_${getLocalDateStr().replace(/-/g, '')}.sqlite`;
    res.download(dbPath, filename);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Automated Daily Database Backup Routine
function performAutomatedBackup() {
  try {
    const backupDir = path.join(__dirname, 'backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    const dbFile = path.join(__dirname, 'database.sqlite');
    if (fs.existsSync(dbFile)) {
      const targetFile = path.join(backupDir, `mrc_auto_backup_${getLocalDateStr().replace(/-/g, '')}.sqlite`);
      fs.copyFileSync(dbFile, targetFile);
      console.log('Automated daily backup created:', targetFile);

      // Clean old backups keeping last 14 days
      const files = fs.readdirSync(backupDir).filter(f => f.startsWith('mrc_auto_backup_'));
      if (files.length > 14) {
        files.sort().slice(0, files.length - 14).forEach(old => {
          try { fs.unlinkSync(path.join(backupDir, old)); } catch (e) {}
        });
      }
    }
  } catch (err) {
    console.error('Automated backup error:', err.message);
  }
}
setTimeout(performAutomatedBackup, 5000);
setInterval(performAutomatedBackup, 24 * 60 * 60 * 1000);

// Catch-all route to serve index.html
app.use((req, res) => {
  const rootIndex = path.join(__dirname, 'index.html');
  const pubIndex = path.join(__dirname, 'public', 'index.html');
  if (fs.existsSync(rootIndex)) {
    return res.sendFile(rootIndex);
  }
  res.sendFile(pubIndex);
});

// Start Server function with dynamic port fallback
let serverInstance = null;
function startServer(port = PORT) {
  if (serverInstance) return Promise.resolve(serverInstance);
  return new Promise((resolve, reject) => {
    function tryListen(p) {
      const server = app.listen(p, () => {
        serverInstance = server;
        console.log(`===============================================`);
        console.log(` MRC KH Employee & Absence Management System Running!`);
        console.log(` Server URL: http://localhost:${p}`);
        console.log(` Database: SQLite (WAL mode, built-in node:sqlite)`);
        console.log(` Absence / Leave Management Module Enabled`);
        console.log(`===============================================`);
        resolve(serverInstance);
      });
      server.on('error', (err) => {
        if (err.code === 'EADDRINUSE' && p < 3015) {
          console.log(`Port ${p} in use, trying port ${p + 1}...`);
          tryListen(p + 1);
        } else {
          console.error('Server error:', err);
          reject(err);
        }
      });
    }
    tryListen(Number(port) || 3000);
  });
}

if (require.main === module) {
  startServer().catch(console.error);
}

module.exports = { app, startServer, db };

