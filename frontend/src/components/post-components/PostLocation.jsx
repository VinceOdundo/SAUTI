const PostLocation = ({ location }) => {
  if (!location) return null;

  return (
    <div className="bg-dark-600 rounded-lg p-4 mb-4">
      <div className="space-y-1">
        {location.county && (
          <p className="text-gray-300">County: {location.county}</p>
        )}
        {location.constituency && (
          <p className="text-gray-300">Constituency: {location.constituency}</p>
        )}
        {location.ward && (
          <p className="text-gray-300">Ward: {location.ward}</p>
        )}
      </div>
    </div>
  );
};

export default PostLocation;
