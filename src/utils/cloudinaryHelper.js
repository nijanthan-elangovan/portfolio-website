/**
 * Cloudinary Helper
 * Optimizes images by injecting auto-format and auto-quality parameters.
 */
export const optimizeImage = (url, width = 'auto') => {
    if (!url) return '';

    // Check if it's already a Cloudinary URL
    if (url.includes('res.cloudinary.com')) {
        // If it already has transformations, we might want to append/replace, 
        // but for safety, let's just inject f_auto,q_auto if missing.

        // Split by 'upload/'
        const parts = url.split('/upload/');
        if (parts.length === 2) {
            let params = [
                'f_auto',
                'q_auto',
                width !== 'auto' ? `w_${width}` : ''
            ].filter(Boolean).join(',');

            // If there are existing params in the second part (e.g. v12345/image.jpg), 
            // usually params go right after upload/.
            // If the URL is like .../upload/v123/img.jpg, we insert params before v123.
            return `${parts[0]}/upload/${params}/${parts[1]}`;
        }
    }

    // Fallback for non-Cloudinary images (return as is)
    return url;
};
