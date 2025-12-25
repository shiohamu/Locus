const CACHE_NAME = "locus-v1";
const urlsToCache = [
	"/",
	"/notes/new",
	"/tags",
	"/rss",
	"/search",
];

// インストール時にキャッシュを作成
self.addEventListener("install", (event) => {
	event.waitUntil(
		caches.open(CACHE_NAME).then((cache) => {
			return cache.addAll(urlsToCache);
		}),
	);
});

// アクティベート時に古いキャッシュを削除
self.addEventListener("activate", (event) => {
	event.waitUntil(
		caches.keys().then((cacheNames) => {
			return Promise.all(
				cacheNames.map((cacheName) => {
					if (cacheName !== CACHE_NAME) {
						return caches.delete(cacheName);
					}
				}),
			);
		}),
	);
});

// フェッチイベントでキャッシュを確認
self.addEventListener("fetch", (event) => {
	// APIリクエストはキャッシュしない
	if (event.request.url.includes("/api/")) {
		return;
	}

	event.respondWith(
		caches.match(event.request).then((response) => {
			// キャッシュがあれば返す
			if (response) {
				return response;
			}

			// ネットワークから取得を試みる
			return fetch(event.request)
				.then((response) => {
					// レスポンスが有効でない場合はそのまま返す
					if (!response || response.status !== 200 || response.type !== "basic") {
						return response;
					}

					// レスポンスをクローンしてキャッシュに保存
					const responseToCache = response.clone();
					caches.open(CACHE_NAME).then((cache) => {
						cache.put(event.request, responseToCache);
					});

					return response;
				})
				.catch(() => {
					// オフライン時はオフラインページを返す（簡略化）
					if (event.request.destination === "document") {
						return caches.match("/");
					}
				});
		}),
	);
});


