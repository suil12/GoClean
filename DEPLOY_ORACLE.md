# Deploy GoClean Lux on Oracle Cloud Always Free

This keeps the website, booking API, local booking log, before/after gallery, and notifications working together.

## 1. Create the Oracle server

In Oracle Cloud:

1. Go to **Compute > Instances > Create instance**.
2. Use an **Always Free eligible** shape.
3. Choose **Ubuntu** if possible.
4. Add your SSH public key.
5. After the server is created, copy its public IP address.

In the Oracle network settings for the server, add ingress rules for:

- TCP port `80`
- TCP port `443`
- TCP port `22`

## 2. Connect to the server

From your Mac, replace `SERVER_IP` with the public IP:

```bash
ssh ubuntu@SERVER_IP
```

If Oracle gave you an Oracle Linux image instead of Ubuntu, the user is often `opc`:

```bash
ssh opc@SERVER_IP
```

## 3. Install the server tools

For Ubuntu:

```bash
sudo apt update
sudo apt install -y nginx git rsync curl ufw
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pm2
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw --force enable
```

## 4. Upload the website

From your Mac, inside this website folder:

```bash
rsync -av --delete \
  --exclude node_modules \
  --exclude .git \
  --exclude .env \
  /Users/souhailnmili/Desktop/GoClean/Website/ \
  ubuntu@SERVER_IP:/home/ubuntu/goclean-lux/
```

Then connect to the server:

```bash
ssh ubuntu@SERVER_IP
cd /home/ubuntu/goclean-lux
npm install --omit=dev
```

## 5. Add your secret settings

Create the production `.env` file on the server:

```bash
nano /home/ubuntu/goclean-lux/.env
```

Recommended minimum:

```env
HOST=127.0.0.1
PORT=3000
BOOKING_RECEIVER_EMAIL=contact@goclean.lu

SMTP_HOST=mail.goclean.lu
SMTP_PORT=465
SMTP_SECURE=true
SMTP_TIMEOUT_MS=10000
SMTP_USER=contact@goclean.lu
SMTP_PASS=YOUR_LWS_EMAIL_PASSWORD
SMTP_FROM=GoClean Lux <contact@goclean.lu>

TELEGRAM_BOT_TOKEN=YOUR_TELEGRAM_BOT_TOKEN
TELEGRAM_CHAT_ID=YOUR_TELEGRAM_CHAT_ID
```

Save with `Ctrl+O`, Enter, then exit with `Ctrl+X`.

## 6. Start the website

```bash
cd /home/ubuntu/goclean-lux
pm2 start server.js --name goclean-lux
pm2 save
pm2 startup
```

The `pm2 startup` command prints one extra command. Copy and run that command too.

Check it:

```bash
curl http://127.0.0.1:3000/healthz
```

You should see:

```json
{"ok":true,"service":"goclean-lux"}
```

## 7. Connect Nginx to the Node app

Create the Nginx config:

```bash
sudo nano /etc/nginx/sites-available/goclean-lux
```

Paste this:

```nginx
server {
    listen 80;
    server_name goclean.lu www.goclean.lu;

    client_max_body_size 20M;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable it:

```bash
sudo ln -s /etc/nginx/sites-available/goclean-lux /etc/nginx/sites-enabled/goclean-lux
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

## 8. Point the domain to Oracle

In your domain DNS panel at LWS:

- `A` record for `goclean.lu` -> `SERVER_IP`
- `A` record for `www.goclean.lu` -> `SERVER_IP`

Wait for DNS to update.

## 9. Enable HTTPS

After the domain points to the Oracle IP:

```bash
sudo snap install core
sudo snap refresh core
sudo snap install --classic certbot
sudo ln -s /snap/bin/certbot /usr/bin/certbot
sudo certbot --nginx -d goclean.lu -d www.goclean.lu
```

Choose the redirect-to-HTTPS option.

## 10. Updating the website later

From your Mac:

```bash
rsync -av --delete \
  --exclude node_modules \
  --exclude .git \
  --exclude .env \
  /Users/souhailnmili/Desktop/GoClean/Website/ \
  ubuntu@SERVER_IP:/home/ubuntu/goclean-lux/
```

Then on the server:

```bash
ssh ubuntu@SERVER_IP
cd /home/ubuntu/goclean-lux
npm install --omit=dev
pm2 restart goclean-lux
```

## Useful checks

```bash
pm2 logs goclean-lux
pm2 status
curl https://www.goclean.lu/healthz
```

If booking emails fail but Telegram works, the reservation is still saved and logged. Check:

```bash
cat /home/ubuntu/goclean-lux/bookings.json
pm2 logs goclean-lux
```
