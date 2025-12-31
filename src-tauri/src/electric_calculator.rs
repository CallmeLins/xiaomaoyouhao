use crate::models::ChargingRecord;

/// 电耗计算结果
#[allow(dead_code)]
#[derive(Debug, Clone)]
pub struct ElectricConsumption {
    pub consumption_per_100km: f64,  // 百公里电耗（kWh）
    pub total_distance: f64,          // 总行驶距离
    pub total_kwh: f64,               // 总充电量
    pub average_price: f64,           // 平均电价
    pub total_cost: f64,              // 总费用
}

/// 电耗计算器
#[allow(dead_code)]
pub struct ElectricCalculator;

#[allow(dead_code)]
impl ElectricCalculator {
    /// 计算电耗
    pub fn calculate_consumption(records: &[ChargingRecord]) -> Option<ElectricConsumption> {
        if records.is_empty() {
            return None;
        }

        let mut total_distance = 0.0;
        let mut total_kwh = 0.0;
        let mut total_cost = 0.0;

        for record in records {
            let distance = record.mileage_after - record.mileage_before;
            total_distance += distance;
            total_kwh += record.kwh;
            total_cost += record.amount;
        }

        if total_distance <= 0.0 {
            return None;
        }

        let consumption_per_100km = (total_kwh / total_distance) * 100.0;
        let average_price = total_cost / total_kwh;

        Some(ElectricConsumption {
            consumption_per_100km,
            total_distance,
            total_kwh,
            average_price,
            total_cost,
        })
    }
}
