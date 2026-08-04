#!/usr/bin/env bash
# exit on error
set -o errexit

echo "--- 1. BUILDING FRONTEND REACT UI ---"
cd frontend
npm install
npm run build
cd ..

echo "--- 2. INSTALLING BACKEND PYTHON PACKAGES ---"
cd backend
pip install -r requirements.txt
