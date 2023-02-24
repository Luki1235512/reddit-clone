import { Community } from "@/src/atoms/communitiesAtom"
import { Post } from "@/src/atoms/postsAtom";
import { auth, firestore } from "@/src/firebase/clientApp";
import usePosts from "@/src/hooks/usePosts";
import { Stack } from "@chakra-ui/react";
import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import PostItem from "./postItem";
import PostLoader from "./Loader";

type PostProps = {
    communityData?: Community;
    userId?: string;
    loadingUser: boolean;
};

const Posts: React.FC<PostProps> = ({communityData, userId, loadingUser}) => {
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const {postStateValue, setPostStateValue, onVote, onDeletePost} = usePosts(communityData!);

    const onSelectPost = (post: Post, postIdx: number) => {
        setPostStateValue(prev => ({
            ...prev,
            selectedPost: {...post, postIdx},
        }));
        router.push(`/r/${communityData?.id!}/comments/${post.id}`);
    };

    useEffect(() => {
        if (postStateValue.postsCache[communityData?.id!] && !postStateValue.postUpdateRequired) {
            setPostStateValue(prev => ({
                ...prev,
                posts: postStateValue.postsCache[communityData?.id!],
            }));
            return;
        }

        getPosts();
    }, [communityData, postStateValue.postUpdateRequired]);

    const getPosts = async () => {
        setLoading(true);
        try {
            const postQuery = query(
                collection(firestore, "posts"),
                where("communityId", "==", communityData?.id!),
                orderBy("createdAt", "desc")
            );
            const postDocs = await getDocs(postQuery);
            const posts = postDocs.docs.map(doc => ({id: doc.id, ...doc.data()}));
            setPostStateValue(prev => ({
                ...prev,
                posts: posts as Post[],
                postsCache: {
                    ...prev.postsCache,
                    [communityData?.id!]: posts as Post[]
                },
                postUpdateRequired: false
            }));
        }
        catch (error: any) {
            console.log("getPost error", error.message);
        }
        setLoading(false);
    };

    return (
        <>
            {loading ? (
                <PostLoader />
            ) : (
                <Stack>
                    {postStateValue.posts.map((post: Post, index) => (
                        <PostItem 
                            key={post.id}
                            post={post} 
                            userIsCreator={userId === post.creatorId}
                            userVoteValue={
                                postStateValue.postVotes.find(item => item.postId === post.id)?.voteValue
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