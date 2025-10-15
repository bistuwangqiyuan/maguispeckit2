/**
 * Service Worker for MagSpecKit
 * 提供离线支持和缓存优化，提升PWA性能和SEO得分
 */

const CACHE_VERSION = 'v1.0.0';
const CACHE_NAME = `magspeckit-${CACHE_VERSION}`;

// 需要缓存的核心资源
const CORE_ASSETS = [
  '/',
  '/index.html',
  '/css/main.css',
  '/js/app.js',
  '/manifest.json'
];

// 需要缓存的静态资源
const STATIC_ASSETS = [
  '/js/config.js',
  '/js/services/supabase-client.js',
  '/js/components/status-bar.js',
  '/js/components/left-toolbar.js',
  '/js/components/right-toolbar.js',
  '/js/components/bottom-nav.js',
  '/js/components/waveform-chart.js',
  '/js/components/waveform-controls.js'
];

// 安装事件 - 预缓存核心资源
self.addEventListener('install', (event) => {
  console.log('[SW] Installing Service Worker...', CACHE_VERSION);
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching core assets');
        return cache.addAll(CORE_ASSETS);
      })
      .then(() => {
        console.log('[SW] Core assets cached successfully');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[SW] Failed to cache core assets:', error);
      })
  );
});

// 激活事件 - 清理旧缓存
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Service Worker...', CACHE_VERSION);
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              // 删除旧版本的缓存
              return cacheName.startsWith('magspeckit-') && cacheName !== CACHE_NAME;
            })
            .map((cacheName) => {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => {
        console.log('[SW] Old caches cleaned up');
        return self.clients.claim();
      })
  );
});

// Fetch事件 - 网络优先策略（适合动态内容）
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // 跳过非GET请求
  if (request.method !== 'GET') {
    return;
  }
  
  // 跳过chrome extension请求
  if (url.protocol === 'chrome-extension:') {
    return;
  }
  
  // 跳过Supabase API请求（始终获取最新数据）
  if (url.hostname.includes('supabase.co')) {
    return;
  }
  
  // 跳过CDN资源（它们有自己的缓存策略）
  if (url.hostname.includes('cdn.')) {
    return;
  }
  
  // 对于同源请求，使用缓存优先策略
  if (url.origin === location.origin) {
    event.respondWith(
      caches.match(request)
        .then((cachedResponse) => {
          if (cachedResponse) {
            // 返回缓存的响应，同时在后台更新缓存
            event.waitUntil(
              fetch(request)
                .then((networkResponse) => {
                  if (networkResponse && networkResponse.status === 200) {
                    return caches.open(CACHE_NAME)
                      .then((cache) => {
                        cache.put(request, networkResponse.clone());
                        return networkResponse;
                      });
                  }
                })
                .catch(() => {
                  // 网络错误，忽略
                })
            );
            return cachedResponse;
          }
          
          // 缓存中没有，从网络获取
          return fetch(request)
            .then((networkResponse) => {
              // 缓存成功的响应
              if (networkResponse && networkResponse.status === 200) {
                return caches.open(CACHE_NAME)
                  .then((cache) => {
                    cache.put(request, networkResponse.clone());
                    return networkResponse;
                  });
              }
              return networkResponse;
            })
            .catch((error) => {
              console.error('[SW] Fetch failed:', error);
              
              // 如果是HTML请求且网络失败，返回离线页面
              if (request.headers.get('accept').includes('text/html')) {
                return caches.match('/index.html');
              }
              
              throw error;
            });
        })
    );
  }
});

// 消息事件 - 处理来自主线程的消息
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_URLS') {
    event.waitUntil(
      caches.open(CACHE_NAME)
        .then((cache) => cache.addAll(event.data.urls))
    );
  }
});

// 错误处理
self.addEventListener('error', (event) => {
  console.error('[SW] Error:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
  console.error('[SW] Unhandled rejection:', event.reason);
});

console.log('[SW] Service Worker loaded', CACHE_VERSION);


