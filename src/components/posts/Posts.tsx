import { Community } from "@/src/atoms/communitiesAtom"
import { Post } from "@/src/atoms/postsAtom";
import { auth, firestore } from "@/src/firebase/clientApp";
import usePosts from "@/src/hooks/usePosts";
import { Stack } from "@chakra-ui/react";
import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import PostItem from "./PostItem";
import PostLoader from "./PostLoader";

type PostProps = {
    communityData: Community;
};

const Posts: React.FC<PostProps> = ({communityData}) => {
    const [user] = useAuthState(auth);
    const [loading, setLoading] = useState(false);
    const {postStateValue, setPostStateValue, onVote, onSelectPost, onDeletePost} = usePosts();

    const getPosts = async () => {
        try {
            setLoading(true);
            // GET POSTS FOR THIS COMMUNITY
            const postQuery = query(
                collection(firestore, "posts"),
                where("communityId", "==", communityData.id),
                orderBy("createdAt", "desc")
            );
            const postDocs = await getDocs(postQuery);

            // STORE IN POST STATE
            const posts = postDocs.docs.map(doc => ({id: doc.id, ...doc.data()}));
            setPostStateValue(prev => ({
                ...prev,
                posts: posts as Post[],
            }));
        }
        catch (error: any) {
            console.log("getPost error", error.message);
        }
        setLoading(false);
    };

    useEffect(() => {
        getPosts();
    }, [])

    return (
        <>
            {loading ? (
                <PostLoader />
            ) : (
                <Stack>
                    {postStateValue.posts.map(item => (
                        <PostItem 
                            key={item.id}
                            post={item} 
                            userIsCreator={user?.uid === item.creatorId}
                            userVoteValue={
                                postStateValue.postVotes.find(vote => vote.postId === item.id)?.voteValue
                            } 
                            onVote={onVote}
                            onSelectPost={onSelectPost}
                            onDeletePost={onDeletePost}
                        />))}
                </Stack>
            )}
        </>
    );
};

export default Posts;