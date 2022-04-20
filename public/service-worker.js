const App_Pre = 'BudgetTracker-';
const App_Version = 'version_01';
const Cash_Name = App_Pre + App_Version;
const Data_Cash_Name = App_Pre + 'cache-' + App_Version;

const Files_To_Cash = [
    './index.html',
    './css/styles.css',
    './js/index.js',
    './js/IndexDb.js',
    './icons/icon-72x72.png',
    './icons/icon-96x96.png',
    './icons/icon-128x128.png',
    './icons/icon-144x144.png',
    './icons/icon-152x152.png',
    './icons/icon-192x192.png',
    './icons/icon-384x384.png',
    './icons/icon-512x512.png'
];

self.addEventListener('install', function(e) {
    e.waitUntil(
        caches.open(Cash_Name).then(cache => {
            console.log('Your files were pre-cached !!!.');
            return cache.addAll(Files_To_Cash);
        })
    );
});

self.addEventListener('activate', function(e) {
    e.waitUntil(
        caches.keys().then(keyList => {
            let CacheKeepList = keyList.filter(key => {
                return key.indexOf(App_Pre);
            });
            CacheKeepList.push(Cash_Name);
            CacheKeepList.push(Data_Cash_Name);
            return Promise.all(
                keyList.map((key, i) => {
                    if (CacheKeepList.indexOf(key) === -1) {
                        console.log('Remove old Cache ..', keyList[i]);
                        return caches.delete(keyList[i]);
                    }
                })
            );
        })
    );
});

self.addEventListener('fetch', function(e) {
    if (e.request.url.includes('/api/')) {
        e.respondWith(
            caches.open(Data_Cash_Name)
                .then(cache => {
                    return fetch(e.request)
                        .then(response => {
                            if (response.status === 200) {
                                cache.put(e.request.url, response.clone());
                            }
                            return response;
                        })
                        .catch(err => {
                            return cache.match(e.request);
                        });
                })
                .catch(err => console.log(err))
        );
        return;
    }
    console.log('Fetch request:', e.request.url);
    e.respondWith(
        fetch(e.request).catch(function() {
            return caches.match(e.request).then(function(response) {
                if (response) {
                    return response;
                } else if (e.request.headers.get('accept').includes('text/html')) {
                    return caches.match('/');
                }
            });
        })
    );
});