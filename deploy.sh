#!/usr/bin/env bash
set -e

# ==============================================================================
# RentCar Production Deployment Script
# Platform Rental Mobil Lepas Kunci (Next.js + SQLite)
# ==============================================================================

# Text formatting
BOLD='\033[1m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BOLD}${BLUE}====================================================${NC}"
echo -e "${BOLD}${BLUE}       🚀 Memulai Proses Deployment RentCar        ${NC}"
echo -e "${BOLD}${BLUE}====================================================${NC}"

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$APP_DIR"

# Auto-load .env jika file ada, atau buat dari .env.example jika belum ada
if [ ! -f ".env" ] && [ -f ".env.example" ]; then
    echo -e "${YELLOW}File .env tidak ditemukan, membuat .env dari .env.example...${NC}"
    cp .env.example .env
fi

if [ -f ".env" ]; then
    set -a
    source .env
    set +a
fi

# 1. Cek Node.js & NPM
echo -e "\n${BOLD}[1/6] Memeriksa Lingkungan Node.js & NPM...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js belum terinstall. Harap install Node.js (>= 18) terlebih dahulu.${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Node.js $(node -v) terdeteksi${NC}"
echo -e "${GREEN}✓ NPM $(npm -v) terdeteksi${NC}"

# 2. Pull Kode Terbaru dari Git (jika ada remote)
echo -e "\n${BOLD}[2/6] Memeriksa Pembaruan Kode dari Git...${NC}"
if [ -d ".git" ]; then
    BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "main")
    echo -e "Menarik pembaruan dari branch ${YELLOW}${BRANCH}${NC}..."
    git pull origin "$BRANCH" || echo -e "${YELLOW}⚠️ Gagal git pull (mungkin offline atau tidak ada upstream), melanjutkan...${NC}"
else
    echo -e "${YELLOW}Bukan git repository atau .git tidak ditemukan, melewati git pull.${NC}"
fi

# 3. Setup Direktori Database & Aset
echo -e "\n${BOLD}[3/6] Mempersiapkan Direktori Database & Aset...${NC}"
mkdir -p data
mkdir -p public/images/cars
mkdir -p public/images/hero
mkdir -p public/images/avatars
echo -e "${GREEN}✓ Direktori data dan aset terverifikasi.${NC}"

# 4. Install Dependensi
echo -e "\n${BOLD}[4/6] Menginstall Dependensi Proyek...${NC}"
npm install --no-audit --prefer-offline || npm install
echo -e "${GREEN}✓ Dependensi berhasil dipasang.${NC}"

# 5. Build Aplikasi Next.js
echo -e "\n${BOLD}[5/6] Membangun Aplikasi (Next.js Build)...${NC}"
npm run build
echo -e "${GREEN}✓ Build produksi berhasil dibuat tanpa error.${NC}"

# 6. Restart Server (PM2 jika tersedia, atau fallback info)
echo -e "\n${BOLD}[6/6] Menjalankan / Memperbarui Service Aplikasi...${NC}"
APP_NAME="${APP_NAME:-rentcar}"
TARGET_PORT="${PORT:-${1:-3000}}"

# Fungsi untuk memeriksa apakah port sedang digunakan
is_port_in_use() {
    local p=$1
    if command -v lsof &> /dev/null; then
        lsof -iTCP:"$p" -sTCP:LISTEN -P -n &> /dev/null
    elif command -v nc &> /dev/null; then
        nc -z 127.0.0.1 "$p" &> /dev/null
    else
        return 1
    fi
}

PORT=$TARGET_PORT

# Jika port sedang dipakai oleh service lain di luar PM2, cari port yang tersedia
if is_port_in_use "$PORT"; then
    # Cek apakah itu proses PM2 milik kita sendiri
    IS_OUR_PM2=false
    if command -v pm2 &> /dev/null && pm2 list | grep -q "$APP_NAME"; then
        IS_OUR_PM2=true
    fi

    if [ "$IS_OUR_PM2" = false ]; then
        echo -e "${YELLOW}⚠️ Port $PORT sedang digunakan oleh proses lain.${NC}"
        echo -e "Mencari port kosong berikutnya secara otomatis..."
        while is_port_in_use "$PORT"; do
            PORT=$((PORT + 1))
        done
        echo -e "${GREEN}✓ Mengalihkan otomatis ke port yang tersedia: ${BOLD}$PORT${NC}"
    fi
fi

if command -v pm2 &> /dev/null; then
    echo -e "Menggunakan PM2 Process Manager..."
    if pm2 list | grep -q "$APP_NAME"; then
        echo -e "Merestart service PM2: ${YELLOW}$APP_NAME${NC} pada port ${YELLOW}$PORT${NC}..."
        pm2 delete "$APP_NAME" &> /dev/null || true
        pm2 start npm --name "$APP_NAME" -- start -- -p "$PORT"
    else
        echo -e "Memulai service baru di PM2: ${YELLOW}$APP_NAME${NC} pada port ${YELLOW}${PORT}${NC}..."
        pm2 start npm --name "$APP_NAME" -- start -- -p "$PORT"
    fi
    pm2 save
    echo -e "${GREEN}✓ Service PM2 berhasil aktif pada port ${PORT}!${NC}"
else
    echo -e "${YELLOW}ℹ️ PM2 tidak terdeteksi secara global.${NC}"
    echo -e "Untuk menjalankan aplikasi pada port ${BOLD}${PORT}${NC}:"
    echo -e "  ${BOLD}npm run start -- -p ${PORT}${NC}"
    echo -e "Atau dengan PM2: ${BOLD}pm2 start npm --name \"$APP_NAME\" -- start -- -p ${PORT}${NC}"
fi

echo -e "\n${BOLD}${GREEN}====================================================${NC}"
echo -e "${BOLD}${GREEN}   ✨ Deployment Selesai & Aplikasi Siap Diakses!   ${NC}"
echo -e "${BOLD}${GREEN}   🌐 URL: http://localhost:${PORT}                   ${NC}"
echo -e "${BOLD}${GREEN}====================================================${NC}"
