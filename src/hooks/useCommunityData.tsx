import { collection, doc, getDoc, getDocs, increment, query, writeBatch } from "firebase/firestore";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useRecoilState, useSetRecoilState } from "recoil";
import { authModalState } from "../atoms/authModalAtoms";
import { Community, CommunitySnippet, CommunityState } from "../atoms/communitiesAtom";
import { auth, firestore } from "../firebase/clientApp";

const useCommunityData = () => {
    const [user, loadingUser] = useAuthState(auth);
    const router = useRouter();
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

    const getSnippets = async () => {
        setLoading(true);
        try {
            const snippets = await getMySnippets(user?.uid!);
            setCommunityStateValue((prev) => ({
                ...prev,
                mySnippets: snippets as CommunitySnippet[],
                initSnippetsFetched: true,
            }));
            setLoading(false);
        } catch (error: any) {
            console.log("Error getting user snippets", error);
            setError(error.message);
        }
        setLoading(false);
    };

    const getMySnippets = async (userId: string) => {
        const snippetQuery = query(
            collection(firestore, `users/${userId}/communitySnippets`)
        );
      
        const snippetDocs = await getDocs(snippetQuery);
        return snippetDocs.docs.map((doc) => ({ ...doc.data() }));
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

    const getCommunityData = async (communityId: string) => {
        try {
            const communityDocRef = doc(firestore, "communities", communityId);
            const communityDoc = await getDoc(communityDocRef);

            setCommunityStateValue(prev => ({
                ...prev,
                currentCommunity: {id: communityDoc.id, ...communityDoc.data()} as Community
            }));
        }
        catch (error) {
            console.log("getCommunityData", error);
        }
    };

    useEffect(() => {
        if (!user || !!communityStateValue.mySnippets.length) {
            return;
        }
        getSnippets();
    }, [user]);

    useEffect(() => {
        const {communityId} = router.query;
        if (communityId && !communityStateValue.currentCommunity) {
            getCommunityData(communityId as string);
        }
    }, [router.query, communityStateValue.currentCommunity]);

    return {
        communityStateValue,
        onJoinOrLeavecommunity,
        loading
    };
};

export default useCommunityData;