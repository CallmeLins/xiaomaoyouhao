mod db;
mod models;

use models::{FuelRecord, Vehicle};
use rusqlite::Connection;
use std::sync::Mutex;
use tauri::{Manager, State};

// 应用状态
pub struct AppState {
    pub db: Mutex<Connection>,
}

// ========== 车辆管理 API ==========

// 获取所有车辆
#[tauri::command]
fn get_vehicles(state: State<AppState>) -> Result<Vec<Vehicle>, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare("SELECT id, brand, model, year, displacement, fuel_type, license_plate, purchase_date, note, created_at, updated_at FROM vehicles ORDER BY created_at DESC")
        .map_err(|e| e.to_string())?;

    let vehicles = stmt
        .query_map([], |row| {
            Ok(Vehicle {
                id: row.get(0)?,
                brand: row.get(1)?,
                model: row.get(2)?,
                year: row.get(3)?,
                displacement: row.get(4)?,
                fuel_type: row.get(5)?,
                license_plate: row.get(6)?,
                purchase_date: row.get(7)?,
                note: row.get(8)?,
                created_at: row.get(9)?,
                updated_at: row.get(10)?,
            })
        })
        .map_err(|e| e.to_string())?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| e.to_string())?;

    Ok(vehicles)
}

// 获取所有油耗记录
#[tauri::command]
fn get_fuel_records(state: State<AppState>) -> Result<Vec<FuelRecord>, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare("SELECT id, vehicle_id, date, mileage, fuel_amount, unit_price, total_price, fuel_type, is_full, note, created_at FROM fuel_records ORDER BY date DESC")
        .map_err(|e| e.to_string())?;

    let records = stmt
        .query_map([], |row| {
            Ok(FuelRecord {
                id: row.get(0)?,
                vehicle_id: row.get(1)?,
                date: row.get(2)?,
                mileage: row.get(3)?,
                fuel_amount: row.get(4)?,
                unit_price: row.get(5)?,
                total_price: row.get(6)?,
                fuel_type: row.get(7)?,
                is_full: row.get::<_, i32>(8)? != 0,
                note: row.get(9)?,
                created_at: row.get(10)?,
            })
        })
        .map_err(|e| e.to_string())?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| e.to_string())?;

    Ok(records)
}

// 添加油耗记录
#[tauri::command]
fn add_fuel_record(record: FuelRecord, state: State<AppState>) -> Result<FuelRecord, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    conn.execute(
        "INSERT INTO fuel_records (id, vehicle_id, date, mileage, fuel_amount, unit_price, total_price, fuel_type, is_full, note, created_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11)",
        rusqlite::params![
            record.id,
            record.vehicle_id,
            record.date,
            record.mileage,
            record.fuel_amount,
            record.unit_price,
            record.total_price,
            record.fuel_type,
            if record.is_full { 1 } else { 0 },
            record.note,
            record.created_at,
        ],
    )
    .map_err(|e| e.to_string())?;

    Ok(record)
}

// 更新油耗记录
#[tauri::command]
fn update_fuel_record(record: FuelRecord, state: State<AppState>) -> Result<FuelRecord, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    conn.execute(
        "UPDATE fuel_records SET vehicle_id=?1, date=?2, mileage=?3, fuel_amount=?4, unit_price=?5, total_price=?6, fuel_type=?7, is_full=?8, note=?9 WHERE id=?10",
        rusqlite::params![
            record.vehicle_id,
            record.date,
            record.mileage,
            record.fuel_amount,
            record.unit_price,
            record.total_price,
            record.fuel_type,
            if record.is_full { 1 } else { 0 },
            record.note,
            record.id,
        ],
    )
    .map_err(|e| e.to_string())?;

    Ok(record)
}

// 删除油耗记录
#[tauri::command]
fn delete_fuel_record(id: String, state: State<AppState>) -> Result<(), String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM fuel_records WHERE id = ?1", rusqlite::params![id])
        .map_err(|e| e.to_string())?;
    Ok(())
}

// 添加车辆
#[tauri::command]
fn add_vehicle(vehicle: Vehicle, state: State<AppState>) -> Result<Vehicle, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    conn.execute(
        "INSERT INTO vehicles (id, brand, model, year, displacement, fuel_type, license_plate, purchase_date, note, created_at, updated_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11)",
        rusqlite::params![
            vehicle.id,
            vehicle.brand,
            vehicle.model,
            vehicle.year,
            vehicle.displacement,
            vehicle.fuel_type,
            vehicle.license_plate,
            vehicle.purchase_date,
            vehicle.note,
            vehicle.created_at,
            vehicle.updated_at,
        ],
    )
    .map_err(|e| e.to_string())?;

    Ok(vehicle)
}

// 更新车辆
#[tauri::command]
fn update_vehicle(vehicle: Vehicle, state: State<AppState>) -> Result<Vehicle, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    conn.execute(
        "UPDATE vehicles SET brand=?1, model=?2, year=?3, displacement=?4, fuel_type=?5, license_plate=?6, purchase_date=?7, note=?8, updated_at=?9 WHERE id=?10",
        rusqlite::params![
            vehicle.brand,
            vehicle.model,
            vehicle.year,
            vehicle.displacement,
            vehicle.fuel_type,
            vehicle.license_plate,
            vehicle.purchase_date,
            vehicle.note,
            vehicle.updated_at,
            vehicle.id,
        ],
    )
    .map_err(|e| e.to_string())?;

    Ok(vehicle)
}

// 删除车辆（会级联删除关联的油耗记录）
#[tauri::command]
fn delete_vehicle(id: String, state: State<AppState>) -> Result<(), String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;

    // 先删除关联的油耗记录
    conn.execute("DELETE FROM fuel_records WHERE vehicle_id = ?1", rusqlite::params![id])
        .map_err(|e| e.to_string())?;

    // 再删除车辆
    conn.execute("DELETE FROM vehicles WHERE id = ?1", rusqlite::params![id])
        .map_err(|e| e.to_string())?;

    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .setup(|app| {
            let app_dir = app.path().app_data_dir().expect("Failed to get app data dir");
            std::fs::create_dir_all(&app_dir).expect("Failed to create app data dir");
            let db_path = app_dir.join("xiaomaoyouhao.db");
            let conn = db::init_db(&db_path).expect("Failed to initialize database");
            app.manage(AppState {
                db: Mutex::new(conn),
            });
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            get_vehicles,
            add_vehicle,
            update_vehicle,
            delete_vehicle,
            get_fuel_records,
            add_fuel_record,
            update_fuel_record,
            delete_fuel_record
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
