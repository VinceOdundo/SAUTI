import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import PostForm from "../components/PostForm";
import Timeline from "../components/Timeline";
import SuggestedProfiles from "../components/SuggestedProfiles";
import RepresentativePosts from "../components/RepresentativePosts";

const HomePage = () => {
  const { user } = useSelector((state) => state.auth);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  return (
    <div className="grid grid-cols-12 gap-8">
      <div className="col-span-8">
        <PostForm onPostCreated={(newPost) => setPosts([newPost, ...posts])} />
        <Timeline posts={posts} setPosts={setPosts} />
      </div>

      <div className="col-span-4 space-y-6">
        <SuggestedProfiles />
        <RepresentativePosts />
      </div>
    </div>
  );
};

export default HomePage;
