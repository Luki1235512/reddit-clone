import { Stack } from "@chakra-ui/react";
import { collection, getDocs, limit, orderBy, query } from "firebase/firestore";
import { NextPage } from "next";
import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useRecoilValue } from "recoil";
import { CommunityState } from "../atoms/communitiesAtom";
import { Post } from "../atoms/postsAtom";
import CreatePostLink from "../components/community/CreatePostLink";
import PageContent from "../components/layout/PageContent";
import PostItem from "../components/posts/PostItem";
import PostLoader from "../components/posts/PostLoader";
import { auth, firestore } from "../firebase/clientApp";
import usePosts from "../hooks/usePosts";

const Home: NextPage = () => {
  const [user, loadingUser] = useAuthState(auth)
  const [loading, setLoading] = useState(false);
  const {postStateValue, setPostStateValue, onSelectPost, onDeletePost, onVote} = usePosts();
  const communityStateValue = useRecoilValue(CommunityState);

  const buildUserHomeFeed = () => {};

  const buildNoUserHomeFeed = async () => {
    setLoading(true);
    try {
      const postQuery = query(
        collection(firestore, "posts"),
        orderBy("voteStatus", "desc"),
        limit(10));

        const postDocs = await getDocs(postQuery);
        const posts = postDocs.docs.map(doc => ({id: doc.id, ...doc.data()}));
        setPostStateValue(prev => ({
          ...prev,
          posts: posts as Post[]
        }));

        // setPostState
    }
    catch (error) {
      console.log("buildNoUsaerHomeFeed error", error);
    }
    setLoading(false);
  };

  const getUserPostVotes = () => {};

  // useEffects
  useEffect(() => {
    if (!user && !loadingUser) {
      buildNoUserHomeFeed();
    }
  }, [user, loadingUser]);

  return (
    <PageContent>
      <>
      <CreatePostLink />
        {loading ? (
          <PostLoader />
        ) : (
          <Stack>
            {postStateValue.posts.map(post => (
              <PostItem
                key={post.id}
                post={post}
                onSelectPost={onSelectPost}
                onDeletePost={onDeletePost}
                onVote={onVote}
                userVoteValue={postStateValue.postVotes.find(item => item.postId === post.id)?.voteValue}
                userIsCreator={user?.uid === post.creatorId}
                homePage
              />
            ))}
          </Stack>
        )}
      </>
      <>
        {/* RECOMENDATIONS */}
      </>
    </PageContent>
  );
};

export default Home;
