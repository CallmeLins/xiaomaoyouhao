mod models;
mod database;
mod db_operations;
mod fuel_calculator;
mod electric_calculator;

use database::Database;
use models::*;
use chrono::Utc;
use std::sync::Mutex;
use tauri::State;

struct AppState {
    db: Mutex<Database>,
}

#[tauri::command]
fn add_vehicle(
    state: State<AppState>,
    brand: String,
    model: String,
    year: i32,
    vehicle_type: String,
    fuel_tank_capacity: Option<f64>,
    battery_capacity: Option<f64>,
) -> Result<i64, String> {
    let vehicle_type = match vehicle_type.as_str() {
        "Fuel" => VehicleType::Fuel,
        "Electric" => VehicleType::Electric,
        "Hybrid" => VehicleType::Hybrid,
        _ => return Err("Invalid vehicle type".to_string()),
    };

    let vehicle = Vehicle {
        id: None,
        brand,
        model,
        year,
        vehicle_type,
        fuel_tank_capacity,
        battery_capacity,
        created_at: Utc::now(),
        updated_at: Utc::now(),
    };

    let db = state.db.lock().unwrap();
    db.add_vehicle(&vehicle).map_err(|e| e.to_string())
}

#[tauri::command]
fn get_all_vehicles(state: State<AppState>) -> Result<Vec<Vehicle>, String> {
    let db = state.db.lock().unwrap();
    db.get_all_vehicles().map_err(|e| e.to_string())
}

#[tauri::command]
fn add_fuel_record(
    state: State<AppState>,
    vehicle_id: i64,
    fuel_type: String,
    price_per_liter: f64,
    amount: f64,
    liters: f64,
    mileage: f64,
    is_full_tank: bool,
    note: Option<String>,
) -> Result<i64, String> {
    let fuel_type = match fuel_type.as_str() {
        "Gasoline92" => FuelType::Gasoline92,
        "Gasoline95" => FuelType::Gasoline95,
        "Gasoline98" => FuelType::Gasoline98,
        "Diesel" => FuelType::Diesel,
        _ => return Err("Invalid fuel type".to_string()),
    };

    let record = FuelRecord {
        id: None,
        vehicle_id,
        fuel_type,
        price_per_liter,
        amount,
        liters,
        mileage,
        is_full_tank,
        note,
        created_at: Utc::now(),
    };

    let db = state.db.lock().unwrap();
    db.add_fuel_record(&record).map_err(|e| e.to_string())
}

#[tauri::command]
fn add_charging_record(
    state: State<AppState>,
    vehicle_id: i64,
    charging_type: String,
    price_per_kwh: f64,
    amount: f64,
    kwh: f64,
    mileage_before: f64,
    mileage_after: f64,
    duration_minutes: Option<i32>,
    note: Option<String>,
) -> Result<i64, String> {
    let charging_type = match charging_type.as_str() {
        "Slow" => ChargingType::Slow,
        "Fast" => ChargingType::Fast,
        _ => return Err("Invalid charging type".to_string()),
    };

    let record = ChargingRecord {
        id: None,
        vehicle_id,
        charging_type,
        price_per_kwh,
        amount,
        kwh,
        mileage_before,
        mileage_after,
        duration_minutes,
        note,
        created_at: Utc::now(),
    };

    let db = state.db.lock().unwrap();
    db.add_charging_record(&record).map_err(|e| e.to_string())
}

#[tauri::command]
fn get_fuel_records(state: State<AppState>, vehicle_id: i64) -> Result<Vec<FuelRecord>, String> {
    let db = state.db.lock().unwrap();
    db.get_fuel_records(vehicle_id).map_err(|e| e.to_string())
}

#[tauri::command]
fn get_charging_records(state: State<AppState>, vehicle_id: i64) -> Result<Vec<ChargingRecord>, String> {
    let db = state.db.lock().unwrap();
    db.get_charging_records(vehicle_id).map_err(|e| e.to_string())
}

#[tauri::command]
fn get_vehicle_consumption(state: State<AppState>, vehicle_id: i64, vehicle_type: String) -> Result<f64, String> {
    let db = state.db.lock().unwrap();

    match vehicle_type.as_str() {
        "Fuel" => db.calculate_fuel_consumption(vehicle_id).map_err(|e| e.to_string()),
        "Electric" => db.calculate_electric_consumption(vehicle_id).map_err(|e| e.to_string()),
        "Hybrid" => {
            // 混动车辆，返回油耗
            db.calculate_fuel_consumption(vehicle_id).map_err(|e| e.to_string())
        },
        _ => Ok(0.0),
    }
}

#[tauri::command]
fn add_maintenance_record(
    state: State<AppState>,
    vehicle_id: i64,
    maintenance_type: String,
    mileage: f64,
    cost: f64,
    shop: Option<String>,
    note: Option<String>,
) -> Result<i64, String> {
    let record = MaintenanceRecord {
        id: None,
        vehicle_id,
        maintenance_type,
        mileage,
        cost,
        shop,
        note,
        created_at: Utc::now(),
    };

    let db = state.db.lock().unwrap();
    db.add_maintenance_record(&record).map_err(|e| e.to_string())
}

#[tauri::command]
fn get_maintenance_records(state: State<AppState>, vehicle_id: i64) -> Result<Vec<MaintenanceRecord>, String> {
    let db = state.db.lock().unwrap();
    db.get_maintenance_records(vehicle_id).map_err(|e| e.to_string())
}

#[tauri::command]
fn export_fuel_records_csv(state: State<AppState>, vehicle_id: i64) -> Result<String, String> {
    let db = state.db.lock().unwrap();
    db.export_fuel_records_csv(vehicle_id).map_err(|e| e.to_string())
}

#[tauri::command]
fn get_fuel_consumption_trend(state: State<AppState>, vehicle_id: i64) -> Result<Vec<ConsumptionTrendPoint>, String> {
    let db = state.db.lock().unwrap();
    db.get_fuel_consumption_trend(vehicle_id).map_err(|e| e.to_string())
}

#[tauri::command]
fn get_electric_consumption_trend(state: State<AppState>, vehicle_id: i64) -> Result<Vec<ConsumptionTrendPoint>, String> {
    let db = state.db.lock().unwrap();
    db.get_electric_consumption_trend(vehicle_id).map_err(|e| e.to_string())
}

#[tauri::command]
fn get_expense_statistics(state: State<AppState>, vehicle_id: i64) -> Result<Vec<ExpenseStatPoint>, String> {
    let db = state.db.lock().unwrap();
    db.get_expense_statistics(vehicle_id).map_err(|e| e.to_string())
}

#[tauri::command]
fn get_recent_expense_records(state: State<AppState>, vehicle_id: i64, limit: usize) -> Result<Vec<ExpenseStatPoint>, String> {
    let db = state.db.lock().unwrap();
    db.get_recent_expense_records(vehicle_id, limit).map_err(|e| e.to_string())
}

#[tauri::command]
fn add_test_fuel_records(state: State<AppState>, vehicle_id: i64) -> Result<String, String> {
    use chrono::{Duration, Utc};

    let db = state.db.lock().unwrap();

    // 添加7条测试加油记录
    let test_records = vec![
        (5000.0, 40.00, 7.50, -60), // 60天前
        (5450.0, 42.95, 7.45, -45), // 45天前
        (5900.0, 40.79, 7.60, -30), // 30天前
        (6350.0, 39.07, 7.55, -20), // 20天前
        (6800.0, 42.86, 7.70, -10), // 10天前
        (7250.0, 41.18, 7.65, -5),  // 5天前
        (7700.0, 41.94, 7.75, -1),  // 1天前
    ];

    for (mileage, liters, price, days_ago) in test_records {
        let amount = liters * price;
        let created_at = Utc::now() + Duration::days(days_ago);

        let record = FuelRecord {
            id: None,
            vehicle_id,
            fuel_type: FuelType::Gasoline92,
            price_per_liter: price,
            amount,
            liters,
            mileage,
            is_full_tank: true,
            note: Some("测试数据".to_string()),
            created_at,
        };

        db.add_fuel_record(&record).map_err(|e| e.to_string())?;
    }

    Ok("成功添加7条测试加油记录".to_string())
}

#[tauri::command]
fn delete_fuel_record(state: State<AppState>, record_id: i64) -> Result<(), String> {
    let db = state.db.lock().unwrap();
    db.delete_fuel_record(record_id).map_err(|e| e.to_string())
}

#[tauri::command]
fn update_fuel_record(
    state: State<AppState>,
    record_id: i64,
    fuel_type: String,
    price_per_liter: f64,
    amount: f64,
    liters: f64,
    mileage: f64,
    is_full_tank: bool,
    note: Option<String>,
) -> Result<(), String> {
    let fuel_type = match fuel_type.as_str() {
        "Gasoline92" => FuelType::Gasoline92,
        "Gasoline95" => FuelType::Gasoline95,
        "Gasoline98" => FuelType::Gasoline98,
        "Diesel" => FuelType::Diesel,
        _ => return Err("Invalid fuel type".to_string()),
    };

    let record = FuelRecord {
        id: Some(record_id),
        vehicle_id: 0, // 不需要更新
        fuel_type,
        price_per_liter,
        amount,
        liters,
        mileage,
        is_full_tank,
        note,
        created_at: Utc::now(), // 不需要更新
    };

    let db = state.db.lock().unwrap();
    db.update_fuel_record(&record).map_err(|e| e.to_string())
}

#[tauri::command]
fn import_fuel_records_csv(
    state: State<AppState>,
    vehicle_id: i64,
    csv_content: String,
) -> Result<usize, String> {
    let db = state.db.lock().unwrap();
    db.import_fuel_records_from_csv(vehicle_id, &csv_content)
        .map_err(|e| e.to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let db_path = std::env::current_dir()
        .unwrap()
        .join("car_fuel_tracker.db");

    let db = Database::new(db_path).expect("Failed to create database");
    db.init_tables().expect("Failed to initialize tables");

    tauri::Builder::default()
        .manage(AppState {
            db: Mutex::new(db),
        })
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            add_vehicle,
            get_all_vehicles,
            add_fuel_record,
            add_charging_record,
            get_fuel_records,
            get_charging_records,
            get_vehicle_consumption,
            add_maintenance_record,
            get_maintenance_records,
            export_fuel_records_csv,
            get_fuel_consumption_trend,
            get_electric_consumption_trend,
            get_expense_statistics,
            get_recent_expense_records,
            add_test_fuel_records,
            delete_fuel_record,
            update_fuel_record,
            import_fuel_records_csv
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
