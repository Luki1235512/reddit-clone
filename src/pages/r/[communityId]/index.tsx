import { Community, CommunityState } from "@/src/atoms/communitiesAtom";
import About from "@/src/components/community/About";
import CreatePostLink from "@/src/components/community/CreatePostLink";
import Header from "@/src/components/community/Header";
import NotFound from "@/src/components/community/NotFound";
import PageContent from "@/src/components/layout/PageContent";
import Posts from "@/src/components/posts/Posts";
import { firestore } from "@/src/firebase/clientApp";
import { doc, getDoc } from "firebase/firestore";
import { GetServerSidePropsContext } from "next";
import { useEffect } from "react";
import { useSetRecoilState } from "recoil";
import safeJsonStringify from "safe-json-stringify";


type CommunityPageProps = {
    communityData: Community;
};

const CommunityPage: React.FC<CommunityPageProps> = ({communityData}) => {
    const setCommunityStateValue = useSetRecoilState(CommunityState);

    if (!communityData) {
        return <NotFound />
    }

    useEffect(() => {
        setCommunityStateValue((prev) => ({
            ...prev,
            currentCommunity: communityData,
        }));
    }, []);

    return (
        <>
            <Header communityData={communityData} />
            <PageContent>
                <>
                    <CreatePostLink />
                    <Posts communityData={communityData} />
                </>
                <>
                    <About communityData={communityData} />
                </>
            </PageContent>
        </>
    );
};

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

export default CommunityPage;
