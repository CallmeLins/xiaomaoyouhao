use crate::models::FuelRecord;

/// 油耗计算结果
#[allow(dead_code)]
#[derive(Debug, Clone)]
pub struct FuelConsumption {
    pub consumption_per_100km: f64,  // 百公里油耗
    pub total_distance: f64,          // 总行驶距离
    pub total_fuel: f64,              // 总加油量
    pub average_price: f64,           // 平均油价
    pub total_cost: f64,              // 总费用
}

/// 油耗计算器
#[allow(dead_code)]
pub struct FuelCalculator;

#[allow(dead_code)]
impl FuelCalculator {
    /// 使用跳枪法计算油耗（基于多次加满油箱的记录）
    pub fn calculate_consumption(records: &[FuelRecord]) -> Option<FuelConsumption> {
        // 筛选出加满油箱的记录
        let full_tank_records: Vec<&FuelRecord> = records
            .iter()
            .filter(|r| r.is_full_tank)
            .collect();

        if full_tank_records.len() < 2 {
            return None;
        }

        let mut total_distance = 0.0;
        let mut total_fuel = 0.0;
        let mut total_cost = 0.0;

        // 计算相邻两次加满油之间的油耗
        for i in 1..full_tank_records.len() {
            let prev = full_tank_records[i - 1];
            let curr = full_tank_records[i];

            let distance = curr.mileage - prev.mileage;
            total_distance += distance;
            total_fuel += curr.liters;
            total_cost += curr.amount;
        }

        if total_distance <= 0.0 {
            return None;
        }

        let consumption_per_100km = (total_fuel / total_distance) * 100.0;
        let average_price = total_cost / total_fuel;

        Some(FuelConsumption {
            consumption_per_100km,
            total_distance,
            total_fuel,
            average_price,
            total_cost,
        })
    }
}
