# 🚀 CashPilot Deployment Guide

## Prerequisites
1. **Server/VPS**: Any Linux-based server (e.g., Ubuntu 22.04 on DigitalOcean, AWS EC2).
2. **Domain Name**: Point your domain to the server's IP.
3. **Services**:
   - Supabase project URL and anon key.
   - OpenAI API key.

## Deploying with Docker (Recommended)

1. **Install Docker & Docker Compose** on your server.
2. **Clone the Repository**:
   ```bash
   git clone https://github.com/abhi128nandan/cashpilot.git
   cd cashpilot
   ```
3. **Configure Environment Variables**:
   Create a `.env.local` file:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
   OPENAI_API_KEY=sk-<your-openai-key>
   ```
4. **Start the Service**:
   ```bash
   docker-compose up -d --build
   ```
5. **Verify**:
   The app is running on `http://localhost:3000`.

## Reverse Proxy Setup (NGINX)

Install NGINX:
```bash
sudo apt update
sudo apt install nginx
```

Create a new config `/etc/nginx/sites-available/cashpilot`:
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

Enable it:
```bash
sudo ln -s /etc/nginx/sites-available/cashpilot /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## SSL Configuration
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

Your CashPilot instance is now production-ready and accessible via HTTPS!
