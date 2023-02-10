import { Community } from "@/src/atoms/communitiesAtom"
import { Post } from "@/src/atoms/postsAtom";
import { firestore } from "@/src/firebase/clientApp";
import usePosts from "@/src/hooks/useHooks";
import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";

type PostProps = {
    communityData: Community;
};

const Posts: React.FC<PostProps> = ({communityData}) => {
    // useAuthState
    const [loading, setLoading] = useState(false);
    const {postStateValue, setPostStateValue} = usePosts();

    const getPosts = async () => {
        try {
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

            console.log("posts", posts);
        }
        catch (error: any) {
            console.log("getPost error", error.message);
        }
    };

    useEffect(() => {
        getPosts();
    }, [])

    return <div>Posts</div>;
};

export default Posts;