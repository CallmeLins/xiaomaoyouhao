use serde::{Deserialize, Serialize};

// 车辆数据结构
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Vehicle {
    pub id: String,
    pub brand: String,
    pub model: String,
    pub year: Option<i32>,
    pub displacement: Option<String>,
    pub fuel_type: Option<String>,
    pub license_plate: Option<String>,
    pub purchase_date: Option<String>,
    pub note: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}

// 油耗记录数据结构
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct FuelRecord {
    pub id: String,
    pub vehicle_id: String,
    pub date: String,
    pub mileage: f64,
    pub fuel_amount: f64,
    pub unit_price: f64,
    pub total_price: f64,
    pub fuel_type: String,
    pub is_full: bool,
    pub note: String,
    pub created_at: String,
}
