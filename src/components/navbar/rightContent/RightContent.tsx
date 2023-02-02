import React from "react";
import {Button, Flex} from "@chakra-ui/react";
import AuthButtons from "@/src/components/navbar/rightContent/AuthButtons";
import AuthModal from "@/src/components/modal/auth/AuthModal";
import {signOut} from "@firebase/auth";
import {auth} from "@/src/firebase/clientApp";
import {User} from "firebase/auth";
import Icons from "./Icons";

type RightContentProps = {
    user?: User | null;
};

const RightContent: React.FC<RightContentProps> = ({user}) => {
    return (
        <>
            <AuthModal />
            <Flex justify="center" align="center">
                {user ? <Icons /> : <AuthButtons />}
                {/* <Menu /> */}
            </Flex>
        </>
    );
};

export default RightContent;
