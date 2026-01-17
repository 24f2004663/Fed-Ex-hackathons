# 🛠️ Server Setup Guide: PostgreSQL

> [!IMPORTANT]
> **Safety Notice:** Following this guide will **NOT** erase your existing server files (100GB+). 
> It simply installs a new application (PostgreSQL). 
> However, if you *already* have a database running on port 5432, you should run the pre-Check below.

## 🛑 Pre-Flight Check (Crucial)
Before running anything, check if Port 5432 is already in use:
```bash
sudo lsof -i :5432
# OR
sudo netstat -plnt | grep 5432
```

- **If output is empty:** ✅ Safe to proceed.
- **If you see a process:** ⚠️ You already have a DB running! 
    - **Docker Users:** Change the port in the command below (e.g., `-p 5433:5432`).
    - **Linux Users:** Do **not** install a new Postgres. Skip to "Step 2: Create User & Database" to use your existing engine.

## Option A: The Easiest Way (Docker) 🐳
If your server has Docker installed, run this single command to start a database instantly:

```bash
docker run -d \
  --name fedex-db \
  -e POSTGRES_USER=myuser \
  -e POSTGRES_PASSWORD=mypassword123 \
  -e POSTGRES_DB=external_data \
  -p 5432:5432 \
  postgres:latest
```

### Your Connection Details:
- **Host:** Your Server's Public IP (e.g., `123.45.67.89`)
- **Port:** `5432`
- **Database Name:** `external_data`
- **Username:** `myuser`
- **Password:** `mypassword123`

---

## Option B: Manual Installation (Linux/Ubuntu) 🐧
If you are using a standard Linux VPS (like AWS EC2, DigitalOcean):

### 1. Install Postgres
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib -y
```

### 2. Create User & Database
Log in as the postgres user and run SQL commands:
```bash
sudo -u postgres psql
```

Inside the SQL prompt, run:
```sql
CREATE DATABASE external_data;
CREATE USER myuser WITH ENCRYPTED PASSWORD 'mypassword123';
GRANT ALL PRIVILEGES ON DATABASE external_data TO myuser;
\q
```

### 3. Allow Remote Connections ⚠️ (Crucial Step)
By default, Postgres only listens to the local machine. You must enable external access.

**Step 3a: Edit `postgresql.conf`**
```bash
sudo nano /etc/postgresql/14/main/postgresql.conf
# (Replace '14' with your version number if different)
```
Find `listen_addresses` and change it to:
```conf
listen_addresses = '*'
```
*Save and exit (Ctrl+O, Enter, Ctrl+X).*

**Step 3b: Edit `pg_hba.conf`**
```bash
sudo nano /etc/postgresql/14/main/pg_hba.conf
```
Scroll to the bottom and add this line to allow password login from anywhere:
```conf
host    all             all             0.0.0.0/0            scram-sha-256
```
*Save and exit.*

**Step 3c: Restart Postgres**
```bash
sudo systemctl restart postgresql
```

---

## 🛡️ Firewall Settings
Ensure your server firewall allows traffic on port **5432**.

**For Ubuntu (UFW):**
```bash
sudo ufw allow 5432/tcp
```

**For AWS/Azure/GCP:**
- Go to your Security Groups / Network Security settings.
- Add an **Inbound Rule** allowing Custom TCP Port `5432` from `Anywhere` (0.0.0.0/0) or (Use your specific IP for better security).

## ✅ Verification
On your local machine or the Smart Recovery app:
1.  Enter your **Server IP**.
2.  Use the `myuser` / `mypassword123` credentials.
3.  Click Connect.
