import PageContent from "@/src/components/layout/PageContent";
import PostItem from "@/src/components/posts/PostItem";
import { auth } from "@/src/firebase/clientApp";
import usePosts from "@/src/hooks/usePosts";
import { useAuthState } from "react-firebase-hooks/auth";

const PostPage: React.FC = () => {
    const [user] = useAuthState(auth);
    const {postStateValue, setPostStateValue, onDeletePost, onVote} = usePosts();

    return (
        <PageContent>
            <>
                {postStateValue.selectedPost && <PostItem 
                    post={postStateValue.selectedPost} 
                    onVote={onVote} 
                    onDeletePost={onDeletePost} 
                    userVoteValue={postStateValue.postVotes.find(item => item.postId === postStateValue.selectedPost?.id)?.voteValue} 
                    userIsCreator={user?.uid === postStateValue.selectedPost?.creatorId}
                />}
                {/* Comments */}
            </>
            <>
                {/* About */}
            </>
        </PageContent>
    )
};

export default PostPage;