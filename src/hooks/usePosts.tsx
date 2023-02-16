import { deleteObject, ref } from "@firebase/storage";
import { collection, deleteDoc, doc, getDocs, query, where, writeBatch } from "firebase/firestore";
import { useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { authModalState } from "../atoms/authModalAtoms";
import { CommunityState } from "../atoms/communitiesAtom";
import { Post, postState, PostVote } from "../atoms/postsAtom";
import { auth, firestore, storage } from "../firebase/clientApp";

const usePosts = () => {
    const [user] = useAuthState(auth);
    const [postStateValue, setPostStateValue] = useRecoilState(postState);
    const currentCommunity = useRecoilValue(CommunityState).currentCommunity;
    const setAuthModalState = useSetRecoilState(authModalState);

    const onVote = async (post: Post, vote: number, communityId: string) => {
        // CHECK FOR A USER => IF NOT, OPEN AUTH MODAL
        if (!user?.uid) {
            setAuthModalState({open: true, view: "login"});
            return;
        }

        try {
            const {voteStatus} = post;
            const existingVote = postStateValue.postVotes.find(vote => vote.postId === post.id);

            const batch = writeBatch(firestore);
            const updatedPost = {...post};
            const updatedPosts = [...postStateValue.posts];
            let updatedPostVotes = [...postStateValue.postVotes];
            let voteChange = vote;

            // NEW VOTE
            if (!existingVote) {
                // CREATE A NEW postVote DOCUMENT
                const postVoteRef = doc(collection(firestore, "users", `${user?.uid}/postVotes`));

                const newVote: PostVote = {
                    id: postVoteRef.id,
                    postId: post.id!,
                    communityId,
                    voteValue: vote, // 1 OR -1
                };

                batch.set(postVoteRef, newVote);

                // ADD/SUBTRACT 1 TO/FROM post.voteStatus
                updatedPost.voteStatus = voteStatus + vote;
                updatedPostVotes = [...updatedPostVotes, newVote];
            }
            // EXISTING VOTE - THEY HAVE VOTED ON THE POST BEFORE
            else {
                const postVoteRef = doc(firestore, "users", `${user?.uid}/postVotes/${existingVote.id}`);
                // REMOVING THEIR VOTE (UP => NEUTRAL OR DOWN => NEUTRAL)
                if (existingVote.voteValue === vote) {
                    // ADD/SUBTRACT 1 TO/FROM post.voteStatus
                    updatedPost.voteStatus = voteStatus - vote;
                    updatedPostVotes = updatedPostVotes.filter(vote => vote.id !== existingVote.id);

                    // DELETE THE postVote DOCUMENT
                    batch.delete(postVoteRef); 
                    voteChange *= -1;
                }
                // FLIPPING THEIR VOTE (UP => DOWN OR DOWN => UP)
                else {
                    // ADD/SUBTRACT 2 TO/FROM post.voteStatus
                    updatedPost.voteStatus = voteStatus + 2 * vote;
                    const voteIdx = postStateValue.postVotes.findIndex(vote => vote.id === existingVote.id);
                    updatedPostVotes[voteIdx] = {
                        ...existingVote,
                        voteValue: vote
                    };

                    // UPDATING THE EXISTING postVote DOCUMENT
                    batch.update(postVoteRef, {
                        voteValue: vote
                    });

                    voteChange = 2 * vote;
                }
            }
            // UPDATE OUT POST DOCUMENT
            const postRef = doc(firestore, "posts", post.id!);
            batch.update(postRef, {voteStatus: voteStatus + voteChange})

            await batch.commit();

            // UPDATE STATE WITH UPDATED VALUES
            const postIdx = postStateValue.posts.findIndex(item => item.id === post.id);
            updatedPosts[postIdx] = updatedPost;

            setPostStateValue(prev => ({
                ...prev,
                posts: updatedPosts,
                postVotes: updatedPostVotes
            }));

        }
        catch (error) {
            console.log("onVote error", error);
        }
    };

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

    const getCommunityPostVotes = async (communityId: string) => {
        const postVotesQuery = query(
            collection(firestore, "users", `${user?.uid}/postVotes`),
            where("communityId", "==", communityId)
        );

        const postVoteDocs = await getDocs(postVotesQuery);
        const postVotes = postVoteDocs.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        setPostStateValue(prev => ({
            ...prev,
            postVotes: postVotes as PostVote[]
        }));
    };

    useEffect(() => {
        if (!user || !currentCommunity?.id) {
            return;
        }
        getCommunityPostVotes(currentCommunity?.id);
    }, [user, currentCommunity]);

    useEffect(() => {
        if (!user) {
            // CLEAR USER POST VOTES
            setPostStateValue(prev => ({
                ...prev,
                postVotes: [],
            }));
        }
    }, [user]);

    return {
        postStateValue,
        setPostStateValue,
        onVote,
        onSelectPost,
        onDeletePost,
    };
};

export default usePosts;