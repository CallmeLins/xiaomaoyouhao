use rusqlite::{Connection, Result};
use std::path::PathBuf;
use thiserror::Error;

#[derive(Error, Debug)]
pub enum DbError {
    #[error("Database error: {0}")]
    Sqlite(#[from] rusqlite::Error),
    #[error("IO error: {0}")]
    Io(#[from] std::io::Error),
}

pub struct Database {
    pub(crate) conn: Connection,
}

impl Database {
    /// 创建或打开数据库
    pub fn new(db_path: PathBuf) -> Result<Self, DbError> {
        let conn = Connection::open(db_path)?;
        Ok(Database { conn })
    }

    /// 初始化数据库表结构
    pub fn init_tables(&self) -> Result<(), DbError> {
        // 创建车辆表
        self.conn.execute(
            "CREATE TABLE IF NOT EXISTS vehicles (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                brand TEXT NOT NULL,
                model TEXT NOT NULL,
                year INTEGER NOT NULL,
                vehicle_type TEXT NOT NULL,
                fuel_tank_capacity REAL,
                battery_capacity REAL,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            )",
            [],
        )?;

        // 创建加油记录表
        self.conn.execute(
            "CREATE TABLE IF NOT EXISTS fuel_records (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                vehicle_id INTEGER NOT NULL,
                fuel_type TEXT NOT NULL,
                price_per_liter REAL NOT NULL,
                amount REAL NOT NULL,
                liters REAL NOT NULL,
                mileage REAL NOT NULL,
                is_full_tank INTEGER NOT NULL,
                note TEXT,
                created_at TEXT NOT NULL,
                FOREIGN KEY (vehicle_id) REFERENCES vehicles(id)
            )",
            [],
        )?;

        // 创建充电记录表
        self.conn.execute(
            "CREATE TABLE IF NOT EXISTS charging_records (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                vehicle_id INTEGER NOT NULL,
                charging_type TEXT NOT NULL,
                price_per_kwh REAL NOT NULL,
                amount REAL NOT NULL,
                kwh REAL NOT NULL,
                mileage_before REAL NOT NULL,
                mileage_after REAL NOT NULL,
                duration_minutes INTEGER,
                note TEXT,
                created_at TEXT NOT NULL,
                FOREIGN KEY (vehicle_id) REFERENCES vehicles(id)
            )",
            [],
        )?;

        // 创建保养记录表
        self.conn.execute(
            "CREATE TABLE IF NOT EXISTS maintenance_records (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                vehicle_id INTEGER NOT NULL,
                maintenance_type TEXT NOT NULL,
                mileage REAL NOT NULL,
                cost REAL NOT NULL,
                shop TEXT,
                note TEXT,
                created_at TEXT NOT NULL,
                FOREIGN KEY (vehicle_id) REFERENCES vehicles(id)
            )",
            [],
        )?;

        // 创建费用记录表
        self.conn.execute(
            "CREATE TABLE IF NOT EXISTS expense_records (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                vehicle_id INTEGER NOT NULL,
                expense_type TEXT NOT NULL,
                amount REAL NOT NULL,
                note TEXT,
                created_at TEXT NOT NULL,
                FOREIGN KEY (vehicle_id) REFERENCES vehicles(id)
            )",
            [],
        )?;

        Ok(())
    }
}
