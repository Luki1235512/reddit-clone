import { Community, communityState } from "@/src/atoms/communitiesAtom";
import About from "@/src/components/community/About";
import CreatePostLink from "@/src/components/community/CreatePostLink";
import Header from "@/src/components/community/Header";
import NotFound from "@/src/components/community/CommunityNotFound";
import PageContentLayout from "@/src/components/layout/PageContent";
import Posts from "@/src/components/posts/Posts";
import { auth, firestore } from "@/src/firebase/clientApp";
import { doc, getDoc } from "firebase/firestore";
import { GetServerSidePropsContext, NextPage } from "next";
import { useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useRecoilState } from "recoil";
import safeJsonStringify from "safe-json-stringify";


interface CommunityPageProps {
    communityData: Community;
};

const CommunityPage: NextPage<CommunityPageProps> = ({communityData}) => {
    const [user, loadingUser] = useAuthState(auth);
    
    const [communityStateValue, setCommunityStateValue] = useRecoilState(communityState);

    useEffect(() => {
        setCommunityStateValue((prev) => ({
            ...prev,
            currentCommunity: communityData,
        }));
    }, [communityData]);

    if (!communityData) {
        return <NotFound />;
    }

    return (
        <>
            <Header communityData={communityData} />
            <PageContentLayout>
                <>
                    <CreatePostLink />
                    <Posts
                        communityData={communityData}
                        userId={user?.uid}
                        loadingUser={loadingUser}
                    />
                </>
                <>
                    <About communityData={communityData} />
                </>
            </PageContentLayout>
        </>
    );
};

export default CommunityPage;

export async function getServerSideProps(context: GetServerSidePropsContext) {
    // GET COMMUNITY DATA AND PASS IT TO CLIENT
    try {
        const communityDocRef = doc(firestore, "communities", context.query.communityId as string);
        const communityDoc = await getDoc(communityDocRef);

        return {
            props: {
                communityData: communityDoc.exists() ? JSON.parse(
                    safeJsonStringify({id: communityDoc.id, ...communityDoc.data()})
                    ) : "",
            },
        };
    }
    catch (error) {
        // TODO: ADD ERROR PAGE HERE
        console.log("getServerSideProps error", error);
    }
};