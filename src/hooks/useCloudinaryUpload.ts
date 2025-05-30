import { useState, useCallback } from 'react';

interface UseCloudinaryUploadReturn {
    uploadImage: (file: File) => Promise<string>;
    imageUrl: string | null;
    isUploading: boolean;
    error: string | null;
}

const uploadImageToCloudinary = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'product_images');
    formData.append('cloud_name', 'dklikxmpm');

    const res = await fetch('https://api.cloudinary.com/v1_1/dklikxmpm/upload', {
        method: 'POST',
        body: formData,
    });
    const data = await res.json();
    if (res.ok) {
        return data.secure_url;
    }
    throw new Error(data.error?.message || 'Failed to upload image to Cloudinary');
};

export const useCloudinaryUpload = (): UseCloudinaryUploadReturn => {
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const uploadImage = useCallback(async (file: File) => {
        setIsUploading(true);
        setError(null);
        try {
            const url = await uploadImageToCloudinary(file);
            setImageUrl(url);
            return url;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to upload image';
            setError(errorMessage);
            throw err;
        } finally {
            setIsUploading(false);
        }
    }, []);

    return { uploadImage, imageUrl, isUploading, error };
};