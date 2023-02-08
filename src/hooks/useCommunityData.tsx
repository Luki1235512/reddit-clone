import { async } from "@firebase/util";
import { collection, doc, getDocs, increment, writeBatch } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useRecoilState, useSetRecoilState } from "recoil";
import { authModalState } from "../atoms/authModalAtoms";
import { Community, CommunitySnippet, CommunityState } from "../atoms/communitiesAtom";
import { auth, firestore } from "../firebase/clientApp";

const useCommunityData = () => {
    const [user] = useAuthState(auth);
    const [communityStateValue, setCommunityStateValue] = useRecoilState(CommunityState);
    const setAuthModalState = useSetRecoilState(authModalState);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const onJoinOrLeavecommunity = (communityData: Community, isJoined: boolean) => {
        // IS THE USER SIGNED IN?
        // IF NOT => OPEN AUTH MODAL
        if (!user) {
            // OPEN MODAL
            setAuthModalState({open: true, view: "login"});
            return;
        }

        if (isJoined) {
            leaveCommunity(communityData.id);
            return;
        }
        joinCommunity(communityData);
    };

    const getMySnippets = async () => {
        setLoading(true);
        try {
            // GET USER SNIPPETS
            const snippetDocs = await getDocs(collection(firestore, `users/${user?.uid}/communitySnippets`));
            const snippets = snippetDocs.docs.map(doc => ({...doc.data()}));
            setCommunityStateValue(prev => ({
                ...prev,
                mySnippets: snippets as CommunitySnippet[]
            }));
            console.log("here are snippets ", snippets);
        }
        catch (error: any) {
            console.log("getMySnippets error", error);
            setError(error.message);
        }
        setLoading(false);
    };

    const joinCommunity = async (communityData: Community) => {
        // BATCH WRITE
        try {
            const batch = writeBatch(firestore);

            // CREATING A NEW COMMUNITY SNIPPET
            const newSnippet: CommunitySnippet = {
                communityId: communityData.id,
                imageURL: communityData.imageURL || ""
            };
            batch.set(doc(firestore, `users/${user?.uid}/communitySnippets`, communityData.id), newSnippet);
            batch.update(doc(firestore, "communities", communityData.id), {numberOfMembers: increment(1)});

            await batch.commit();

            // UPDATE RECOIL STATE - communityState.mySnippets
            setCommunityStateValue(prev => ({
                ...prev,
                mySnippets: [...prev.mySnippets, newSnippet]
            }));
        }
        catch (error: any) {
            console.log("joinCommunity error", error);
            setError(error.message);
        }
        setLoading(false);
    };

    const leaveCommunity = async (communityId: string) => {
        // BATCH WRITE
        
        try {
            const batch = writeBatch(firestore);

            // DELETING THE COMMUNITY SNIPPET FROM USER
            batch.delete(doc(firestore, `users/${user?.uid}/communitySnippets`, communityId));

            // UPDATING THE numberOfMembers (-1)
            batch.update(doc(firestore, "communities", communityId), {numberOfMembers: increment(-1)});

            await batch.commit();

            // UPDATE RECOIL STATE - communityState.mySnippets
            setCommunityStateValue(prev => ({
                ...prev,
                mySnippets: prev.mySnippets.filter(item => item.communityId !== communityId)
            }));
        }
        catch (error: any) {
            console.log("leaveCommunity error", error);
            setError(error.message);
        }
        setLoading(false);
    };

    useEffect(() => {
        if (!user) {
            return;
        }
        getMySnippets();
    }, [user])

    return {
        communityStateValue,
        onJoinOrLeavecommunity,
        loading
    };
};

export default useCommunityData;