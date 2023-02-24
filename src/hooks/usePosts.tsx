import { deleteObject, ref } from "@firebase/storage";
import { collection, deleteDoc, doc, getDocs, query, where, writeBatch } from "firebase/firestore";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { authModalState } from "../atoms/authModalAtoms";
import { Community, CommunityState } from "../atoms/communitiesAtom";
import { Post, postState, PostVote } from "../atoms/postsAtom";
import { auth, firestore, storage } from "../firebase/clientApp";

const usePosts = (communityData?: Community) => {
    const [user, loadingUser] = useAuthState(auth);
    const [postStateValue, setPostStateValue] = useRecoilState(postState);
    const setAuthModalState = useSetRecoilState(authModalState);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();
    const communnityStateValue = useRecoilValue(CommunityState);
    
    const onSelectPost = (post: Post, postIdx: number) => {
        setPostStateValue(prev => ({
            ...prev,
            selectedPost: {...post, postIdx},
        }));
        router.push(`/r/${post.communityId}/comments/${post.id}`);
    };

    const onVote = async (
        event: React.MouseEvent<SVGElement, MouseEvent>,
        post: Post,
        vote: number,
        communityId: string
    ) => {
        event.stopPropagation();
        if (!user?.uid) {
            setAuthModalState({open: true, view: "login"});
            return;
        }

        const {voteStatus} = post;
        const existingVote = postStateValue.postVotes.find(vote => vote.postId === post.id);

        try {
            let voteChange = vote;
            const batch = writeBatch(firestore);

            const updatedPost = {...post};
            const updatedPosts = [...postStateValue.posts];
            let updatedPostVotes = [...postStateValue.postVotes];

            // NEW VOTE
            if (!existingVote) {
                const postVoteRef = doc(collection(firestore, "users", `${user.uid}/postVotes`));

                const newVote: PostVote = {
                    id: postVoteRef.id,
                    postId: post.id,
                    communityId,
                    voteValue: vote,
                };

                batch.set(postVoteRef, newVote);

                updatedPost.voteStatus = voteStatus + vote;
                updatedPostVotes = [...updatedPostVotes, newVote];
            }
            // EXISTING VOTE - THEY HAVE VOTED ON THE POST BEFORE
            else {
                const postVoteRef = doc(firestore, "users", `${user.uid}/postVotes/${existingVote.id}`);
                // REMOVING THEIR VOTE (UP => NEUTRAL OR DOWN => NEUTRAL)
                if (existingVote.voteValue === vote) {
                    voteChange *= -1;
                    updatedPost.voteStatus = voteStatus - vote;
                    updatedPostVotes = updatedPostVotes.filter(vote => vote.id !== existingVote.id);
                    batch.delete(postVoteRef);
                }
                // FLIPPING THEIR VOTE (UP => DOWN OR DOWN => UP)
                else {
                    // ADD/SUBTRACT 2 TO/FROM post.voteStatus
                    voteChange = 2 * vote;
                    updatedPost.voteStatus = voteStatus + 2 * vote;
                    const voteIdx = postStateValue.postVotes.findIndex(vote => vote.id === existingVote.id);

                    if (voteIdx !== -1) {
                        updatedPostVotes[voteIdx] = {
                            ...existingVote,
                            voteValue: vote
                        };
                    }
                    batch.update(postVoteRef, {
                        voteValue: vote
                    });
                }
            }

            let updatedState = {...postStateValue, postVotes: updatedPostVotes};

            const postIdx = postStateValue.posts.findIndex(item => item.id === post.id);

            updatedPosts[postIdx!] = updatedPost;
            updatedState = {
                ...updatedState,
                posts: updatedPosts,
                postsCache: {
                    ...updatedState.postsCache,
                    [communityId]: updatedPosts,
                }
            };

            if (updatedState.selectedPost) {
                updatedState = {
                    ...updatedState,
                    selectedPost: updatedPost
                };
            }

            setPostStateValue(updatedState);

            const postRef = doc(firestore, "posts", post.id);
            batch.update(postRef, {voteStatus: voteStatus + voteChange});
            await batch.commit();
        }
        catch (error) {
            console.log("onVote error", error);
        }
    };

    const onDeletePost = async (post: Post): Promise<boolean> => {
        try {
            // CHECK IF IMAGE, DELETE IF EXISTS
            if (post.imageURL) {
                const imageRef = ref(storage, `posts/${post.id}/image`);
                await deleteObject(imageRef);
            }

            // DELETE POST DOCUMENT FROM FIRESTORE
            const postDocRef = doc(firestore, "posts", post.id);
            await deleteDoc(postDocRef);

            // UPDATE RECOIL STATE
            setPostStateValue(prev => ({
                ...prev,
                posts: prev.posts.filter(item => item.id !== post.id),
                postsCache: {
                    ...prev.postsCache,
                    [post.communityId]: prev.postsCache[post.communityId]?.filter(
                        item => item.id !== post.id
                    )
                }
            }));

            return true;
        }
        catch (error) {
            console.log("THERE WAS AN ERROR", error)
            return false;
        }
    };

    const getCommunityPostVotes = async (communityId: string) => {
        const postVotesQuery = query(
            collection(firestore, `users/${user?.uid}/postVotes`),
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
        if (!user?.uid || !communnityStateValue.currentCommunity) {
            return;
        }
        getCommunityPostVotes(communnityStateValue.currentCommunity.id);
    }, [user, communnityStateValue.currentCommunity]);

    useEffect(() => {
        if (!user?.uid && !loadingUser) {
            setPostStateValue(prev => ({
                ...prev,
                postVotes: [],
            }));
            return;
        }
    }, [user, loadingUser]);

    return {
        postStateValue,
        setPostStateValue,
        onSelectPost,
        onDeletePost,
        loading,
        setLoading,
        onVote,
        error,
    };
};

export default usePosts;