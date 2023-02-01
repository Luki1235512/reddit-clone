import React from "react";
import {Button, Flex} from "@chakra-ui/react";
import AuthButtons from "@/src/components/navbar/rightContent/AuthButtons";
import AuthModal from "@/src/components/modal/auth/AuthModal";
import {signOut} from "@firebase/auth";
import {auth} from "@/src/firebase/clientApp";

type RightContentProps = {
    user: any;
};

const RightContent: React.FC<RightContentProps> = ({user}) => {
    return (
        <>
            <AuthModal />
            <Flex justify="center" align="center">
                {user ? <Button onClick={() => signOut(auth)}>Logout</Button> : <AuthButtons />}
            </Flex>
        </>
    );
};

export default RightContent;
