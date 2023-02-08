import PageContent from "@/src/components/layout/PageContent";
import NewPostForm from "@/src/components/posts/NewPostForm";
import { Box, Text } from "@chakra-ui/react";

const SubmitPostPage: React.FC = () => {
    return (
        <PageContent>
            <>
                <Box p="14px 0px" borderBottom="1px solid" borderColor="white">
                    <Text>Create a post</Text>
                </Box>
                <NewPostForm />
                {/* NewPostForm */}
            </>

            <>
                {/* About */}
            </>
        </PageContent>
    )
};

export default SubmitPostPage;