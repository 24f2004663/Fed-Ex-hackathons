# External Database Connection Guide

This guide details the parameters required to connect to an external database, whether it resides on the same server or a remote one.

## 🔌 Connection Parameters

To establish a connection, you will need the following 5 key pieces of information:

| Parameter | Description | Example Value |
| :--- | :--- | :--- |
| **1. Host / Hostname** | The IP address or domain of the database server. <br><br>• **Same Server:** Use `127.0.0.1` or `localhost`<br>• **Different Server:** Use the LAN IP (e.g., `192.168.1.50`) or Public IP/Domain. | `127.0.0.1`<br>`192.168.1.50`<br>`db.example.com` |
| **2. Port** | The numbered "door" the database listens on. Common defaults are:<br>• **PostgreSQL:** `5432`<br>• **MySQL:** `3306`<br>• **MongoDB:** `27017` | `5432` |
| **3. Database Name** | The specific folder or schema instance you want to access. | `analytics_db`<br>`archive_users` |
| **4. Username** | The account used to authenticate. <br>⚠️ **CRITICAL:** For external connections, use a user with **restricted permissions** (e.g., `SELECT` only) to minimize security risks. | `readonly_user` |
| **5. Password** | The secret password for that specific user. | `secure_password_123` |

---

## 📝 Example Connection Strings

Here is how you would use these details in common connection URL formats:

**PostgreSQL:**
```bash
postgresql://readonly_user:secure_password_123@192.168.1.50:5432/analytics_db
```

**MySQL:**
```bash
mysql://readonly_user:secure_password_123@192.168.1.50:3306/analytics_db
```

**MongoDB:**
```bash
mongodb://readonly_user:secure_password_123@192.168.1.50:27017/analytics_db
```

## 🛡️ Security Best Practices
1.  **Firewall Rules:** Ensure the server's firewall (e.g., AWS Security Groups, UFW) allows traffic on the database port from your specific IP address only.
2.  **SSL/TLS:** Always prefer encrypted connections (`?sslmode=require`) when connecting over the internet.
3.  **Least Privilege:** Never use the `root` or `admin` user for external applications. Create a specific user with only the permissions needed.

---

## 👨‍💻 Developer Guide: Enabling Real Connections

Currently, the "Connect Database" modal in the application is set to **Simulation Mode** for demonstration purposes. To enable actual data syncing from a legacy source (e.g., Legacy Oracle ERP or MySQL), follow this procedure:

### 1. Install Database Driver
Install the Node.js driver for your specific database type:
```bash
npm install pg        # For PostgreSQL
npm install mysql2    # For MySQL
npm install oracledb  # For Oracle
```

### 2. Update Server Action
Modify `src/app/actions.ts` -> `testAndSyncDatabase` to use the credentials passed from the form:

```typescript
// Example for PostgreSQL
import { Client } from 'pg';

export async function testAndSyncDatabase(config: any) {
    const client = new Client({
        user: config.username,
        host: config.host,
        database: config.database,
        password: config.password,
        port: parseInt(config.port),
    });

    try {
        await client.connect();
        
        // 1. Fetch External Data
        const res = await client.query('SELECT * FROM invoices WHERE status = $1', ['OPEN']);
        
        // 2. Map & Save to Local System (Prisma)
        for (const row of res.rows) {
             // ... Logic to upsert into prisma.invoice ...
        }
        
        await client.end();
        return { success: true };
    } catch (e) {
        return { success: false, error: e.message };
    }
}
```

### 3. Schema Mapping
**Crucial Step:** You must map the columns from your external database (e.g., `INV_ID`, `AMT_DUE`) to our internal schema (`invoiceNumber`, `amount`). This logic belongs in the loop in Step 2.

