use crate::database::{Database, DbError};
use crate::models::*;
use chrono::Utc;
use rusqlite::params;

impl Database {
    /// 添加车辆
    pub fn add_vehicle(&self, vehicle: &Vehicle) -> Result<i64, DbError> {
        let vehicle_type_str = match vehicle.vehicle_type {
            VehicleType::Fuel => "Fuel",
            VehicleType::Electric => "Electric",
            VehicleType::Hybrid => "Hybrid",
        };

        self.conn.execute(
            "INSERT INTO vehicles (brand, model, year, vehicle_type, fuel_tank_capacity,
             battery_capacity, created_at, updated_at)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)",
            params![
                vehicle.brand,
                vehicle.model,
                vehicle.year,
                vehicle_type_str,
                vehicle.fuel_tank_capacity,
                vehicle.battery_capacity,
                vehicle.created_at.to_rfc3339(),
                vehicle.updated_at.to_rfc3339(),
            ],
        )?;

        Ok(self.conn.last_insert_rowid())
    }

    /// 获取所有车辆
    pub fn get_all_vehicles(&self) -> Result<Vec<Vehicle>, DbError> {
        let mut stmt = self.conn.prepare(
            "SELECT id, brand, model, year, vehicle_type, fuel_tank_capacity,
             battery_capacity, created_at, updated_at FROM vehicles"
        )?;

        let vehicles = stmt.query_map([], |row: &rusqlite::Row| {
            let vehicle_type_str: String = row.get(4)?;
            let vehicle_type = match vehicle_type_str.as_str() {
                "Fuel" => VehicleType::Fuel,
                "Electric" => VehicleType::Electric,
                "Hybrid" => VehicleType::Hybrid,
                _ => VehicleType::Fuel,
            };

            Ok(Vehicle {
                id: Some(row.get(0)?),
                brand: row.get(1)?,
                model: row.get(2)?,
                year: row.get(3)?,
                vehicle_type,
                fuel_tank_capacity: row.get(5)?,
                battery_capacity: row.get(6)?,
                created_at: row.get::<_, String>(7)?.parse().unwrap_or(Utc::now()),
                updated_at: row.get::<_, String>(8)?.parse().unwrap_or(Utc::now()),
            })
        })?
        .collect::<Result<Vec<_>, _>>()?;

        Ok(vehicles)
    }

    pub fn delete_vehicle(&self, vehicle_id: i64) -> Result<(), DbError> {
        // 删除车辆的所有加油记录
        self.conn.execute(
            "DELETE FROM fuel_records WHERE vehicle_id = ?1",
            [vehicle_id],
        )?;

        // 删除车辆的所有充电记录
        self.conn.execute(
            "DELETE FROM charging_records WHERE vehicle_id = ?1",
            [vehicle_id],
        )?;

        // 删除车辆的所有保养记录
        self.conn.execute(
            "DELETE FROM maintenance_records WHERE vehicle_id = ?1",
            [vehicle_id],
        )?;

        // 删除车辆本身
        self.conn.execute(
            "DELETE FROM vehicles WHERE id = ?1",
            [vehicle_id],
        )?;

        Ok(())
    }

    pub fn update_vehicle(
        &self,
        vehicle_id: i64,
        brand: String,
        model: String,
        year: i32,
        vehicle_type: VehicleType,
        fuel_tank_capacity: Option<f64>,
        battery_capacity: Option<f64>,
    ) -> Result<(), DbError> {
        let vehicle_type_str = match vehicle_type {
            VehicleType::Fuel => "Fuel",
            VehicleType::Electric => "Electric",
            VehicleType::Hybrid => "Hybrid",
        };

        self.conn.execute(
            "UPDATE vehicles SET brand = ?1, model = ?2, year = ?3, vehicle_type = ?4,
             fuel_tank_capacity = ?5, battery_capacity = ?6, updated_at = ?7
             WHERE id = ?8",
            rusqlite::params![
                brand,
                model,
                year,
                vehicle_type_str,
                fuel_tank_capacity,
                battery_capacity,
                Utc::now().to_rfc3339(),
                vehicle_id,
            ],
        )?;

        Ok(())
    }

    /// 添加加油记录
    pub fn add_fuel_record(&self, record: &FuelRecord) -> Result<i64, DbError> {
        let fuel_type_str = match record.fuel_type {
            FuelType::Gasoline92 => "Gasoline92",
            FuelType::Gasoline95 => "Gasoline95",
            FuelType::Gasoline98 => "Gasoline98",
            FuelType::Diesel => "Diesel",
        };

        self.conn.execute(
            "INSERT INTO fuel_records (vehicle_id, fuel_type, price_per_liter, amount,
             liters, mileage, is_full_tank, note, created_at)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)",
            params![
                record.vehicle_id,
                fuel_type_str,
                record.price_per_liter,
                record.amount,
                record.liters,
                record.mileage,
                record.is_full_tank as i32,
                record.note,
                record.created_at.to_rfc3339(),
            ],
        )?;

        Ok(self.conn.last_insert_rowid())
    }

    /// 获取指定车辆的加油记录
    pub fn get_fuel_records(&self, vehicle_id: i64) -> Result<Vec<FuelRecord>, DbError> {
        let mut stmt = self.conn.prepare(
            "SELECT id, vehicle_id, fuel_type, price_per_liter, amount, liters,
             mileage, is_full_tank, note, created_at
             FROM fuel_records WHERE vehicle_id = ?1 ORDER BY created_at DESC"
        )?;

        let records = stmt.query_map([vehicle_id], |row: &rusqlite::Row| {
            let fuel_type_str: String = row.get(2)?;
            let fuel_type = match fuel_type_str.as_str() {
                "Gasoline92" => FuelType::Gasoline92,
                "Gasoline95" => FuelType::Gasoline95,
                "Gasoline98" => FuelType::Gasoline98,
                "Diesel" => FuelType::Diesel,
                _ => FuelType::Gasoline92,
            };

            Ok(FuelRecord {
                id: Some(row.get(0)?),
                vehicle_id: row.get(1)?,
                fuel_type,
                price_per_liter: row.get(3)?,
                amount: row.get(4)?,
                liters: row.get(5)?,
                mileage: row.get(6)?,
                is_full_tank: row.get::<_, i32>(7)? != 0,
                note: row.get(8)?,
                created_at: row.get::<_, String>(9)?.parse().unwrap_or(Utc::now()),
            })
        })?
        .collect::<Result<Vec<_>, _>>()?;

        Ok(records)
    }

    /// 计算车辆的平均油耗（百公里）
    pub fn calculate_fuel_consumption(&self, vehicle_id: i64) -> Result<f64, DbError> {
        let records = self.get_fuel_records(vehicle_id)?;

        // 筛选出加满油箱的记录
        let full_tank_records: Vec<&FuelRecord> = records
            .iter()
            .filter(|r| r.is_full_tank)
            .collect();

        if full_tank_records.len() < 2 {
            return Ok(0.0);
        }

        let mut total_distance = 0.0;
        let mut total_fuel = 0.0;

        // 计算相邻两次加满油之间的油耗
        for i in 1..full_tank_records.len() {
            let prev = full_tank_records[i - 1];
            let curr = full_tank_records[i];

            let distance = curr.mileage - prev.mileage;
            if distance > 0.0 {
                total_distance += distance;
                total_fuel += curr.liters;
            }
        }

        if total_distance <= 0.0 {
            return Ok(0.0);
        }

        let consumption = (total_fuel / total_distance) * 100.0;
        Ok(consumption)
    }

    /// 添加充电记录
    pub fn add_charging_record(&self, record: &ChargingRecord) -> Result<i64, DbError> {
        let charging_type_str = match record.charging_type {
            ChargingType::Slow => "Slow",
            ChargingType::Fast => "Fast",
        };

        self.conn.execute(
            "INSERT INTO charging_records (vehicle_id, charging_type, price_per_kwh, amount,
             kwh, mileage_before, mileage_after, duration_minutes, note, created_at)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)",
            params![
                record.vehicle_id,
                charging_type_str,
                record.price_per_kwh,
                record.amount,
                record.kwh,
                record.mileage_before,
                record.mileage_after,
                record.duration_minutes,
                record.note,
                record.created_at.to_rfc3339(),
            ],
        )?;

        Ok(self.conn.last_insert_rowid())
    }

    /// 获取指定车辆的充电记录
    pub fn get_charging_records(&self, vehicle_id: i64) -> Result<Vec<ChargingRecord>, DbError> {
        let mut stmt = self.conn.prepare(
            "SELECT id, vehicle_id, charging_type, price_per_kwh, amount, kwh,
             mileage_before, mileage_after, duration_minutes, note, created_at
             FROM charging_records WHERE vehicle_id = ?1 ORDER BY created_at DESC"
        )?;

        let records = stmt.query_map([vehicle_id], |row: &rusqlite::Row| {
            let charging_type_str: String = row.get(2)?;
            let charging_type = match charging_type_str.as_str() {
                "Slow" => ChargingType::Slow,
                "Fast" => ChargingType::Fast,
                _ => ChargingType::Slow,
            };

            Ok(ChargingRecord {
                id: Some(row.get(0)?),
                vehicle_id: row.get(1)?,
                charging_type,
                price_per_kwh: row.get(3)?,
                amount: row.get(4)?,
                kwh: row.get(5)?,
                mileage_before: row.get(6)?,
                mileage_after: row.get(7)?,
                duration_minutes: row.get(8)?,
                note: row.get(9)?,
                created_at: row.get::<_, String>(10)?.parse().unwrap_or(Utc::now()),
            })
        })?
        .collect::<Result<Vec<_>, _>>()?;

        Ok(records)
    }

    /// 计算车辆的平均电耗（百公里）
    pub fn calculate_electric_consumption(&self, vehicle_id: i64) -> Result<f64, DbError> {
        let records = self.get_charging_records(vehicle_id)?;

        if records.is_empty() {
            return Ok(0.0);
        }

        let mut total_distance = 0.0;
        let mut total_kwh = 0.0;

        for record in records {
            let distance = record.mileage_after - record.mileage_before;
            if distance > 0.0 {
                total_distance += distance;
                total_kwh += record.kwh;
            }
        }

        if total_distance <= 0.0 {
            return Ok(0.0);
        }

        let consumption = (total_kwh / total_distance) * 100.0;
        Ok(consumption)
    }

    /// 添加保养记录
    pub fn add_maintenance_record(&self, record: &MaintenanceRecord) -> Result<i64, DbError> {
        self.conn.execute(
            "INSERT INTO maintenance_records (vehicle_id, maintenance_type, mileage, cost, shop, note, created_at)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
            params![
                record.vehicle_id,
                record.maintenance_type,
                record.mileage,
                record.cost,
                record.shop,
                record.note,
                record.created_at.to_rfc3339(),
            ],
        )?;

        Ok(self.conn.last_insert_rowid())
    }

    /// 获取指定车辆的保养记录
    pub fn get_maintenance_records(&self, vehicle_id: i64) -> Result<Vec<MaintenanceRecord>, DbError> {
        let mut stmt = self.conn.prepare(
            "SELECT id, vehicle_id, maintenance_type, mileage, cost, shop, note, created_at
             FROM maintenance_records WHERE vehicle_id = ?1 ORDER BY created_at DESC"
        )?;

        let records = stmt.query_map([vehicle_id], |row: &rusqlite::Row| {
            Ok(MaintenanceRecord {
                id: Some(row.get(0)?),
                vehicle_id: row.get(1)?,
                maintenance_type: row.get(2)?,
                mileage: row.get(3)?,
                cost: row.get(4)?,
                shop: row.get(5)?,
                note: row.get(6)?,
                created_at: row.get::<_, String>(7)?.parse().unwrap_or(Utc::now()),
            })
        })?
        .collect::<Result<Vec<_>, _>>()?;

        Ok(records)
    }

    /// 导出加油记录为CSV格式
    pub fn export_fuel_records_csv(&self, vehicle_id: i64) -> Result<String, DbError> {
        let records = self.get_fuel_records(vehicle_id)?;

        let mut csv_content = String::from("日期,油品类型,油价(元/升),加油量(升),金额(元),里程(公里),加满,备注\n");

        for record in records {
            let fuel_type = match record.fuel_type {
                FuelType::Gasoline92 => "92号汽油",
                FuelType::Gasoline95 => "95号汽油",
                FuelType::Gasoline98 => "98号汽油",
                FuelType::Diesel => "柴油",
            };

            csv_content.push_str(&format!(
                "{},{},{:.2},{:.2},{:.2},{:.1},{},{}\n",
                record.created_at.format("%Y-%m-%d %H:%M:%S"),
                fuel_type,
                record.price_per_liter,
                record.liters,
                record.amount,
                record.mileage,
                if record.is_full_tank { "是" } else { "否" },
                record.note.as_deref().unwrap_or("")
            ));
        }

        Ok(csv_content)
    }

    /// 获取燃油车的油耗趋势数据（用于图表展示）
    pub fn get_fuel_consumption_trend(&self, vehicle_id: i64) -> Result<Vec<ConsumptionTrendPoint>, DbError> {
        let records = self.get_fuel_records(vehicle_id)?;

        // 筛选加满油箱的记录并反转顺序（从旧到新）
        let mut full_tank_records: Vec<&FuelRecord> = records
            .iter()
            .filter(|r| r.is_full_tank)
            .collect();

        full_tank_records.reverse(); // 反转为从旧到新的顺序

        let mut trend_points = Vec::new();

        if full_tank_records.len() < 2 {
            return Ok(trend_points);
        }

        // 计算每两次加满油之间的油耗
        for i in 1..full_tank_records.len() {
            let prev = full_tank_records[i - 1]; // 更早的记录
            let curr = full_tank_records[i];     // 更晚的记录

            let distance = curr.mileage - prev.mileage;
            if distance > 0.0 {
                let consumption = (curr.liters / distance) * 100.0;
                trend_points.push(ConsumptionTrendPoint {
                    date: curr.created_at.format("%Y-%m-%d").to_string(),
                    consumption,
                    mileage: curr.mileage,
                });
            }
        }

        Ok(trend_points)
    }

    /// 获取电动车的电耗趋势数据（用于图表展示）
    pub fn get_electric_consumption_trend(&self, vehicle_id: i64) -> Result<Vec<ConsumptionTrendPoint>, DbError> {
        let records = self.get_charging_records(vehicle_id)?;

        let mut trend_points = Vec::new();

        for record in records {
            let distance = record.mileage_after - record.mileage_before;
            if distance > 0.0 {
                let consumption = (record.kwh / distance) * 100.0;
                trend_points.push(ConsumptionTrendPoint {
                    date: record.created_at.format("%Y-%m-%d").to_string(),
                    consumption,
                    mileage: record.mileage_after,
                });
            }
        }

        Ok(trend_points)
    }

    /// 获取费用统计数据（按月统计，用于图表展示）
    pub fn get_expense_statistics(&self, vehicle_id: i64) -> Result<Vec<ExpenseStatPoint>, DbError> {
        use std::collections::HashMap;

        let mut stats_map: HashMap<String, ExpenseStatPoint> = HashMap::new();

        // 统计加油费用
        let fuel_records = self.get_fuel_records(vehicle_id)?;
        for record in fuel_records {
            let month = record.created_at.format("%Y-%m").to_string();
            let stat = stats_map.entry(month.clone()).or_insert(ExpenseStatPoint {
                month,
                fuel_cost: 0.0,
                charging_cost: 0.0,
                maintenance_cost: 0.0,
                other_cost: 0.0,
                total_cost: 0.0,
            });
            stat.fuel_cost += record.amount;
        }

        // 统计充电费用
        let charging_records = self.get_charging_records(vehicle_id)?;
        for record in charging_records {
            let month = record.created_at.format("%Y-%m").to_string();
            let stat = stats_map.entry(month.clone()).or_insert(ExpenseStatPoint {
                month,
                fuel_cost: 0.0,
                charging_cost: 0.0,
                maintenance_cost: 0.0,
                other_cost: 0.0,
                total_cost: 0.0,
            });
            stat.charging_cost += record.amount;
        }

        // 统计保养费用
        let maintenance_records = self.get_maintenance_records(vehicle_id)?;
        for record in maintenance_records {
            let month = record.created_at.format("%Y-%m").to_string();
            let stat = stats_map.entry(month.clone()).or_insert(ExpenseStatPoint {
                month,
                fuel_cost: 0.0,
                charging_cost: 0.0,
                maintenance_cost: 0.0,
                other_cost: 0.0,
                total_cost: 0.0,
            });
            stat.maintenance_cost += record.cost;
        }

        // 计算总费用
        for stat in stats_map.values_mut() {
            stat.total_cost = stat.fuel_cost + stat.charging_cost + stat.maintenance_cost + stat.other_cost;
        }

        // 转换为Vec并按月份排序
        let mut stats: Vec<ExpenseStatPoint> = stats_map.into_values().collect();
        stats.sort_by(|a, b| a.month.cmp(&b.month));

        Ok(stats)
    }

    /// 获取最近N次加油/充电记录的费用数据（用于折线图展示）
    pub fn get_recent_expense_records(&self, vehicle_id: i64, limit: usize) -> Result<Vec<ExpenseStatPoint>, DbError> {
        let mut records = Vec::new();

        // 获取加油记录
        let fuel_records = self.get_fuel_records(vehicle_id)?;
        for record in fuel_records.iter().take(limit) {
            records.push(ExpenseStatPoint {
                month: record.created_at.format("%Y-%m-%d").to_string(),
                fuel_cost: record.amount,
                charging_cost: 0.0,
                maintenance_cost: 0.0,
                other_cost: 0.0,
                total_cost: record.amount,
            });
        }

        // 获取充电记录
        let charging_records = self.get_charging_records(vehicle_id)?;
        for record in charging_records.iter().take(limit) {
            records.push(ExpenseStatPoint {
                month: record.created_at.format("%Y-%m-%d").to_string(),
                fuel_cost: 0.0,
                charging_cost: record.amount,
                maintenance_cost: 0.0,
                other_cost: 0.0,
                total_cost: record.amount,
            });
        }

        // 按日期排序并取最近的N条
        records.sort_by(|a, b| b.month.cmp(&a.month));
        records.truncate(limit);
        records.reverse(); // 反转为从旧到新

        Ok(records)
    }

    /// 删除加油记录
    pub fn delete_fuel_record(&self, record_id: i64) -> Result<(), DbError> {
        self.conn.execute(
            "DELETE FROM fuel_records WHERE id = ?1",
            [record_id],
        )?;
        Ok(())
    }

    /// 更新加油记录
    pub fn update_fuel_record(&self, record: &FuelRecord) -> Result<(), DbError> {
        let fuel_type_str = match record.fuel_type {
            FuelType::Gasoline92 => "Gasoline92",
            FuelType::Gasoline95 => "Gasoline95",
            FuelType::Gasoline98 => "Gasoline98",
            FuelType::Diesel => "Diesel",
        };

        self.conn.execute(
            "UPDATE fuel_records SET fuel_type = ?1, price_per_liter = ?2, amount = ?3,
             liters = ?4, mileage = ?5, is_full_tank = ?6, note = ?7
             WHERE id = ?8",
            params![
                fuel_type_str,
                record.price_per_liter,
                record.amount,
                record.liters,
                record.mileage,
                record.is_full_tank as i32,
                record.note,
                record.id,
            ],
        )?;
        Ok(())
    }

    /// 从CSV内容导入加油记录
    pub fn import_fuel_records_from_csv(&self, vehicle_id: i64, csv_content: &str) -> Result<usize, DbError> {
        use chrono::NaiveDateTime;

        let mut imported_count = 0;
        let lines: Vec<&str> = csv_content.lines().collect();

        // 跳过标题行
        for line in lines.iter().skip(1) {
            if line.trim().is_empty() {
                continue;
            }

            let fields: Vec<&str> = line.split(',').collect();
            if fields.len() < 7 {
                continue; // 跳过格式不正确的行
            }

            // 解析字段
            let date_str = fields[0].trim();
            let fuel_type_str = fields[1].trim();
            let price_per_liter = fields[2].trim().parse::<f64>().unwrap_or(0.0);
            let liters = fields[3].trim().parse::<f64>().unwrap_or(0.0);
            let amount = fields[4].trim().parse::<f64>().unwrap_or(0.0);
            let mileage = fields[5].trim().parse::<f64>().unwrap_or(0.0);
            let is_full_tank_str = fields[6].trim();
            let note = if fields.len() > 7 { Some(fields[7].trim().to_string()) } else { None };

            // 解析油品类型
            let fuel_type = match fuel_type_str {
                "92号汽油" => FuelType::Gasoline92,
                "95号汽油" => FuelType::Gasoline95,
                "98号汽油" => FuelType::Gasoline98,
                "柴油" => FuelType::Diesel,
                _ => FuelType::Gasoline92,
            };

            // 解析是否加满
            let is_full_tank = is_full_tank_str == "是";

            // 解析日期
            let created_at = NaiveDateTime::parse_from_str(date_str, "%Y-%m-%d %H:%M:%S")
                .ok()
                .and_then(|dt| dt.and_local_timezone(chrono::Local).single())
                .map(|dt| dt.with_timezone(&chrono::Utc))
                .unwrap_or_else(|| chrono::Utc::now());

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
                created_at,
            };

            if self.add_fuel_record(&record).is_ok() {
                imported_count += 1;
            }
        }

        Ok(imported_count)
    }
}
