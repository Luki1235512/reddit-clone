import { deleteObject, ref } from "@firebase/storage";
import { deleteDoc, doc } from "firebase/firestore";
import { useRecoilState } from "recoil";
import { Post, postState } from "../atoms/postsAtom";
import { firestore, storage } from "../firebase/clientApp";

const usePosts = () => {
    const [postStateValue, setPostStateValue] = useRecoilState(postState);

    const onVote = async () => {};

    const onSelectPost = () => {};

    const onDeletePost = async (post: Post): Promise<boolean> => {
        try {
            // CHECK IF IMAGE, DELETE IF EXISTS
            if (post.imageURL) {
                const imageRef = ref(storage, `posts/${post.id}/image`);
                await deleteObject(imageRef);
            }

            // DELETE POST DOCUMENT FROM FIRESTORE
            const postDocRef = doc(firestore, "posts", post.id!);
            await deleteDoc(postDocRef);

            // UPDATE RECOIL STATE
            setPostStateValue(prev => ({
                ...prev,
                posts: prev.posts.filter(item => item.id !== post.id)
            }));

            return true;
        }
        catch (error) {
            return false;
        }
    };

    return {
        postStateValue,
        setPostStateValue,
        onVote,
        onSelectPost,
        onDeletePost,
    };
};

export default usePosts;