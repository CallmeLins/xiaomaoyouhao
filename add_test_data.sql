-- 添加测试加油记录数据
-- 假设车辆ID为1，模拟7次加油记录，每次间隔约400-500公里

-- 第1次加油（最早）- 2024-11-01
INSERT INTO fuel_records (vehicle_id, fuel_type, price_per_liter, amount, liters, mileage, is_full_tank, note, created_at)
VALUES (1, 'Gasoline92', 7.50, 300.00, 40.00, 5000.0, 1, '高速行驶', '2024-11-01 10:30:00');

-- 第2次加油 - 2024-11-15
INSERT INTO fuel_records (vehicle_id, fuel_type, price_per_liter, amount, liters, mileage, is_full_tank, note, created_at)
VALUES (1, 'Gasoline92', 7.45, 320.00, 42.95, 5450.0, 1, '市区行驶', '2024-11-15 14:20:00');

-- 第3次加油 - 2024-12-01
INSERT INTO fuel_records (vehicle_id, fuel_type, price_per_liter, amount, liters, mileage, is_full_tank, note, created_at)
VALUES (1, 'Gasoline92', 7.60, 310.00, 40.79, 5900.0, 1, '混合路况', '2024-12-01 09:15:00');

-- 第4次加油 - 2024-12-15
INSERT INTO fuel_records (vehicle_id, fuel_type, price_per_liter, amount, liters, mileage, is_full_tank, note, created_at)
VALUES (1, 'Gasoline92', 7.55, 295.00, 39.07, 6350.0, 1, '高速为主', '2024-12-15 16:45:00');

-- 第5次加油 - 2025-01-05
INSERT INTO fuel_records (vehicle_id, fuel_type, price_per_liter, amount, liters, mileage, is_full_tank, note, created_at)
VALUES (1, 'Gasoline92', 7.70, 330.00, 42.86, 6800.0, 1, '冬季油耗', '2025-01-05 11:30:00');

-- 第6次加油 - 2025-01-20
INSERT INTO fuel_records (vehicle_id, fuel_type, price_per_liter, amount, liters, mileage, is_full_tank, note, created_at)
VALUES (1, 'Gasoline92', 7.65, 315.00, 41.18, 7250.0, 1, '市区拥堵', '2025-01-20 13:50:00');

-- 第7次加油 - 2025-02-05
INSERT INTO fuel_records (vehicle_id, fuel_type, price_per_liter, amount, liters, mileage, is_full_tank, note, created_at)
VALUES (1, 'Gasoline92', 7.75, 325.00, 41.94, 7700.0, 1, '正常行驶', '2025-02-05 10:00:00');
