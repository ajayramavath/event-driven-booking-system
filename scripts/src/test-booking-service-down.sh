#!/bin/bash
set -e

echo "Booking Service Crash Scenario"

echo ""
echo "[1/4] Stopping booking-service..."
docker compose stop booking-service

echo ""
echo "[2/4] Emitting booking + payment events while service is down..."
cd scripts
bun run booking-down
cd ..

echo ""
echo "[3/4] Restarting booking-service..."
docker compose start booking-service

echo ""
echo "[4/4] Verifying recovery and final state..."
cd scripts
bun run booking-recovery
cd ..

echo ""
echo "Booking service crash scenario PASSED!!"
