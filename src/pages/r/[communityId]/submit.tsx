import { CommunityState } from "@/src/atoms/communitiesAtom";
import About from "@/src/components/community/About";
import PageContentLayot from "@/src/components/layout/PageContent";
import PageContent from "@/src/components/layout/PageContent";
import NewPostForm from "@/src/components/posts/postForm/NewPostForm";
import { auth } from "@/src/firebase/clientApp";
import useCommunityData from "@/src/hooks/useCommunityData";
import { Box, Text } from "@chakra-ui/react";
import { NextPage } from "next";
import router from "next/router";
import { useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useRecoilValue } from "recoil";

const CreateCommunityPostPage: NextPage = () => {
    const [user, loadingUser, error] = useAuthState(auth);
    const communityStateValue = useRecoilValue(CommunityState);
    const {loading} = useCommunityData();

    useEffect(() => {
        if (!user && !loadingUser && communityStateValue.currentCommunity.id) {
            router.push(`/r${communityStateValue.currentCommunity.id}`);
        }
    }, [user, loadingUser, communityStateValue.currentCommunity]);

    return (
        <PageContentLayout maxWidth="1060px">
            <>
                <Box p="14px 0px" borderBottom="1px solid" borderColor="white">
                    <Text fontWeight={600}>Create a post</Text>
                </Box>
                {user && <NewPostForm user={user} communityImageURL={communityStateValue.currentCommunity.imageURL} communityId={communityStateValue.currentCommunity.id} />}
            </>
            {communityStateValue.currentCommunity && (
                <>
                    <About
                        communityData={communityStateValue.currentCommunity}
                        pt={6}
                        onCreatePage
                        loading={loading}
                    />
                </>
            )}
        </PageContentLayout>
    )
};

export default CreateCommunityPostPage;