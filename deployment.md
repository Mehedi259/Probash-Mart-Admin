# Deployment Guide

This document outlines the standard deployment process for the Probash Mart Admin Dashboard.

## Server Details
- **Server:** Hetzner (`musa` alias in SSH config)
- **Deployment Path:** `/root/probash-mart-admin`
- **Docker Container Name:** `probash-mart-admin-probash-mart-admin-1`
- **Port:** Maps `3007 -> 3000` internally.

## Deployment Steps

1. **Sync Changes to the Server**
   From your local machine, run the following `rsync` command to safely upload only the changed files (excluding `node_modules` and hidden files):
   ```bash
   rsync -avz --exclude 'node_modules' --exclude '.git' --exclude '.next' --exclude '.env.local' /Users/mehedihasanmridul/website/Probash-Mart-Admin/ musa:/root/probash-mart-admin/
   ```

2. **Rebuild and Restart the Docker Container**
   SSH into the server, navigate to the project directory, and rebuild the Docker image so Next.js compiles the latest changes into the standalone production build.
   ```bash
   ssh musa
   cd /root/probash-mart-admin
   docker compose build
   docker compose up -d
   ```

3. **Verify Deployment**
   Check the logs to ensure the Next.js server has started without errors:
   ```bash
   docker logs -f probash-mart-admin-probash-mart-admin-1
   ```

## Environment Variables
Production environment variables should be defined in `/root/probash-mart-admin/.env.local`. Ensure that `NEXT_PUBLIC_API_URL` points to the remote backend (e.g. `http://46.225.103.236:8003`).
