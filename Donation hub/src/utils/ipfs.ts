const PINATA_JWT = import.meta.env.VITE_PINATA_JWT;
const PINATA_GATEWAY = import.meta.env.VITE_PINATA_GATEWAY;

const IPFS_GATEWAYS = [
    PINATA_GATEWAY ? `https://${PINATA_GATEWAY}/ipfs/` : '',
    'https://cloudflare-ipfs.com/ipfs/',
    'https://ipfs.io/ipfs/',
    'https://dweb.link/ipfs/',
    'https://gateway.pinata.cloud/ipfs/',
].filter(Boolean);

/**
 * Standardized key for localStorage metadata
 */
const getCacheKey = (hash: string) => `ipfs_${hash}`;

/**
 * Uploads metadata to Pinata.
 * Returns a URI formatted as ipfs://HASH.
 */
export const uploadMetadata = async (metadata: any): Promise<string> => {
    if (!PINATA_JWT || PINATA_JWT === 'your_pinata_jwt_here') {
        throw new Error('Pinata JWT not configured. Metadata upload is required.');
    }

    try {
        const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${PINATA_JWT}`
            },
            body: JSON.stringify({
                pinataContent: metadata,
                pinataMetadata: {
                    name: metadata.name || 'Badge Metadata'
                }
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Pinata upload failed: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        const hash = data.IpfsHash;
        // Also cache locally for immediate access
        localStorage.setItem(getCacheKey(hash), JSON.stringify(metadata));
        return `ipfs://${hash}`;
    } catch (error) {
        console.error('Metadata upload failed:', error);
        throw error;
    }
};

/**
 * Fetches JSON metadata from IPFS or Local Storage.
 */
export const fetchFromIPFS = async (hash: string): Promise<any> => {
    if (!hash) return null;

    // 1. Try localStorage cache first
    const cached = localStorage.getItem(getCacheKey(hash));
    if (cached) {
        try {
            return JSON.parse(cached);
        } catch (e) {
            console.error('Failed to parse cached IPFS data:', e);
        }
    }

    // 2. Iterate over gateways for IPFS hashes
    for (const gateway of IPFS_GATEWAYS) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 8000);

            const response = await fetch(`${gateway}${hash}`, {
                signal: controller.signal,
                headers: {
                    'Accept': 'application/json'
                }
            });

            clearTimeout(timeoutId);

            if (response.ok) {
                const data = await response.json();
                localStorage.setItem(getCacheKey(hash), JSON.stringify(data));
                return data;
            }
        } catch (error) {
            console.warn(`Failed to fetch from ${gateway} for hash ${hash}`);
        }
    }

    return null; // Silent fail rather than throw to keep UI stable
};

/**
 * Extracts the hash from various URI formats (ipfs://, gateway URLs)
 */
export const getIPFSUrl = (uri: string): string => {
    if (!uri) return '';
    if (uri.startsWith('ipfs://')) {
        return uri.replace('ipfs://', '');
    }
    if (uri.includes('/ipfs/')) {
        return uri.split('/ipfs/')[1];
    }
    return uri;
};
