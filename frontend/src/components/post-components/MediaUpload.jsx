const MediaUpload = ({ media, onChange }) => {
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    // In production, upload these files to a server
    // For now, we'll just create object URLs
    const imageUrls = files.map((file) => URL.createObjectURL(file));
    onChange({ ...media, images: [...media.images, ...imageUrls] });
  };

  const handleVideoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // In production, upload this file to a server
      const videoUrl = URL.createObjectURL(file);
      onChange({ ...media, video: { url: videoUrl } });
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-white mb-2">Upload Images (max 4)</label>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageUpload}
          disabled={media.images.length >= 4}
          className="w-full text-gray-400"
        />
      </div>

      <div>
        <label className="block text-white mb-2">Upload Video (max 30s)</label>
        <input
          type="file"
          accept="video/*"
          onChange={handleVideoUpload}
          className="w-full text-gray-400"
        />
      </div>
    </div>
  );
};

export default MediaUpload;
