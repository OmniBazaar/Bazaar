import React from 'react';

interface ImageUploadProps {
    onImagesSelected: (images: File[]) => void;
    maxImages?: number;
    maxSize?: number;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
    onImagesSelected,
    maxImages = 10,
    maxSize = 5 * 1024 * 1024
}) => {
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files ?? []);
        onImagesSelected(files);
    };

    return (
        <div>
            <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileChange}
                data-testid="image-upload"
            />
            <p>Max {maxImages} images, {(maxSize / 1024 / 1024).toFixed(0)}MB each</p>
        </div>
    );
}; 