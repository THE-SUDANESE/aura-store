-- =====================================================================
--  AURA — Order Number Sequence
--  Migration: 004_order_number.sql
--  يُستخدم داخل Transaction: SELECT nextval('order_number_seq')
--  لضمان رقم طلب تسلسلي فريد دون تعارض بين الطلبات المتزامنة.
-- =====================================================================

BEGIN;

CREATE SEQUENCE IF NOT EXISTS order_number_seq START WITH 1001 INCREMENT BY 1;

COMMIT;
