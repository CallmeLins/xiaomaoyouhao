use rusqlite::{Connection, Result};
use std::path::PathBuf;

pub fn init_db(db_path: &PathBuf) -> Result<Connection> {
    let conn = Connection::open(db_path)?;

    // 启用外键约束
    conn.execute("PRAGMA foreign_keys = ON", [])?;

    // 创建车辆表
    conn.execute(
        "CREATE TABLE IF NOT EXISTS vehicles (
            id TEXT PRIMARY KEY,
            brand TEXT NOT NULL,
            model TEXT NOT NULL,
            year INTEGER,
            displacement TEXT,
            fuel_type TEXT,
            license_plate TEXT,
            purchase_date TEXT,
            note TEXT,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )",
        [],
    )?;

    // 创建油耗记录表
    conn.execute(
        "CREATE TABLE IF NOT EXISTS fuel_records (
            id TEXT PRIMARY KEY,
            vehicle_id TEXT NOT NULL,
            date TEXT NOT NULL,
            mileage REAL NOT NULL,
            fuel_amount REAL NOT NULL,
            unit_price REAL NOT NULL,
            total_price REAL NOT NULL,
            fuel_type TEXT NOT NULL,
            is_full INTEGER NOT NULL,
            note TEXT,
            created_at TEXT NOT NULL,
            FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
        )",
        [],
    )?;

    Ok(conn)
}
