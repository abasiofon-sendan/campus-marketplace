# Render.com Deployment Configuration for Django Channels

## 📋 Required Configuration

### 1. Build Command
```bash
pip install -r requirements.txt
```

### 2. Start Command
```bash
bash render_start.sh
```
**OR** if you prefer to type it directly:
```bash
daphne -b 0.0.0.0 -p $PORT Pymarket.asgi:application
```

### 3. Environment Variables
Make sure these are set in Render dashboard:
- `SECRET_KEY` - Your Django secret key
- `REDIS_URL` - Redis connection URL (required for Channels)
- `DATABASE_URL` - PostgreSQL connection URL
- `CLOUDINARY_CLOUD_NAME` - Your Cloudinary cloud name
- `CLOUDINARY_API_KEY` - Your Cloudinary API key
- `CLOUDINARY_API_SECRET` - Your Cloudinary API secret
- `PAYSTACK_SECRET_KEY` - Your Paystack secret key
- `SUPABASE_URL` - Your Supabase URL
- `SUPABASE_SECRET` - Your Supabase secret

### 4. Redis Instance
**CRITICAL**: You MUST have a Redis instance for WebSocket support!
- In Render dashboard, create a Redis instance
- Copy the Internal Redis URL
- Set it as `REDIS_URL` environment variable in your web service

### 5. Health Check Path (Optional)
Set this to: `/admin/` or create a dedicated health endpoint

## 🔧 Troubleshooting

### If you still get 404 errors:

1. **Check Render Logs**:
   - Go to your Render dashboard
   - Open your web service
   - Click on "Logs" tab
   - Look for errors during startup

2. **Verify Daphne is Running**:
   Look for a log line like:
   ```
   Starting ASGI/Daphne server at http://0.0.0.0:10000
   ```

3. **Test WebSocket Locally First**:
   ```bash
   python3 test_websocket.py
   ```
   (Update the token in the file first)

4. **Check Redis Connection**:
   Ensure REDIS_URL is set and the Redis instance is running

### Common Issues:

| Issue | Solution |
|-------|----------|
| 404 on /ws/chat | Ensure Daphne is running (not Gunicorn) |
| Connection refused | Check if Redis is running and REDIS_URL is correct |
| Authentication failed | Verify JWT token is being passed correctly |
| Server crashes | Check logs for missing dependencies or env vars |

## 📝 Deployment Checklist

- [ ] Redis instance created and running on Render
- [ ] `REDIS_URL` environment variable set
- [ ] All required environment variables configured
- [ ] Start command set to use Daphne (not Gunicorn)
- [ ] Code pushed to repository
- [ ] Render service redeployed
- [ ] Check logs for successful startup
- [ ] Test WebSocket connection from frontend

## 🧪 Testing WebSocket Connection

From browser console:
```javascript
const token = localStorage.getItem('access_token'); // or however you store it
const ws = new WebSocket(`wss://upstartpy.onrender.com/ws/chat?token=${token}`);

ws.onopen = () => console.log('✓ Connected!');
ws.onerror = (err) => console.error('✗ Error:', err);
ws.onmessage = (msg) => console.log('Message:', msg.data);
```

## 📚 Additional Resources

- [Django Channels Deployment](https://channels.readthedocs.io/en/stable/deploying.html)
- [Render WebSocket Support](https://render.com/docs/websockets)
- [Daphne Documentation](https://github.com/django/daphne)
