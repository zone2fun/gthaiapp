import * as FileSystem from 'expo-file-system/legacy';

const API_URL = 'https://gthai-backend.onrender.com/api';

export const uploadImageToCloudinary = async (imageUri: string, token: string): Promise<string> => {
    try {
        console.log('Starting Cloudinary upload for:', imageUri);

        // Get signature from backend
        console.log('Getting signature from backend...');
        const signatureResponse = await fetch(`${API_URL}/cloudinary/signature`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!signatureResponse.ok) {
            throw new Error('Failed to get Cloudinary signature');
        }

        const { signature, timestamp, cloudName, apiKey, folder } = await signatureResponse.json();
        console.log('Signature received');

        // Read the file as base64
        const base64 = await FileSystem.readAsStringAsync(imageUri, {
            encoding: 'base64',
        });

        // Create form data
        const formData = new FormData();
        formData.append('file', `data:image/jpeg;base64,${base64}`);
        formData.append('signature', signature);
        formData.append('timestamp', timestamp.toString());
        formData.append('api_key', apiKey);
        formData.append('folder', folder);

        console.log('Uploading to Cloudinary...');

        // Upload to Cloudinary
        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
            {
                method: 'POST',
                body: formData,
            }
        );

        if (!response.ok) {
            const error = await response.text();
            console.error('Cloudinary upload error:', error);
            throw new Error('Failed to upload image to Cloudinary');
        }

        const data = await response.json();
        console.log('Cloudinary upload successful:', data.secure_url);

        return data.secure_url;
    } catch (error) {
        console.error('Error uploading to Cloudinary:', error);
        throw error;
    }
};
