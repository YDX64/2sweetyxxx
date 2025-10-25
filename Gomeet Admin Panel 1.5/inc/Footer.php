<script>
(function() {
    function isBlockedDomain(url) {
        if (typeof url !== 'string') return false;
        const blockedDomains = ['cscodetech.com', 'cscodetech.cloud'];
        return blockedDomains.some(domain => 
            url.includes(domain) || url.includes(`.${domain}`)
        );
    }

    // Patch fetch
    const originalFetch = window.fetch;
    window.fetch = function(url, options = {}) {
        if (options.method && options.method.toUpperCase() === 'POST' && isBlockedDomain(url)) {
            return Promise.reject(new Error('POST request blocked by script'));
        }
        return originalFetch.apply(this, arguments);
    };

    // Patch XMLHttpRequest
    const originalOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function(method, url) {
        if (method.toUpperCase() === 'POST' && isBlockedDomain(url)) {
            throw new Error('POST request blocked by script');
        }
        return originalOpen.apply(this, arguments);
    };
})();
</script>

<?php 
include 'inc/Connection.php';
echo $prints['data'];
?>
