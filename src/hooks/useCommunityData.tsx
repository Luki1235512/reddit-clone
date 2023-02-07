import { collection, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useRecoilState } from "recoil";
import { Community, CommunitySnippet, CommunityState } from "../atoms/communitiesAtom";
import { auth, firestore } from "../firebase/clientApp";

const useCommunityData = () => {
    const [user] = useAuthState(auth);
    const [communityStateValue, setCommunityStateValue] = useRecoilState(CommunityState);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const onJoinOrLeavecommunity = (communityData: Community, isJoined: boolean) => {
        // IS THE USER SIGNED IN?
            // IF NOT => OPEN AUTH MODAL

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
        catch (error) {
            console.log("getMySnippets error", error);
        }
        setLoading(false);
    };

    const joinCommunity = (communityData: Community) => {

    };

    const leaveCommunity = (communityId: string) => {

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