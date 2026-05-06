// Minimal password-reset backend (Express)
const express = require('express');
const path = require('path');
const fs = require('fs');
const OpenAI = require('openai');
const axios = require('axios');
const cheerio = require('cheerio');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 3000;
const openai = new OpenAI({ apiKey: process.env.BLACKBOX_API_KEY || 'no-key-set' });

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static site files from project root
app.use(express.static(path.join(__dirname)));

// Enhanced CORS: add localhost ports
app.use((req, res, next) => {
    const allowedEnv = process.env.ALLOWED_ORIGINS;
    const defaultOrigins = [
        'http://localhost:5500', 
        'http://127.0.0.1:5500',
        'http://localhost:3000',
        'http://127.0.0.1:3000'
    ];
    const allowed = allowedEnv ? allowedEnv.split(',') : defaultOrigins;
    const origin = req.headers.origin;
    if (origin && allowed.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Access-Control-Allow-Credentials', 'true');
    }

    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');

    if (req.method === 'OPTIONS') return res.sendStatus(200);
    next();
});

// In-memory store for reset codes: { email: { code, time } }
const resetStore = new Map();
const CODE_TTL_MS = 10 * 60 * 1000; // 10 minutes for dev

// Optional SMTP transporter if env vars present
let transporter = null;
if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587', 10),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });
}

// Site context loader for AI chat (all HTML files)
async function loadSiteContext() {
    try {
        const files = fs.readdirSync('.').filter(f => f.endsWith('.html'));
        let context = '';
        const maxContext = 50000; // 50KB limit

        for (const file of files.slice(0, 20)) { // Max 20 files
            if (context.length > maxContext) break;
            const content = fs.readFileSync(file, 'utf8');
            const $ = cheerio.load(content);
            // Extract text, remove scripts/styles
            $('script, style').remove();
            const text = $('body').text().trim().replace(/\s+/g, ' ').slice(0, 5000);
            if (text) {
                context += `\n\n--- ${file} ---\n${text}`;
            }
        }

        return context.slice(0, maxContext) || 'EDA Website: Digital academy courses on freelancing, job bidding, graphics design etc.';
    } catch (err) {
        console.error('Context load error:', err);
        return 'EDA Website content unavailable.';
    }
}

// Use SQLite for server-side users and bcryptjs for password hashing
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const DB_FILE = path.join(__dirname, 'data.db');

// Open or create the SQLite database
const db = new sqlite3.Database(DB_FILE);

// Ensure users table exists
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            email TEXT UNIQUE,
            password TEXT,
            phone TEXT,
            course TEXT,
            progress INTEGER DEFAULT 0,
            plan TEXT,
            createdAt TEXT
        )
    `);

    // Migrate existing users.json into SQLite if present
    const usersJsonPath = path.join(__dirname, 'users.json');
    if (fs.existsSync(usersJsonPath)) {
        try {
            const raw = fs.readFileSync(usersJsonPath, 'utf8');
            const users = JSON.parse(raw || '[]');
            const insert = db.prepare(`INSERT OR IGNORE INTO users (name,email,password,phone,course,progress,plan,createdAt) VALUES (?,?,?,?,?,?,?,?)`);
            users.forEach(u => {
                // Hash passwords when migrating
                const hashed = bcrypt.hashSync(String(u.password || ''), 10);
                insert.run(u.name || '', u.email || '', hashed, u.phone || '', u.course || '', u.progress || 0, u.plan || 'starter', u.createdAt || new Date().toISOString());
            });
            insert.finalize();
            console.log('Migrated users.json into SQLite database (data.db)');
        } catch (e) {
            console.warn('No users.json to migrate or failed to parse/migrate:', e.message);
        }
    }
});

function findUserByEmail(email) {
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
            if (err) return reject(err);
            resolve(row || null);
        });
    });
}

function updateUserPasswordInDb(email, newPassword) {
    return new Promise((resolve, reject) => {
        const hashed = bcrypt.hashSync(String(newPassword), 10);
        db.run('UPDATE users SET password = ? WHERE email = ?', [hashed, email], function(err) {
            if (err) return reject(err);
            resolve(this.changes > 0);
        });
    });
}

function generateCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

app.post('/api/send-reset-code', async (req, res) => {
    try {
        const { email } = req.body || {};
        if (!email) return res.status(400).json({ success: false, message: 'Email is required' });

        const code = generateCode();
        resetStore.set(email, { code, time: Date.now() });

        // Prepare email content using requested template
        const subject = 'Password Reset Code';
        const body = `Hello,
We received a request to reset the password associated with your account. To continue with your password recovery, please use the verification code provided below. This code is unique to your request and ensures that only you can access and update your account details.

Your password reset code is:

${code}

For your security, this code will remain valid for a limited time. If the code expires, you will need to initiate another password reset request. Please do not share this code with anyone, as it grants access to sensitive account settings.

If you did not request a password reset, kindly disregard this message. Your account will remain secure and no changes will be made unless the correct code is entered.

Thank you for choosing Emmy’s Digital Academy.
We are committed to keeping your information safe and providing you with the best user experience.

Stay protected,
EDA Support Team`;

        if (transporter) {
            await transporter.sendMail({
                from: process.env.FROM_EMAIL || process.env.SMTP_USER,
                to: email,
                subject: subject,
                text: body
            });
            console.log(`Sent reset code to ${email}`);
        } else {
            // No SMTP configured — log code and body for local debugging
            console.log(`Reset code for ${email}: ${code}`);
            console.log('Email body:\n', body);
        }

        // For local testing, include code when DEV=true
        if (process.env.DEV === 'true') {
            return res.json({ success: true, message: 'Code sent successfully', code });
        }

        return res.json({ success: true, message: 'Code sent' });
    } catch (err) {
        console.error('Error in /api/send-reset-code:', err);
        return res.status(500).json({ success: false, message: 'Server error while sending code' });
    }
});

// Health endpoint for quick connectivity checks
app.get('/api/health', (req, res) => {
    res.json({ ok: true, env: { DEV: process.env.DEV === 'true', PORT }, time: new Date().toISOString() });
});

app.post('/api/signup', async (req, res) => {
    try {
        const { name, email, password, phone, course, plan } = req.body || {};
        if (!name || !email || !password) return res.status(400).json({ success: false, message: 'Name, email, and password required' });

        // Password rules:
        // - Must be at least 6 characters
        // - Must not be only numbers
        if (String(password).length < 6) {
            return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
        }
        if (/^\d+$/.test(String(password))) {
            return res.status(400).json({ success: false, message: 'Password cannot be only numbers' });
        }

        const existing = await findUserByEmail(email);
        if (existing) return res.status(400).json({ success: false, message: 'Email already registered' });

        const hashed = bcrypt.hashSync(String(password), 10);
        const insert = db.prepare(`INSERT INTO users (name,email,password,phone,course,progress,plan,createdAt) VALUES (?,?,?,?,?,?,?,?)`);
        insert.run(name, email, hashed, phone || '', course || '', 0, plan || 'starter', new Date().toISOString(), function(err) {
            if (err) return res.status(500).json({ success: false, message: 'Failed to create user' });
            // Send welcome email
            if (transporter) {
                const welcomeSubject = 'Welcome to Emmy\'s Digital Academy!';
                const welcomeBody = `Hello ${name},

Welcome to Emmy's Digital Academy! Your account has been created successfully.

You can now log in and start your learning journey.

If you have any questions, feel free to contact our support team.

Best regards,
EDA Support Team`;
                transporter.sendMail({
                    from: process.env.FROM_EMAIL || process.env.SMTP_USER,
                    to: email,
                    subject: welcomeSubject,
                    text: welcomeBody
                }).catch(err => console.error('Welcome email error:', err));
            }
            res.json({ success: true, message: 'Account created successfully' });
        });
        insert.finalize();
    } catch (err) {
        console.error('Signup error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body || {};
        if (!email || !password) return res.status(400).json({ success: false, message: 'Email and password required' });

        const user = await findUserByEmail(email);
        if (!user || !bcrypt.compareSync(password, user.password)) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        // For simplicity, return user data (in production, use JWT)
        res.json({ success: true, message: 'Login successful', user: { name: user.name, email: user.email, plan: user.plan } });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

app.post('/api/verify-reset-code', (req, res) => {
    const { email, code } = req.body || {};
    if (!email || !code) return res.status(400).json({ valid: false, message: 'Email and code required' });

    const entry = resetStore.get(email);
    if (!entry) return res.json({ valid: false, message: 'No verification request found' });

    if (Date.now() - entry.time > CODE_TTL_MS) {
        resetStore.delete(email);
        return res.json({ valid: false, message: 'Code has expired' });
    }

    if (entry.code === String(code)) {
        // Do not delete here - allow user to call /api/reset-password to finalize and update password.
        return res.json({ valid: true, message: 'Code verified successfully' });
    }

    return res.json({ valid: false, message: 'Invalid verification code' });
});

app.post('/api/reset-password', async (req, res) => {
    const { email, code, newPassword } = req.body || {};
    if (!email || !code) return res.status(400).json({ success: false, message: 'Email and code required' });

    const entry = resetStore.get(email);
    if (!entry) return res.json({ success: false, message: 'No verification request found' });
    if (Date.now() - entry.time > CODE_TTL_MS) {
        resetStore.delete(email);
        return res.json({ success: false, message: 'Code has expired' });
    }
    if (entry.code !== String(code)) return res.json({ success: false, message: 'Invalid verification code' });

    // Update server-side user in SQLite
    if (newPassword) {
        try {
            const user = await findUserByEmail(email);
            if (!user) {
                resetStore.delete(email);
                return res.json({ success: false, message: 'User not found' });
            }

            const ok = await updateUserPasswordInDb(email, newPassword);
            resetStore.delete(email);
            if (ok) {
                return res.json({ success: true, message: 'Password updated successfully' });
            } else {
                return res.json({ success: false, message: 'Failed to update password' });
            }
        } catch (err) {
            console.error('Error updating password in DB:', err);
            resetStore.delete(email);
            return res.json({ success: false, message: 'Server error' });
        }
    }

    // Otherwise just validate code
    resetStore.delete(email);
    return res.json({ success: true, message: 'Code valid' });
});

// AI Chat endpoint - Blackbox.ai proxy with site context
app.post('/api/chat', async (req, res) => {
    try {
        const { message } = req.body;
        if (!message || typeof message !== 'string') {
            return res.status(400).json({ error: 'Message required' });
        }

        const context = await loadSiteContext();
        console.log('AI Chat:', message.substring(0, 50) + '...');

        if (!process.env.BLACKBOX_API_KEY || process.env.BLACKBOX_API_KEY === 'no-key-set') {
            // Mock response without API key
            return res.json({
                response: `🔧 **API Key Setup**: Add BLACKBOX_API_KEY=sk-... to .env\n\nMock: "${message}"? Here's EDA info:\n\n${context.substring(0, 500)}...\n\nGet key at blackbox.ai to enable real AI!`,
                contextLength: context.length,
                mock: true
            });
        }

        // Real OpenAI-compatible call (Blackbox.ai)
        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini', // or 'blackbox-model' if custom
            messages: [
                {
                    role: 'system',
                    content: `You are EDA Assistant for Emmy\'s Digital Academy website. Use this site context ONLY: ${context}\n\nAnswer accurately about courses (freelancing, job bidding, graphics design etc.), pricing, mentorship. Be helpful, concise. Site founded Dec 2025.`
                },
                { role: 'user', content: message }
            ],
            max_tokens: 500,
            temperature: 0.7
        });

        const response = completion.choices[0].message.content;
        res.json({ response, contextLength: context.length });

    } catch (err) {
        console.error('AI Chat error:', err.message);
        res.status(500).json({ error: 'Chat service unavailable. Check server logs.' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT} (DEV=${process.env.DEV || 'false'})`);
    if (!transporter) console.log('No SMTP transporter configured; emails will be logged to console.');
    console.log('✅ AI Chat ready at /api/chat (needs BLACKBOX_API_KEY)');
});
