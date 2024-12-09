const PostMedia = ({ media }) => {
  if (!media) return null;

  return (
    <div className="mb-4">
      {media.images?.length > 0 && (
        <div
          className={`grid gap-2 ${
            media.images.length === 1
              ? "grid-cols-1"
              : media.images.length === 2
              ? "grid-cols-2"
              : media.images.length === 3
              ? "grid-cols-2"
              : "grid-cols-2"
          }`}
        >
          {media.images.map((image, index) => (
            <img
              key={index}
              src={image}
              alt={`Post image ${index + 1}`}
              className="rounded-lg w-full h-full object-cover"
              style={{ maxHeight: "400px" }}
            />
          ))}
        </div>
      )}

      {media.video && (
        <video
          src={media.video.url}
          controls
          className="w-full rounded-lg"
          style={{ maxHeight: "400px" }}
        />
      )}
    </div>
  );
};

export default PostMedia;
