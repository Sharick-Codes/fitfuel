/**
 * GTAE-ATRA Security Monitoring Middleware for FitFuel
 * PRODUCTION VERSION — Real IP blocking + telemetry capture.
 *
 * Environment Variables:
 *   MONITOR_URL      - GTAE-ATRA server base URL (default: http://127.0.0.1:8765)
 *   MONITOR_API_KEY  - API key for authentication
 *   MONITOR_SITE_ID  - Site identifier (default: fitfuel)
 */

import dotenv from 'dotenv';
dotenv.config();

const getMonitorBase = () => process.env.MONITOR_URL || 'https://gtae-atra-security.onrender.com';
const getTelemetryUrl = () => `${getMonitorBase()}/telemetry`;
const getBlocklistUrl = () => `${getMonitorBase()}/api/blocklist/check`;
const getApiKey = () => process.env.MONITOR_API_KEY || '';
const getSiteId = () => process.env.MONITOR_SITE_ID || 'fitfuel';

const ipBuffers = new Map();
const blockedIPCache = new Map(); // ip -> { blocked, expiresAt }
const CACHE_TTL_MS = 30_000;

function getClientIP(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) return forwarded.split(',')[0].trim();
  return req.ip || req.socket?.remoteAddress || '127.0.0.1';
}

/**
 * Check if IP is blocked (cache first, then server).
 */
async function isIPBlocked(ip) {
  // Never block local development loopback addresses
  if (['127.0.0.1', '::1', '::ffff:127.0.0.1', 'localhost'].includes(ip)) {
    return false;
  }

  const cached = blockedIPCache.get(ip);
  if (cached && Date.now() < cached.expiresAt) {
    return cached.blocked;
  }
  blockedIPCache.delete(ip);

  try {
    const res = await fetch(`${getBlocklistUrl()}?ip=${encodeURIComponent(ip)}`, {
      signal: AbortSignal.timeout(1000),
    });
    const data = await res.json();
    const blocked = data?.blocked === true;
    blockedIPCache.set(ip, { blocked, expiresAt: Date.now() + CACHE_TTL_MS });
    return blocked;
  } catch {
    return false; // fail-open if monitor is down
  }
}

function cacheBlock(ip) {
  blockedIPCache.set(ip, { blocked: true, expiresAt: Date.now() + 60_000 });
}

async function flushBuffers() {
  if (ipBuffers.size === 0) return;
  const snapshot = new Map(ipBuffers);
  ipBuffers.clear();

  for (const [ip, requests] of snapshot.entries()) {
    try {
      const res = await fetch(getTelemetryUrl(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': getApiKey(),
        },
        body: JSON.stringify({ source_ip: ip, requests, site_id: getSiteId() }),
      });
      const data = await res.json();
      console.log(`🛡️  GTAE-ATRA [${getSiteId()}]: Sent ${requests.length} telemetry records for IP ${ip} -> Status: ${data?.status || 'ok'}`);
      if (data?.blocked === true) {
        console.warn(`🚨 GTAE-ATRA [${getSiteId()}]: IP ${ip} is BLOCKED by AI Security Engine!`);
        cacheBlock(ip);
      }
    } catch (err) {
      console.warn(`⚠️  GTAE-ATRA telemetry error: ${err.message}`);
    }
  }
}

setInterval(flushBuffers, 3000); // Send batches every 3 seconds

export function securityMonitor() {
  return async (req, res, next) => {
    const clientIP = getClientIP(req);

    // ── ENFORCEMENT: Block known bad IPs ──
    const blocked = await isIPBlocked(clientIP);
    if (blocked) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Your IP has been blocked by the security system.',
        code: 'GTAE_ATRA_BLOCKED',
      });
    }

    // ── TELEMETRY: Capture request metadata ──
    const startMs = Date.now();

    res.on('finish', () => {
      const record = {
        timestamp_ms: Date.now(),
        method:       req.method,
        path:         req.baseUrl ? req.baseUrl + req.path : req.path,
        query:        req.originalUrl?.includes('?') ? req.originalUrl.split('?')[1] : '',
        status:       res.statusCode,
        response_time_ms: Date.now() - startMs,
        request_size: parseInt(req.headers['content-length'] || '0', 10),
        response_size: parseInt(res.getHeader?.('content-length') || '0', 10),
        user_agent:   (req.headers['user-agent'] || '').substring(0, 200),
      };

      if (!ipBuffers.has(clientIP)) ipBuffers.set(clientIP, []);
      ipBuffers.get(clientIP).push(record);
      if (ipBuffers.get(clientIP).length >= 20) flushBuffers();
    });

    next();
  };
}
