# 🐳 Docker Guide

## Local Development

### 1. Install Docker
Ensure you have [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed on your machine.

### 2. Build the Image
```bash
docker build -t cashpilot .
```

### 3. Run the Container
You need to pass the environment variables. The easiest way is to use the `.env.local` file:
```bash
docker run -p 3000:3000 --env-file .env.local cashpilot
```
The app will be accessible at `http://localhost:3000`.

### 4. Stop the Container
Find the container ID and stop it:
```bash
docker ps
docker stop <container_id>
```

### 5. View Logs
```bash
docker logs <container_id> -f
```

---

## Docker Compose

For a smoother experience, use Docker Compose.

### Start Services
```bash
docker-compose up -d
```
This runs the application in detached mode.

### Stop Services
```bash
docker-compose down
```

### Rebuild
If you change `package.json` or source files:
```bash
docker-compose up -d --build
```

---

## Production Deployment

### 1. Build Production Image
```bash
docker build -t your-registry/cashpilot:latest .
```

### 2. Push Image
```bash
docker push your-registry/cashpilot:latest
```

### 3. Configure Environment
On your VPS, ensure you have a `.env` file containing production credentials (Supabase URLs, OpenAI API key).

### 4. Configure Reverse Proxy (NGINX Example)
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 5. Configure SSL
Use Certbot to automatically configure SSL for NGINX:
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

### 6. Scaling Recommendations
- Run multiple container instances behind a load balancer.
- Ensure Supabase connection pooling is configured correctly if connecting directly to DB.
