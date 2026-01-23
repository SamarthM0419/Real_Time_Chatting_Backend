# 🚪 NGINX API Gateway – Port 3000

## Overview

The **NGINX API Gateway** listens on **port 3000** and acts as the **single entry point** for all client requests.

Clients never communicate directly with backend services.  
Instead, all traffic flows through NGINX on port 3000.

---

## Request Flow

```text
Client Request
     ↓
http://localhost:3000
     ↓
NGINX API Gateway
```

## Stopping the nginx : .\nginx.exe -s stop
