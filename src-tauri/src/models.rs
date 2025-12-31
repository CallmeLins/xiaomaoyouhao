use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};

/// 车辆类型
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum VehicleType {
    Fuel,      // 燃油车
    Electric,  // 纯电动车
    Hybrid,    // 混合动力车
}

/// 车辆信息
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Vehicle {
    pub id: Option<i64>,
    pub brand: String,           // 品牌
    pub model: String,           // 型号
    pub year: i32,               // 年份
    pub vehicle_type: VehicleType,
    pub fuel_tank_capacity: Option<f64>,  // 油箱容量（升）
    pub battery_capacity: Option<f64>,    // 电池容量（kWh）
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

/// 油品类型
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum FuelType {
    Gasoline92,  // 92号汽油
    Gasoline95,  // 95号汽油
    Gasoline98,  // 98号汽油
    Diesel,      // 柴油
}

/// 加油记录
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FuelRecord {
    pub id: Option<i64>,
    pub vehicle_id: i64,
    pub fuel_type: FuelType,
    pub price_per_liter: f64,    // 油价（元/升）
    pub amount: f64,              // 加油金额（元）
    pub liters: f64,              // 加油量（升）
    pub mileage: f64,             // 当前总里程（公里）
    pub is_full_tank: bool,       // 是否加满油箱
    pub note: Option<String>,     // 备注
    pub created_at: DateTime<Utc>,
}

/// 充电类型
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ChargingType {
    Slow,  // 慢充
    Fast,  // 快充
}

/// 充电记录
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChargingRecord {
    pub id: Option<i64>,
    pub vehicle_id: i64,
    pub charging_type: ChargingType,
    pub price_per_kwh: f64,       // 电价（元/度）
    pub amount: f64,               // 充电金额（元）
    pub kwh: f64,                  // 充电度数（kWh）
    pub mileage_before: f64,       // 充电前里程（公里）
    pub mileage_after: f64,        // 充电后里程（公里）
    pub duration_minutes: Option<i32>, // 充电时长（分钟）
    pub note: Option<String>,      // 备注
    pub created_at: DateTime<Utc>,
}

/// 保养记录
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MaintenanceRecord {
    pub id: Option<i64>,
    pub vehicle_id: i64,
    pub maintenance_type: String,  // 保养项目（如：换机油、清洗节气门）
    pub mileage: f64,              // 保养时里程（公里）
    pub cost: f64,                 // 费用（元）
    pub shop: Option<String>,      // 维修门店
    pub note: Option<String>,      // 备注
    pub created_at: DateTime<Utc>,
}

/// 费用类型
#[allow(dead_code)]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ExpenseType {
    Fuel,        // 油费
    Charging,    // 充电费
    Maintenance, // 保养费
    Parking,     // 停车费
    Toll,        // 过路费
    Insurance,   // 保险费
    Repair,      // 维修费
    Other,       // 其他
}

/// 费用记录
#[allow(dead_code)]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExpenseRecord {
    pub id: Option<i64>,
    pub vehicle_id: i64,
    pub expense_type: ExpenseType,
    pub amount: f64,               // 金额（元）
    pub note: Option<String>,      // 备注
    pub created_at: DateTime<Utc>,
}

/// 能耗趋势数据点（用于图表展示）
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ConsumptionTrendPoint {
    pub date: String,              // 日期
    pub consumption: f64,          // 百公里能耗（升或kWh）
    pub mileage: f64,              // 里程
}

/// 费用统计数据点（用于图表展示）
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExpenseStatPoint {
    pub month: String,             // 月份（如：2025-01）
    pub fuel_cost: f64,            // 油费
    pub charging_cost: f64,        // 充电费
    pub maintenance_cost: f64,     // 保养费
    pub other_cost: f64,           // 其他费用
    pub total_cost: f64,           // 总费用
}
