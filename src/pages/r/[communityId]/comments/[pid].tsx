import { Post } from "@/src/atoms/postsAtom";
import About from "@/src/components/community/About";
import Comments from "@/src/components/posts/comments";
import PostLoader from "@/src/components/posts/Loader";
import PostItem from "@/src/components/posts/postItem";
import { auth, firestore } from "@/src/firebase/clientApp";
import useCommunityData from "@/src/hooks/useCommunityData";
import usePosts from "@/src/hooks/usePosts";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";

const PostPage: React.FC = () => {
    const [user] = useAuthState(auth);
    const router = useRouter();
    const {community, pid} = router.query;
    const {communityStateValue} = useCommunityData();

    const {
        postStateValue,
        setPostStateValue,
        onDeletePost,
        loading,
        setLoading,
        onVote,
    } = usePosts(communityStateValue.currentCommunity);

    const fetchPost = async () => {
        setLoading(true);
        try {
            const postDocRef = doc(firestore, "posts", pid as string);
            const postDoc = await getDoc(postDocRef);
            setPostStateValue(prev => ({
                ...prev,
                selectedPost: {id: postDoc.id, ...postDoc.data()} as Post
            }));
        }
        catch (error: any) {
            console.log("fetchPost error", error.message)
        }
        setLoading(false);
    };
    
    useEffect(() => {
        const {pid} = router.query;

        if (pid && !postStateValue.selectedPost) {
            fetchPost();
        }
    }, [router.query, postStateValue.selectedPost]);

    return (
        <PageContentLayout>
          {/* Left Content */}
          <>
            {loading ? (
              <PostLoader />
            ) : (
              <>
                {postStateValue.selectedPost && (
                  <>
                    <PostItem
                      post={postStateValue.selectedPost}
                      // postIdx={postStateValue.selectedPost.postIdx}
                      onVote={onVote}
                      onDeletePost={onDeletePost}
                      userVoteValue={
                        postStateValue.postVotes.find(
                          (item) => item.postId === postStateValue.selectedPost!.id
                        )?.voteValue
                      }
                      userIsCreator={
                        user?.uid === postStateValue.selectedPost.creatorId
                      }
                      router={router}
                    />
                    <Comments
                      user={user}
                      community={community as string}
                      selectedPost={postStateValue.selectedPost}
                    />
                  </>
                )}
              </>
            )}
          </>
          {/* Right Content */}
          <>
            <About
              communityData={
                communityStateValue.currentCommunity
                // communityStateValue.visitedCommunities[community as string]
              }
              loading={loading}
            />
          </>
        </PageContentLayout>
      );
    };
    export default PostPage;